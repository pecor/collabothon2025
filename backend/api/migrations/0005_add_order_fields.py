# Generated manually for adding order fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_alter_order_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='cargo_type',
            field=models.CharField(blank=True, help_text="e.g. Pallets, Boxes, Chemicals", max_length=255, null=True, verbose_name='Cargo Type'),
        ),
        migrations.AddField(
            model_name='order',
            name='weight',
            field=models.FloatField(blank=True, help_text='Order weight override (if different from cargo weight)', null=True, verbose_name='Weight (kg)'),
        ),
        migrations.AddField(
            model_name='order',
            name='temperature',
            field=models.CharField(blank=True, help_text="e.g. -18 to -20 or 'Ambient'", max_length=100, null=True, verbose_name='Temperature (°C)'),
        ),
        migrations.AddField(
            model_name='order',
            name='special_requirements',
            field=models.TextField(blank=True, help_text='e.g. ADR, Forklift, Tarpaulin', null=True, verbose_name='Special Requirements'),
        ),
        migrations.AddField(
            model_name='order',
            name='loading_date',
            field=models.DateField(blank=True, null=True, verbose_name='Loading Date'),
        ),
        migrations.AddField(
            model_name='order',
            name='unloading_date',
            field=models.DateField(blank=True, null=True, verbose_name='Unloading Date'),
        ),
    ]

