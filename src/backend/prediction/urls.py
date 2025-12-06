from django.urls import path
from . import views

urlpatterns = [
    path("predict/", views.predict_mean_size_view, name="predict-mean-size"),
]
