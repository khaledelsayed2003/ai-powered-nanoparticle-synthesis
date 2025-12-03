import torch
import torch.nn as nn
import torch.nn.functional as F


class ConvBlock(nn.Module):
    """
    A simple building block: Conv2d -> BatchNorm2d -> ReLU -> MaxPool2d
    """

    def __init__(self, in_channels: int, out_channels: int):
        super().__init__()

        self.conv = nn.Conv2d(
            in_channels,
            out_channels,
            kernel_size=3,
            padding=1,    # keep H, W the same before pooling
        )
        self.bn = nn.BatchNorm2d(out_channels)
        self.pool = nn.MaxPool2d(kernel_size=2, stride=2)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.conv(x)
        x = self.bn(x)
        x = F.relu(x, inplace=True)
        x = self.pool(x)
        return x


class SemMeanSizeCNN(nn.Module):
    """
    CNN model for predicting mean nanoparticle size (in nm)
    from a single SEM grayscale image (1 x 480 x 480).

    Output: a single scalar (no activation on the last layer).
    """

    def __init__(self):
        super().__init__()

        # Feature extractor
        self.features = nn.Sequential(
            # Input: 1 x 480 x 480
            ConvBlock(1, 16),   # -> 16 x 240 x 240
            ConvBlock(16, 32),  # -> 32 x 120 x 120
            ConvBlock(32, 64),  # -> 64 x 60 x 60
            ConvBlock(64, 128), # -> 128 x 30 x 30
            ConvBlock(128, 256) # -> 256 x 15 x 15
        )

        # Global average pooling -> 256 x 1 x 1
        self.global_pool = nn.AdaptiveAvgPool2d((1, 1))

        # Regression head
        self.regressor = nn.Sequential(
            nn.Flatten(),            # 256
            nn.Linear(256, 128),
            nn.ReLU(inplace=True),
            nn.Dropout(p=0.2),
            nn.Linear(128, 64),
            nn.ReLU(inplace=True),
            nn.Linear(64, 1)         # output: mean_size_nm (scalar)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        x shape: (batch_size, 1, 480, 480)
        returns: (batch_size,)  predicted mean sizes in nm
        """
        x = self.features(x)
        x = self.global_pool(x)
        x = self.regressor(x)   # shape: (batch_size, 1)
        x = x.squeeze(-1)       # -> (batch_size,)
        return x


def create_model(device: str | torch.device | None = None) -> SemMeanSizeCNN:
    """
    Helper to create the model and move it to a device if given.
    Example:
        model = create_model(device="cuda" if torch.cuda.is_available() else "cpu")
    """
    model = SemMeanSizeCNN()
    if device is not None:
        model = model.to(device)
    return model


def count_parameters(model: nn.Module) -> int:
    """Return number of trainable parameters."""
    return sum(p.numel() for p in model.parameters() if p.requires_grad)


if __name__ == "__main__":
    # Quick sanity check: run a dummy batch through the model
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")

    model = create_model(device=device)
    print(model)
    print(f"Trainable parameters: {count_parameters(model):,}")

    # Dummy input: batch of 4 grayscale images, 480x480
    dummy_input = torch.randn(4, 1, 480, 480).to(device)
    output = model(dummy_input)

    print("Output shape:", output.shape)       # should be torch.Size([4])
    print("Output:", output)                  # random numbers for now
