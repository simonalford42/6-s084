import itertools
import data


def synthesize(examples):
    '''
        Take as input the training examples.
        Tries to synthesize a rule that gives the output for each index in the
        example for all of the examples. If it finds one, returns the node set,
        which is the set of spots used by the synthesizer, and a dictionary
        mapping inputs to the spots to the desired output for that index.

        If none is possible, returns false
    '''
    spots = get_spot_fns()
    max_nodes = len(spots)
    
    for num_nodes in range(1, max_nodes + 1):
        combinations = list(itertools.combinations(spots, num_nodes))
        for node_set in combinations:
            # processes the examples on this node set to determine the right 
            # output rules that makes it work. if none possible, returns false.
            process_out = process(node_set, examples)
            if process_out is not False:
                yes_range = process_out
                return node_set, yes_range

    return False


def test(node_set, io_mapping, examples):
    bad_examples = []
    for (i1, i2, o) in examples:
        for ix in range(len(i1)):
            input_tuple = tuple(spot.f(i1, i2, ix, len(i1)) 
                    for spot in node_set)
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


def process(node_set, examples):
    '''
        processes the examples on this node set to determine the right target
        set that makes the synthesis succeed with this node_set. If one exists,
        returns the minimal set of yes examples. Otherwise, returns false.
    '''
    # we now have an io pair for each index in each example
    example_mapping = {}
    for (i1, i2, o) in examples:
        for ix in range(len(i1)):
            input_tuple = tuple(spot.f(i1, i2, ix, len(i1)) 
                    for spot in node_set)
            if input_tuple in example_mapping:
                if o[ix] != example_mapping[input_tuple]:
                    # conflicts with earlier classification, so this node set is
                    # not discrminatory
                    return False
            else:
                example_mapping[input_tuple] = o[ix]

    # no conflicts, so we have a valid discriminator
    # return the mapping we found to use for the future

    assert test(node_set, example_mapping, examples)
    return example_mapping


class Spot:
    def __init__(self, name, f):
        self.name = name
        self.f = f

    def __repr__(self): 
        return self.__str__()

    def __str__(self): 
        return self.name


def get_spot_fns():
    def c1(i1, i2, ix, n):
        return i1[ix]

    def c2(i1, i2, ix, n):
        return i2[ix]

    def c3(i1, i2, ix, n):
        return i1[n - 1]

    def c4(i1, i2, ix, n):
        return i2[n - 1]

    def c5(i1, i2, ix, n):
        return i1[0]

    def c6(i1, i2, ix, n):
        return i2[0]

    # def c7(i1, i2, ix, n):
    #     return i1[ix + 1]

    # def c8(i1, i2, ix, n):
    #     return i1[ix - 1]

    # def c9(i1, i2, ix, n):
    #     return i2[ix + 1]

    # def c10(i1, i2, ix, n):
    #     return i2[ix - 1]

    return [Spot('i1[ix]', c1), Spot('i2[ix]', c2), Spot('i1[n-1]', c3),
            Spot('i2[n-1]', c4), Spot('i1[0]', c5), Spot('i2[0]', c6)]
            # Spot('i1[ix+1]', c7), Spot('i1[ix-1]', c8), Spot('i2[ix+1]', c9), 
            # Spot('i2[ix-1]', c10)]


def print_synthesis(node_set, yes_range):
    print('node set: ' + str(node_set))
    print('yes_range:')
    for val in yes_range:
        print(val)


def run_synthesis_on_task(data_dict, task_name):
    print('running synthesis on task {}'.format(task_name))
    synthesis_out = synthesize(data_dict[task_name]['train'])

    if synthesis_out is False:
        print('Synthesis was not possible')
        return False
    else:
        (node_set, yes_range) = synthesis_out
        print_synthesis(node_set, yes_range)
        test_out = test(node_set, yes_range, data_dict[task_name]['test'])

        if test_out is True:
            print('synthesized program is correct')
            return True
        else:
            bad_examples = test_out
            print('synthesized program failed on test set:')
            # for b in bad_examples:
                # print(b)
            return False


if __name__ == '__main__':
    data_dict = data.make_tasks()
    successes = []
    failures = []
    for task_name in data_dict:
        print(task_name)
        success = run_synthesis_on_task(data_dict, task_name)
        if success:
            successes.append(task_name)
        else:
            failures.append(task_name)

    print('successes: {}'.format(successes))
    print('failures: {}'.format(failures))
