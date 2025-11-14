# Generated manually for adding order fields

from django.db import migrations, models


def populate_order_fields(apps, schema_editor):
    """Populate new order fields with default values from cargo"""
    Order = apps.get_model('api', 'Order')
    for order in Order.objects.all():
        if not order.cargo_type:
            order.cargo_type = order.cargo.name if order.cargo else 'Unknown'
        if not order.weight:
            order.weight = order.cargo.weight if order.cargo else 0.0
        if not order.temperature:
            order.temperature = 'Ambient'
        if not order.loading_date:
            order.loading_date = order.planned_date
        if not order.unloading_date:
            # Set unloading_date to 2 days after loading_date
            from datetime import timedelta
            order.unloading_date = order.planned_date + timedelta(days=2)
        order.save()


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_alter_order_user'),
    ]

    operations = [
        # Step 1: Add fields as nullable first
        migrations.AddField(
            model_name='order',
            name='cargo_type',
            field=models.CharField(blank=True, help_text="e.g. Pallets, Boxes, Chemicals", max_length=255, null=True, verbose_name='Cargo Type'),
        ),
        migrations.AddField(
            model_name='order',
            name='weight',
            field=models.FloatField(blank=True, help_text='Order weight (kg)', null=True, verbose_name='Weight (kg)'),
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
        # Step 2: Populate existing records
        migrations.RunPython(populate_order_fields, migrations.RunPython.noop),
        # Step 3: Make fields required
        migrations.AlterField(
            model_name='order',
            name='cargo_type',
            field=models.CharField(help_text="e.g. Pallets, Boxes, Chemicals", max_length=255, verbose_name='Cargo Type'),
        ),
        migrations.AlterField(
            model_name='order',
            name='weight',
            field=models.FloatField(help_text='Order weight (kg)', verbose_name='Weight (kg)'),
        ),
        migrations.AlterField(
            model_name='order',
            name='temperature',
            field=models.CharField(help_text="e.g. -18 to -20 or 'Ambient'", max_length=100, verbose_name='Temperature (°C)'),
        ),
        migrations.AlterField(
            model_name='order',
            name='loading_date',
            field=models.DateField(verbose_name='Loading Date'),
        ),
        migrations.AlterField(
            model_name='order',
            name='unloading_date',
            field=models.DateField(verbose_name='Unloading Date'),
        ),
    ]

