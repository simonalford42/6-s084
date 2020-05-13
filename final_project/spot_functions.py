

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
    def index(a, b, ix, n):
        return ix

    def c1(a, b, ix, n):
        return a[ix]

    def c2(a, b, ix, n):
        return b[ix]

    def c3(a, b, ix, n):
        return a[n - 1]

    def c4(a, b, ix, n):
        return b[n - 1]

    def c5(a, b, ix, n):
        return a[0]

    def c6(a, b, ix, n):
        return b[0]

    def c7(a, b, ix, n):
        return a[n - ix - 1]

    def c8(a, b, ix, n):
        return b[n - ix - 1]

    def c9(a, b, ix, n):
        return 0 if ix + 1 >= n else a[ix + 1]

    def c10(a, b, ix, n):
        return 0 if ix - 1 < 0 else a[ix - 1]

    def c11(a, b, ix, n):
        return 0 if ix + 1 >= n else b[ix + 1]

    def c12(a, b, ix, n):
        return 0 if ix - 1 < 0 else b[ix - 1]

    return [Spot('a[ix]', c1), Spot('b[ix]', c2), Spot('a[n-1]', c3),
            Spot('b[n-1]', c4), Spot('a[0]', c5), Spot('b[0]', c6),
            Spot('ix', index), 
            Spot('a[ix+1]', c9), Spot('a[ix-1]', c10), Spot('b[ix+1]', c11), 
            Spot('b[ix-1]', c12)]


def index(a, b, ix, aux):
    return ix


def c1(a, b, ix, aux):
    return a[ix]


def c2(a, b, ix, aux):
    return b[ix]

def c3(a, b, ix, aux):
    return a[len(a) - 1]

def c4(a, b, ix, aux):
    return b[len(b) - 1]

def c5(a, b, ix, aux):
    return a[0]

def c6(a, b, ix, aux):
    return b[0]

def c7(a, b, ix, aux):
    return a[len(a) - ix - 1]

def c8(a, b, ix, aux):
    return b[len(b) - ix - 1]

def c9(a, b, ix, aux):
    return 0 if ix + 1 >= len(a) else a[ix + 1]

def c10(a, b, ix, aux):
    return 0 if ix - 1 < 0 else a[ix - 1]

def c11(a, b, ix, aux):
    return 0 if ix + 1 >= len(a) else b[ix + 1]

def c12(a, b, ix, aux):
    return 0 if ix - 1 < 0 else b[ix - 1]

def c13(a, b, ix, aux):
    return aux

def const(a, b, ix, aux):
    return 0

def end(a, b, ix, aux):
    return int(ix == 0)

def get_for_loop_spot_fns():
    return [Spot('a[ix]', c1), Spot('b[ix]', c2), 
            Spot('b[len(a)-1]', c4), Spot('a[0]', c5), 
            Spot('ix', index), Spot('a[len(a)-ix-1]', c7),
            Spot('a[ix-1]', c10),
            Spot('aux', c13), Spot('c', const),
            Spot('end', end)]


def get_for_loop_originals():
    return [Spot('a[ix]', c1), Spot('b[ix]', c2), Spot('aux', c13),
            Spot('c', const), Spot('end', end), Spot('a[0]', c5)]



