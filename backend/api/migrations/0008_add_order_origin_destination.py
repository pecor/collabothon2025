# Generated manually for adding origin and destination fields to orders

from django.db import migrations, models


def populate_order_origin_destination(apps, schema_editor):
    """Populate origin and destination from route if available"""
    Order = apps.get_model('api', 'Order')
    for order in Order.objects.all():
        if not order.origin and order.route:
            order.origin = order.route.origin
        if not order.destination and order.route:
            order.destination = order.route.destination
        order.save()


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_add_user_location_and_vehicle'),
    ]

    operations = [
        # Step 1: Add fields as nullable first
        migrations.AddField(
            model_name='order',
            name='origin',
            field=models.CharField(
                blank=True,
                help_text='Starting location',
                max_length=255,
                null=True,
                verbose_name='Origin'
            ),
        ),
        migrations.AddField(
            model_name='order',
            name='destination',
            field=models.CharField(
                blank=True,
                help_text='Destination location',
                max_length=255,
                null=True,
                verbose_name='Destination'
            ),
        ),
        # Step 2: Populate existing records from route
        migrations.RunPython(populate_order_origin_destination, migrations.RunPython.noop),
        # Step 3: Make fields required
        migrations.AlterField(
            model_name='order',
            name='origin',
            field=models.CharField(
                help_text='Starting location',
                max_length=255,
                verbose_name='Origin'
            ),
        ),
        migrations.AlterField(
            model_name='order',
            name='destination',
            field=models.CharField(
                help_text='Destination location',
                max_length=255,
                verbose_name='Destination'
            ),
        ),
    ]

