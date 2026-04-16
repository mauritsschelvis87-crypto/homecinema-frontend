from __future__ import annotations

from io import BytesIO
from pathlib import Path
from shutil import copy2
from urllib.request import urlopen

from PIL import Image, ImageEnhance, ImageFilter


TARGET_SIZE = (1288, 1600)
OUTPUT_DIR = Path(__file__).resolve().parents[1] / "src" / "assets" / "gifts"

SOURCE_IMAGES = {
    "10_euro.png": "https://res.cloudinary.com/duurvelke/image/upload/v1776339640/10_euro_f4vsch.png",
    "20_euro.png": "https://res.cloudinary.com/duurvelke/image/upload/v1776339640/20_euro_oxni1m.png",
    "30_euro.png": "https://res.cloudinary.com/duurvelke/image/upload/v1776339639/30_euro_fkcwel.png",
    "50_euro.png": "https://res.cloudinary.com/duurvelke/image/upload/v1776339644/50_euro_mgywcg.png",
    "100_euro.png": "https://res.cloudinary.com/duurvelke/image/upload/v1776339643/100_euro_qne5v5.png",
    "10_pound.png": "https://res.cloudinary.com/duurvelke/image/upload/v1776339638/10_pound_cc9p1v.png",
    "20_pound.png": "https://res.cloudinary.com/duurvelke/image/upload/v1776339639/20_pound_yzzxza.png",
    "30_pound.png": "https://res.cloudinary.com/duurvelke/image/upload/v1776339644/30_pound_svix5b.png",
    "50_pound.png": "https://res.cloudinary.com/duurvelke/image/upload/v1776339643/50_pound_qepszy.png",
    "100_pound.png": "https://res.cloudinary.com/duurvelke/image/upload/v1776339648/100_pound_oihveh.png",
    "dvd.png": "https://res.cloudinary.com/duurvelke/image/upload/v1776339644/dvd_cmwwer.png",
    "blu-ray.png": "https://res.cloudinary.com/duurvelke/image/upload/v1776339642/blu-ray_mpcamm.png",
    "4k-uhd.png": "https://res.cloudinary.com/duurvelke/image/upload/v1776339640/4k-uhd_bj4u2y.png",
}

ALIASES = {
    "digital-10.png": "10_euro.png",
    "digital-20.png": "20_euro.png",
    "digital-30.png": "30_euro.png",
    "digital-50.png": "50_euro.png",
    "digital-100.png": "100_euro.png",
    "physical-10.png": "dvd.png",
    "physical-20.png": "blu-ray.png",
    "physical-30.png": "4k-uhd.png",
}


def download_image(url: str) -> Image.Image:
    with urlopen(url) as response:
        return Image.open(BytesIO(response.read())).convert("RGBA")


def resize_cover(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    scale = max(size[0] / image.width, size[1] / image.height)
    resized = image.resize(
        (round(image.width * scale), round(image.height * scale)),
        Image.Resampling.LANCZOS,
    )
    left = max(0, (resized.width - size[0]) // 2)
    top = max(0, (resized.height - size[1]) // 2)
    return resized.crop((left, top, left + size[0], top + size[1]))


def resize_contain(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    scale = min(size[0] / image.width, size[1] / image.height)
    return image.resize(
        (round(image.width * scale), round(image.height * scale)),
        Image.Resampling.LANCZOS,
    )


def create_poster_canvas(image: Image.Image) -> Image.Image:
    background = resize_cover(image, TARGET_SIZE).filter(ImageFilter.GaussianBlur(radius=30))
    background = ImageEnhance.Brightness(background).enhance(0.72)

    foreground = resize_contain(image, TARGET_SIZE)
    canvas = Image.new("RGBA", TARGET_SIZE)
    canvas.alpha_composite(background, (0, 0))

    left = (TARGET_SIZE[0] - foreground.width) // 2
    top = max(0, (TARGET_SIZE[1] - foreground.height) // 2)
    canvas.alpha_composite(foreground, (left, top))

    return canvas


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for file_name, url in SOURCE_IMAGES.items():
        poster = create_poster_canvas(download_image(url))
        poster.save(OUTPUT_DIR / file_name, optimize=True)
        print(f"generated {file_name}")

    for alias_name, source_name in ALIASES.items():
        copy2(OUTPUT_DIR / source_name, OUTPUT_DIR / alias_name)
        print(f"copied {alias_name}")


if __name__ == "__main__":
    main()
