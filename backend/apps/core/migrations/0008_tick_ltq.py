# Generated by Django 4.2.3 on 2024-09-24 08:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0007_alter_percentageinstrument_instrument"),
    ]

    operations = [
        migrations.AddField(
            model_name="tick",
            name="ltq",
            field=models.FloatField(blank=True, null=True),
        ),
    ]
