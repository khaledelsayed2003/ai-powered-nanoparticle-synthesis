from pathlib import Path

import pandas as pd
from PIL import Image

import torch
from torch.utils.data import Dataset
from torchvision import transforms


def get_default_transforms(train: bool = True):
    """
    Returns the default torchvision transforms for SEM images.
    train=True: includes data augmentation (optional, minimal for now).
    """

    base_transforms = [
        transforms.ToTensor(),              # [0,1], shape: (1, H, W) for grayscale
        transforms.Normalize([0.5], [0.5])  # (x - 0.5) / 0.5 -> [-1,1]
    ]

    if train:
        # NOTE: anyone clones our repo can add light augmentations here later, e.g.:
        # augmentations = [
        #     transforms.RandomHorizontalFlip(),
        #     transforms.RandomVerticalFlip(),
        # ]
        # return transforms.Compose(augmentations + base_transforms)
        return transforms.Compose(base_transforms)
    else:
        return transforms.Compose(base_transforms)


class SemMeanSizeDataset(Dataset):
    """
    PyTorch Dataset for SEM images with mean nanoparticle size labels.

    Assumes:
      - Images are in PNG format under images_dir (e.g. data/raw/images/)
      - Labels are in a CSV with columns: filename, mean_size_nm
    """

    def __init__(
        self,
        csv_path: str | Path,
        images_dir: str | Path,
        transform=None,
    ):
        super().__init__()

        self.csv_path = Path(csv_path)
        self.images_dir = Path(images_dir)
        self.transform = transform if transform is not None else get_default_transforms(train=True)

        if not self.csv_path.exists():
            raise FileNotFoundError(f"CSV file not found: {self.csv_path}")

        if not self.images_dir.exists():
            raise FileNotFoundError(f"Images directory not found: {self.images_dir}")

        # Load CSV
        df = pd.read_csv(self.csv_path)

        # Basic checks
        required_cols = {"filename", "mean_size_nm"}
        missing = required_cols - set(df.columns)
        if missing:
            raise ValueError(f"CSV is missing required columns: {missing}")

        # Clean up filename + convert to numeric
        df["filename"] = df["filename"].astype(str).str.strip()
        df["mean_size_nm"] = pd.to_numeric(df["mean_size_nm"], errors="raise")

        self.df = df.reset_index(drop=True)

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx: int):
        row = self.df.iloc[idx]
        filename = row["filename"]
        mean_size = float(row["mean_size_nm"])

        img_path = self.images_dir / filename
        if not img_path.exists():
            raise FileNotFoundError(f"Image file not found: {img_path}")

        # Load image as grayscale
        with Image.open(img_path) as img:
            img = img.convert("L")  # 'L' = 8-bit grayscale

        if self.transform is not None:
            img = self.transform(img)

        # img: torch.Tensor [1, 480, 480]
        # mean_size: scalar float (we'll convert to tensor here)
        target = torch.tensor(mean_size, dtype=torch.float32)

        return img, target
