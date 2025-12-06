from pathlib import Path
import argparse

import torch
from PIL import Image

from datasets import get_default_transforms
from model import create_model


def load_model(
    model_path: Path,
    device: torch.device | str | None = None,
):
    """
    Load the trained SemMeanSizeCNN model from disk.
    """
    if device is None:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    elif isinstance(device, str):
        device = torch.device(device)

    model = create_model(device=device)

    if not model_path.exists():
        raise FileNotFoundError(f"Model file not found: {model_path}")

    state_dict = torch.load(model_path, map_location=device)
    model.load_state_dict(state_dict)
    model.eval()

    return model, device


def preprocess_image(image_path: Path):
    """
    Load a single PNG SEM image and apply the SAME preprocessing
    as in training (grayscale + ToTensor + Normalize).
    """
    if not image_path.exists():
        raise FileNotFoundError(f"Image not found: {image_path}")

    with Image.open(image_path) as img:
        img = img.convert("L")  # ensure grayscale

        # If for some reason size is not 480x480, we can resize.
        # (According to the contract, all BME images are 480x480.)
        if img.size != (480, 480):
            print(f"[WARNING] Image size is {img.size}, resizing to (480, 480).")
            img = img.resize((480, 480))

    transform = get_default_transforms(train=False)
    tensor = transform(img)  # shape: [1, 480, 480]
    tensor = tensor.unsqueeze(0)  # add batch dimension -> [1, 1, 480, 480]

    return tensor


@torch.no_grad()
def predict_mean_size(
    image_path: str | Path,
    model_path: str | Path | None = None,
    device: torch.device | str | None = None,
) -> float:
    """
    Predict the mean nanoparticle size (in nm) for a single SEM image.

    Args:
        image_path: path to a PNG image.
        model_path: path to trained model (.pt). If None, uses models/best_sem_meansize_cnn.pt.
        device: 'cpu', 'cuda', or torch.device. If None, auto-selects.

    Returns:
        Predicted mean size in nanometers (float, >= 0).
    """
    image_path = Path(image_path).resolve()
    project_root = image_path.parents[3] if "data" in str(image_path) else Path(__file__).resolve().parents[2]

    if model_path is None:
        model_path = project_root / "models" / "best_sem_meansize_cnn.pt"
    else:
        model_path = Path(model_path).resolve()

    model, device = load_model(model_path=model_path, device=device)
    img_tensor = preprocess_image(image_path).to(device)

    preds = model(img_tensor)           # shape: [1]
    preds_clamped = torch.clamp(preds, min=0.0)
    mean_size_nm = float(preds_clamped.item())

    return mean_size_nm


def main():
    parser = argparse.ArgumentParser(
        description="Predict mean nanoparticle size (nm) from a SEM PNG image."
    )
    parser.add_argument(
        "--image",
        type=str,
        required=True,
        help="Path to the SEM PNG image.",
    )
    parser.add_argument(
        "--model",
        type=str,
        default=None,
        help="Path to the trained model (.pt). If omitted, uses models/best_sem_meansize_cnn.pt",
    )
    parser.add_argument(
        "--device",
        type=str,
        default=None,
        help="Device to use: 'cpu' or 'cuda'. If omitted, auto-detect.",
    )

    args = parser.parse_args()

    mean_size_nm = predict_mean_size(
        image_path=args.image,
        model_path=args.model,
        device=args.device,
    )

    print(f"Predicted mean size: {mean_size_nm:.4f} nm")


if __name__ == "__main__":
    main()
