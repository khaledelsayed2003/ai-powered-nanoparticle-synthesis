from pathlib import Path
import os
import tempfile

from django.http import JsonResponse
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser

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
def predict_mean_size_view(request):
    """
    POST /api/predict/
    Body: multipart/form-data with field "image" = uploaded PNG
    Response: {"mean_size_nm": float}
    """
    uploaded_file = request.FILES.get("image")

    if uploaded_file is None:
        return JsonResponse(
            {"error": "No file provided. Please upload an image with field name 'image'."},
            status=400,
        )

    # Save uploaded image to a temporary file
    suffix = os.path.splitext(uploaded_file.name)[1] or ".png"

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        for chunk in uploaded_file.chunks():
            tmp.write(chunk)
        temp_path = Path(tmp.name)

    try:
        mean_size_nm = predict_mean_size(image_path=temp_path)
    except Exception as e:
        # Clean up temp file, then return error
        temp_path.unlink(missing_ok=True)
        return JsonResponse({"error": f"Prediction failed: {e}"}, status=500)

    # Clean up
    temp_path.unlink(missing_ok=True)

    return JsonResponse(
        {"mean_size_nm": mean_size_nm},
        status=200,
    )

