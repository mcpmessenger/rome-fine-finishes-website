#!/usr/bin/env python3
"""
Utility script to auto-categorize the Megan Fair photo drop using CLIP and
copy the assets into organized gallery folders. It also emits a JSON summary
that the site can consume.
"""

from __future__ import annotations

import argparse
import json
import shutil
from collections import defaultdict
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

import open_clip
import torch
from PIL import Image, ImageOps
from tqdm import tqdm

REPO_ROOT = Path(__file__).resolve().parents[1]
SRC_DIR = REPO_ROOT / "public" / "images" / "iCloud Photos from Megan Fair" / "iCloud Photos from Megan Fair"
DEST_ROOT = REPO_ROOT / "public" / "images" / "gallery"
SUMMARY_PATH = REPO_ROOT / "data" / "megan-gallery.json"

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MODEL_NAME = "ViT-B-32"
PRETRAINED = "openai"

CATEGORY_PROMPTS: Dict[str, Iterable[str]] = {
    "cabinetry": [
        "a professional photo of newly refinished kitchen cabinets",
        "a craftsman sanding and painting cabinet doors",
        "luxury bathroom vanity cabinetry with smooth painted finish",
    ],
    "decks": [
        "outdoor wooden deck with fresh stain on the boards",
        "carpenter refinishing backyard deck railing and stairs",
        "sunlit porch deck boards with semi transparent stain",
    ],
    "interiors": [
        "interior living room walls with high end paint finish",
        "trim and crown molding detail inside a luxury home",
        "hallway drywall and interior doors freshly painted",
    ],
    "furniture-restoration": [
        "antique furniture refinishing close up of a table or dresser",
        "wooden chair repair and refinishing project",
        "furniture restoration showing dresser drawers being painted",
    ],
}


def build_text_features(
    model: torch.nn.Module, tokenizer, device: torch.device
) -> Dict[str, torch.Tensor]:
    """Create normalized text feature vectors for each category."""
    text_features: Dict[str, torch.Tensor] = {}
    for category, prompts in CATEGORY_PROMPTS.items():
        tokens = tokenizer(list(prompts))
        with torch.no_grad():
            features = model.encode_text(tokens.to(device))
        features = features / features.norm(dim=-1, keepdim=True)
        text_features[category] = features.mean(dim=0, keepdim=True)
    return text_features


def categorize_image(
    image_path: Path,
    model: torch.nn.Module,
    preprocess,
    text_features: Dict[str, torch.Tensor],
    device: torch.device,
) -> Tuple[str, float]:
    """Return the best matching category and cosine similarity."""
    with Image.open(image_path) as img:
        img = ImageOps.exif_transpose(img).convert("RGB")
        image_tensor = preprocess(img).unsqueeze(0).to(device)

    with torch.no_grad():
        image_features = model.encode_image(image_tensor)
    image_features = image_features / image_features.norm(dim=-1, keepdim=True)

    best_category = None
    best_score = float("-inf")
    for category, text_feature in text_features.items():
        score = (image_features @ text_feature.T).item()
        if score > best_score:
            best_category = category
            best_score = score

    if best_category is None:
        raise RuntimeError(f"Failed to categorize {image_path}")
    return best_category, best_score


def sanitize_name(path: Path) -> str:
    """Generate a lowercase, dash-friendly file name."""
    stem = path.stem.lower().replace(" ", "-")
    suffix = path.suffix.lower()
    return f"{stem}{suffix}"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="Only log classifications")
    parser.add_argument(
        "--clean", action="store_true", help="Remove existing gallery output before copying"
    )
    parser.add_argument("--limit", type=int, default=0, help="Limit number of processed files")
    args = parser.parse_args()

    if not SRC_DIR.exists():
        raise SystemExit(f"Source directory not found: {SRC_DIR}")

    if args.clean and DEST_ROOT.exists():
        shutil.rmtree(DEST_ROOT)
    DEST_ROOT.mkdir(parents=True, exist_ok=True)

    SUMMARY_PATH.parent.mkdir(parents=True, exist_ok=True)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model, _, preprocess = open_clip.create_model_and_transforms(MODEL_NAME, pretrained=PRETRAINED)
    tokenizer = open_clip.get_tokenizer(MODEL_NAME)
    model = model.to(device)
    model.eval()

    text_features = build_text_features(model, tokenizer, device)

    files = [
        path
        for path in sorted(SRC_DIR.iterdir())
        if path.suffix.lower() in ALLOWED_EXTENSIONS
    ]
    if args.limit:
        files = files[: args.limit]

    summary: Dict[str, List[Dict[str, object]]] = defaultdict(list)

    for image_path in tqdm(files, desc="Categorizing photos"):
        category, score = categorize_image(image_path, model, preprocess, text_features, device)
        clean_name = sanitize_name(image_path)
        dest_dir = DEST_ROOT / category
        dest_dir.mkdir(parents=True, exist_ok=True)

        dest_path = dest_dir / clean_name
        counter = 1
        while dest_path.exists():
            dest_path = dest_dir / f"{dest_path.stem}-{counter}{dest_path.suffix}"
            counter += 1

        if not args.dry_run:
            shutil.copy2(image_path, dest_path)

        public_rel = dest_path.relative_to(REPO_ROOT / "public")
        summary[category].append(
            {
                "file": f"/{public_rel.as_posix()}",
                "confidence": round(float(score), 4),
                "source": image_path.name,
            }
        )

    summary = {key: sorted(items, key=lambda item: item["confidence"], reverse=True) for key, items in summary.items()}

    if not args.dry_run:
        with SUMMARY_PATH.open("w", encoding="utf-8") as fh:
            json.dump(summary, fh, indent=2)

    print(f"\nProcessed {sum(len(v) for v in summary.values())} images into {DEST_ROOT}")
    if not args.dry_run:
        print(f"Summary saved to {SUMMARY_PATH}")


if __name__ == "__main__":
    main()





