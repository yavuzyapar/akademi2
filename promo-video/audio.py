# Synthesizes the soundtrack (100 BPM, 36 beats) -> out/music.wav. Needs only numpy.
import numpy as np, wave
SR=44100; B=0.6; DUR=36*B; N=int(SR*DUR)
t=np.arange(N)/SR
rng=np.random.default_rng(7)
L=np.zeros(N); R=np.zeros(N)
def add(buf,sig,at,g=1.0):
    i=int(at*SR)
    if i>=N: return
    sig=sig[:N-i]; buf[i:i+len(sig)]+=sig*g
def both(sig,at,g=1.0,pan=0.0):
    add(L,sig,at,g*(1-max(pan,0))); add(R,sig,at,g*(1+min(pan,0)))
def lp(x,fc):   # FFT brickwall-ish lowpass with soft slope
    X=np.fft.rfft(x); f=np.fft.rfftfreq(len(x),1/SR); X*=1/(1+(f/fc)**4); return np.fft.irfft(X,len(x))
def hp(x,fc):
    X=np.fft.rfft(x); f=np.fft.rfftfreq(len(x),1/SR); X*=1-1/(1+(f/fc)**4); return np.fft.irfft(X,len(x))
def note(m): return 440*2**((m-69)/12)
def kick(g=1.0):
    n=int(.34*SR); tt=np.arange(n)/SR
    f=45+110*np.exp(-tt*38); ph=2*np.pi*np.cumsum(f)/SR
    return np.sin(ph)*np.exp(-tt*11)*g
def clap():
    n=int(.22*SR); tt=np.arange(n)/SR
    x=hp(lp(rng.standard_normal(n),5200),900)
    env=np.exp(-tt*24)+.6*np.exp(-np.abs(tt-.012)*400)+.5*np.exp(-np.abs(tt-.024)*400)
    return x*env*.5
def hat(d=.05):
    n=int(d*4*SR); tt=np.arange(n)/SR
    return hp(rng.standard_normal(n),7500)*np.exp(-tt/d)*.25
def pluck(m,d=.5):
    n=int(d*SR); tt=np.arange(n)/SR; f=note(m)
    x=np.sin(2*np.pi*f*tt)+.5*np.sin(2*np.pi*2*f*tt)*np.exp(-tt*9)+.25*np.sin(2*np.pi*3*f*tt)*np.exp(-tt*16)
    return x*np.exp(-tt*7)*(1-np.exp(-tt*900))
def pad(ms,d):
    n=int(d*SR); tt=np.arange(n)/SR; x=np.zeros(n)
    for m in ms:
        f=note(m)
        for det in (-.004,0,.004):
            ph=rng.uniform(0,6.28)
            x+=np.sin(2*np.pi*f*(1+det)*tt+ph)+.3*np.sin(2*np.pi*2*f*(1+det)*tt+ph)
    env=np.minimum(1,tt/.25)*np.minimum(1,(d-tt)/.35)
    return lp(x,1800)*env/len(ms)/3
def bass(m,d):
    n=int(d*SR); tt=np.arange(n)/SR; f=note(m)
    return (np.sin(2*np.pi*f*tt)+.35*np.sin(2*np.pi*2*f*tt))*np.minimum(1,tt/.01)*np.exp(-tt*3.5)
def whoosh(d=.55):
    n=int(d*SR); tt=np.arange(n)/SR
    x=rng.standard_normal(n); X=np.fft.rfft(x); f=np.fft.rfftfreq(n,1/SR)
    X*=np.exp(-((np.log(f+1)-np.log(2500))**2)/1.2); x=np.fft.irfft(X,n)
    return x*(tt/d)**2.5*np.minimum(1,(d-tt)/.02)*.9
def impact():
    n=int(1.6*SR); tt=np.arange(n)/SR
    return np.sin(2*np.pi*(38+30*np.exp(-tt*10))*tt)*np.exp(-tt*3)+lp(rng.standard_normal(n),900)*np.exp(-tt*6)*.5

# Am9 | Fmaj7 | Cmaj7 | Em7  (one chord per 4 beats)
chords=[([57,60,64,67,71],45),([53,57,60,64],41),([48,52,55,59,64],36),([52,55,59,62],40)]
duck=np.ones(N)
for bar in range(9):
    ms,root=chords[bar%4]; t0=bar*4*B
    drums = 2<=bar<8          # beats 8..31
    p=pad(ms,4*B+.3); both(p,t0,.55 if bar<8 else .7)
    both(pad([m+12 for m in ms[:3]],4*B+.3),t0,.18)
    arp=[ms[0]+12,ms[2]+12,ms[1]+12,ms[-1]+12,ms[2]+12,ms[1]+24,ms[-1]+12,ms[2]+12]
    for k,m in enumerate(arp):
        if bar==0 and k<2: continue
        g=.16 if drums else .12
        both(pluck(m),t0+k*B/2,g,pan=.5 if k%2 else -.5)
        both(pluck(m),t0+k*B/2+B*.75,g*.35,pan=-.5 if k%2 else .5)   # echo
    if bar<2:
        both(kick(.6),t0,.8); both(kick(.6),t0+2*B,.55)
    if drums:
        for k in range(4):
            tk=t0+k*B; both(kick(),tk,.95)
            i=int(tk*SR); n=int(.3*SR); e=min(N,i+n); duck[i:e]*=np.linspace(.35,1,n)[:e-i]
            both(hat(),tk+B/2,.9); both(hat(.02),tk+B/4,.35,pan=.4); both(hat(.02),tk+3*B/4,.35,pan=-.4)
            both(bass(root,B*.5),tk+B/2,.5)
            if k in (1,3): both(clap(),tk,.8)
    if bar==8:
        both(impact(),t0,.9)
for bt in (4,8,12,14,16,19,23,27,31):
    w=whoosh(.75 if bt in (8,31) else .5); both(w,bt*B-len(w)/SR,.5 if bt in (8,31) else .3)
for bt in (8,12,17,23): both(impact(),bt*B,.3)
# quick ticks for the opening flash cuts
for k in range(4): both(hat(.015),k*4/30,1.2)
mix=np.stack([L,R])*1.0
mix=np.tanh(mix*1.5)
fade=np.minimum(1,(DUR-t)/1.2); mix*=fade*np.minimum(1,t/.01)
mix/=np.abs(mix).max()/.89
import os; os.makedirs('out',exist_ok=True)
w=wave.open('out/music.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((mix.T*32767).astype('<i2').tobytes()); w.close()
