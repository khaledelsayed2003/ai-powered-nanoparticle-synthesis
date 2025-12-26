from pathlib import Path
import math

import torch
import torch.nn as nn
from torch.utils.data import DataLoader, random_split

from datasets import SemMeanSizeDataset, get_default_transforms
from model import create_model


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
    """

    # Full dataset
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
            "You need more images from BME before serious training."
        )

    # Integer splits
    n_test = int(n_total * test_ratio)
    n_val = int(n_total * val_ratio)
    n_train = n_total - n_val - n_test

    if n_train <= 0:
        raise ValueError(
            f"Not enough samples for chosen split ratios. "
            f"Got n_total={n_total}, train={n_train}, val={n_val}, test={n_test}."
        )

    print(f"Splits -> train: {n_train}, val: {n_val}, test: {n_test} "
          "(val/test may be 0 for very small datasets)")

    generator = torch.Generator().manual_seed(seed)
    train_dataset, val_dataset, test_dataset = random_split(
        full_dataset,
        lengths=[n_train, n_val, n_test],
        generator=generator,
    )

    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,
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



# Training & Evaluation
def train_one_epoch(
    model: nn.Module,
    loader: DataLoader,
    criterion: nn.Module,
    optimizer: torch.optim.Optimizer,
    device: torch.device,
):
    model.train()

    running_loss = 0.0
    running_mae = 0.0
    n_samples = 0

    for images, targets in loader:
        images = images.to(device)             # [B, 1, 480, 480]
        targets = targets.to(device)           # [B]

        optimizer.zero_grad()

        preds = model(images)                  # [B]
        # We use raw preds for loss (they can be negative while training)
        loss = criterion(preds, targets)

        loss.backward()
        optimizer.step()

        # --------- stats ----------
        batch_size = targets.size(0)
        running_loss += loss.item() * batch_size

        # For MAE we clamp to >= 0 (physically mean size can't be negative)
        preds_clamped = torch.clamp(preds, min=0.0)
        mae = torch.abs(preds_clamped - targets).sum()
        running_mae += mae.item()
        n_samples += batch_size

    epoch_loss = running_loss / n_samples
    epoch_mae = running_mae / n_samples

    return epoch_loss, epoch_mae


@torch.no_grad()
def evaluate(model: nn.Module, loader: DataLoader, device: torch.device):
    """
    Evaluate MSE, MAE, RMSE on a loader.
    Returns None if the loader has no samples.
    """
    if len(loader.dataset) == 0:
        return None

    model.eval()

    mse_sum = 0.0
    mae_sum = 0.0
    n_samples = 0

    for images, targets in loader:
        images = images.to(device)
        targets = targets.to(device)

        preds = model(images)                      # [B]
        preds_clamped = torch.clamp(preds, min=0.0)

        diff = preds_clamped - targets
        mse_sum += (diff ** 2).sum().item()
        mae_sum += diff.abs().sum().item()
        n_samples += targets.size(0)

    mse = mse_sum / n_samples
    mae = mae_sum / n_samples
    rmse = math.sqrt(mse)

    return {"mse": mse, "mae": mae, "rmse": rmse}



# Main training script
def main():
    project_root = Path(__file__).resolve().parents[2]
    csv_path = project_root / "data" / "raw" / "sem_mean_sizes.csv"
    images_dir = project_root / "data" / "raw" / "images"
    models_dir = project_root / "models"
    models_dir.mkdir(parents=True, exist_ok=True)

    # Hyperparameters (anyone who clones the repo can tune these)
    batch_size = 4
    num_epochs = 100
    learning_rate = 1e-3
    val_ratio = 0.15
    test_ratio = 0.15

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    # Data
    train_loader, val_loader, test_loader = create_dataloaders(
        csv_path=csv_path,
        images_dir=images_dir,
        batch_size=batch_size,
        val_ratio=val_ratio,
        test_ratio=test_ratio,
        num_workers=0,
        seed=42,
    )

    # Model, loss, optimizer
    model = create_model(device=device)
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)

    best_val_mae = float("inf")
    best_model_path = models_dir / "best_sem_meansize_cnn.pt"

    has_val = len(val_loader.dataset) > 0

    print("\nStarting training...\n")
    for epoch in range(1, num_epochs + 1):
        train_loss, train_mae = train_one_epoch(
            model=model,
            loader=train_loader,
            criterion=criterion,
            optimizer=optimizer,
            device=device,
        )

        msg = f"[Epoch {epoch:03d}] Train loss: {train_loss:.4f}, Train MAE: {train_mae:.4f} nm"

        # Validation (if we have val data)
        if has_val:
            val_metrics = evaluate(model, val_loader, device)
            if val_metrics is not None:
                val_mae = val_metrics["mae"]
                msg += f" | Val MAE: {val_mae:.4f} nm, Val RMSE: {val_metrics['rmse']:.4f} nm"

                # Save best model by validation MAE
                if val_mae < best_val_mae:
                    best_val_mae = val_mae
                    torch.save(model.state_dict(), best_model_path)
            else:
                msg += " | (no validation samples)"
        else:
            msg += " | (validation set empty with current dataset size)"

        print(msg)

    # If we never had a val set, just save final model
    if not has_val:
        torch.save(model.state_dict(), best_model_path)

    print(f"\nTraining finished. Best model saved to: {best_model_path}")

    # Final test evaluation (if test set is non-empty)
    if len(test_loader.dataset) > 0:
        test_metrics = evaluate(model, test_loader, device)
        print(
            f"\nTest set: MAE = {test_metrics['mae']:.4f} nm, "
            f"RMSE = {test_metrics['rmse']:.4f} nm"
        )
    else:
        print("\nTest set is empty (too few samples). Add more data to evaluate properly.")


if __name__ == "__main__":
    main()
