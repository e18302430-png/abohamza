# Continuous score + SFX for «محبوس في كيو». Pure numpy, no samples.
import numpy as np, wave
SR = 48000; DUR = 48.5; N = int(SR * DUR)
rng = np.random.default_rng(11)
T = np.arange(N) / SR
BPM = 120; B = 60 / BPM; S16 = B / 4; BAR = 4 * B

music = np.zeros((N, 2)); drums = np.zeros((N, 2)); sfx = np.zeros((N, 2))
kick_env = np.zeros(N)

def put(buf, sig, at, g=1.0, pan=0.0):
    i = int(round(at * SR))
    if i >= N or i + len(sig) <= 0: return
    j = min(N, i + len(sig)); s = sig[: j - i] * g
    buf[i:j, 0] += s * (1 - max(0, pan)); buf[i:j, 1] += s * (1 + min(0, pan))

def env(n, a=.003, d=.2):
    t = np.arange(n) / SR; return np.minimum(1, t / a) * np.exp(-t / d)

def midi(m): return 440 * 2 ** ((m - 69) / 12)

def saw(f, n, det=0.0):
    t = np.arange(n) / SR; out = np.zeros(n)
    for d in ([-det, 0, det] if det else [0]):
        out += 2 * ((t * f * (1 + d)) % 1) - 1
    return out / (3 if det else 1)

def energy(t):
    if t < 5.4: return .9            # hook: hits hard from frame one
    if t < 11.4: return .45          # flashback (filtered)
    if t < 17.4: return .6 + .3 * (t - 11.4) / 6
    if 43.2 <= t < 43.7: return 0    # half-second stop before the logo hit
    return 1.0

PROG = [(45, [57, 60, 64]), (41, [53, 57, 60]), (48, [55, 60, 64]), (43, [55, 59, 62])]  # Am F C G
def chord_at(t): return PROG[int(t // BAR) % 4]

# ---------- drums ----------
def kick():
    n = int(.4 * SR); t = np.arange(n) / SR
    f = 45 + 160 * np.exp(-t * 35)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .001, .18) * 2.2)
def clap():
    n = int(.3 * SR); s = np.diff(np.concatenate([[0], rng.standard_normal(n)]))
    e = sum(env(n, .001, .012) * (np.arange(n) >= o * SR) for o in [0, .011, .022])
    return s * (e * .5 + env(n, .001, .09) * .6)
def hat(open_=False):
    n = int((.25 if open_ else .05) * SR); s = np.diff(np.concatenate([[0], rng.standard_normal(n)]))
    return s * env(n, .0005, .08 if open_ else .012) * .5

step = 0; t = 0.0
while t < DUR - .05:
    e = energy(t); s = step % 16; bar = int(t // BAR); fl = 5.4 <= t < 11.4
    if e > 0:
        if s in (0, 4, 8, 12) or (t >= 17.4 and s == 14 and bar % 2 == 1):
            put(drums, kick(), t, .95 * min(1, e + .2))
            i = int(t * SR); n = min(int(.35 * SR), N - i)
            kick_env[i:i + n] = np.maximum(kick_env[i:i + n], env(n, .002, .12))
        if s in (4, 12) and not fl: put(drums, clap(), t, .55 * e)
        if s % 2 == 1 or t >= 17.4: put(drums, hat(), t, (.28 if s % 4 == 2 else .16) * e, pan=.25)
        if t >= 21 and s in (2, 6, 10, 14): put(drums, hat(True), t, .12 * e, pan=-.25)
    step += 1; t += S16

def roll(a, b, g):
    t = a
    while t < b:
        pr = (t - a) / (b - a); put(drums, clap(), t, g * (.25 + .75 * pr))
        t += S16 if pr < .5 else S16 / 2
roll(15.9, 17.35, .35); roll(4.6, 5.35, .3); roll(42.4, 43.15, .3)

# ---------- 808 bass ----------
t = 0.0; step = 0
while t < DUR - .05:
    s = step % 16
    if s in (0, 3, 6, 8, 10, 11, 14) and energy(t) > 0:
        root, _ = chord_at(t); f = midi(root - 12 if s != 10 else root)
        n = int(S16 * (3 if s in (0, 8) else 2) * SR); tt = np.arange(n) / SR
        fr = f * (1 + .6 * np.exp(-tt * 60)); ph = 2 * np.pi * np.cumsum(fr) / SR
        b = np.tanh((np.sin(ph) + .3 * np.sin(2 * ph)) * 1.8) * env(n, .004, .35) * np.minimum(1, (n - np.arange(n)) / (.01 * SR))
        put(music, b, t, .5)
    step += 1; t += S16

# ---------- pad ----------
for k in range(int(DUR // BAR) + 1):
    root, notes = PROG[k % 4]; n = int((BAR + .2) * SR); pad = np.zeros(n)
    for m in notes + [notes[0] + 12]: pad += saw(midi(m), n, det=.006)
    a = np.minimum(1, np.arange(n) / (.15 * SR)) * np.minimum(1, (n - np.arange(n)) / (.2 * SR))
    put(music, pad * a / 4, k * BAR, .16, pan=(-.2 if k % 2 else .2))

# ---------- pluck arpeggio ----------
t = 0.0; step = 0
while t < DUR - .05:
    root, notes = chord_at(t); seq = notes + [notes[1] + 12, notes[2] + 12, notes[0] + 12, notes[2]]
    n = int(.22 * SR); pl = saw(midi(seq[step % len(seq)] + 12), n) * env(n, .002, .07)
    put(music, pl, t, .07 if 5.4 <= t < 11.4 else .1, pan=(.35 if step % 2 else -.35))
    step += 1; t += S16

# ---------- lead motif on drops ----------
MOTIF = [(0, 76), (1.5, 74), (2, 72), (3, 74), (4, 76), (5.5, 79), (6, 76), (7, 72)]
for start, end in [(0.9, 5.3), (17.4, 33.6), (37.6, 43.2), (43.7, 47.7)]:
    t2 = np.floor(start / (2 * BAR)) * 2 * BAR
    while t2 < end:
        for bt, m in MOTIF:
            t0 = t2 + bt * B
            if start <= t0 < end:
                n = int(.45 * SR); x = np.arange(n) / SR
                v = np.sin(2 * np.pi * midi(m) * x + 2.2 * np.sin(4 * np.pi * midi(m) * x) * np.exp(-x * 6))
                put(music, v * env(n, .005, .25), t0, .09, pan=.1)
        t2 += 2 * BAR

# ---------- FFT lowpass blend for the flashback ----------
def lowpass(x, fc):
    X = np.fft.rfft(x, axis=0); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= (1 / (1 + (f / fc) ** 4))[:, None]; return np.fft.irfft(X, n=len(x), axis=0)
mus_lp = lowpass(music, 700); dr_lp = lowpass(drums, 900); mus_br = lowpass(music, 6000)
mask = np.interp(T, [0, 5.3, 5.5, 10.9, 11.4, 15.9, 17.35, DUR], [0, 0, 1, 1, .6, .35, 0, 0])[:, None]
music = mus_br * (1 - mask) + mus_lp * mask
drums = drums * (1 - mask) + dr_lp * mask
music *= (1 - .45 * kick_env)[:, None]   # sidechain pump

# ---------- risers / impacts / sfx ----------
def riser(d):
    n = int(d * SR); x = np.arange(n) / SR
    s = np.diff(np.concatenate([[0], rng.standard_normal(n)]))
    tone = np.sin(2 * np.pi * np.cumsum(300 + 1800 * (x / d) ** 2) / SR) * .3
    return (s * .5 + tone) * (x / d) ** 2
put(sfx, riser(1.2), 4.2, .35); put(sfx, riser(1.5), 15.9, .4); put(sfx, riser(.9), 42.3, .35)
def impact():
    n = int(1.6 * SR); x = np.arange(n) / SR
    boom = np.sin(2 * np.pi * np.cumsum(34 + 150 * np.exp(-x * 16)) / SR) * env(n, .002, .5)
    nz = np.convolve(rng.standard_normal(n), np.ones(10) / 10, 'same') * env(n, .001, .1)
    crash = np.diff(np.concatenate([[0], rng.standard_normal(n)])) * env(n, .002, .6) * .25
    return np.tanh((boom + nz * 1.5 + crash) * 1.4)
for h, g in [(.15, .7), (.9, 1.0), (3.3, .9), (13.9, .8), (14.6, .5), (15.9, .85), (18.4, .95), (18.85, .9), (37.7, .85), (40.25, .85), (41.3, .85), (43.7, 1.0)]:
    put(sfx, impact(), h - .005, g)
for z in [0.0, .62, 1.9, 2.7]:   # CCTV glitch zaps
    n = int(.08 * SR); put(sfx, np.sign(np.sin(2 * np.pi * 90 * np.arange(n) / SR)) * rng.random(n) * env(n, .001, .03), z, .12)
def tick():
    n = int(.03 * SR); x = np.arange(n) / SR
    return (np.sin(2 * np.pi * 2400 * x) * .6 + rng.standard_normal(n) * .4) * env(n, .0005, .006)
tt = 5.6
while tt < 11.2:
    put(sfx, tick(), tt, .3, pan=-.2); tt += .42 - .32 * (tt - 5.6) / 5.6
n = int(3.8 * SR); x = np.arange(n) / SR
rat = rng.standard_normal(n) * (.5 + .5 * np.sign(np.sin(2 * np.pi * 9 * x)))
put(sfx, np.convolve(rat, np.ones(20) / 20, 'same') * np.minimum(1, x / .3) * np.minimum(1, (3.8 - x) / .2), 5.8, .4)
def clank():
    n = int(.6 * SR); x = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * f * x) * env(n, .001, d) for f, d in [(2100, .12), (3150, .08), (4700, .05)])
put(sfx, clank(), 9.6, .25); put(sfx, clank(), 10.2, .4); put(sfx, impact(), 9.75, .4)
def chime():
    n = int(.9 * SR); x = np.arange(n) / SR
    a = np.sin(2 * np.pi * 1318.5 * x) * env(n, .003, .25); b = np.sin(2 * np.pi * 1760 * x) * env(n, .003, .3)
    return a + np.concatenate([np.zeros(int(.12 * SR)), b[: n - int(.12 * SR)]])
put(sfx, chime(), 23.7, .4)
def beep(f, d):
    n = int(d * SR); x = np.arange(n) / SR; return np.sin(2 * np.pi * f * x) * env(n, .002, d / 2.5)
for v in [1e5, 2.5e5, 5e5]:
    k = 1 - (1 - v / 612487) ** (1 / 1.6); tm = 21.5 + 11 * k
    put(sfx, beep(1760, .12), tm, .3); put(sfx, beep(2640, .16), tm + .12, .3)
for c in [34.6, 35.6, 36.6]: put(sfx, beep(1650, .07), c, .22)
def whoosh(d):
    n = int(d * SR); x = np.arange(n) / SR
    return np.convolve(rng.standard_normal(n), np.ones(40) / 40, 'same') * np.sin(np.pi * x / d) ** 2 * 2.5
put(sfx, whoosh(.5), 20.7, .3); put(sfx, whoosh(.5), 33.3, .3); put(sfx, whoosh(.4), 39.8, .3)

# ---------- final ring-out chord + master ----------
n = int(1.6 * SR); ring = sum(saw(midi(m), n, det=.005) for m in [57, 60, 64, 69])
put(music, lowpass(np.stack([ring, ring], 1), 3000)[:, 0] * env(n, .01, .8) / 4, 46.9, .35)
mix = drums * .9 + music + sfx * .85
mix *= (np.clip((DUR - T) / .6, 0, 1) * np.minimum(1, T / .01))[:, None]
mix /= np.abs(mix).max(); mix = np.tanh(mix * 1.6) / np.tanh(1.6) * .9
with wave.open('audio.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype('<i2').tobytes())
print('ok')
