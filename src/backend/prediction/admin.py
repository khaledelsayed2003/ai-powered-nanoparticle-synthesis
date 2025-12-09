from django.contrib import admin
from .models import MeanSizePrediction


@admin.register(MeanSizePrediction)
class MeanSizePredictionAdmin(admin.ModelAdmin):
    list_display = ("id", "original_filename", "predicted_mean_size_nm", "created_at")
    list_filter = ("created_at",)
    search_fields = ("original_filename",)
