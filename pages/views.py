import json

from django.http import HttpResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView, FormView, ListView, UpdateView, CreateView, View
from django.urls import reverse_lazy
from django.core.mail import send_mail
from urllib import request
from django.shortcuts import render, render_to_response
# from python_http_client import HTTPError

from util import IdGen, Defaults, JsonConvert, Log, Status
from .forms import *
from .models import *
from django.conf import settings

# TODO: We're likely going to have to go through and convert the FormViews into TemplateViews with proper html/js
#  forms that hit a django endpoint
#  TODO: BEFORE YOU DEPLOY [Run this off local host], Don't forget to change this.
#   It's the address that gets attached to any outgoing url links, such as invites
BASE_URL = 'http://127.0.0.1:8000'


# Endpoints go here
#Results Endpoint that is used to actually save and get from the database
class EndResultsAll(View):
    @staticmethod
    def TAG():
        return 'EndResults'

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super(EndResultsAll, self).dispatch(request, *args, **kwargs)

    @staticmethod
    def post(req):
        return asJsonResponse(
            JsonConvert.buildError('This operation not supported by this endpoint.')
        )

    #Get method for all/anon results table in DB
    @staticmethod
    def get(self, expName, increment):

        results = Results.objects.filter(experimentName=expName)

        if not results:
            return asJsonResponse(
                JsonConvert.buildError('Results not found' + expName)
            )

        results = results[increment]
        resultDic = {
            'experimentName' : results.experimentName,
            'testerName' : results.testerName,
            'stimNum' : results.stimNum,
            'stimX' : results.stimX,
            'stimY' : results.stimY,
            'timeStamp' : results.timeStamp,
        }

        return asJsonResponse(
            JsonConvert.buildDicListResponse(resultDic)
        )
class EndResultsAllBounds(View):
    @staticmethod
    def TAG():
        return 'EndResultsAllBounds'

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super(EndResultsAllBounds, self).dispatch(request, *args, **kwargs)

    @staticmethod
    def post(req):
        return asJsonResponse(
            JsonConvert.buildError('This operation not supported by this endpoint.')
        )

    @staticmethod
    def get(self, expName):
        resultDic = {
            'count' : Results.objects.filter(experimentName=expName).count()
        }
        return asJsonResponse(
            JsonConvert.buildDicListResponse(resultDic)
        )
        
class EndResults(View):

    @staticmethod
    def TAG():
        return 'EndResults'

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super(EndResults, self).dispatch(request, *args, **kwargs)

    @staticmethod
    def post(req):

        experimentName = req.POST['experimentName']
        testerName = req.POST['testerName']
        stimNum = req.POST['stimNum']
        stimX = req.POST['stimX']
        stimY = req.POST['stimY']
        timeStamp = req.POST['timeStamp']

        res = Results()
        res.experimentName = experimentName
        res.testerName = testerName
        res.stimNum = stimNum
        res.stimX = stimX
        res.stimY = stimY
        res.timeStamp = timeStamp

        res.save()
    
    #Get method for results table in DB
    @staticmethod
    def get(self, name):

        results = Results.objects.filter(testerName=name)

        if not results:
            return asJsonResponse(
                JsonConvert.buildError('Results not found' + name)
            )

        results = results[0]
        resultDic = {
            'experimentName' : results.experimentName,
            'testerName' : results.testerName,
            'stimNum' : results.stimNum,
            'stimX' : results.stimX,
            'stimY' : results.stimY,
            'timeStamp' : results.timeStamp,
        }

        return asJsonResponse(
            JsonConvert.buildDicListResponse(resultDic)
        )

class EndResultsBounds(View):
    @staticmethod
    def TAG():
        return 'EndResultsBounds'

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super(EndResultsBounds, self).dispatch(request, *args, **kwargs)

    @staticmethod
    def post(req):
        return asJsonResponse(
            JsonConvert.buildError('This operation not supported by this endpoint.')
        )

    @staticmethod
    def get(self, name):
        resultDic = { 
            'count' : Results.objects.filter(testerName__contains=name).count()
        }
        return asJsonResponse(
            JsonConvert.buildDicListResponse(resultDic)
        )


class EndCreateExperimentForUser(View):

    # Create a TAG method for use in logging.
    @staticmethod
    def TAG():
        return 'EndCreateExperimentForUser'

    # Without this, we'll need to provide a csrf token manually.
    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super(EndCreateExperimentForUser, self).dispatch(request, *args, **kwargs)

    @staticmethod
    def get(req):
        return asJsonResponse(
            JsonConvert.buildError('This operation not supported by this endpoint.')
        )

    @staticmethod
    def post(req):

        # Pull parameters\
        # Fixed this, it's a mutiDictParameter error. Make sure to use the POST.get for uid
        creatorId = req.POST.get('uid', None)
        if creatorId is None:
            return asJsonResponse(
                JsonConvert.buildError('Found no userId!')
            )

        name = req.POST['exName']

        # Grab the user objects
        creator = CustomUser.objects.filter(id=creatorId)
        if creator.count() == 0:
            # No user found return error
            return asJsonResponse(
                JsonConvert.buildError('Unable to find user ' + creatorId)
            )
        else:
            creator = creator[0]

        ex = Experiment()
        ex.experimentId = IdGen.experimentId()
        ex.creator = creator
        ex.name = name

        # Create the stim set\
        sSet = StimSets()

        sSet.experimentId = ex
        sSet.stimsetid = IdGen.stimsetId()
        sSet.user = creator

        # Create the board
        board = Boards()
        board.user = creator
        board.experimentId = ex
        # Set default colors
        board.boardb = Defaults.BOARD_B
        board.boardg = Defaults.BOARD_G
        board.boardr = Defaults.BOARD_R

        board.boardbackgroundb = Defaults.BOARD_BG_B
        board.boardbackgroundg = Defaults.BOARD_BG_G
        board.boardbackgroundr = Defaults.BOARD_BG_R
        # Set default tilt
        board.boardtiltx = 0
        board.boardtilty = 0
        # Generate boardId
        board.boardid = IdGen.boardId()

        # Save to the database. ORDER MATTERS! Don't mess this up pls lol.
        try:
            ex.save()
            board.save()
            sSet.save()

            # If successful, we respond to the requester the experiment id and accepted exName; Also including userId
            data = {'exId': ex.experimentId, 'exName': ex.name, 'uid': ex.creator_id, }
            response = JsonConvert.buildBasicResponse(data, Defaults.OpOK)
            # Write the data here, then return.
            return asJsonResponse(response)

        except Exception as e:
            if hasattr(e, 'message'):
                # TODO: Replace first parameter with TAG
                Log.e(EndCreateExperimentForUser.TAG(), e.message)
                # We use this method to build an error message into json form.
                msg = JsonConvert.buildError(e.message)
            else:
                Log.e(EndCreateExperimentForUser.TAG(), 'An error has occurred! ' + type(e).__name__ + ' ' + e.args[0])
                msg = JsonConvert.buildError('An error has occurred!')
            # Respond err
            return asJsonResponse(msg)


class EndGetConfigurationById(View):
    # Create a TAG method for use in logging.
    @staticmethod
    def TAG():
        return 'EndGetConfigurationById'

    # Without this, we'll need to provide a csrf token manually.
    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super(EndGetConfigurationById, self).dispatch(request, *args, **kwargs)

    def get(self, req, configId):
        if not configId:
            return asJsonResponse(
                JsonConvert.buildError('Could not find parameter: userId')
            )

        try:
            result = ExperimentConfiguration.objects.get(exConfigId=configId)

            if not result:
                raise Exception('No results found matching configId %s' % configId)

            exConfig = {
                'exConfigId': configId,
                'experimentId': result.experimentId.experimentId,
                'exConfigName': result.exConfigName,
                'currentPresentationOrder': json.loads(result.currentPresentationOrder),
                'locks': result.locks,
                'gridNumber': result.gridNumber,
                'boardTintOpacity': result.boardTintOpacity,
                'boardTintR': result.boardTintR,
                'boardTintG': result.boardTintG,
                'boardTintB': result.boardTintB,
                'bgImageTintR': result.bgImageTintR,
                'bgImageTintG': result.bgImageTintG,
                'bgImageTintB': result.bgImageTintB,
                'previewImageUrl': result.previewImageUrl,
                'boardTiltOptions': result.boardTiltOptions,
                'shouldHidePreview': result.shouldHidePreview,
                'shouldHideBgImage': result.shouldHideBgImage,
                'shouldHideStimLabels': result.shouldHideStimLabels,
            }
            return asJsonResponse(
                JsonConvert.buildBasicResponse({
                    'config': exConfig
                })
            )
        except Exception as e:
            return asJsonResponse(
                JsonConvert.buildError('Was unable to retrieve configuration! msg: %s' % e.args[0])
            )


class EndGetInviteById(View):
    # Create a TAG method for use in logging.
    @staticmethod
    def TAG():
        return 'EndGetInviteById'

    # Without this, we'll need to provide a csrf token manually.
    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super(EndGetInviteById, self).dispatch(request, *args, **kwargs)

    def get(self, req, invId):
        if not invId:
            return asJsonResponse(
                JsonConvert.buildError('Could not find parameter: invId')
            )

        try:
            result = Invite.objects.get(invId=invId)

            if not result:
                raise Exception('No results found matching configId %s' % invId)

            exInv = {
                'invId': invId,
                'exConfigID': result.exConfigId.exConfigId,
                'participantId': result.participantId,
                'isExpired': result.isExpired,
            }
            return asJsonResponse(
                JsonConvert.buildBasicResponse({
                    'invite': exInv
                })
            )
        except Exception as e:
            return asJsonResponse(
                JsonConvert.buildError('Was unable to retrieve invite! msg: %s' % e.args[0])
            )

class EndDeleteConfigById(View):
    #Delete a configuration by the ID passed
    @staticmethod
    def TAG():
        return 'EndDeleteConfigById'
    @method_decorator(csrf_exempt)

    def dispatch(self, request, *args, **kwargs):
       return super(EndDeleteConfigById, self).dispatch(request, *args, **kwargs)
    def post(self, req):
        uid = req.user.id
        configId = req.POST['configId']
        if not configId:
            return asJsonResponse(
                JsonConvert.buildError('Could not find parameter configId')
            )

        exId = ExperimentConfiguration.objects.get(exConfigId=configId).experimentId.experimentId
        if not exId:
            return asJsonResponse(
                JsonConvert.buildError('Could not find associate exId with given configId '+ configId)
            )
        if not validateUserForExperiment(uid, exId):
            return asJsonResponse(
                JsonConvert.buildError(
                    'Could not validate user for experiment!'
                )
            )
        try:
            # todo: make this return a friendly error when the id is not found
            exConfig = ExperimentConfiguration.objects.get(exConfigId=configId).delete()
            if not exConfig:
                return asJsonResponse(
                    JsonConvert.buildError('could not find config %s' %configId)
                )

            return asJsonResponse(
                JsonConvert.buildBasicResponse({})
            )
        except Exception as e:
            return asJsonResponse(
                JsonConvert.buildError(
                    'Was unable to delete configuration. Msg: ' + e.args[0]
                )
            )




# names can ONLY BE SET ONCE!!
class EndSetParticipantIdForInvite(View):
    # Create a TAG method for use in logging.
    @staticmethod
    def TAG():
        return 'EndGetInviteById'

    # Without this, we'll need to provide a csrf token manually.
    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super(EndSetParticipantIdForInvite, self).dispatch(request, *args, **kwargs)

    def post(self, req):
        if 'invId' not in req.POST:
            return asJsonResponse(
                JsonConvert.buildError('Was unable to locate needed x-www-form-urlencoded params: %s, %s' % (
                    'invId', 'participantId [recieved]'))
            )
        if 'participantId' not in req.POST:
            return asJsonResponse(
                JsonConvert.buildError('Was unable to locate needed x-www-form-urlencoded params: %s, %s' % (
                    'invId [recieved]', 'participantId'))
            )

        invite = Invite.objects.get(invId=req.POST['invId'])
        # Can only set this ONCE, to avoid fraud #for harris
        if invite.participantId is not None:
            return asJsonResponse(
                JsonConvert.buildError('Name has already been set for this invite! Cannot change due to security '
                                       'restritions!')
            )

        # Set id here
        invite.participantId = req.POST['participantId']

        try:
            invite.save()
            return asJsonResponse(
                JsonConvert.buildBasicResponse({})
            )
        except Exception as e:
            return asJsonResponse(
                JsonConvert.buildError(
                    'Was unable to retrieve invite. Msg: ' + e.args[0]
                )
            )


class EndGetExperimentsForUser(View):
    # Create a TAG method for use in logging.
    @staticmethod
    def TAG():
        return 'EndGetExperimentsForUser'

    # Without this, we'll need to provide a csrf token manually.
    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super(EndGetExperimentsForUser, self).dispatch(request, *args, **kwargs)

    def get(self, req, userId):
        if not userId:
            return asJsonResponse(
                JsonConvert.buildError('Could not find parameter: userId')
            )

        try:
            exList = []
            for ex in Experiment.objects.filter(creator=userId):
                exList.append(
                    {
                        'exId': ex.experimentId,
                        'exName': ex.name
                    }
                )

            return asJsonResponse(
                JsonConvert.buildDicListResponse(exList)
            )
        except Exception as e:
            return None


class EndSetNameForExperiment(View):
    # Without this, we'll need to provide a csrf token manually.
    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super(EndSetNameForExperiment, self).dispatch(request, *args, **kwargs)

    def post(self, req):
        # Read and Validate parameters from the POST request
        if not req.POST['exId']:
            return asJsonResponse(
                JsonConvert.buildError('could not find parameter: exId')
            )
        exId = req.POST['exId']

        if not req.POST['uid']:
            return asJsonResponse(
                JsonConvert.buildError('could not find parameter: uid')
            )
        uid = req.POST['uid']

        if not req.POST['name']:
            return asJsonResponse(
                JsonConvert.buildError('could not find parameter: name')
            )
        name = req.POST['name']

        # Validate the user
        try:
            if not validateUserForExperiment(uid, exId):
                return asJsonResponse(
                    JsonConvert.buildError(
                        'could not validate uid %s for ex %s' % (uid, exId)
                    )
                )
        except Exception as e:
            msg = 'Exception while validating ex %s user %s!\nmsg: %s ' % (exId, uid, e.args[0])
            Log.e('End Update ExName', msg)

            # min validated
        ex = Experiment.objects.filter(experimentId=exId)
        if not ex:
            return asJsonResponse(
                JsonConvert.buildError('Unable to find matching ex for id %s' % exId)
            )
        ex = ex[0]

        ex.name = name
        try:
            ex.save()
            return asJsonResponse(
                JsonConvert.buildBasicResponse({})
            )
        except Exception as e:
            return asJsonResponse(
                JsonConvert.buildError('Unable to update board model! Why: ' + e.args[0])
            )


class EndLoadFullExperimentById(View):
    # Without this, we'll need to provide a csrf token manually.
    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super(EndLoadFullExperimentById, self).dispatch(request, *args, **kwargs)

    def get(self, req, exId):
        try:
            if not exId:
                raise Exception('Could not find parameter: exId')
            # Gather resources

            board = Boards.objects.get(experimentId=exId)
            dictBoard = {
                'boardid': board.boardid,
                'experimentId': board.experimentId.experimentId,
                'user': board.user.id,
                'boardname': board.boardname,
                'boardr': board.boardr,
                'boardg': board.boardg,
                'boardb': board.boardb,
                'boardtiltx': board.boardtiltx,
                'boardtilty': board.boardtilty,
                'boardbackgroundr': board.boardbackgroundr,
                'boardbackgroundg': board.boardbackgroundg,
                'boardbackgroundb': board.boardbackgroundb,
                'boardbackgroundurl': board.boardbackgroundurl,
            }

            dictStims = []
            stimsQs = Stims.objects.filter(
                stimsetid=StimSets.objects.get(experimentId=exId).stimsetid
            )
            for stim in stimsQs:
                dictStims.append(
                    {
                        'stimid': stim.stimid,
                        'stimr': stim.stimr,
                        'stimg': stim.stimg,
                        'stimb': stim.stimb,
                        'stimlabel': stim.stimlabel,
                        'labelr': stim.labelr,
                        'labelg': stim.labelg,
                        'labelb': stim.labelb,
                        'stimshape': stim.stimshape,
                        'stimsetid': stim.stimsetid.stimsetid,
                        'orders': stim.orders,
                        'imageUrl': stim.imageUrl
                    }
                )

            return asJsonResponse(
                JsonConvert.buildDicListResponse(
                    {
                        'experimentId': exId,
                        'experimentName': Experiment.objects.get(experimentId=exId).name,
                        'stims': dictStims,
                        'board': dictBoard
                    }
                )
            )
        except Exception as e:
            return asJsonResponse(
                JsonConvert.buildError('Failed to package experiment %s, \nmsg: %s' % (exId, e))
            )


class EndSaveConfigurationForEperiment(View):
    # Without this, we'll need to provide a csrf token manually.
    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super(EndSaveConfigurationForEperiment, self).dispatch(request, *args, **kwargs)

    def post(self, req):

        # Read and Validate parameters from the POST request
        if not req.POST['exConfig']:
            return asJsonResponse(
                JsonConvert.buildError('could not find parameter: exConfig')
            )
        if not req.POST['exId']:
            return asJsonResponse(
                JsonConvert.buildError('could not find parameter: exId')
            )
        exId = req.POST['exId']
        if not req.POST['uid']:
            return asJsonResponse(
                JsonConvert.buildError('could not find parameter: uid')
            )
        uid = req.POST['uid']
        # save the model, use try:except and be sure to notify on error
        try:
            exConfig = json.loads(req.POST['exConfig'])

            # Validate the user
            try:
                if not validateUserForExperiment(uid, exId):
                    return asJsonResponse(
                        JsonConvert.buildError(
                            'could not validate uid %s for ex %s' % (uid, exId)
                        )
                    )
            except Exception as e:
                msg = 'Exception while validating ex %s user %s!\nmsg: %s ' % (exId, uid, e.args[0])
                Log.e('End Update ExName', msg)

            # search for the name, if it exists, we perform an update
            baseConfig = ExperimentConfiguration.objects.filter(exConfigName=exConfig['exConfigName'],
                                                                experimentId=exId)
            # Create base config if none exists
            if not baseConfig:
                baseConfig = ExperimentConfiguration()
                baseConfig.exConfigId = IdGen.configId()
                baseConfig.experimentId = Experiment.objects.get(experimentId=exId)
                baseConfig.exConfigName = exConfig['exConfigName']
            # yes, I know this isn't quite all the fields, however, these are all we need for now.
            # Refer to GS 61 for more information about ExperimentCOnfiguration
            else:
                baseConfig = baseConfig[0]
            baseConfig.currentPresentationOrder = exConfig['currentPresentationOrder']
            baseConfig.locks = exConfig['locks']

            baseConfig.gridNumber = exConfig['gridSize']

            baseConfig.boardTintOpacity = exConfig['boardTintOpacity']
            baseConfig.boardTintR = exConfig['boardTintR']
            baseConfig.boardTintG = exConfig['boardTintG']
            baseConfig.boardTintB = exConfig['boardTintB']
            baseConfig.previewImageUrl = exConfig['previewImageUrl']
            baseConfig.shouldHidePreview = exConfig['shouldHidePreview']
            baseConfig.shouldHideBgImage = exConfig['shouldHideBgImage']
            baseConfig.shouldHideStimLabels = exConfig['shouldHideStimLabels']

            baseConfig.save()
            return asJsonResponse(
                JsonConvert.buildBasicResponse(
                    {'exConfigId': baseConfig.exConfigId})
            )
        except Exception as e:
            return asJsonResponse(
                JsonConvert.buildError('Was unable to update model! msg: %s' % e.args[0])
            )


# noinspection PyPep8Naming
class EndGetConfigsForExperiment(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super(EndGetConfigsForExperiment, self).dispatch(request, *args, **kwargs)

    @staticmethod
    def post(req):
        return asJsonResponse(
            JsonConvert.buildError('This operation not supported by this endpoint.')
        )

    def get(self, req, exId):

        if not exId:
            return asJsonResponse(
                JsonConvert.buildError('Provide parameter exId.')
            )

        configQuerySet = ExperimentConfiguration.objects.filter(experimentId=exId).only('exConfigName', 'exConfigId')

        returnList = []
        if not configQuerySet:
            return asJsonResponse(
                JsonConvert.buildDicListResponse(returnList)
            )
        for qConfig in configQuerySet:
            dictConfig = {'configName': qConfig.exConfigName, 'configId': qConfig.exConfigId}
            returnList.append(
                dictConfig
            )

        return asJsonResponse(
            JsonConvert.buildDicListResponse(returnList)
        )


# todone: TEST
class EndGetStimSetForExperiment(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super(EndGetStimSetForExperiment, self).dispatch(request, *args, **kwargs)

    @staticmethod
    def post(req):
        return asJsonResponse(
            JsonConvert.buildError('This operation not supported by this endpoint.')
        )

    def get(self, req, exId):

        if not exId:
            return asJsonResponse(
                JsonConvert.buildError('Provide parameter exId.')
            )

        stimset = StimSets.objects.filter(experimentId=exId)

        if not stimset:
            return asJsonResponse(
                JsonConvert.buildError('Unable to find stimset for exId: %s' % (exId))
            )
        else:
            return asJsonResponse(
                JsonConvert.buildQueryResponse(stimset)
            )


class EndGetExperimentById(View):
    @staticmethod
    def TAG():
        return 'Get Experiment By Id End'

    # Without this, we'll need to provide a csrf token manually.
    @method_decorator(csrf_exempt)
    def dispatch(self, req, *args, **kwargs):
        return super(EndGetExperimentById, self).dispatch(req, *args, **kwargs)

    @staticmethod
    def post(req):
        return buildHttpResponse(405, 'Method POST unsupported by this endpoint!')

    @staticmethod
    def get(req, exId):
        try:
            ex = Experiment.objects.get(experimentId=exId)
            data = {
                'exId': ex.experimentId,
                'creator': ex.creator.id,
                'name': ex.name,
            }
            return asJsonResponse(
                JsonConvert.buildDicListResponse(data)
            )
        except Exception as e:
            return asJsonResponse(
                JsonConvert.buildError('Was unable to get experiment ' + exId + '  msg?: ' + e.args[0])
            )


class EndGetStimsForExperiment(View):
    @staticmethod
    def TAG():
        return 'Get Stims By ID End'

    # Without this, we'll need to provide a csrf token manually.
    @method_decorator(csrf_exempt)
    def dispatch(self, req, *args, **kwargs):
        return super(EndGetStimsForExperiment, self).dispatch(req, *args, **kwargs)

    @staticmethod
    def post(req):
        return buildHttpResponse(405, 'Method POST unsupported by this endpoint!')

    @staticmethod
    def get(req, exId):
        stimSet = StimSets.objects.filter(experimentId=exId)
        if stimSet.count == 0:
            return asJsonResponse(
                JsonConvert.buildError('Was unable to find experiment for id ' + exId + '!')
            )

        else:
            stims = Stims.objects.filter(stimsetid=stimSet[0].stimsetid)
            stimList = []
            for stim in stims:
                stimDict = {
                    # Damn how'd I forget this...
                    "stimid": stim.stimid,
                    "imageUrl": stim.imageUrl,
                    "stimr": stim.stimr,
                    "stimb": stim.stimb,
                    "stimg": stim.stimg,
                    "stimlabel": stim.stimlabel,
                    "labelr": stim.labelr,
                    "labelb": stim.labelb,
                    "labelg": stim.labelg,
                    "stimshape": stim.stimshape,
                    "stimsetid": stim.stimsetid.stimsetid,
                    "orders": stim.orders
                }
                stimList.append(
                    stimDict
                )
            return asJsonResponse(
                JsonConvert.buildDicListResponse(stimList)
            )

        # api/experiment/create req: uid, exName


class EndSetStimsForExperiment(View):
    @staticmethod
    def TAG():
        return 'Set Stims End'

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super(EndSetStimsForExperiment, self).dispatch(request, *args, **kwargs)

    @staticmethod
    def get(req):
        return asJsonResponse(
            JsonConvert.buildError('This operation not supported by this endpoint.')
        )

    @staticmethod
    def post(req):
        # Pull parameters\
        # Fixed this, it's a mutiDictParameter error. Make sure to use the POST.get for uid
        userId = req.POST.get('uid', None)
        if userId is None:
            return asJsonResponse(
                JsonConvert.buildError('Found no uid!')
            )

        exId = req.POST.get('exId', None)
        if exId is None:
            return asJsonResponse(
                JsonConvert.buildError('Found no exId !')
            )

        stimObjects = req.POST.get('stims', None)
        if stimObjects is None:
            return asJsonResponse(
                JsonConvert.buildError('Found no stims parameter!')
            )

        experiment = Experiment.objects.filter(experimentId=exId)[0]

        if experiment.creator.id != int(userId):
            return asJsonResponse(
                JsonConvert.buildError(
                    'User does not have permissions to edit this experiment ' + str(
                        experiment.creator.id) + ' to ' + userId)
                # Better version 'YOU HAVE NO POWER HERE'
            )

        # Gives a list of stim dictionaries
        stims = json.loads(stimObjects)

        stimObj = None
        for stim in stims:
            try:
                if 'stimid' not in stim:
                    stimObj = Stims()
                else:
                    stimObj = Stims.objects.filter(stimid=stim['stimid'])
                    if stimObj.count() == 0:
                        return asJsonResponse(
                            JsonConvert.buildError(
                                'Could not find stim of id ' + str(stim['stimid']) + ' yet it was specified.'
                            )
                        )
                    else:
                        stimObj = stimObj[0]
                # Set attributes
                stimObj.imageUrl = stim['imageUrl']
                stimObj.stimr = stim['stimr']
                stimObj.stimb = stim['stimb']
                stimObj.stimg = stim['stimg']
                stimObj.stimlabel = stim['stimlabel']
                stimObj.labelr = stim['labelr']
                stimObj.labelb = stim['labelb']
                stimObj.labelg = stim['labelg']
                stimObj.stimshape = stim['stimshape']
                stimObj.stimsetid = StimSets.objects.filter(stimsetid=stim['stimsetid'])[0]
                stimObj.orders = stim['orders']
                stimObj.save()
            except Exception as e:
                return asJsonResponse(
                    JsonConvert.buildError('Unable to Save Stims \n' + e.args[0])
                )
        return asJsonResponse(
            JsonConvert.buildBasicResponse({})
        )


class EndUpdateBoardForExperiment(View):
    @staticmethod
    def TAG():
        return 'Update Board End'

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super(EndUpdateBoardForExperiment, self).dispatch(request, *args, **kwargs)

    def get(self, req):
        return buildHttpResponse(
            405, 'Method not supported by this endpoint, GET'
        )

    def post(self, req):
        # Read and Validate parameters from the POST request
        if not req.POST['exId']:
            return asJsonResponse(
                JsonConvert.buildError('could not find parameter: exId')
            )
        exId = req.POST['exId']
        if not req.POST['board']:
            return asJsonResponse(
                JsonConvert.buildError('could not find parameter: board')
            )
        uid = req.POST['uid']
        if not req.POST['uid']:
            return asJsonResponse(
                JsonConvert.buildError('could not find parameter: uid')
            )

        # Validate the user
        try:
            if not validateUserForExperiment(uid, exId):
                return asJsonResponse(
                    JsonConvert.buildError(
                        'could not validate uid %s for ex %s' % (uid, exId)
                    )
                )
        except Exception as e:
            msg = 'Exception while validating ex %s user %s!\nmsg: %s ' % (exId, uid, e.args[0])
            Log.e(self.TAG(), msg)
        # should be min validated
        newBoard = json.loads(req.POST['board'])
        if not newBoard:
            return asJsonResponse(
                JsonConvert.buildError('could not load parameter: board ; bad JSON?')
            )
        # Grab the base board and validate
        board = Boards.objects.filter(experimentId=exId)
        if not board:
            return asJsonResponse(
                JsonConvert.buildError('unable to find board for exId: ' + exId)
            )
        # fix not bein g amodel
        board = board[0]
        # update the model with the new model.
        board.boardr = newBoard['boardr']
        board.boardg = newBoard['boardg']
        board.boardb = newBoard['boardb']

        board.boardbackgroundb = newBoard['boardbackgroundb']
        board.boardbackgroundg = newBoard['boardbackgroundg']
        board.boardbackgroundr = newBoard['boardbackgroundr']

        board.boardbackgroundurl = newBoard['boardbackgroundurl']

        board.boardtiltx = newBoard['boardtiltx']
        board.boardtilty = newBoard['boardtilty']

        try:
            # attempt save
            board.save()
            Log.i(self.TAG(), 'success')
            return asJsonResponse(
                JsonConvert.buildBasicResponse({})
            )
        except Exception as e:
            # something went wrong...
            Log.e(self.TAG(), e.args[0] + '\nexId: ' + exId)
            return asJsonResponse(
                JsonConvert.buildError('a problem occured while saving!')
            )


class EndSendInvitesForExperiment(View):
    @staticmethod
    def TAG():
        return 'EndSendInvitesForExperiment'

        # Without this, we'll need to provide a csrf token manually.

    @method_decorator(csrf_exempt)
    def dispatch(self, req, *args, **kwargs):
        return super(EndSendInvitesForExperiment, self).dispatch(req, *args, **kwargs)

    def post(self, req):
        if 'uid' not in req.POST:
            return asJsonResponse(
                JsonConvert.buildError('Could not find required paremeter: uid')
            )
        if 'exConfigId' not in req.POST:
            return asJsonResponse(

                JsonConvert.buildError('Could not find required paremeter: exConfigId')
            )
        if 'emails' not in req.POST:
            return asJsonResponse(
                JsonConvert.buildError('Could not find required paremeter: emails')
            )
        try:
            uid = req.POST['uid']
            exConfigId = req.POST['exConfigId']
            exId = ExperimentConfiguration.objects.get(exConfigId=exConfigId).experimentId.experimentId
            emails = req.POST['emails']
            if ',' in emails:
                emails = emails.split(',')
            else:
                emails = [emails]

            if not validateUserForExperiment(uid, exId):
                return asJsonResponse(
                    JsonConvert.buildError('Could not validate user for experiment, are you sure you have access?')
                )

            for email in emails:
                inviteModel = Invite()
                inviteModel.exConfigId = ExperimentConfiguration.objects.get(exConfigId=exConfigId)
                inviteModel.invId = IdGen.inviteId()
                inviteModel.isExpired = False
                inviteModel.participantId = None

                inviteModel.save()
                url = BASE_URL + '/subject/prompt/' + inviteModel.invId
                # Send Email
                send_mail(
                    'SOSA: Experiment Invitation',
                    'Hello, \n You are seeing this message because you have been invited to participate in a SOSA study!\n'
                    'Click this link %s to begin! \n\nNote that time tracking will begin as soon as you confirm the prompt.'
                    '\n\n-SOSA Team' % url,
                    'no-reply@sosa.georgiasouthern.edu', [email], True
                )

            return asJsonResponse(
                JsonConvert.buildBasicResponse({})
            )
        except Exception as e:
            return asJsonResponse(
                JsonConvert.buildError('Failed to send invites! ' + e.args[0])
            )


class EndGetBoardForExperiment(View):
    @staticmethod
    def TAG():
        return 'Get Board For Experiment End'

        # Without this, we'll need to provide a csrf token manually.

    @method_decorator(csrf_exempt)
    def dispatch(self, req, *args, **kwargs):
        return super(EndGetBoardForExperiment, self).dispatch(req, *args, **kwargs)

    def get(self, req, exId):
        board = Boards.objects.filter(experimentId=exId)
        if not board:
            return asJsonResponse(
                JsonConvert.buildError('Board not found ' + exId)
            )
        board = board[0]
        boardDic = {
            'boardid': board.boardid,
            'experimentId': board.experimentId.experimentId,
            'boardr': board.boardr,
            'boardg': board.boardg,
            'boardb': board.boardb,
            'boardtiltx': board.boardtiltx,
            'boardtilty': board.boardtilty,
            'boardbackgroundr': board.boardbackgroundr,
            'boardbackgroundg': board.boardbackgroundg,
            'boardbackgroundb': board.boardbackgroundb,
            'boardbackgroundurl': board.boardbackgroundurl,

        }
        return asJsonResponse(
            JsonConvert.buildDicListResponse(boardDic)
        )


class EndLoadTemplateForExperiment(View):
    @staticmethod
    def TAG():
        return 'LoadTemplateForExperiment'

        # Without this, we'll need to provide a csrf token manually.

    @method_decorator(csrf_exempt)
    def dispatch(self, req, *args, **kwargs):
        return super(EndLoadTemplateForExperiment, self).dispatch(req, *args, **kwargs)

    def post(self, req):
        # Read and Validate parameters from the POST request
        if not req.POST['templateEx']:
            return asJsonResponse(
                JsonConvert.buildError('could not find parameter: templateEx')
            )
        templateExId = req.POST['templateEx']
        if not req.POST['baseEx']:
            return asJsonResponse(
                JsonConvert.buildError('could not find parameter: baseEx')
            )
        baseExId = req.POST['baseEx']
        if not req.POST.get('uid'):
            return asJsonResponse(
                JsonConvert.buildError('could not find parameter: uid')
            )

        userId = req.POST.get('uid')

        # Validate
        try:
            if not validateUserForExperiment(userId, baseExId):
                return asJsonResponse(
                    JsonConvert.buildError('could not validate parameter: uid %s for ex %s' % (userId, baseExId))
                )
        except Exception as e:
            print(e)
            return asJsonResponse(
                JsonConvert.buildError('could not validate parameter: uid %s for ex %s [Do you have the right ids? '
                                       'They may no longer be valid!]' % (userId, baseExId))
            )

        # should be validated at this point

        # gather template resources clone them withnew experiment
        try:
            baseStimSet = StimSets.objects.filter(experimentId=baseExId)[0]
            if not baseStimSet:
                raise Exception('Unable to find base stimeset!')
            templateStimset = StimSets.objects.filter(experimentId=templateExId)[0]
            if not templateStimset:
                raise Exception('Unable to find template stimeset!')
            # Template board
            templateBoard = Boards.objects.filter(experimentId=templateExId)[0]
            if not templateBoard:
                raise Exception('Unable to find template board!')
        except Exception as E:
            return asJsonResponse(
                JsonConvert.buildError('Could not gather assets! \n msg: %s' % E)
            )
        # Update pk to copy
        templateBoard.pk = None
        templateBoard.experimentId = Experiment.objects.get(experimentId=baseExId)
        # cleanup old board
        Boards.objects.filter(experimentId=baseExId).delete()
        # save board
        templateBoard.save()
        # load all template stims
        templateStims = Stims.objects.filter(stimsetid=templateStimset)

        # delete all old stims from the base set
        Stims.objects.filter(stimsetid=baseStimSet).delete()
        # add stim copies
        for stim in templateStims:
            stim.pk = None
            stim.stimsetid = baseStimSet
            stim.save()

        return asJsonResponse(
            JsonConvert.buildBasicResponse({})
        )
        # todo test.


class EndDeleteExperimentById(View):
    @staticmethod
    def TAG():
        return 'DeleteExperimentById'

    @method_decorator(csrf_exempt)
    def dispatch(self, req, *args, **kwargs):
        return super(EndDeleteExperimentById, self).dispatch(req, *args, **kwargs)

    def post(self, req):
        uid = req.POST['uid']
        exId = req.POST['exId']
        if not uid:
            return asJsonResponse(
                JsonConvert.buildError('Could not find parameter: uid')
            )

        if not exId:
            return asJsonResponse(
                JsonConvert.buildError('Could not find parameter: exId')
            )

        # Validate the user
        try:
            if not validateUserForExperiment(uid, exId):
                return asJsonResponse(
                    JsonConvert.buildError(
                        'could not validate uid %s for ex %s' % (uid, exId)
                    )
                )
        except Exception as e:
            msg = 'Exception while validating ex %s user %s!\nmsg: %s ' % (exId, uid, e.args[0])
            Log.e(self.TAG(), msg)
            return asJsonResponse(
                JsonConvert.buildError('Failed to validate user for experiment')
            )

        try:
            ex = Experiment.objects.get(experimentId=exId)
            if not ex:
                return asJsonResponse(
                    JsonConvert.buildError(
                        'could not find experiment by id parameter: %s' % exId
                    )
                )
            else:
                stimset = StimSets.objects.get(experimentId=ex.experimentId)
                stims = Stims.objects.filter(stimsetid=stimset.stimsetid)

                stims.delete()
                stimset.delete()
                ex.delete()

                Log.i(self.TAG(), 'Experiment deleted by id parameter: exId')
                return asJsonResponse(
                    JsonConvert.buildBasicResponse({})
                )

        except Exception as e:
            msg = 'Exception while deleting ex %s user %s!\nmsg: %s ' % (exId, uid, e.args[0])
            Log.e(self.TAG(), msg)
            return asJsonResponse(
                JsonConvert.buildError('Failed to validate user for experiment')
            )


# End endpoints

# TODOING : Fix
class BoardCreatePageView(TemplateView):
    template_name = "../templates/pages/edit_board.html"


class EditExperimentLandingPageView(TemplateView):
    template_name = 'pages/edit_ex_landing.html'

    def get_context_data(self, **kwargs):
        context = super(EditExperimentLandingPageView, self).get_context_data(**kwargs)
        context['exId'] = kwargs['exId']
        return context


class ExPresPreviewPageView(TemplateView):
    template_name = 'pages/ex_presentation_preview.html'

    def get_context_data(self, **kwargs):
        context = super(ExPresPreviewPageView, self).get_context_data(**kwargs)
        context['invId'] = kwargs['invId']
        context['promptTime'] = kwargs['promptTime']
        return context


class ExPresentationPageView(TemplateView):
    template_name = 'pages/ex_presentation.html'

    def get_context_data(self, **kwargs):
        context = super(ExPresentationPageView, self).get_context_data(**kwargs)
        context['dataString'] = kwargs['dataString']
        return context


class ExPresentationFinishPageView(TemplateView):
    template_name = 'pages/ex_pres_finish.html'

    def get_context_data(self, **kwargs):
        context = super(ExPresentationFinishPageView, self).get_context_data(**kwargs)
        context['dataString'] = kwargs['dataString']
        return context

class StimSetEditPageView(TemplateView):
    model = Stims
    context_object_name = "stimuli"
    template_name = "../templates/pages/edit_stimulus.html"
    success_url = reverse_lazy('stimsets')

    def get_context_data(self, **kwargs):
        context = super(StimSetEditPageView, self).get_context_data(**kwargs)
        context['exId'] = kwargs['exId']
        context['userId'] = self.request.user.id
        return context


class ExPresPromptPageView(TemplateView):
    template_name = "../templates/pages/ex_pres_prompt.html"

    def get_context_data(self, **kwargs):
        context = super(ExPresPromptPageView, self).get_context_data(**kwargs)
        context['invId'] = kwargs['invId']
        return context


class BoardEditPageView(TemplateView):
    template_name = "../templates/pages/edit_board.html"
    success_url = reverse_lazy('boards')

    def get_context_data(self, **kwargs):
        context = super(BoardEditPageView, self).get_context_data(**kwargs)
        context['exId'] = kwargs['exId']
        context['userId'] = self.request.user.id
        return context


class HomePageView(TemplateView):
    template_name = 'pages/home.html'


class AboutPageView(TemplateView):
    template_name = 'pages/about.html'


class ExInvitePageView(TemplateView):
    template_name = "../templates/pages/ex_invite.html"

    def get_context_data(self, **kwargs):
        context = super(ExInvitePageView, self).get_context_data(**kwargs)

        configId = kwargs['configId']

        context['configId'] = configId
        context['userId'] = self.request.user.id

        return context


class ExSetupPage(TemplateView):
    template_name = "../templates/pages/ex_setup.html"

    def get_context_data(self, **kwargs):
        context = super(ExSetupPage, self).get_context_data(**kwargs)
        exId = kwargs['exId']
        context['exId'] = exId
        context['userId'] = self.request.user.id
        return context


class ExperimentLandingPageView(TemplateView):
    template_name = "../templates/pages/load_ex_landing.html"

    def get_context_data(self, **kwargs):
        context = super(ExperimentLandingPageView, self).get_context_data(**kwargs)
        exId = kwargs['exId']
        context['exId'] = exId
        context['userId'] = self.request.user.id
        return context


class LoginPageView(TemplateView):
    template_name = "account/login.html"


class BoardListPageView(ListView):
    template_name = "pages/board_list.html"
    model = Boards
    queryset = Boards.objects.all()
    context_object_name = "boards"


class StimSetListPageView(CreateView, ListView):
    model = StimSets
    template_name = "../templates/pages/stim_sets.html"
    queryset = StimSets.objects.all()
    context_object_name = "stimsets"
    form_class = StimSetForm
    success_url = reverse_lazy('stimsets')


class StimListPageView(ListView):
    model = Stims
    template_name = "pages/stimuli.html"
    queryset = Stims.objects.all()
    context_object_name = "stimuli"

    def get_context_data(self, *, object_list=None, **kwargs):
        context = super(StimListPageView, self).get_context_data(**kwargs)
        context['stimsets'] = StimSets.objects.all()
        return context


class StimCreatePageView(FormView):
    form_class = StimForm

    template_name = "../templates/pages/create_stimulus.html"
    success_url = reverse_lazy('stimsets')

    def form_valid(self, form):
        form.save()
        return super(StimCreatePageView, self).form_valid(form)


class ViewResultsPageView(TemplateView):
    template_name = "pages/view_results.html"


class CreateExperimentPageView(ListView):
    template_name = "pages/create_experiment.html"
    model = Boards
    queryset = Boards.objects.all()
    context_object_name = "boards"

    def get_context_data(self, **kwargs):
        context = super(CreateExperimentPageView, self).get_context_data(**kwargs)
        context['stimsets'] = StimSets.objects.all()
        context['stimuli'] = Stims.objects.all()
        # And so on for more models
        return context


class ViewExperimentPageView(TemplateView):
    template_name = "pages/view_experiment.html"

    def get_context_data(self, **kwargs):
        context = super(ViewExperimentPageView, self).get_context_data(**kwargs)
        # *rolls eyes*s ~m
        context['boards'] = Boards.objects.all()
        context['stimsets'] = StimSets.objects.all()
        context['stimuli'] = Stims.objects.all()
        # TODO: replace this absurd code with filter()
        return context


# Validation todo: we should move this to a utility class, for the sake of proper MVT
def validateUserForExperiment(uid, exId):
    if not uid:
        raise ParameterException('uid cannot be None')
    if not exId:
        raise ParameterException('exId cannot be None')

    experiment = Experiment.objects.filter(experimentId=exId)
    if not experiment:
        raise ParameterException('invalid exId was passed! ' + exId)
    experiment = experiment[0]

    return str(experiment.creator.id) == str(uid)


# Tools
def asJsonResponse(json):
    res = HttpResponse()
    res['Content-Type'] = 'application/json'
    res.write(json)
    return res


def buildHttpResponse(code, content):
    res = HttpResponse(content=content)
    res.status_code = code
    return res


# Exceptions
class ParameterException(Exception):
    def __init__(self, msg):
        super(Exception(msg))
