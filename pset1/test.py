def grow(arg_types, plist):
    '''
        arg_types is a list of types, example [bool, int, int]
        plist is map between type and list of terminals of that type: {'bool': [...], 
        returns a list of arguments for the new operation.

        [true, 1, 2]
        [true, 1, 1]
        [true, 2, 2]
        [true, 2, 1]
        [false, 2, 2]
        [false, 2, 1]
        [false, 1, 1]
        [false, 1, 2]
    '''

    if len(arg_types) == 1:
        out = [[term] for term in plist[arg_types[0]]]
        print(out)
        return out

    recursive = grow(arg_types[1:], plist)
    out = [0]*len(plist[arg_types[0]])*len(recursive)
    i = 0
    for arg in plist[arg_types[0]]:
        for rest in recursive:
            out[i] = [arg] + rest
            i = i + 1

    print(out)
    return out

def grow2(plist, intops, boolops):
    new_plist = []
    for intop in intops:
        arg_types = intop.arg_types
        new_plist.addall(grow(arg_types, plist))
        

    for boolop in boolops:



grow(['bool', 'bool', 'int', 'int'], {'bool': ['true', 'false'], 'int': ['1','2']})

