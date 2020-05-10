import numpy as np


def make_tasks():
    training_examples_per_length = 10
    testing_examples_per_length = 10
    min_length = 4
    max_length = 10

    task_dict = {f_name: make_task(task_function, training_examples_per_length,
            testing_examples_per_length, min_length, max_length) 
            for f_name, task_function in get_task_functions().items()}

    # maps f_name to dict with keys train, test, and values of lists of 
    # (i1, i2, out) tuples
    return task_dict


def get_task_functions():
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
        split = len(i1) / 2
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
        for a, b in zip(i1, i2)[::-1]:
            o = a + b + carry
            carry = 1 if o > 1 else 0
            o = o % 2
            out.append(o)

        out = out + [carry]
        return out[::-1]

    def parity(i1, i2):
        count = sum(i1)
        return [1 if count % 2 == 0 else 0] * len(i1)

    def all_zeros_if_second_odd_else_copy_first(i1, i2):
        if i2[-1] == 1:
            return [0] * len(i1)
        else:
            return i1

    all_task_functions = (bitwise_and, bitwise_or, bitwise_xor, reverse, copy,
            split_halfway, alternate_bits, copy_1_if_1, insert_1, addition,
            parity, all_zeros_if_second_odd_else_copy_first)

    task_dict = {f.__name__: f for f in all_task_functions}

    return task_dict


def generate_examples(examples_per_length, min_length, max_length):
    examples = []
    for length in range(min_length, max_length + 1):
        for i in range(examples_per_length):
            input_1 = generate_boolean_list(length)
            input_2 = generate_boolean_list(length)
            examples.append((input_1, input_2))

    return examples


def generate_boolean_list(n):
    return np.random.randint(0, 2, n).tolist()


def reverse(s):
    return s[::-1]


def make_task(task_function, training_examples_per_length=10,
              testing_examples_per_length=10, min_length=2, max_length=20):
    training_input = generate_examples(training_examples_per_length,
                                       min_length, max_length)
    training_examples = [(i1, i2, task_function(i1, i2))
            for (i1, i2) in training_input]

    testing_input = generate_examples(testing_examples_per_length, min_length,
                                      max_length)
    testing_examples = [(i1, i2, task_function(i1, i2))
            for (i1, i2) in testing_input]

    return {'train': training_examples, 'test': testing_examples}


if __name__ == '__main__':
    task_dict = make_tasks()
    for f_name in task_dict:
        print(f_name)
        print('\ttrain')
        for example in task_dict[f_name]['train']:
            print('\t\t' + str(example))
        print('\ttest')
        for example in task_dict[f_name]['test']:
            print('\t\t' + str(example))
