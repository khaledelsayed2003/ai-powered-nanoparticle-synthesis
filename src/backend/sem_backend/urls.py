# in sem_backend/urls.py
from django.http import HttpResponse
from django.urls import path, include
from django.contrib import admin

def home(request):
    return HttpResponse("SEM Mean Size API – go to /api/predict/")

urlpatterns = [
    path("", home),
    path("admin/", admin.site.urls),
    path("api/", include("prediction.urls")),
]

