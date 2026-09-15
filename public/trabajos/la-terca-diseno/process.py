from PIL import Image, ImageFilter, ImageOps
import numpy as np, os

src = "/root/.claude/uploads/4124e525-7931-5b29-83c1-dda88dae4cfd/7c1226bf-image.jpg"
im = Image.open(src).convert("RGB")
W,H = im.size
# trim 4% border (scan edges)
bx,by = int(W*0.04), int(H*0.04)
im = im.crop((bx,by,W-bx,H-by))
a = np.asarray(im).astype(np.float32)
lum = a.mean(axis=2)
# letters are near white on brown (~ (110,75,50))
mask = np.clip((lum-140)/70.0, 0, 1)
# bbox of letters
ys,xs = np.where(mask>0.5)
x0,x1,y0,y1 = xs.min(), xs.max(), ys.min(), ys.max()
print("bbox", x0,y0,x1,y1, "size", x1-x0, y1-y0)
pad = 110
L = Image.fromarray((mask*255).astype(np.uint8))
Lc = L.crop((x0-pad, y0-pad, x1+pad, y1+pad))
# scale to width 1000
tw = 1000
s = tw/Lc.width
th = round(Lc.height*s)
Lc = Lc.resize((tw,th), Image.LANCZOS)
print("canvas", tw, th, "scale", s)

def dilate(img, px):
    # rounded dilation via repeated MaxFilter on half-res
    small = img.resize((img.width//2, img.height//2), Image.BILINEAR)
    steps = max(1, round(px/2/4))
    for _ in range(steps):
        small = small.filter(ImageFilter.MaxFilter(9))
    small = small.filter(ImageFilter.GaussianBlur(6))
    small = small.point(lambda v: 255 if v>110 else 0)
    small = small.filter(ImageFilter.GaussianBlur(2))
    return small.resize(img.size, Image.BILINEAR)

def erode(img, px):
    return ImageOps.invert(dilate(ImageOps.invert(img), px))

led_outer = dilate(Lc, 46)
led_inner = erode(led_outer, 9)
ring = np.clip(np.asarray(led_outer).astype(int) - np.asarray(led_inner).astype(int), 0, 255).astype(np.uint8)
panel = dilate(Lc, 66)

def save_alpha(arr, name):
    a = Image.fromarray(np.asarray(arr).astype(np.uint8))
    out = Image.merge("LA", [Image.new("L", a.size, 255), a])
    out.save(name, optimize=True)
    print(name, os.path.getsize(name)//1024, "KB")

save_alpha(Lc, "letras.png")
save_alpha(ring, "led.png")
save_alpha(panel, "panel.png")

# standoff positions: nearest interior panel point to each corner, 26px inside
pin = np.asarray(erode(panel, 30)) > 128
ys,xs = np.where(pin)
for name,(cx,cy) in {"tl":(0,0),"tr":(tw,0),"bl":(0,th),"br":(tw,th)}.items():
    d = (xs-cx)**2 + (ys-cy)**2
    i = d.argmin(); print(name, xs[i], ys[i])
# letter bbox in canvas coords
ys,xs = np.where(np.asarray(Lc)>128); print("letters bbox", xs.min(), ys.min(), xs.max(), ys.max())
ys,xs = np.where(np.asarray(panel)>128); print("panel bbox", xs.min(), ys.min(), xs.max(), ys.max())
