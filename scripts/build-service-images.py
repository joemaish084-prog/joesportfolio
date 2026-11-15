"""Crop existing site images into the services-page slots. Requires Pillow.

Writes src/assets/services/<slot>.webp (full size) and <slot>-400.webp.
SEO and lead-gen slots have no source yet: drop real files named
svc-seo.webp and svc-lead-gen.webp in that folder and they are picked up.
"""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'site-review.local/image-tools'))
from PIL import Image

OUT = ROOT / 'src/assets/services'
OUT.mkdir(parents=True, exist_ok=True)

# slot: (source, crop box left/top/right/bottom, output size)
SLOTS = {
    'svc-meta-ads': ('src/assets/design-iclear-facebook.webp', (475, 0, 1600, 703), None),
    'svc-google-ads': ('src/assets/design-iclear-filter-promo.webp', (0, 0, 1400, 1750), (1200, 1500)),
    'svc-social': ('src/assets/design-iclear-monday.webp', (0, 150, 1400, 1200), (800, 600)),
    'svc-tiktok-ads': ('src/assets/short-iclear-dishwash.webp', (0, 700, 1600, 1900), (800, 600)),
    'svc-shopify': ('public/work/shopify/babyshop-dansar-desktop.webp', (0, 0, 1093, 820), (800, 600)),
}

for slot, (source, box, size) in SLOTS.items():
    with Image.open(ROOT / source) as opened:
        image = opened.convert('RGB').crop(box)
    if size:
        image = image.resize(size, Image.Resampling.LANCZOS)
    for width in (image.width, 400):
        w = min(width, image.width)
        resized = image if w == image.width else image.resize((w, round(image.height * w / image.width)), Image.Resampling.LANCZOS)
        name = f'{slot}.webp' if w == image.width else f'{slot}-{w}.webp'
        resized.save(OUT / name, 'WEBP', quality=80, method=6)
    print(slot, image.size)
