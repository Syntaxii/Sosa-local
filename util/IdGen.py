import uuid


# Define id helper functions here

def experimentId():
    return 'ex-' + uuid.uuid4().__str__()


def stimsetId():
    return "sts-" + uuid.uuid4().__str__()


def boardId():
    return "brd-" + uuid.uuid4().__str__()


# TODO: Need id helper function to generate short unique ids for invites
def inviteId():
    return "inv-" + uuid.uuid4().__str__()


def configId():
    return "cfg-" + uuid.uuid4().__str__()

