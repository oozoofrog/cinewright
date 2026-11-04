from pathlib import Path
import json
import subprocess
from PIL import Image, ImageChops, ImageStat

root = Path(__file__).resolve().parents[2]
evidence = root / 'evidence/harbor-v2'
folder = evidence / 'parity'
folder.mkdir(exist_ok=True)
results = []
for frame in [23, 24, 25, 168, 264, 360, 503, 504, 505, 552, 575]:
    files = []
    for name, movie in [('full', 'harbor-v2.mp4'), ('preview', 'preview.mp4')]:
        out = folder / f'{name}-{frame}.png'
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(root / 'outputs/harbor-v2' / movie),
                        '-vf', f'select=eq(n\\,{frame})', '-frames:v', '1', str(out)], check=True)
        files.append(out)
    full = Image.open(files[0]).convert('RGB').resize((800, 450), Image.Resampling.LANCZOS)
    preview = Image.open(files[1]).convert('RGB')
    error = sum(ImageStat.Stat(ImageChops.difference(full, preview)).mean) / 3
    assert error < 8, (frame, error)
    results.append({'frame': frame, 'meanAbsoluteRGBError': error})
Image.open(folder / 'full-360.png').save(root / 'outputs/harbor-v2/poster.jpg', quality=93)
sheet = Image.new('RGB', (1600, 450 * 3), '#13212a')
for i, frame in enumerate([24, 264, 504]):
    for j, name in enumerate(['full', 'preview']):
        art = Image.open(folder / f'{name}-{frame}.png').resize((800, 450), Image.Resampling.LANCZOS)
        sheet.paste(art, (j * 800, i * 450))
sheet.save(evidence / 'preview-final-comparison.jpg', quality=92)
(evidence / 'parity.json').write_text(json.dumps({'pass': True, 'toleranceRGB': 8, 'frames': results}, indent=2))
print(json.dumps(results, indent=2))
