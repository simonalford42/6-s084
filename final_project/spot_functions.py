

# Exists just so that once we synthesize a program, it is easy to print out the
# solution
class Spot:
    def __init__(self, name, f):
        self.name = name
        self.f = f

    def __repr__(self): 
        return self.__str__()

    def __str__(self): 
        return self.name


def get_spot_fns():
    def index(i1, i2, ix, n):
        return ix

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

    def c7(i1, i2, ix, n):
        return i1[n - ix - 1]

    def c8(i1, i2, ix, n):
        return i2[n - ix - 1]

    def c9(i1, i2, ix, n):
        return 0 if ix + 1 >= n else i1[ix + 1]

    def c10(i1, i2, ix, n):
        return 0 if ix - 1 < 0 else i1[ix - 1]

    def c11(i1, i2, ix, n):
        return 0 if ix + 1 >= n else i2[ix + 1]

    def c12(i1, i2, ix, n):
        return 0 if ix - 1 < 0 else i2[ix - 1]

    return [Spot('i1[ix]', c1), Spot('i2[ix]', c2), Spot('i1[n-1]', c3),
            Spot('i2[n-1]', c4), Spot('i1[0]', c5), Spot('i2[0]', c6),
            Spot('ix', index), Spot('i1[n-ix-1]', c7), Spot('i2[n-ix-1]', c8), 
            Spot('i1[ix+1]', c9), Spot('i1[ix-1]', c10), Spot('i2[ix+1]', c11), 
            Spot('i2[ix-1]', c12)]


def index(i1, i2, ix, aux):
    return ix

def c1(i1, i2, ix, aux):
    return i1[ix]

def c2(i1, i2, ix, aux):
    return i2[ix]

def c3(i1, i2, ix, aux):
    return i1[len(i1) - 1]

def c4(i1, i2, ix, aux):
    return i2[len(i2) - 1]

def c5(i1, i2, ix, aux):
    return i1[0]

def c6(i1, i2, ix, aux):
    return i2[0]

def c7(i1, i2, ix, aux):
    return i1[len(i1) - ix - 1]

def c8(i1, i2, ix, aux):
    return i2[len(i2) - ix - 1]

def c9(i1, i2, ix, aux):
    return 0 if ix + 1 >= len(i1) else i1[ix + 1]

def c10(i1, i2, ix, aux):
    return 0 if ix - 1 < 0 else i1[ix - 1]

def c11(i1, i2, ix, aux):
    return 0 if ix + 1 >= len(i1) else i2[ix + 1]

def c12(i1, i2, ix, aux):
    return 0 if ix - 1 < 0 else i2[ix - 1]

def c13(i1, i2, ix, aux):
    return aux

def const(i1, i2, ix, aux):
    return 0

def end(i1, i2, ix, aux):
    return int(ix == 0)

def get_for_loop_spot_fns():
    return [Spot('i1[ix]', c1), Spot('i2[ix]', c2), 
            Spot('i2[len(i1)-1]', c4), Spot('i1[0]', c5), 
            Spot('ix', index), Spot('i1[len(i1)-ix-1]', c7),
            Spot('i1[ix-1]', c10),
            Spot('aux', c12), Spot('c', const),
            Spot('end', end)]


def get_for_loop_originals():
    return [Spot('i1[ix]', c1), Spot('i2[ix]', c2), Spot('aux', c13),
            Spot('c', const), Spot('end', end), Spot('i1[0]', c5)]



