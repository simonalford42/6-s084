import itertools
import data

def synthesize(examples):
    spots = get_spot_fns()
    max_nodes = 3
    
    for num_nodes in range(1, max_nodes+1):
        combinations = itertools.combinations(spots, num_nodes)
        print(combinations)



def get_spot_fns():
    def c1(i1, i2, ix, n):
        return i1[ix]

    def c2(i1, i2, ix, n):
        return i2[ix]

    def c3(i1, i2, ix, n):
        return i1[n-1]

    def c4(i1, i2, ix, n):
        return i2[n-1]

    def c5(i1, i2, ix, n):
        return i1[0]

    def c6(i1, i2, ix, n):
        return i2[0]

    return [c1, c2, c3, c4, c5, c6]


if __name__ == '__main__':
    synthesize(
