#!/usr/bin/env bash

set -euo pipefail

mkdir -p "public/media/home" "public/media/families"

webp_writable=false
if sips --formats | grep -q 'org.webmproject.webp.*Writable'; then
  webp_writable=true
fi

if [[ "$webp_writable" == false ]]; then
  if ! command -v python3 >/dev/null 2>&1; then
    printf '%s\n' "ERROR: sips cannot write WebP and Python 3 with Pillow is required. Install Pillow with 'python3 -m pip install Pillow'." >&2
    exit 1
  fi

  if ! python3 -c 'from PIL import features; import sys; sys.exit(0 if features.check("webp") else 1)' >/dev/null 2>&1; then
    printf '%s\n' "ERROR: Pillow is unavailable or lacks WebP support. Install a WebP-enabled Pillow with 'python3 -m pip install --upgrade Pillow'." >&2
    exit 1
  fi
fi

prepare_media() {
  local source_image="$1"
  local destination_image="$2"
  local temporary_image="${destination_image%.webp}.jpg"

  if [[ "$webp_writable" == true ]]; then
    sips -s format webp --resampleWidth 1600 "$source_image" --out "$destination_image"
    return
  fi

  sips -s format jpeg --resampleWidth 1600 "$source_image" --out "$temporary_image"
  python3 - "$temporary_image" "$destination_image" <<'PY'
from pathlib import Path
from PIL import Image
import sys

with Image.open(sys.argv[1]) as image:
    image.save(sys.argv[2], 'WEBP', quality=84, method=6)

Path(sys.argv[1]).unlink()
PY
}

# Remove retired review-failed outputs so the generated media directory contains
# only the current vetted mappings.
rm -f -- \
  "public/media/home/translucent-signage.webp" \
  "public/media/home/car-wrap-yellow-jeep.webp" \
  "public/media/families/perforated-window-graphic.webp" \
  "public/media/families/self-adhesive-signage.webp" \
  "public/media/families/translucent-signage.webp" \
  "public/media/families/car-wrap-yellow-jeep.webp" \
  "public/media/families/overlaminate-roll-red.webp" \
  "public/media/families/cold-lamination-roll-orange.webp" \
  "public/media/families/wall-graphic-installation.webp" \
  "public/media/home/automotive-protected-car.webp" \
  "public/media/home/automotive-film-application.webp" \
  "public/media/families/one-way-vision-perforated-film.webp" \
  "public/media/families/self-adhesive-vinyl-roll.webp" \
  "public/media/families/translucent-film-roll.webp" \
  "public/media/families/paint-protection-car-front.webp" \
  "public/media/families/car-wrapping-material-detail.webp"

prepare_media "/Users/geekou/Desktop/设计/素材/工厂照片.png" "public/media/home/factory-hero.webp"
prepare_media "/Users/geekou/Desktop/设计/素材/Chrome Vinyl For Car Wrapping/DSC_9598.JPG" "public/media/home/material-roll-red.webp"
prepare_media "/Users/geekou/Desktop/设计/外销设计/全公司产品设计样本册/SO-FINE_20页蓝白样本册_跨页绘制素材/跨页_06_第11-12页/图片素材/01_image9.png" "public/media/home/illuminated-signage-application.webp"
prepare_media "/Users/geekou/Desktop/设计/素材/迈凯伦/15.jpg" "public/media/home/automotive-wrapped-mclaren.webp"
prepare_media "/Users/geekou/Desktop/设计/外销设计/美国拉斯维加斯广告印刷展/素材/%E6%9C%BA%E5%99%A8%E8%A3%B1%E8%86%9C%E5%9B%BE%E7%89%87_%E6%96%B9%E5%BD%A2.png" "public/media/home/production-equipment.webp"
prepare_media "/Users/geekou/Desktop/设计/外销设计/全公司产品设计样本册/SO-FINE_20页蓝白样本册_跨页绘制素材/跨页_04_第07-08页/图片素材/02_image7.png" "public/media/families/one-way-vision-window-application.webp"
prepare_media "/Users/geekou/Desktop/设计/外销设计/全公司产品设计样本册/SO-FINE_20页蓝白样本册_跨页绘制素材/跨页_05_第09-10页/图片素材/01_image.jpeg" "public/media/families/self-adhesive-bus-graphics.webp"
prepare_media "/Users/geekou/Desktop/设计/外销设计/全公司产品设计样本册/SO-FINE_20页蓝白样本册_跨页绘制素材/跨页_06_第11-12页/图片素材/01_image9.png" "public/media/families/translucent-lightbox-application.webp"
prepare_media "/Users/geekou/Desktop/设计/外销设计/全公司产品设计样本册/SO-FINE_20页蓝白样本册_跨页绘制素材/跨页_07_第13-14页/图片素材/01_image10.png" "public/media/families/paint-protection-film-layers.webp"
prepare_media "/Users/geekou/Desktop/设计/外销设计/全公司产品设计样本册/SO-FINE_20页蓝白样本册_跨页绘制素材/跨页_07_第13-14页/图片素材/02_image11.png" "public/media/families/car-wrapping-color-rolls.webp"
prepare_media "/Users/geekou/Desktop/设计/素材/Pictures taken by MIC/MOT_7166.jpg" "public/media/families/overlaminate-protective-roll.webp"
prepare_media "/Users/geekou/Desktop/设计/素材/Pictures taken by MIC/MOT_7242.jpg" "public/media/families/cold-lamination-film-roll.webp"
prepare_media "/Users/geekou/Desktop/设计/素材/%E5%8D%A7%E5%AE%A4%E6%95%88%E6%9E%9C%E5%9B%BE_8K%E9%AB%98%E6%B8%85%E7%89%88.webp" "public/media/families/interior-wall-decals.webp"
