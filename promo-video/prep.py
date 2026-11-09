# Splits each photo into a graded foreground cutout + inpainted background plate for 2.5D parallax.
import cv2, numpy as np, sys, os
OUT=sys.argv[1]; os.makedirs(OUT,exist_ok=True)
names=sys.argv[2:]
RATIO=np.array([0.905,0.965,1.0])  # B,G,R of the target warm-cream wall
H=2300
for n in names:
    img=cv2.imread(f'src/{n}.png').astype(np.float32)/255
    a=cv2.imread(f'seg/{n}.png',cv2.IMREAD_UNCHANGED)[:,:,3].astype(np.float32)/255
    if n=='bordeaux':  # the matte misses part of the dark hair against the white wall: add it back
        l0=img@[.114,.587,.299]; hh=np.clip((0.60-l0)/0.22,0,1); hh[int(a.shape[0]*.30):]=0
        a=np.maximum(a,cv2.GaussianBlur(hh.astype(np.float32),(0,0),1.2))
    bgm=a<0.03
    mean=img[bgm].mean(0); lum=float(mean@[.114,.587,.299])
    tgt=RATIO/ (RATIO@[.114,.587,.299])*lum
    gain=(tgt/mean)**0.9
    img=np.clip(img*gain,0,1)
    g=float(np.clip(np.log(0.84)/np.log(lum),0.60,1.12))
    img=img**g
    # gentle filmic: slight desat, lifted blacks
    gray=(img@[.114,.587,.299])[...,None]
    img=gray+(img-gray)*0.93
    img=0.025+img*0.975
    print(n,img.shape,'bg',np.round(mean[::-1],3),'lum',round(lum,3),'gain',np.round(gain[::-1],3),'gamma',round(g,2))
    h,w=a.shape; s=H/h; W=int(round(w*s))
    # background plate
    m=(a>0.02).astype(np.uint8)
    m=cv2.dilate(m,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(41,41)))
    sm=cv2.resize((img*255).astype(np.uint8),(w//3,h//3),interpolation=cv2.INTER_AREA)
    mm=cv2.resize(m,(w//3,h//3),interpolation=cv2.INTER_NEAREST)
    inp=cv2.inpaint(sm,mm,7,cv2.INPAINT_TELEA)
    inp=cv2.GaussianBlur(inp,(0,0),9)
    inp=cv2.resize(inp,(w,h),interpolation=cv2.INTER_CUBIC).astype(np.float32)/255
    mf=cv2.GaussianBlur(m.astype(np.float32),(0,0),10)[...,None]
    bg=img*(1-mf)+inp*mf
    bg=cv2.GaussianBlur(bg,(0,0),2.2)
    bg=cv2.resize(bg,(W,H),interpolation=cv2.INTER_CUBIC)
    cv2.imwrite(f'{OUT}/{n}_bg.jpg',(np.clip(bg,0,1)*255).astype(np.uint8),[cv2.IMWRITE_JPEG_QUALITY,90])
    # foreground cutout
    a2=np.clip((a-0.12)/0.8,0,1); a2=cv2.GaussianBlur(a2,(0,0),0.8)
    fg=cv2.resize(img,(W,H),interpolation=cv2.INTER_LANCZOS4)
    bl=cv2.GaussianBlur(fg,(0,0),2.0); fg=np.clip(fg+(fg-bl)*0.45,0,1)
    a2=cv2.resize(a2,(W,H),interpolation=cv2.INTER_CUBIC)
    rgba=np.dstack([fg,np.clip(a2,0,1)])
    cv2.imwrite(f'{OUT}/{n}_fg.webp',(rgba*255).astype(np.uint8),[cv2.IMWRITE_WEBP_QUALITY,93])
    # flat graded full frame (for reference sheets)
    cv2.imwrite(f'{OUT}/{n}_flat.jpg',(cv2.resize(img,(W//4,H//4))*255).astype(np.uint8))
