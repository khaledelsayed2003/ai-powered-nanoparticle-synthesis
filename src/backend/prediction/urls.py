from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

urlpatterns = [
    path("predict/", views.predict_mean_size_view, name="predict-mean-size"),
    path("images/<int:pk>/", views.PredictionImageView.as_view(), name="prediction-image"), # New path for images
    path("history/", views.PredictionHistoryView.as_view(), name="prediction-history"), # New path for history

    # User Authentication
    path('user/', views.get_current_user, name='get_current_user'),
    path('register/', views.UserRegisterView.as_view(), name='register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
]
