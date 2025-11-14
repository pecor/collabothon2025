# Generated manually for adding financial fields to orders

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_add_order_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='cost',
            field=models.FloatField(blank=True, help_text='Total cost of the order', null=True, verbose_name='Cost'),
        ),
        migrations.AddField(
            model_name='order',
            name='revenue',
            field=models.FloatField(blank=True, help_text='Total revenue from the order', null=True, verbose_name='Revenue'),
        ),
        migrations.AddField(
            model_name='order',
            name='profit',
            field=models.FloatField(blank=True, help_text='Profit (revenue - cost)', null=True, verbose_name='Profit'),
        ),
    ]

