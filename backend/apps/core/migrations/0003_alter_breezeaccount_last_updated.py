# Generated by Django 4.2.3 on 2024-02-19 14:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0002_percentageinstrument"),
    ]

    operations = [
        migrations.AlterField(
            model_name="breezeaccount",
            name="last_updated",
            field=models.DateTimeField(auto_now=True),
        ),
    ]
