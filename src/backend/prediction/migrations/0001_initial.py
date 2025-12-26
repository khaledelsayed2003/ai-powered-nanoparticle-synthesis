from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='MeanSizePrediction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(upload_to='sem_uploads/')),
                ('original_filename', models.CharField(max_length=255)),
                ('predicted_mean_size_nm', models.FloatField()),
                ('magnification', models.CharField(blank=True, max_length=100)),
                ('notes', models.TextField(blank=True)),
                ('model_version', models.CharField(blank=True, max_length=50)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
