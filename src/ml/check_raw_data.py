from pathlib import Path
from collections import Counter

import pandas as pd
from PIL import Image


# --- Paths (relative to project root) ---
PROJECT_ROOT = Path(__file__).resolve().parents[2]  # .../capstone2-sem-mean-size
RAW_DIR = PROJECT_ROOT / "data" / "raw"
IMAGES_DIR = RAW_DIR / "images"
CSV_PATH = RAW_DIR / "sem_mean_sizes.csv"


def main():
    print("=== Checking raw SEM data ===")
    print(f"Project root : {PROJECT_ROOT}")
    print(f"Images folder: {IMAGES_DIR}")
    print(f"CSV path     : {CSV_PATH}\n")

    # --- Basic existence checks ---
    if not IMAGES_DIR.exists():
        raise SystemExit(f"[ERROR] Images folder not found: {IMAGES_DIR}")

    if not CSV_PATH.exists():
        raise SystemExit(f"[ERROR] CSV file not found: {CSV_PATH}")

    # --- Load CSV ---
    df = pd.read_csv(CSV_PATH)

    required_cols = {"filename", "mean_size_nm"}
    missing_cols = required_cols - set(df.columns)
    if missing_cols:
        raise SystemExit(f"[ERROR] CSV missing columns: {missing_cols}")

    print(f"Loaded {len(df)} rows from CSV.\n")

    # --- Clean up filename column (strip spaces) ---
    df["filename"] = df["filename"].astype(str).str.strip()

    # --- Check duplicates in filenames ---
    dup_mask = df["filename"].duplicated(keep=False)
    if dup_mask.any():
        print("[WARNING] Duplicate filenames in CSV:")
        print(df.loc[dup_mask, "filename"].value_counts())
    else:
        print("[OK] No duplicate filenames in CSV.")

    # --- Check mean_size_nm is numeric and positive ---
    numeric_sizes = pd.to_numeric(df["mean_size_nm"], errors="coerce")
    non_numeric = numeric_sizes.isna()
    if non_numeric.any():
        print("\n[ERROR] Non-numeric values in mean_size_nm at rows:")
        print(df.index[non_numeric].tolist())
    else:
        print("[OK] All mean_size_nm values are numeric.")

    negative_or_zero = numeric_sizes <= 0
    if negative_or_zero.any():
        print("\n[WARNING] Non-positive mean_size_nm values at rows:")
        print(df.loc[negative_or_zero, ["filename", "mean_size_nm"]])
    else:
        print("[OK] All mean_size_nm values are > 0.")

    df["mean_size_nm"] = numeric_sizes  # replace with cleaned numeric values

    # --- Check files exist on disk ---
    all_image_files = {p.name for p in IMAGES_DIR.glob("*.png")}
    csv_files = set(df["filename"])

    missing_images = csv_files - all_image_files
    extra_images = all_image_files - csv_files

    if missing_images:
        print("\n[ERROR] These filenames are in CSV but missing as PNG files:")
        for name in sorted(missing_images):
            print("  -", name)
    else:
        print("[OK] Every CSV filename has a matching PNG image.")

    if extra_images:
        print("\n[WARNING] These PNG files exist but are NOT listed in CSV:")
        for name in sorted(extra_images):
            print("  -", name)
    else:
        print("[OK] No extra images without labels.\n")

    # --- Check image format & resolution ---
    print("\nChecking image format & resolution (this may take a moment)...")
    size_counter = Counter()
    non_png_files = []

    for img_name in all_image_files:
        img_path = IMAGES_DIR / img_name
        try:
            with Image.open(img_path) as img:
                size_counter[img.size] += 1
                if img.format != "PNG":
                    non_png_files.append(img_name)
        except Exception as e:
            print(f"[ERROR] Could not open image {img_name}: {e}")

    print("\nImage sizes found (width x height : count):")
    for size, count in size_counter.items():
        print(f"  {size[0]}x{size[1]} : {count}")

    expected_size = (480, 480)
    if size_counter and expected_size not in size_counter:
        print(f"\n[WARNING] No images with expected size {expected_size[0]}x{expected_size[1]}.")
    else:
        print(f"[OK] At least some images have the expected size {expected_size[0]}x{expected_size[1]}.")

    if non_png_files:
        print("\n[WARNING] These files are not PNG format according to Pillow:")
        for name in non_png_files:
            print("  -", name)
    else:
        print("[OK] All images are PNG format according to Pillow.")

    print("\n=== Data check finished ===")


if __name__ == "__main__":
    main()
