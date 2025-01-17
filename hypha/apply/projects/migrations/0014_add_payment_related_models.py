# Generated by Django 2.0.13 on 2019-08-14 14:09

from decimal import Decimal
from django.conf import settings
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion
import hypha.apply.projects.models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('application_projects', '0013_add_contract'),
    ]

    operations = [
        migrations.CreateModel(
            name='PaymentApproval',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='payment_approvals', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='PaymentReceipt',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(storage=django.core.files.storage.FileSystemStorage())),
            ],
        ),
        migrations.CreateModel(
            name='PaymentRequest',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('invoice', models.FileField(storage=django.core.files.storage.FileSystemStorage(), upload_to=hypha.apply.projects.models.payment.invoice_path)),
                ('value', models.DecimalField(decimal_places=2, default=0, max_digits=10, validators=[django.core.validators.MinValueValidator(Decimal('0.01'))])),
                ('requested_at', models.DateTimeField(auto_now_add=True)),
                ('date_from', models.DateTimeField()),
                ('date_to', models.DateTimeField()),
                ('comment', models.TextField()),
                ('status', models.TextField(choices=[('submitted', 'Submitted'), ('under_review', 'Under Review'), ('paid', 'Paid'), ('declined', 'Declined')], default='submitted')),
                ('by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='payment_requests', to=settings.AUTH_USER_MODEL)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='payment_requests', to='application_projects.Project')),
            ],
        ),
        migrations.AddField(
            model_name='paymentreceipt',
            name='payment_request',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='receipts', to='application_projects.PaymentRequest'),
        ),
        migrations.AddField(
            model_name='paymentapproval',
            name='request',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='approvals', to='application_projects.PaymentRequest'),
        ),
    ]
