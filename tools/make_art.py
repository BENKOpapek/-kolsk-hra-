"""Generuje pixel-art grafiku hry do assets/. Spusti: python3 tools/make_art.py

Všetko je kreslené kódom (vlastná grafika, žiadne cudzie assety).
Farby sú v jednej palete hore, aby sa štýl dal ladiť na jednom mieste.
"""
from pathlib import Path
from PIL import Image

OUT_DIR = Path(__file__).resolve().parent.parent / "assets"
T = 16

# --- Paleta (teplé „farm life“ farby) ---
C = {
    "out": (43, 29, 36), "void": (27, 27, 42),
    "floor": (226, 206, 164), "floor2": (218, 196, 152), "floor_hi": (236, 220, 186),
    "floor_lo": (204, 182, 140), "grout": (196, 172, 128),
    "roof": (58, 46, 54), "roof_lo": (50, 40, 48),
    "wtop": (104, 74, 64), "wtop_hi": (126, 92, 78), "wtop_lo": (88, 62, 54),
    "wall": (239, 227, 200), "wall_lo": (226, 212, 182), "sokel": (138, 90, 68),
    "sokel_hi": (164, 112, 84), "sokel_lo": (104, 68, 52),
    "wood": (166, 112, 70), "wood_lo": (140, 92, 56), "wood_hi": (190, 136, 88), "frame": (96, 64, 48),
    "brass": (232, 196, 92),
    "metal": (72, 112, 162), "metal_hi": (104, 146, 196), "metal_lo": (48, 78, 120),
    "glass": (168, 218, 226), "glass_hi": (226, 246, 248), "glass_lo": (128, 182, 196),
    "gold": (214, 168, 62), "gold_lo": (164, 120, 42), "canvas": (64, 84, 112),
    "skin": (242, 196, 158), "skin_lo": (222, 164, 128),
    "hair_m": (66, 44, 34), "hair_f": (124, 64, 42), "hair_old": (150, 150, 156),
    "shirt_m": (70, 120, 190), "shirt_m_lo": (52, 94, 156),
    "shirt_f": (204, 82, 94), "shirt_f_lo": (168, 60, 74),
    "pants_m": (58, 60, 82), "pants_f": (72, 84, 124), "shoe": (52, 38, 40), "white": (248, 244, 232),
    "board": (52, 96, 72), "board_lo": (40, 76, 58), "chalk": (222, 232, 222),
    "sky": (150, 202, 236), "sky_hi": (196, 226, 246),
    "plank": (196, 140, 92), "plank2": (184, 128, 82), "plank_line": (150, 100, 64),
    "desk": (204, 162, 112), "desk_lo": (164, 122, 80), "chair": (84, 128, 176), "chair_lo": (62, 98, 140),
    "pot": (190, 98, 64), "pot_lo": (150, 72, 48), "leaf": (98, 162, 84), "leaf_lo": (66, 124, 62),
}


def new(w, h):
    return Image.new("RGBA", (w, h), (0, 0, 0, 0))


def px(img, x, y, c):
    if 0 <= x < img.width and 0 <= y < img.height:
        img.putpixel((x, y), C[c] + (255,) if isinstance(c, str) else c)


def rect(img, x0, y0, x1, y1, c):
    """Vyplnený obdĺžnik, súradnice vrátane."""
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            px(img, x, y, c)


def outline(img):
    """Tmavý 1px obrys okolo nepriehľadných pixelov (pre postavy a predmety)."""
    src = img.copy()
    for y in range(img.height):
        for x in range(img.width):
            if src.getpixel((x, y))[3]:
                continue
            if any(0 <= x + dx < img.width and 0 <= y + dy < img.height and src.getpixel((x + dx, y + dy))[3]
                   for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                px(img, x, y, "out")


# --- Dlaždice ---------------------------------------------------------------

def tile_floor(base):
    t = new(T, T)
    rect(t, 0, 0, 15, 15, base)
    rect(t, 0, 0, 15, 0, "grout")
    rect(t, 0, 0, 0, 15, "grout")
    rect(t, 1, 1, 15, 1, "floor_hi")
    for x, y in ((4, 5), (11, 3), (7, 10), (13, 12), (3, 13)):
        px(t, x, y, "floor_lo")
    return t


def tile_wall_top():
    t = new(T, T)
    rect(t, 0, 0, 15, 15, "wtop")
    for x, y in ((3, 4), (10, 2), (6, 11), (13, 9), (1, 14)):
        px(t, x, y, "wtop_hi")
    for x, y in ((8, 6), (2, 9), (12, 13)):
        px(t, x, y, "wtop_lo")
    return t


def tile_wall_face():
    t = new(T, T)
    rect(t, 0, 0, 15, 1, "wtop")         # horná hrana steny
    rect(t, 0, 2, 15, 10, "wall")
    rect(t, 0, 2, 15, 2, "wall_lo")
    rect(t, 0, 11, 15, 11, "sokel_hi")    # sokel
    rect(t, 0, 12, 15, 14, "sokel")
    rect(t, 0, 15, 15, 15, "sokel_lo")
    return t


def tile_door():
    t = new(T, T)
    rect(t, 0, 0, 15, 15, "frame")
    rect(t, 2, 1, 13, 15, "wood")
    for x in (5, 8, 11):
        rect(t, x, 2, x, 15, "wood_lo")
    rect(t, 2, 1, 13, 1, "wood_hi")
    rect(t, 4, 4, 11, 6, "white")         # tabuľka s názvom
    rect(t, 5, 5, 10, 5, "frame")
    px(t, 11, 9, "brass")
    px(t, 11, 10, "brass")
    return t


def tile_locker():
    t = tile_wall_face()
    rect(t, 0, 0, 15, 12, "metal")
    rect(t, 0, 0, 15, 0, "metal_lo")
    rect(t, 7, 0, 8, 12, "metal_lo")      # dve skrinky v jednej dlaždici
    for x0 in (1, 9):
        rect(t, x0, 1, x0 + 5, 1, "metal_hi")
        for y in (3, 5):
            rect(t, x0 + 1, y, x0 + 4, y, "metal_lo")  # vetracie mriežky
        px(t, x0 + 5, 8, "white")         # rúčka
    return t


def tile_vitrina():
    t = new(T, T)
    rect(t, 0, 0, 15, 15, "wtop")
    rect(t, 1, 1, 14, 14, "frame")
    rect(t, 2, 2, 13, 13, "glass")
    rect(t, 2, 8, 13, 8, "glass_lo")      # prázdna polička – kniha zmizla!
    for i in range(4):
        px(t, 4 + i, 6 - i, "glass_hi")
        px(t, 9 + i, 12 - i, "glass_hi")
    return t


def tile_portret():
    t = new(T, T)
    rect(t, 0, 0, 15, 15, "wtop")
    rect(t, 2, 1, 13, 14, "gold")
    rect(t, 2, 14, 13, 14, "gold_lo")
    rect(t, 4, 3, 11, 12, "canvas")
    rect(t, 6, 5, 9, 9, "skin")           # tvár
    rect(t, 6, 4, 9, 4, "hair_old")
    px(t, 7, 7, "out"); px(t, 8, 7, "out")  # oči
    rect(t, 6, 8, 9, 8, "hair_old")       # fúzy
    rect(t, 5, 10, 10, 12, "out")         # tmavý kabát
    px(t, 7, 10, "white"); px(t, 8, 10, "white")
    return t


def tile_roof():
    """Vnútro miestností zhora (skryté) – tmavé, aby vynikla chodba."""
    t = new(T, T)
    rect(t, 0, 0, 15, 15, "roof")
    for i in range(0, 16, 4):
        px(t, i, (i * 3) % 16, "roof_lo")
        px(t, (i + 2) % 16, (i * 3 + 8) % 16, "roof_lo")
    return t


def tile_void():
    t = new(T, T)
    rect(t, 0, 0, 15, 15, "void")
    return t


def make_tiles():
    tiles = [tile_floor("floor"), tile_floor("floor2"), tile_wall_top(), tile_wall_face(),
             tile_door(), tile_locker(), tile_vitrina(), tile_portret(), tile_void(), tile_roof()]
    sheet = new(T * len(tiles), T)
    for i, t in enumerate(tiles):
        sheet.paste(t, (i * T, 0))
    return sheet


# --- Postavy ----------------------------------------------------------------
# Riadky: dole, hore, vľavo, vpravo. Stĺpce: stoj, krok1, krok2.

def draw_char(dirn, frame, girl):
    s = new(T, T)
    hair = "hair_f" if girl else "hair_m"
    shirt, shirt_lo = ("shirt_f", "shirt_f_lo") if girl else ("shirt_m", "shirt_m_lo")
    pants = "pants_f" if girl else "pants_m"
    step = (0, 1, -1)[frame]              # ktorá noha ide dopredu
    side = dirn in ("left", "right")

    # nohy a topánky
    if side:
        for lx, d in ((6, step), (8, -step)):
            rect(s, lx + d, 12, lx + d + 1, 13, pants)
            rect(s, lx + d, 14, lx + d + 1, 14, "shoe")
    else:
        for lx, lift in ((5, step == 1), (9, step == -1)):
            rect(s, lx, 12, lx + 1, 13 - lift, pants)
            rect(s, lx, 14 - lift, lx + 1, 14 - lift, "shoe")

    # trup
    x0, x1 = (5, 10) if side else (4, 11)
    rect(s, x0, 8, x1, 11, shirt)
    rect(s, x0, 11, x1, 11, shirt_lo)
    if dirn == "down":
        rect(s, 7, 8, 8, 8, "white")      # golier
    # ruky
    if side:
        ax = 7 + (step if dirn == "right" else -step)
        rect(s, ax, 8, ax + 1, 10, shirt_lo)
        rect(s, ax, 11, ax + 1, 11, "skin")
    else:
        for ax, d in ((3, -step), (12, step)):
            rect(s, ax, 8, ax, 10 + (d > 0), shirt_lo)
            px(s, ax, 11 + (d > 0), "skin")

    # hlava
    rect(s, 5, 2, 10, 7, "skin")
    rect(s, 5, 7, 10, 7, "skin_lo")
    rect(s, 5, 1, 10, 2, hair)            # vrch vlasov
    if dirn == "down":
        rect(s, 4, 2, 4, 4, hair); rect(s, 11, 2, 11, 4, hair)
        rect(s, 5, 3, 10, 3, hair)        # ofina
        px(s, 6, 5, "out"); px(s, 9, 5, "out")
        if girl:
            rect(s, 4, 5, 4, 9, hair); rect(s, 11, 5, 11, 9, hair)
    elif dirn == "up":
        rect(s, 4, 2, 11, 6, hair)
        rect(s, 5, 7, 10, 7, hair if girl else "skin_lo")
        if girl:
            rect(s, 5, 8, 10, 9, hair)
    else:
        back = 9 if dirn == "left" else 4  # zátylok je na opačnej strane ako pohľad
        rect(s, back, 2, back + 2, 6, hair)
        rect(s, 5, 3, 10, 3, hair)
        px(s, 6 if dirn == "left" else 9, 5, "out")
        if girl:
            rect(s, back + (1 if dirn == "left" else 0), 7, back + (2 if dirn == "left" else 1), 10, hair)
    if girl and dirn in ("down", "up"):
        pass
    outline(s)
    return s


def make_player(girl):
    sheet = new(T * 3, T * 4)
    for r, d in enumerate(("down", "up", "left", "right")):
        for f in range(3):
            sheet.paste(draw_char(d, f, girl), (f * T, r * T))
    return sheet


# --- Vzorka triedy (statický obrázok na posúdenie štýlu) ---------------------

def make_classroom():
    w, h = 180, 144
    img = new(w, h)
    # drevená podlaha
    for y in range(40, h):
        row = (y - 40) // 6
        for x in range(w):
            seam = (x + (row % 2) * 16) % 32 == 0
            c = "plank_line" if (y - 40) % 6 == 0 or seam else ("plank" if row % 2 else "plank2")
            px(img, x, y, c)
    # zadná stena so soklom
    rect(img, 0, 0, w - 1, 33, "wall")
    rect(img, 0, 0, w - 1, 1, "wtop")
    rect(img, 0, 34, w - 1, 34, "sokel_hi")
    rect(img, 0, 35, w - 1, 38, "sokel")
    rect(img, 0, 39, w - 1, 39, "sokel_lo")
    # tabuľa
    rect(img, 34, 5, 117, 28, "frame")
    rect(img, 36, 7, 115, 26, "board")
    rect(img, 36, 25, 115, 26, "board_lo")
    for x0, x1, y in ((42, 70, 11), (42, 62, 15), (76, 104, 11), (76, 96, 15), (42, 84, 20)):
        rect(img, x0, y, x1, y, "chalk")
    rect(img, 34, 29, 117, 30, "wood_lo")  # žliabok na kriedu
    rect(img, 100, 29, 103, 29, "white")
    # okno
    rect(img, 132, 4, 167, 28, "white")
    rect(img, 134, 6, 165, 26, "sky")
    rect(img, 149, 6, 150, 26, "white")
    rect(img, 134, 16, 165, 16, "white")
    for i in range(5):
        px(img, 137 + i, 12 - i, "sky_hi")
    # hodiny
    rect(img, 14, 8, 23, 17, "frame"); rect(img, 15, 9, 22, 16, "white")
    rect(img, 18, 10, 18, 13, "out"); rect(img, 18, 13, 21, 13, "out")

    def desk(x, y, wd=28):
        rect(img, x, y, x + wd, y + 9, "desk")
        rect(img, x, y, x + wd, y, "desk_lo")
        rect(img, x, y + 9, x + wd, y + 11, "desk_lo")
        rect(img, x + 1, y + 12, x + 2, y + 15, "frame"); rect(img, x + wd - 2, y + 12, x + wd - 1, y + 15, "frame")

    def chair(x, y):
        rect(img, x, y, x + 9, y + 6, "chair"); rect(img, x, y + 6, x + 9, y + 7, "chair_lo")
        rect(img, x + 1, y + 8, x + 1, y + 10, "frame"); rect(img, x + 8, y + 8, x + 8, y + 10, "frame")

    # katedra
    rect(img, 120, 44, 167, 58, "wood"); rect(img, 120, 44, 167, 45, "wood_hi")
    rect(img, 120, 57, 167, 60, "wood_lo")
    rect(img, 126, 47, 135, 50, "white")   # papiere
    # dva rady lavíc
    for ry in (72, 104):
        for cx in (14, 66, 118):
            desk(cx, ry)
            chair(cx + 4, ry + 17); chair(cx + 17, ry + 17)
    # kvetináč
    rect(img, 4, 54, 13, 63, "pot"); rect(img, 4, 62, 13, 63, "pot_lo")
    for x, y in ((6, 50), (9, 47), (11, 51), (5, 46), (8, 44), (12, 46)):
        rect(img, x, y, x + 1, y + 4, "leaf")
    rect(img, 7, 52, 10, 53, "leaf_lo")
    return img


def main():
    OUT_DIR.mkdir(exist_ok=True)
    make_tiles().save(OUT_DIR / "tiles.png")
    make_player(False).save(OUT_DIR / "player_boy.png")
    make_player(True).save(OUT_DIR / "player_girl.png")
    make_classroom().save(OUT_DIR / "classroom_sample.png")
    print("OK:", ", ".join(p.name for p in sorted(OUT_DIR.glob("*.png"))))


if __name__ == "__main__":
    main()
