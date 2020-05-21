import uuid

from django.db import models
from users.models import CustomUser
from django.forms import ModelForm

# Create your models here.
from util import IdGen


class Experiment(models.Model):
    experimentId = models.CharField(primary_key=True, default=IdGen.experimentId(), max_length=250)
    creator = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    name = models.CharField(max_length=300)

class Results(models.Model):
    experimentName = models.CharField(max_length=250)
    testerName = models.CharField(primary_key=True, default="Anonymous1", max_length=300)
    stimNum = models.CharField(max_length=300)
    stimX = models.CharField(max_length=300)
    stimY = models.CharField(max_length=300)
    timeStamp = models.CharField(max_length=300)

    def __str__(self):
        return self.experimentName
        
    def save(self, *args, **kwargs):
        super(Results, self).save(*args, **kwargs)


class ExperimentConfiguration(models.Model):
    exConfigId = models.CharField(primary_key=True, default=IdGen.configId(), max_length=250)
    experimentId = models.ForeignKey(Experiment, on_delete=models.CASCADE, default=IdGen.experimentId())
    exConfigName = models.CharField(max_length=300, default='No Name')
    currentPresentationOrder = models.CharField(max_length=90000)
    locks = models.CharField(max_length=5000)  # see GS61
    gridNumber = models.IntegerField()  # see GS61

    boardTintOpacity = models.IntegerField(null=False, default=0)
    boardTintR = models.IntegerField(null=True)
    boardTintG = models.IntegerField(null=True)
    boardTintB = models.IntegerField(null=True)
    # Not really needed to be honest, will keep just incase
    bgImageTintR = models.IntegerField(null=True)
    bgImageTintG = models.IntegerField(null=True)
    bgImageTintB = models.IntegerField(null=True)

    previewImageUrl = models.CharField(null=True, max_length=300)
    # Also not sure if we really need this either.
    boardTiltOptions = models.CharField(null=True, max_length=300)  # Could be possible JSON

    shouldHidePreview = models.BooleanField(default=False)
    shouldHideBgImage = models.BooleanField(default=False)
    shouldHideStimLabels = models.BooleanField(default=False)


class Boards(models.Model):
    boardid = models.CharField(primary_key=True, default=IdGen.boardId(), max_length=250)
    experimentId = models.ForeignKey(Experiment, on_delete=models.CASCADE, default=IdGen.experimentId())
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    boardname = models.CharField(max_length=96)
    boardr = models.IntegerField(default=0)
    boardg = models.IntegerField(default=0)
    boardb = models.IntegerField(default=0)
    boardtiltx = models.IntegerField(default=0)
    boardtilty = models.IntegerField(default=0)
    boardbackgroundr = models.IntegerField(default=0)
    boardbackgroundg = models.IntegerField(default=0)
    boardbackgroundb = models.IntegerField(default=0)
    boardbackgroundurl = models.CharField(max_length=350, null=True)

    def __str__(self):
        return self.boardname

    def save(self, *args, **kwargs):
        super(Boards, self).save(*args, **kwargs)


class StimSets(models.Model):
    stimsetid = models.CharField(primary_key=True, default=IdGen.stimsetId(), max_length=250)
    experimentId = models.ForeignKey(Experiment, on_delete=models.CASCADE)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    stimsetname = models.CharField(max_length=96)

    def __str__(self):
        return self.stimsetname

    def save(self, *args, **kwargs):
        super(StimSets, self).save(*args, **kwargs)


class Stims(models.Model):
    stimid = models.AutoField(primary_key=True)
    stimr = models.IntegerField(default=0)
    stimg = models.IntegerField(default=0)
    stimb = models.IntegerField(default=0)
    stimlabel = models.CharField(max_length=96)
    labelr = models.IntegerField(default=0)
    labelg = models.IntegerField(default=0)
    labelb = models.IntegerField(default=0)
    stimshape = models.CharField(max_length=25, blank=True, null=True)
    stimsetid = models.ForeignKey(StimSets, on_delete=models.CASCADE)
    orders = models.CharField(max_length=5000, default='''
    {
    "orders": {
        "Order_1": "0"
     }
    }
    ''')  # JSON Dictionary
    imageUrl = models.CharField(max_length=350, null=True)

    def __str__(self):
        return self.stimlabel

    def save(self, *args, **kwargs):
        super(Stims, self).save(*args, **kwargs)


class Invite(models.Model):
    invId = models.CharField(primary_key=True, default=IdGen.inviteId(), max_length=250)
    exConfigId = models.ForeignKey(ExperimentConfiguration, on_delete=models.CASCADE, default="ex-config-not-set [ERR]")
    participantId = models.CharField(max_length=250, default="no-name-set [ERR]", null=True)
    isExpired = models.BooleanField(default=False)
