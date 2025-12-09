from django.http import HttpResponse
from django.urls import path, include
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static

def home(request):
    return HttpResponse("SEM Mean Size API – go to /api/predict/")

urlpatterns = [
    path("", home),
    path("admin/", admin.site.urls),
    path("api/", include("prediction.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
