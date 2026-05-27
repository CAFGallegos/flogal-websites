"""
One-time script: copies shared/ into each site directory.
Run from repo root: python _copy-shared.py
"""
import shutil
from pathlib import Path

ROOT = Path(__file__).parent
SRC  = ROOT / "shared"

SITES = [
    ROOT / "sites/flogalhq",
    ROOT / "sites/carriers",
    ROOT / "sites/sales",
    ROOT / "sites/properties",
]

for site in SITES:
    dest = site / "shared"
    if dest.exists():
        shutil.rmtree(dest)
    shutil.copytree(SRC, dest)
    print(f"copied → {dest.relative_to(ROOT)}")

print("done.")
