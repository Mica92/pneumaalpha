#!/usr/bin/env python3
"""Genera public/og-image.png (1200x630) con el cisne de origami de Pneuma Alpha."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1200, 630
BG = (11, 11, 13)
GOLD = (201, 162, 75)


def bezier(p0, p1, p2, p3, n=40):
    pts = []
    for i in range(n + 1):
        t = i / n
        x = (1 - t) ** 3 * p0[0] + 3 * (1 - t) ** 2 * t * p1[0] + 3 * (1 - t) * t ** 2 * p2[0] + t ** 3 * p3[0]
        y = (1 - t) ** 3 * p0[1] + 3 * (1 - t) ** 2 * t * p1[1] + 3 * (1 - t) * t ** 2 * p2[1] + t ** 3 * p3[1]
        pts.append((x, y))
    return pts


# facetas del cisne de origami (coordenadas del favicon) con tono de gris
facets = [
    ([(37, 41), (13, 6), (26, 34)], 96),
    ([(37, 41), (26, 34), (30, 12)], 126),
    ([(37, 41), (30, 12), (10, 16)], 246),
    ([(37, 41), (10, 16), (20, 33)], 216),
    ([(37, 41), (20, 33), (7, 27)], 96),
    ([(37, 41), (7, 27), (18, 38)], 246),
    ([(37, 41), (18, 38), (9, 39)], 178),
    ([(37, 41), (9, 39), (20, 45)], 216),
    ([(37, 41), (20, 45), (18, 52), (30, 58)], 96),
    ([(37, 41), (30, 58), (45, 57)], 178),
    ([(37, 41), (45, 57), (50, 46)], 216),
    ([(37, 41), (50, 46), (52, 40)], 126),
]
neck = bezier((49, 47), (44, 30), (44, 16), (52, 14))[:-1] + bezier((52, 14), (59, 12), (61, 20), (56, 23))
head = [(55, 17), (60, 20), (56, 24)]
beak = [(56, 23), (62, 27), (55, 26)]

S = 7.2
minx, maxx = 7, 62
miny, maxy = 6, 58
OX = (W - (maxx - minx) * S) / 2 - minx * S
OY = 250 - (maxy + miny) / 2 * S


def T(p):
    return (OX + p[0] * S, OY + p[1] * S)


img = Image.new("RGB", (W, H), BG)
# resplandor suave
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
gd.ellipse([600 - 460, 160 - 460, 600 + 460, 160 + 460], fill=(61, 180, 242, 55))
gd.ellipse([350 - 300, 420 - 300, 350 + 300, 420 + 300], fill=(240, 163, 92, 35))
glow = glow.filter(ImageFilter.GaussianBlur(160))
img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
d = ImageDraw.Draw(img)

for pts, g in facets:
    d.polygon([T(p) for p in pts], fill=(g, g, g))
d.line([T(p) for p in neck], fill=(245, 245, 245), width=int(5 * S), joint="curve")
d.polygon([T(p) for p in head], fill=(150, 150, 150))
d.polygon([T(p) for p in beak], fill=GOLD)

# tipografía
def font(candidates, size, weight=None):
    for path in candidates:
        try:
            f = ImageFont.truetype(path, size)
            if weight is not None:
                try:
                    f.set_variation_by_name(weight)
                except Exception:
                    pass
            return f
        except Exception:
            continue
    return ImageFont.load_default()


import glob

NOTO = glob.glob("/nix/store/*noto-fonts*/share/fonts/noto")
SERIF = [f"{d}/NotoSerif[wdth,wght].ttf" for d in NOTO] + ["C:/Windows/Fonts/GARABD.TTF"]
SANS = [f"{d}/NotoSans[wdth,wght].ttf" for d in NOTO] + ["C:/Windows/Fonts/arial.ttf"]

serif_b = font(SERIF, 78, weight="Bold")
sans = font(SANS, 26)


brand = "Pneuma Alpha"
d.text((W / 2, 500), brand, fill=(245, 245, 245), font=serif_b, anchor="mm")

tag = "Conversa con las grandes mentes de la historia"
d.text((W / 2, 570), tag, fill=(168, 168, 178), font=sans, anchor="mm")


img.convert("RGB").save("public/og-image.png", optimize=True)
print("og-image.png generado:", img.size)
