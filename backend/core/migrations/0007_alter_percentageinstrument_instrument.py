# Generated by Django 4.2.3 on 2024-09-20 20:55

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0006_candle_volume'),
    ]

    operations = [
        migrations.AlterField(
            model_name='percentageinstrument',
            name='instrument',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='percentage', to='core.subscribedinstruments'),
        ),
    ]