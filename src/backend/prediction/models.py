from django.db import models


class MeanSizePrediction(models.Model):
    """
    Stores one uploaded SEM image and the corresponding predicted mean size (nm).
    """

    # The uploaded SEM image file (saved in MEDIA_ROOT/sem_uploads/)
    image = models.ImageField(upload_to="sem_uploads/")

    # Original filename from the upload (useful for tracking)
    original_filename = models.CharField(max_length=255)

    # Model output (mean size in nm)
    predicted_mean_size_nm = models.FloatField()

    # Optional metadata – you can use later if you add fields in the form
    magnification = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)

    # For future: if you retrain or change model
    model_version = models.CharField(max_length=50, blank=True)

    # Auto timestamp when the prediction was created
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.original_filename} -> {self.predicted_mean_size_nm:.2f} nm"
