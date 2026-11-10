"""Make a contact sheet from direction observe evidence (optional Pillow)."""
import json
import sys
from pathlib import Path
from PIL import Image, ImageDraw

for argument in sys.argv[1:]:
    path = Path(argument)
    info = json.loads(path.read_text())
    files = sorted(Path(info["sampleDirectory"]).glob("sample-*.jpg"))
    image = Image.new("RGB", (960, ((len(files) + 2) // 3) * 201), "#0f151d")
    labels = ImageDraw.Draw(image)
    for i, file in enumerate(files):
        frame = Image.open(file)
        frame.thumbnail((320, 180))
        x, y = i % 3 * 320, i // 3 * 201
        image.paste(frame, (x, y))
        point = info["periods"][i]
        labels.text((x + 8, y + 183),
                    f"{point['seconds']:.3f}s    audio peak {point['audioPeakSincePrevious']:.2f}", fill="#d7dccf")
    image.save(path.with_suffix(".jpg"), quality=90)
