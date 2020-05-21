from django import forms
from django.forms import ModelForm, HiddenInput
from .models import *


class BoardForm(ModelForm):
    class Meta:
        model = Boards
        fields = '__all__'
        exclude = ('experimentId',)
        widgets = {'user': HiddenInput(),
                   'boardr': HiddenInput(),
                   'boardg': HiddenInput(),
                   'boardb': HiddenInput(),
                   'boardtiltx': HiddenInput(),
                   'boardtilty': HiddenInput(),
                   'boardbackgroundr': HiddenInput(),
                   'boardbackgroundg': HiddenInput(),
                   'boardbackgroundb': HiddenInput(),
                   }
#Result Class is used to create an object with the following fields, the fields are set in javascript, then axios.post/get are used to call to the database
class ResultsForm(ModelForm):
    class Meta:
        model = Results
        fields = [
            'experimentName',
            'testerName',
            'stimNum',
            'stimX',
            'stimY',
            'timeStamp'
        ]

class BoardEditForm(ModelForm):
    class Meta:
        model = Boards
        fields = ['boardname',
                  'boardr',
                  'boardg',
                  'boardb',
                  'boardtiltx',
                  'boardtilty',
                  'boardbackgroundr',
                  'boardbackgroundg',
                  'boardbackgroundb',
                  ]
        exclude = ('experimentId',)
        widgets = {'boardr': HiddenInput(),
                   'boardg': HiddenInput(),
                   'boardb': HiddenInput(),
                   'boardtiltx': HiddenInput(),
                   'boardtilty': HiddenInput(),
                   'boardbackgroundr': HiddenInput(),
                   'boardbackgroundg': HiddenInput(),
                   'boardbackgroundb': HiddenInput(),
                   }


class StimSetForm(ModelForm):
    class Meta:
        model = StimSets
        fields = "__all__"
        excluded = ('experimentId',)
        widgets = {'user': HiddenInput(),
                   'experimentId': HiddenInput()}


class StimForm(ModelForm):
    class Meta:
        model = Stims
        fields = '__all__'
        exclude = ('experimentId',)
        widgets = {'stimsetid': HiddenInput(),
                   'stimr': HiddenInput(),
                   'stimg': HiddenInput(),
                   'stimb': HiddenInput(),
                   'labelr': HiddenInput(),
                   'labelg': HiddenInput(),
                   'labelb': HiddenInput(),
                   'stimshape': HiddenInput(),
                   }


class StimEditForm(ModelForm):
    class Meta:
        model = Stims
        fields = ['stimr',
                  'stimb',
                  'stimg',
                  'stimlabel',
                  'labelr',
                  'labelg',
                  'labelb',
                  'stimshape',
                  ]
        widgets = {'stimsetid': HiddenInput(),
                   'stimr': HiddenInput(),
                   'stimg': HiddenInput(),
                   'stimb': HiddenInput(),
                   'labelr': HiddenInput(),
                   'labelg': HiddenInput(),
                   'labelb': HiddenInput(),
                   'stimshape': HiddenInput(),
                   }
