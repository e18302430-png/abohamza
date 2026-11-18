import sys, glob
from PIL import Image
d, slug, out = sys.argv[1], sys.argv[2], sys.argv[3]
fs = sorted(glob.glob(f'{d}/{slug}_*.png'), key=lambda f: int(f.rsplit('_', 1)[1][:-4]))
im = Image.new('RGB', (5 * 300, 2 * 375))
for i, f in enumerate(fs[:10]):
    im.paste(Image.open(f).convert('RGB').resize((300, 375)), ((i % 5) * 300, (i // 5) * 375))
im.save(out)
print(len(fs))
