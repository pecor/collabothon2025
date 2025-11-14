# Generated manually for adding user location and vehicle assignment

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_add_order_financial_fields'),
    ]

    operations = [
        # Add current_vehicle field (nullable ForeignKey)
        migrations.AddField(
            model_name='user',
            name='current_vehicle',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='assigned_driver',
                to='api.vehicle',
                verbose_name='Current Vehicle'
            ),
        ),
        # Add current_country field (nullable CharField)
        migrations.AddField(
            model_name='user',
            name='current_country',
            field=models.CharField(
                blank=True,
                max_length=100,
                null=True,
                verbose_name='Current Country'
            ),
        ),
        # Add current_city field (nullable CharField)
        migrations.AddField(
            model_name='user',
            name='current_city',
            field=models.CharField(
                blank=True,
                max_length=100,
                null=True,
                verbose_name='Current City'
            ),
        ),
        # Update Vehicle model's related_name for current_driver
        # This is a no-op migration since we're just changing the related_name
        # The actual ForeignKey field doesn't change
    ]

