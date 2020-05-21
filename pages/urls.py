from django.urls import path, re_path, include

from django.conf.urls import url
from django.views.generic import RedirectView

from .views import *

# Be sure to check out the JIRA entries. Sorry we didn't have time to properly link everything, but there are
# resources to help. Hopefully there will be a Backup JIRA avaliable, if not -> marcus@iofb.me

urlpatterns = [
    # path('', LoginPageView.as_view(), exName='login'),
    path('api/experiment/create', EndCreateExperimentForUser.as_view()),
    path('api/experiments/<exId>', EndGetExperimentById.as_view()),
    #  path('api/users/experiments/<userId>', EndGetExperimentsForUser.as_view()),
    path('api/config/delete', EndDeleteConfigById.as_view()),
    path('api/stimsets/set', EndSetStimsForExperiment.as_view()),
    path('api/stimsets/<exId>', EndGetStimsForExperiment.as_view()),
    path('api/stimsets/<exId>', EndGetStimsForExperiment.as_view()),
    path('api/stimsets/id/<exId>', EndGetStimSetForExperiment.as_view()),
    path('api/boards/<exId>', EndGetBoardForExperiment.as_view()),
    path('api/board/set', EndUpdateBoardForExperiment.as_view()),
    path('api/experiment/setname', EndSetNameForExperiment.as_view()),
    path('api/experiment/template', EndLoadTemplateForExperiment.as_view()),
    path('api/experiment/configs/<exId>', EndGetConfigsForExperiment.as_view()),
    path('api/experiment/package/<exId>', EndLoadFullExperimentById.as_view()),
    path('api/experiments/user/<userId>', EndGetExperimentsForUser.as_view()),
    path('api/experiment/configs', EndSaveConfigurationForEperiment.as_view()),
    path('api/configs/<configId>', EndGetConfigurationById.as_view()),
    path('api/experiment/invite', EndSendInvitesForExperiment.as_view()),
    path('api/experiment/invites/<invId>', EndGetInviteById.as_view()),
    path('api/invite/assign', EndSetParticipantIdForInvite.as_view()),
    path('api/experiment/remove', EndDeleteExperimentById.as_view()),
    path('api/results', EndResults.as_view()),
    path('api/results/<name>', EndResults.as_view()),
    path('api/results/all/<expName>/<int:increment>', EndResultsAll.as_view()),
    path('api/results/all/<expName>/bounds', EndResultsAllBounds.as_view()),
    path('api/results/<name>/bounds', EndResultsBounds.as_view()),


    # Fix issue where home page does not show login form. '/' is invalid, Need to go to login page!
    # Try navigating to these links in the app, to make more sense of this!
    path('', RedirectView.as_view(pattern_name='account_login')),
    path('home/', HomePageView.as_view(), name='home'),
    # url(r'^experiment/$', 'pages.views.delete_object', exName="delete_obj"),
    path('experiment/<exId>', ExperimentLandingPageView.as_view(), name='experiment_landing'),
    path('about/', AboutPageView.as_view(), name='about'),
    path('boards/', BoardListPageView.as_view(), name='boards'),
    path('stimsets/', StimSetListPageView.as_view(), name='stimsets'),
    path('boards/edit/<int:pk>', BoardEditPageView.as_view(), name='edit_board'),
    path('stimsets/edit/create/<int:stimsetid>', StimCreatePageView.as_view(), name='create_stimulus'),
    path('stimsets/edit/<int:pk>', StimListPageView.as_view(), name='stimuli'),
    path('view_results', ViewResultsPageView.as_view(), name='view_results'),
    # Ex Staging Page Aka Invite Page
    path('experiment/invite/<configId>', ExInvitePageView.as_view(), name='ex_invite'),
    # New landing page for editing an experiment
    path('experiment/edit/<exId>', EditExperimentLandingPageView.as_view(), name='edit-experiment-landing'),
    # We could likely get rid of this next routing later.
    path('create_experiment', CreateExperimentPageView.as_view(), name='create_experiment'),
    path(r'experiment/<int:stimsetid>/<int:boardid>', ViewExperimentPageView.as_view(), name='experiment'),
    # path(r'experiment/<int:stimsetid><int:boardid>', ViewExperimentPageView.as_view(), exName='experiment'),
    path(r'experiment/stimset/edit/<exId>', StimSetEditPageView.as_view(), name='edit_stimulus_set'),
    path(r'experiment/board/edit/<exId>', BoardCreatePageView.as_view(), name='create_board'),
    path('experiment/setup/<exId>', ExSetupPage.as_view(), name="ex_setup"),
    # Subject Subsystem routings
    # todo: Currently you could still go back to the prompt page,
    # which means they can redo their prompt start time. Is this a problem?
    path('subject/prompt/<invId>', ExPresPromptPageView.as_view()),
    path('subject/preview/<invId>/<promptTime>', ExPresPreviewPageView.as_view()),
    path('subject/pres/<dataString>', ExPresentationPageView.as_view()),
    path('subject/pres/complete/<dataString>', ExPresentationFinishPageView.as_view()),
    # path(r'experiment/<int:stimsetid><int:boardid>', ViewExperimentPageView.as_view(), name='experiment'),
]
