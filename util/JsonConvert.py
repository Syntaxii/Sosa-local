import json

# Use this function to define the template of error responses
# Only used in endpoints
from django.core import serializers

from util import Defaults, Status


def buildError(msg):
    data = {'status': 'err', 'message': str(msg)}
    return str(json.dumps(data)).replace('\\', '')


# Use this function to return a msg attached to a payload in serialized JSON
# Payload is a dictionary, msg is a message to be attached to the payload.
# This method automatically populates the status field with 'ok', override the third parameter to change this
def buildBasicResponse(payload, msg=Defaults.OpOK, status=Status.OK):
    data = payload
    data['status'] = status
    data['message'] = msg
    return str(json.dumps(data))


# Use this function to return a list of objects retrieved from the database in a structured, readable, consistent
# form Very useful for most GET endpoints! Not a perfect serialization. If your query set contains objects that
# contain other objects, those dfields will be double serialized. Besure to sanitzie out '\'
def buildQueryResponse(queryset, msg=Defaults.OpOK, status=Status.OK):
    items = serializers.serialize('json', queryset)
    base = str(items)
    pre = '{ "message": "' + msg + '", "status": "' + status + '", "items" :' + base + ' }'

    return pre


# Use this function to return a list of dictionary objects. Useful for representing direct JSobjects
def buildDicListResponse(payload, msg=Defaults.OpOK, status=Status.OK):
    data = {'status': status, 'message': msg, 'items': payload}
    return str(json.dumps(data))
