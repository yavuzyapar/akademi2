# Synthesizes the soundtrack (felt piano + strings, 72 BPM, 10 bars) -> out/music.wav. Needs only numpy.
import numpy as np, wave, os
SR=44100; BEAT=60/72; BAR=4*BEAT; DUR=10*BAR; TAIL=0.0; N=int(SR*(DUR+TAIL))
rng=np.random.default_rng(11)
dry=np.zeros((2,N)); padb=np.zeros((2,N))
f_=lambda m:440*2**((m-69)/12)
def put(buf,sig,at,g=1.0,pan=0.0):
    i=int(max(at,0)*SR)
    if i>=N: return
    sig=sig[:N-i]; l=np.sqrt(.5*(1-pan)); r=np.sqrt(.5*(1+pan))
    buf[0,i:i+len(sig)]+=sig*g*l; buf[1,i:i+len(sig)]+=sig*g*r
def lowpass(x,fc,order=2):
    X=np.fft.rfft(x); f=np.fft.rfftfreq(len(x),1/SR); X*=1/np.sqrt(1+(f/fc)**(2*order)); return np.fft.irfft(X,len(x))
def piano(m,vel=.6,d=4.0):
    f=f_(m); n=int(d*SR); t=np.arange(n)/SR; x=np.zeros(n)
    B=0.0004*(1+(m-40)/40)
    for k in range(1,10):
        fk=f*k*np.sqrt(1+B*k*k)
        if fk>9000: break
        amp=(1/k**(1.9-vel*.7))*(0.6 if k==1 else 1)
        dec=0.55+0.42*k+ (m-48)*0.012
        for det in (-.0007,.0007):
            x+=amp*np.sin(2*np.pi*fk*(1+det)*t+rng.uniform(0,6.28))*np.exp(-t*dec)
    x*=1-np.exp(-t*260)                              # soft felt attack
    x+=lowpass(rng.standard_normal(n),1400)*np.exp(-t*60)*.05*vel   # hammer thump
    x=lowpass(x,1500+2600*vel)
    return x*vel*np.minimum(1,(d-t)/.3)
def strings(ms,d,g=1.0):
    n=int(d*SR); t=np.arange(n)/SR; x=np.zeros(n)
    for m in ms:
        f=f_(m)
        for det in (-.006,-.002,.003,.007):
            vib=1+.0025*np.sin(2*np.pi*(4.6+rng.uniform(-.4,.4))*t+rng.uniform(0,6.28))
            ph=2*np.pi*np.cumsum(f*(1+det)*vib)/SR+rng.uniform(0,6.28)
            x+=np.sin(ph)+.45*np.sin(2*ph)+.22*np.sin(3*ph)+.1*np.sin(4*ph)
    env=np.minimum(1,t/1.3)**1.5*np.minimum(1,(d-t)/1.4)
    return lowpass(x,1300)*env*g/len(ms)/4
def sub(m,d=3.0):
    n=int(d*SR); t=np.arange(n)/SR
    return np.sin(2*np.pi*f_(m)*t)*np.minimum(1,t/.04)*np.exp(-t*1.1)
def air(d=1.6):
    n=int(d*SR); t=np.arange(n)/SR
    x=rng.standard_normal(n); X=np.fft.rfft(x); f=np.fft.rfftfreq(n,1/SR)
    X*=np.exp(-((np.log(f+1)-np.log(3200))**2)/.9); x=np.fft.irfft(X,n)
    return x*np.sin(np.pi*t/d)**3

#        bass, arpeggio tones,        pad,            melody [(beat, midi, vel)]
bars=[
 (41,[53,57,60,64],[53,57,60],[(2,76,.5)]),                 # Fmaj7
 (36,[48,55,60,64],[48,55,64],[(0,74,.5),(2,79,.55)]),      # C
 (45,[57,60,64,67],[57,60,64],[(0,76,.6),(3,72,.45)]),      # Am7
 (43,[55,59,62,67],[55,59,62],[(0,74,.55),(2.5,71,.4)]),    # G
 (41,[53,57,60,64],[53,60,69],[(0,81,.68),(2,79,.6)]),      # Fmaj7
 (36,[48,55,60,64],[55,64,67],[(0,76,.62),(2,79,.62)]),     # C
 (38,[50,57,60,65],[57,62,65],[(0,77,.65),(2,81,.7)]),      # Dm7
 (43,[55,59,62,67],[55,62,67],[(0,79,.66),(2,74,.55)]),     # G
 (41,[53,57,60,64],[53,57,60],[(0,76,.55),(2,72,.45)]),     # Fmaj7
 (36,[48,55,60,64],[48,55,64],[(0,72,.5)]),                 # C
]
E8=BEAT/2
for b,(bass,ar,pd,mel) in enumerate(bars):
    t0=b*BAR
    lvl=[.42,.48,.56,.58,.66,.68,.7,.66,.5,.42][b]
    pat=[bass+12,ar[0]+12 if b<2 else ar[1],ar[2],ar[3],ar[2] if b<2 else ar[3]+ (12 if b in(4,5,6) else 0),ar[3] if b<2 else ar[2],ar[1],ar[2]]
    if b==9: pat=[bass+12,ar[1],ar[2],ar[3]]
    for k,m in enumerate(pat):
        if b==0 and k in(1,3,5,7): continue           # sparse opening
        tt=t0+k*E8+rng.normal(0,.006)+(k*.03 if b==9 else 0)
        v=lvl*(1.0 if k==0 else .62+.1*(k%2==0))*rng.uniform(.92,1.06)
        put(dry,piano(m,v),tt,1,pan=(m-60)/40)
    put(dry,piano(bass,lvl*.6,5),t0,.8,pan=-.15)
    if b>=2: put(dry,sub(bass if bass>=40 else bass+12),t0,.09*lvl)
    for (bt,m,v) in mel:
        put(dry,piano(m,v*.95,5),t0+bt*BEAT+rng.normal(0,.005),1.15,pan=.18)
    if 2<=b<=8:
        g=[0,0,.5,.62,.8,.9,1,.9,.55][b]
        put(padb,strings(pd,BAR+1.5,g),t0-.5,1,pan=-.25); put(padb,strings([p+12 for p in pd[:2]],BAR+1.5,g*.5),t0-.5,1,pan=.3)
    if b>=1: put(padb,air(),t0-1.0,.035,pan=.3 if b%2 else -.3)
# final rolled chord
for k,m in enumerate([36,48,55,60,64,67,72]): put(dry,piano(m,.5,6),9*BAR+2*BEAT+k*.07,1,pan=(m-60)/40)

def reverb(x,seed,rt=2.6,wet=.33):
    n=int(rt*SR); t=np.arange(n)/SR; r=np.random.default_rng(seed)
    ir=lowpass(r.standard_normal(n),4200,1)*np.exp(-t*(6.9/rt)); ir[:int(.012*SR)]=0; ir/=np.sqrt((ir**2).sum())
    L=len(x)+n; y=np.fft.irfft(np.fft.rfft(x,L)*np.fft.rfft(ir,L),L)[:len(x)]
    return x*(1-wet*.4)+y*wet
mix=np.stack([reverb(dry[c]+padb[c]*.9,5+c) for c in (0,1)])
mix=np.stack([lowpass(mix[c],9000)-lowpass(mix[c],48) for c in (0,1)])
t=np.arange(N)/SR
mix*=np.minimum(1,t/.02)*np.minimum(1,(DUR-t)/2.2)**1.3
mix/=np.abs(mix).max()/.92
mix=np.tanh(mix*1.25)/np.tanh(1.25)*.92
os.makedirs('out',exist_ok=True)
w=wave.open('out/music.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((mix.T*32767).astype('<i2').tobytes()); w.close()
print('ok',DUR)
