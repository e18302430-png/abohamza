import sys, glob
from PIL import Image
d, slug, out = sys.argv[1], sys.argv[2], sys.argv[3]
fs = sorted(glob.glob(f'{d}/{slug}_*.png'), key=lambda f: int(f.rsplit('_', 1)[1][:-4]))
im = Image.new('RGB', (4 * 360, 2 * 450))
for i, f in enumerate(fs[:8]):
    im.paste(Image.open(f).convert('RGB').resize((360, 450)), ((i % 4) * 360, (i // 4) * 450))
im.save(out)
print(len(fs))
