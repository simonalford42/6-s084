import itertools
import more_itertools
import data
import numpy as np
import spot_functions


def synthesize_per_index(examples):
    '''
        Take as input the training examples.
        Tries to synthesize a rule that gives the output for each index in the
        example for all of the examples. If it finds one, returns the node set,
        which is the set of spots used by the synthesizer, and a dictionary
        mapping inputs to the spots to the desired output for that index.

        If none is possible, returns false
    '''
    spots = spot_functions.get_spot_fns()
    max_nodes = 3
    
    for num_nodes in range(1, max_nodes + 1):
        combinations = list(itertools.combinations(spots, num_nodes))
        for nodeset in combinations:
            # processes the examples on this node set to determine the right 
            # output rules that makes it work. if none possible, returns false.
            process_out = process(nodeset, examples)
            if process_out is not False:
                mapping = process_out
                return nodeset, mapping

    return False


def get_input_ranges(nodeset, examples):
    input_ranges = []
    aux_state_range = [0, 1]
    for node in nodeset:
        values = set()
        for (i1, i2, o) in examples:
            for ix in range(len(i1)):
                for a in aux_state_range:
                    values.add(node.f(i1, i2, ix, a))
        input_ranges.append(values)

    # print('input_ranges: ' + str(input_ranges))
    return input_ranges


def process_for_loop_aux_mapping(aux_nodeset, examples, spots, max_nodes=4,
                                 max_subsets=10000):
    # list of sets of values that are possible at each spot
    input_ranges = get_input_ranges(aux_nodeset, examples)
    num_inputs = np.prod([len(r) for r in input_ranges])
    num_subsets = 2 ** num_inputs
    print('num subsets = 2^{} = {}'.format(num_inputs, num_subsets))

    if num_subsets >= max_subsets:  # give up for tasks which take too long
        # print('task with {}'.format(num_subsets) + ' subsets is going to ' 
        # + 'take too long, quitting'.format(num_subsets))
        return False

    inputs = itertools.product(*input_ranges)
    all_subsets = more_itertools.powerset(inputs)
    for subset in all_subsets:
        num_subsets -= 1
        yes_range = set(subset)

        aux_mapping = {input: int(input in yes_range) for input in
                itertools.product(*input_ranges)}

        for num_nodes in range(1, len(aux_nodeset) + 1):
            combinations = list(itertools.combinations(spots, num_nodes))
            for out_nodeset in combinations:
                process_out = process_for_loop_out_mapping(aux_nodeset,
                        out_nodeset, aux_mapping, examples)

                if process_out is not False:
                    out_mapping = process_out
                    assert test_for_loop(aux_nodeset, out_nodeset, aux_mapping,
                            out_mapping, examples) is True
                    return aux_mapping, out_mapping, out_nodeset

    assert num_subsets == 0, 'didnt count subsets well:{}'.format(num_subsets)
    return False


def process_for_loop_out_mapping(aux_nodeset, out_nodeset, aux_mapping,
                                 examples):
    out_mapping = {}
    for (i1, i2, o) in examples:
        aux_state = 0
        for ix in range(len(i1) - 1, -1, -1):
            input_tuple = tuple(spot.f(i1, i2, ix, aux_state) 
                    for spot in out_nodeset)
            if input_tuple in out_mapping:
                if o[ix] != out_mapping[input_tuple]:
                    return False
            else:
                out_mapping[input_tuple] = o[ix]

            input_tuple = tuple(spot.f(i1, i2, ix, aux_state)
                    for spot in aux_nodeset)

            if input_tuple not in aux_mapping:
                return False
            aux_state = aux_mapping[input_tuple]

    return out_mapping


def test_for_loop(aux_nodeset, out_nodeset, aux_mapping, out_mapping, examples):
    bad_examples = []
    for (i1, i2, o) in examples:
        aux_state = 0
        for ix in range(len(i1) - 1, -1, -1):
            input_tuple = tuple(spot.f(i1, i2, ix, aux_state)
                    for spot in out_nodeset)

            if input_tuple not in out_mapping:
                bad_examples.append((i1, i2, o))
            else:
                prediction = out_mapping[input_tuple]
                if o[ix] != prediction:
                    bad_examples.append((i1, i2, o))

            input_tuple = tuple(spot.f(i1, i2, ix, aux_state)
                    for spot in aux_nodeset)
            if input_tuple not in aux_mapping:
                bad_examples.append((i1, i2, o))
            else:
                aux_state = aux_mapping[input_tuple]

    if len(bad_examples) == 0:
        return True
    else:
        return bad_examples


def synthesize_for_loop(examples, spots, max_nodes=4, max_subsets=10000):
    for num_nodes in range(1, max_nodes + 1):
        combinations = list(itertools.combinations(spots, num_nodes))
        for aux_nodeset in combinations:
            # print(aux_nodeset)
            # processes the examples on this node set to determine the right 
            # output rules that makes it work. if none possible, returns false.
            process_out = process_for_loop_aux_mapping(aux_nodeset, examples,
                    spots, max_nodes=max_nodes, max_subsets=max_subsets)
            if process_out is not False:
                aux_mapping, out_mapping, out_nodeset = process_out
                return aux_nodeset, out_nodeset, aux_mapping, out_mapping

    return False


def test_per_index(nodeset, io_mapping, examples):
    bad_examples = []
    for (i1, i2, o) in examples:
        for ix in range(len(i1)):
            input_tuple = tuple(spot.f(i1, i2, ix, len(i1)) 
                    for spot in nodeset)
            if input_tuple not in io_mapping:
                bad_examples.append((i1, i2, o))
            else:
                prediction = io_mapping[input_tuple]
                if o[ix] != prediction:
                    bad_examples.append((i1, i2, o))

    if len(bad_examples) == 0:
        return True
    else:
        return bad_examples


def process(nodeset, examples):
    '''
        processes the examples on this node set to determine the right target
        set that makes the synthesis succeed with this nodeset. If one exists,
        returns the minimal set of yes examples. Otherwise, returns false.
    '''
    # we now have an io pair for each index in each example
    example_mapping = {}
    for (i1, i2, o) in examples:
        for ix in range(len(i1)):
            input_tuple = tuple(spot.f(i1, i2, ix, len(i1)) 
                    for spot in nodeset)
            if input_tuple in example_mapping:
                if o[ix] != example_mapping[input_tuple]:
                    # conflicts with earlier classification, so this node set is
                    # not discrminatory
                    return False
            else:
                example_mapping[input_tuple] = o[ix]

    # no conflicts, so we have a valid discriminator
    # return the mapping we found to use for the future

    assert test_per_index(nodeset, example_mapping, examples) is True
    return example_mapping


def run_per_index_synthesis_on_task(data_dict, task_name):
    # print('running synthesis "per index" on task {}'.format(task_name))
    synthesis_out = synthesize_per_index(data_dict[task_name]['train'])

    if synthesis_out is False:
        # print('Synthesis was not possible')
        return False
    else:
        (nodeset, mapping) = synthesis_out
        
        # print('mapping:')
        # for val in mapping.items():
        #     print(val)

        test_out = test_per_index(nodeset, mapping, 
                data_dict[task_name]['test'])

        if test_out is True:
            # print('synthesized program passed test cases')
            return True
        else:
            bad_examples = test_out
            # print('synthesized program failed on test set:')
            # for b in bad_examples:
                # print(b)
            return False


def run_for_loop_synthesis_on_task(data_dict, task_name, spots, max_nodes=4,
        max_subsets=10000):
    # print('running synthesis "for loop" on task {}'.format(task_name))
    synthesis_out = synthesize_for_loop(data_dict[task_name]['train'],
            spots, max_nodes=max_nodes, max_subsets=max_subsets)

    if synthesis_out is False:
        # print('Synthesis was not possible')
        return False
    else:
        aux_nodeset, out_nodeset, aux_mapping, out_mapping = synthesis_out
        # print('aux nodeset: {}'.format(aux_nodeset))
        # print('out nodeset: {}'.format(out_nodeset))
        # print('aux mapping:')
        # for val in aux_mapping.items():
            # print(val)
        # print('out mapping:')
        # for val in out_mapping.items():
            # print(val)

        test_out = test_for_loop(aux_nodeset, out_nodeset, aux_mapping,
                out_mapping, data_dict[task_name]['test'])

        if test_out is True:
            # print('synthesized program past test cases')
            return True
        else:
            bad_examples = test_out
            # print('synthesized program failed on test set:')
            # print(len(bad_examples))
            # if len(bad_examples) < 10:
                # for b in bad_examples:
                    # print(b)

            return False


def run_per_index_on_all_tasks():
    data_dict = data.make_tasks()
    successes = []
    failures = []
    for task_name in data_dict:
        # print(task_name)
        success = run_per_index_synthesis_on_task(data_dict, task_name)
        if success:
            successes.append(task_name)
        else:
            failures.append(task_name)

    print('successes: {}'.format(successes))
    print('failures: {}'.format(failures))


def run_for_loop_synthesis():
    data_dict = data.make_tasks()
    successes = []
    failures = []
    for task_name in data_dict:
        print(task_name)
        success = run_for_loop_synthesis_on_task(data_dict, task_name,
                spot_functions.get_for_loop_spot_fns(), max_nodes=4,
                max_subsets=10000)
        if success:
            successes.append(task_name)
        else:
            failures.append(task_name)

    print('successes: {}'.format(successes))
    print('failures: {}'.format(failures))


def run_for_loop_originals():
    data_dict = data.make_tasks()
    spots = spot_functions.get_for_loop_originals()

    successes = []
    failures = []
    for task_name in ['addition', 'parity', 'addition_with_a_twist',
            'parity_single_bit', 'running_parity']:
        print(task_name)
        success = run_for_loop_synthesis_on_task(data_dict, task_name, spots,
                max_nodes=4, max_subsets=10000)
        if success:
            successes.append(task_name)
        else:
            failures.append(task_name)

    print('successes: {}'.format(successes))
    print('failures: {}'.format(failures))


if __name__ == '__main__':
    run_per_index_on_all_tasks()
    run_for_loop_originals()
