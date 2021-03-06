# Generated by Django 2.2.6 on 2019-12-02 22:00

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Experiment',
            fields=[
                ('experimentId', models.CharField(default='ex-9e877487-4c00-4097-bb3b-b670b92b9d47', max_length=250, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=300)),
                ('creator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='ExperimentConfiguration',
            fields=[
                ('exConfigId', models.CharField(default='cfg-1e8e41bf-610f-4124-ae1e-e924e7bab9b0', max_length=250, primary_key=True, serialize=False)),
                ('exConfigName', models.CharField(default='No Name', max_length=300)),
                ('currentPresentationOrder', models.CharField(max_length=90000)),
                ('locks', models.CharField(max_length=5000)),
                ('gridNumber', models.IntegerField()),
                ('boardTintOpacity', models.IntegerField(default=0)),
                ('boardTintR', models.IntegerField(null=True)),
                ('boardTintG', models.IntegerField(null=True)),
                ('boardTintB', models.IntegerField(null=True)),
                ('bgImageTintR', models.IntegerField(null=True)),
                ('bgImageTintG', models.IntegerField(null=True)),
                ('bgImageTintB', models.IntegerField(null=True)),
                ('previewImageUrl', models.CharField(max_length=300, null=True)),
                ('boardTiltOptions', models.CharField(max_length=300, null=True)),
                ('shouldHidePreview', models.BooleanField(default=False)),
                ('shouldHideBgImage', models.BooleanField(default=False)),
                ('shouldHideStimLabels', models.BooleanField(default=False)),
                ('experimentId', models.ForeignKey(default='ex-e8c806ab-d628-47c3-9aa5-4fa30355184c', on_delete=django.db.models.deletion.CASCADE, to='pages.Experiment')),
            ],
        ),
        migrations.CreateModel(
            name='Results',
            fields=[
                ('experimentName', models.CharField(max_length=250)),
                ('testerName', models.CharField(default='Anonymous1', max_length=300, primary_key=True, serialize=False)),
                ('stimNum', models.CharField(max_length=300)),
                ('stimX', models.CharField(max_length=300)),
                ('stimY', models.CharField(max_length=300)),
                ('timeStamp', models.CharField(max_length=300)),
            ],
        ),
        migrations.CreateModel(
            name='StimSets',
            fields=[
                ('stimsetid', models.CharField(default='sts-2ac9ff21-0729-4b9f-839f-b90ec2ed5dbb', max_length=250, primary_key=True, serialize=False)),
                ('stimsetname', models.CharField(max_length=96)),
                ('experimentId', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='pages.Experiment')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Stims',
            fields=[
                ('stimid', models.AutoField(primary_key=True, serialize=False)),
                ('stimr', models.IntegerField(default=0)),
                ('stimg', models.IntegerField(default=0)),
                ('stimb', models.IntegerField(default=0)),
                ('stimlabel', models.CharField(max_length=96)),
                ('labelr', models.IntegerField(default=0)),
                ('labelg', models.IntegerField(default=0)),
                ('labelb', models.IntegerField(default=0)),
                ('stimshape', models.CharField(blank=True, max_length=25, null=True)),
                ('orders', models.CharField(default='\n    {\n    "orders": {\n        "Order_1": "0"\n     }\n    }\n    ', max_length=5000)),
                ('imageUrl', models.CharField(max_length=350, null=True)),
                ('stimsetid', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='pages.StimSets')),
            ],
        ),
        migrations.CreateModel(
            name='Invite',
            fields=[
                ('invId', models.CharField(default='inv-63c2877f-dde7-4e79-9017-9e3b2c0d0360', max_length=250, primary_key=True, serialize=False)),
                ('participantId', models.CharField(default='no-name-set [ERR]', max_length=250, null=True)),
                ('isExpired', models.BooleanField(default=False)),
                ('exConfigId', models.ForeignKey(default='ex-config-not-set [ERR]', on_delete=django.db.models.deletion.CASCADE, to='pages.ExperimentConfiguration')),
            ],
        ),
        migrations.CreateModel(
            name='Boards',
            fields=[
                ('boardid', models.CharField(default='brd-828e534f-4638-41ba-9182-f369a143f2f0', max_length=250, primary_key=True, serialize=False)),
                ('boardname', models.CharField(max_length=96)),
                ('boardr', models.IntegerField(default=0)),
                ('boardg', models.IntegerField(default=0)),
                ('boardb', models.IntegerField(default=0)),
                ('boardtiltx', models.IntegerField(default=0)),
                ('boardtilty', models.IntegerField(default=0)),
                ('boardbackgroundr', models.IntegerField(default=0)),
                ('boardbackgroundg', models.IntegerField(default=0)),
                ('boardbackgroundb', models.IntegerField(default=0)),
                ('boardbackgroundurl', models.CharField(max_length=350, null=True)),
                ('experimentId', models.ForeignKey(default='ex-87a96171-6e68-4289-9d31-e6fdbc7fc1c3', on_delete=django.db.models.deletion.CASCADE, to='pages.Experiment')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
