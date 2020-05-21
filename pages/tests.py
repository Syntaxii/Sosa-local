from django.test import TestCase
from .models import *
#Make sure to install coverage with: $pip install coverage
#To run tests normally: $ python manage.py test
#To run test with coverage: $ coverage run --source='.' manage.py test
#To display coverage: $ coverage report
#Make sure to set your database to a local postgres database.
#Backend models/DB testing

#Testing requirement 17 and 19
class ResultTestCase(TestCase):
    def  setUp(self):
        experimentName="UnitTest"
        testerName="testing"
        stimNum="0"
        stimX="-12.0"
        stimY="12.0"
        timeStamp="7:54:29 AM"

        res = Results()
        res.experimentName = experimentName
        res.testerName = testerName
        res.stimNum = stimNum
        res.stimX = stimX
        res.stimY = stimY
        res.timeStamp = timeStamp

        res.save()

    def testResult(self):
        #Check if results are properly generated
        res = Results.objects.get(testerName="testing")
        self.assertEqual(res.experimentName, 'UnitTest')

class UserTestCase(TestCase):
    def setUp(self):
        CustomUser.objects.create(id="12", password='asd123', last_login="2019-10-31", username="jeff")

    def testUserCreation(self):
        user = CustomUser.objects.get(id="12")
        self.assertEqual(user.username, 'jeff')

#Testing requirements 9, 12, and 13
class ExperimentTestCase(TestCase):
    def setUp(self):
        #create temporary customuser ID as foreign key for Experiment
        CustomUser.objects.create(id="123", password='asd123', last_login="2019-10-31", username="jeff")
        Experiment.objects.create(experimentId="ex-ID", name="experiment", creator_id="123")

    def testExperiment(self):
        exp = Experiment.objects.get(experimentId="ex-ID")
        self.assertEqual(exp.name, 'experiment')

#Test stimset creation
class StimsetTestCase(TestCase):

    def setUp(self):
        #Create temporary experiment and user as foreign key
        CustomUser.objects.create(id="1234", password='asd123', last_login="2019-10-31", username="jeff1")
        Experiment.objects.create(experimentId="2", name="experiment2", creator_id="1234")

        StimSets.objects.create(stimsetid="1", experimentId_id="2", user_id="1234")

    def testStimset(self):
        sSet = StimSets.objects.get(stimsetid="1")
        self.assertEqual(sSet.user_id, 1234)

#Complete requirement 9 test
class TotalExperimentTestCase(TestCase):
    def setUp(self):
        #User objects
        CustomUser.objects.create(id="12", password='asd123', last_login="2019-10-31", username="jeff1")
        creator = CustomUser.objects.filter(id=12)

        #Expepriment objects
        Experiment.objects.create(experimentId="12", name="experiment2", creator_id="12")
        exp = Experiment.objects.filter(experimentId="12")

        #Stimset objects
        StimSets.objects.create(stimsetid="1", experimentId_id="12", user_id="12")
        set = StimSets.objects.filter(stimsetid="1")

        ex = Experiment()
        ex.experimentId = exp[0]
        ex.creator = creator[0]
        ex.name = "experiment2"

        # Create the stim set\
        sSet = StimSets()

        sSet.experimentId = exp[0]
        sSet.stimsetid = 123
        sSet.user = creator[0]

        # Create the board
        board = Boards()
        board.user = creator[0]
        board.experimentId = exp[0]
        # Set default colors
        board.boardb = 111
        board.boardg = 111
        board.boardr = 111

        board.boardbackgroundb = 111
        board.boardbackgroundg = 111
        board.boardbackgroundr = 111
        # Set default tilt
        board.boardtiltx = 0
        board.boardtilty = 0
        # Generate boardId
        board.boardid = 1

        ex.save()
        board.save()
        sSet.save()

    def testTotalExperiment(self):
        ex = Experiment.objects.get(experimentId=12)
        board = Boards.objects.get(boardid=1)
        sSet = StimSets.objects.get(stimsetid=123)

        self.assertEqual(ex.name, "experiment2") #using local DB, you will need to change this
        self.assertEqual(board.boardtiltx, 0)
        self.assertEqual(sSet.stimsetid, '123')
        
class AllBoundsTestCase(TestCase):

    def testAllBounds(self):
        response = self.client.get('127.0.0.1:8000/api/results/all/<expName>/bounds', expName="asd")
        self.assertEqual(response.status_code, 404)