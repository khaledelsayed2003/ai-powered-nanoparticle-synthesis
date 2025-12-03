from pathlib import Path

import torch
from torch.utils.data import DataLoader, random_split

from datasets import SemMeanSizeDataset, get_default_transforms


def create_dataloaders(
    csv_path: Path = Path("data/raw/sem_mean_sizes.csv"),
    images_dir: Path = Path("data/raw/images"),
    batch_size: int = 4,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
    num_workers: int = 0,
    seed: int = 42,
):
    """
    Create train/val/test DataLoaders from the full SEM dataset.

    - csv_path: path to sem_mean_sizes.csv
    - images_dir: folder with PNG images
    - batch_size: how many images per batch
    - val_ratio, test_ratio: fractions of total data

    Returns:
        train_loader, val_loader, test_loader
    """

    # 1) Full dataset
    full_dataset = SemMeanSizeDataset(
        csv_path=csv_path,
        images_dir=images_dir,
        transform=get_default_transforms(train=True),
    )

    n_total = len(full_dataset)
    print(f"Total samples in full dataset: {n_total}")

    if n_total < 2:
        raise ValueError(
            "Dataset is too small (< 2 samples). "
            "You need more images from BME before training."
        )

    # 2) Compute sizes (simple integer splits)
    n_test = int(n_total * test_ratio)
    n_val = int(n_total * val_ratio)
    n_train = n_total - n_val - n_test

    # Ensure at least 1 training sample
    if n_train <= 0:
        raise ValueError(
            f"Not enough samples for the chosen split ratios. "
            f"Got n_total={n_total}, train={n_train}, val={n_val}, test={n_test}."
        )

    print(f"Splits -> train: {n_train}, val: {n_val}, test: {n_test} "
          "(val/test may be 0 for small datasets)")

    # 3) Random split with fixed seed (reproducible)
    generator = torch.Generator().manual_seed(seed)
    train_dataset, val_dataset, test_dataset = random_split(
        full_dataset,
        lengths=[n_train, n_val, n_test],
        generator=generator,
    )

    # 4) Create DataLoaders
    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,           # shuffle for training
        num_workers=num_workers,
    )

    val_loader = DataLoader(
        val_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
    )

    test_loader = DataLoader(
        test_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
    )

    return train_loader, val_loader, test_loader


def main():
    # Project root: .../capstone2-sem-mean-size
    project_root = Path(__file__).resolve().parents[2]
    csv_path = project_root / "data" / "raw" / "sem_mean_sizes.csv"
    images_dir = project_root / "data" / "raw" / "images"

    # You can increase this later (8, 16, ...) when you have more data
    batch_size = 4

    train_loader, val_loader, test_loader = create_dataloaders(
        csv_path=csv_path,
        images_dir=images_dir,
        batch_size=batch_size,
        val_ratio=0.15,
        test_ratio=0.15,
        num_workers=0,   # keep 0 on Windows
        seed=42,
    )

    # Quick sanity check: try to read one batch from each loader
    for name, loader in [("train", train_loader), ("val", val_loader), ("test", test_loader)]:
        try:
            images, targets = next(iter(loader))
        except StopIteration:
            print(f"\n[{name}] loader is empty (no samples in this split).")
            continue

        print(f"\n[{name}] batch:")
        print("  images shape :", images.shape)   # [B, 1, 480, 480]
        print("  targets      :", targets)        # B mean sizes in nm

    print("\nStep 4 dataloader check complete.")


if __name__ == "__main__":
    main()
