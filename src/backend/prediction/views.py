from pathlib import Path
import os
import tempfile

from django.http import JsonResponse, FileResponse
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView # Import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import generics # Import generics for ListAPIView

# Django model
from .models import MeanSizePrediction
from .serializers import UserRegisterSerializer, MeanSizePredictionSerializer # Import the serializer

# Small hack to import from src/ml
import sys
CURRENT_FILE = Path(__file__).resolve()
SRC_DIR = CURRENT_FILE.parents[2]  # .../src
ML_DIR = SRC_DIR / "ml"
if str(ML_DIR) not in sys.path:
    sys.path.append(str(ML_DIR))

from infer import predict_mean_size  # type: ignore


@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
@permission_classes([IsAuthenticated])
def predict_mean_size_view(request):
    """
    POST /api/predict/
    Body: multipart/form-data with field "image" = uploaded PNG
    Response: {"mean_size_nm": float, "id": int, "created_at": str}
    """
    uploaded_file = request.FILES.get("image")

    if uploaded_file is None:
        return JsonResponse(
            {"error": "No file provided. Please upload an image with field name 'image'."},
            status=400,
        )

    # Save uploaded image to a temporary file for the PyTorch inference code
    suffix = os.path.splitext(uploaded_file.name)[1] or ".png"

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        for chunk in uploaded_file.chunks():
            tmp.write(chunk)
        temp_path = Path(tmp.name)

    try:
        # 1) Run PyTorch model on the temp file
        mean_size_nm = predict_mean_size(image_path=temp_path)

        # 2) Save prediction + the *uploaded file* into the database
        prediction_obj = MeanSizePrediction.objects.create(
            user=request.user, # Associate with the authenticated user
            image=uploaded_file,                 # ImageField will store it under MEDIA_ROOT/sem_uploads/
            original_filename=uploaded_file.name,
            predicted_mean_size_nm=mean_size_nm,
            # magnification="",  # fill later if you add a form field
            # notes="",
            # model_version="v1",  # or whatever you decide
        )

    except Exception as e:
        # Clean up temp file, then return error
        temp_path.unlink(missing_ok=True)
        return JsonResponse({"error": f"Prediction failed: {e}"}, status=500)

    # Clean up temporary file used only for inference
    temp_path.unlink(missing_ok=True)

    # 3) Return response with prediction and DB id
    return JsonResponse(
        {
            "predicted_mean_size_nm": mean_size_nm, # Changed key name here
            "id": prediction_obj.id,
            "created_at": prediction_obj.created_at.isoformat(),
            "image_url": request.build_absolute_uri(prediction_obj.image.url),
        },
        status=200,
    )


class UserRegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PredictionImageView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk, format=None):
        prediction = get_object_or_404(MeanSizePrediction, pk=pk)
        
        # Check if the user making the request owns this prediction
        # For PredictionImageView, it's important to ensure only owners can access their images
        if prediction.user != request.user:
            return Response({"detail": "You do not have permission to view this image."},
                            status=status.HTTP_403_FORBIDDEN)

        if not prediction.image:
            return Response({"detail": "Image not found for this prediction."},
                            status=status.HTTP_404_NOT_FOUND)

        img_file = prediction.image.open()
        return FileResponse(img_file, content_type=f"image/{prediction.image.name.split('.')[-1]}")

from django_filters.rest_framework import DjangoFilterBackend
from .filters import MeanSizePredictionFilter
class PredictionHistoryView(generics.ListAPIView):
    serializer_class = MeanSizePredictionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = MeanSizePredictionFilter

    def get_queryset(self):
        # Filter predictions to only include those belonging to the authenticated user
        return MeanSizePrediction.objects.filter(user=self.request.user).order_by('-created_at')
