import numpy as np


def make_tasks():
    training_examples_per_length = 10
    testing_examples_per_length = 10
    min_length = 5
    max_length = 10

    task_dict = {task_function.__name__: make_task(task_function, input_values,
            training_examples_per_length, testing_examples_per_length,
            min_length, max_length) 
            for task_function, input_values in get_tasks()}

    # maps f_name to dict with keys train, test, and values of lists of 
    # (i1, i2, out) tuples
    return task_dict


def get_tasks():
    def bitwise_and(i1, i2):
        return [a and b for (a, b) in zip(i1, i2)]

    def bitwise_or(i1, i2):
        return [a or b for (a, b) in zip(i1, i2)]

    def bitwise_xor(i1, i2):
        return [a ^ b for (a, b) in zip(i1, i2)]

    def reverse(i1, i2):
        return i1[::-1]

    def copy(i1, i2):
        return i1

    def split_halfway(i1, i2):
        split = int(len(i1) / 2)
        return i1[:split] + i2[split:]

    def alternate_bits(i1, i2):
        return [a if i % 2 == 0 else b for i, (a, b) in enumerate(zip(i1, i2))]

    def copy_1_if_1(i1, i2):
        return i1 if i1[0] == 1 else i2

    def insert_1(i1, i2):
        return [1] + i1

    def addition(i1, i2):
        carry = 0
        out = []
        for a, b in list(zip(i1, i2))[::-1]:
            o = a + b + carry
            carry = 1 if o > 1 else 0
            o = o % 2
            out.append(o)

        # commented so that out length equals in length (wrap when overflowing)
        # out = out + [carry]
        return out[::-1]

    def parity(i1, i2):
        count = sum(i1)
        return [1 if count % 2 == 0 else 0] * len(i1)

    def all_zeros_if_second_odd_else_copy_first(i1, i2):
        if i2[-1] == 1:
            return [0] * len(i1)
        else:
            return i1

    def elementwise_both_even(i1, i2):
        return [int(a % 2 == 0 and b % 2 == 0) for (a, b) in zip(i1, i2)]

    addition_max = 10

    def elementwise_addition(i1, i2):
        return [((a + b) % addition_max) for (a, b) in zip(i1, i2)]

    def addition_with_a_twist(i1, i2):
        # do some wonky stuff just so it uses four spots
        carry = 0
        out = []
        for a, b in list(zip(i1, i2))[::-1]:
            o = a + b + carry
            carry = 1 if o > 1 and i1[0] else 0
            o = o % 2
            out.append(o)

        # commented so that out length equals in length (wrap when overflowing)
        # out = out + [carry]
        return out[::-1]

    all_tasks = ((bitwise_and, [0, 1]), 
            (bitwise_or, [0, 1]), 
            (bitwise_xor, [0, 1]),
            (reverse, [0, 1]),
            (copy, list(range(0, 10))),
            (split_halfway, [0, 1]),
            (alternate_bits, [0, 1]),
            (copy_1_if_1, [0, 1]),
            (insert_1, [0, 1]),
            (addition, [0, 1]),
            (parity, [0, 1]),
            (all_zeros_if_second_odd_else_copy_first, [0, 1]),
            (elementwise_both_even, list(range(0, 10))),
            (elementwise_addition, list(range(0, addition_max))),
            (addition_with_a_twist, [0, 1]))

    return all_tasks


def generate_examples(examples_per_length, min_length, max_length,
                      input_values):
    examples = []
    for length in range(min_length, max_length + 1):
        for i in range(examples_per_length):
            input_1 = generate_list(length, input_values)
            input_2 = generate_list(length, input_values)
            examples.append((input_1, input_2))

    return examples


def generate_list(n, input_values):
    return np.random.choice(input_values, size=n).tolist()


def make_task(task_function, input_values, training_examples_per_length=10,
              testing_examples_per_length=10, min_length=2, max_length=20):
    training_input = generate_examples(training_examples_per_length,
                                       min_length, max_length, input_values)
    training_examples = [(i1, i2, task_function(i1, i2)) for (i1, i2) in
            training_input]

    testing_input = generate_examples(testing_examples_per_length, min_length,
                                      max_length, input_values)
    testing_examples = [(i1, i2, task_function(i1, i2)) for (i1, i2) in
            testing_input]

    return {'train': training_examples, 'test': testing_examples}


if __name__ == '__main__':
    task_dict = make_tasks()
    for f_name in task_dict:
        if f_name == 'elementwise_both_even':
            print(f_name)
            print('\ttrain')
            for example in task_dict[f_name]['train']:
                print('\t\t' + str(example))
            print('\ttest')
            for example in task_dict[f_name]['test']:
                print('\t\t' + str(example))
