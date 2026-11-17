"""Score + SFX generator for the viral machine.
usage: python3 music.py <style: action|comedy|trailer> <duration> <cues.json> <out.wav> [drop_time]
Pure numpy. Music runs continuously from 0 to the end."""
import sys, json, wave, numpy as np
style, DUR, cues_path, out = sys.argv[1], float(sys.argv[2]), sys.argv[3], sys.argv[4]
DROP = float(sys.argv[5]) if len(sys.argv) > 5 else None
CUES = json.load(open(cues_path))
SR = 48000; N = int(SR * DUR); T = np.arange(N) / SR
rng = np.random.default_rng(5)
mus = np.zeros((N, 2)); drm = np.zeros((N, 2)); fx = np.zeros((N, 2)); kenv = np.zeros(N)

def put(buf, sig, at, g=1.0, pan=0.0):
    i = int(round(at * SR))
    if i >= N or i + len(sig) <= 0 or i < 0: return
    j = min(N, i + len(sig)); s = sig[: j - i] * g
    buf[i:j, 0] += s * (1 - max(0, pan)); buf[i:j, 1] += s * (1 + min(0, pan))
def env(n, a=.003, d=.2):
    t = np.arange(n) / SR; return np.minimum(1, t / a) * np.exp(-t / d)
def midi(m): return 440 * 2 ** ((m - 69) / 12)
def saw(f, n, det=0.0):
    t = np.arange(n) / SR; o = np.zeros(n)
    for d in ([-det, 0, det] if det else [0]): o += 2 * ((t * f * (1 + d)) % 1) - 1
    return o / (3 if det else 1)
def sq(f, n): t = np.arange(n) / SR; return np.sign(np.sin(2 * np.pi * f * t))
def noise(n): return np.diff(np.concatenate([[0], rng.standard_normal(n)]))
def lowpass(x, fc):
    X = np.fft.rfft(x, axis=0); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= (1 / (1 + (f / fc) ** 4))[:, None] if x.ndim == 2 else 1 / (1 + (f / fc) ** 4)
    return np.fft.irfft(X, n=len(x), axis=0)

def kick(depth=1.0):
    n = int(.42 * SR); t = np.arange(n) / SR
    f = 42 + 170 * np.exp(-t * 32)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .001, .2 * depth) * 2.4)
def snare():
    n = int(.3 * SR); t = np.arange(n) / SR
    return noise(n) * env(n, .001, .09) * .8 + np.sin(2 * np.pi * 185 * t) * env(n, .001, .05) * .5
def clap():
    n = int(.3 * SR); e = sum(env(n, .001, .012) * (np.arange(n) >= o * SR) for o in [0, .011, .022])
    return noise(n) * (e * .5 + env(n, .001, .09) * .6)
def hat(o=False):
    n = int((.25 if o else .05) * SR); return noise(n) * env(n, .0005, .08 if o else .012) * .5
def wood():
    n = int(.08 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * 1100 * t) * env(n, .0005, .02) + np.sin(2 * np.pi * 1700 * t) * env(n, .0005, .012) * .5
def hitk(at, g=1.0):
    put(drm, kick(), at, g); i = int(at * SR); n = min(int(.35 * SR), N - i)
    if n > 0: kenv[i:i + n] = np.maximum(kenv[i:i + n], env(n, .002, .12))

# ---------------- style parameters ----------------
if style == 'comedy':
    BPM = 118; PROG = [(48, [60, 64, 67]), (45, [57, 60, 64]), (41, [53, 57, 60]), (43, [55, 59, 62])]
elif style == 'trailer':
    BPM = 100; PROG = [(45, [57, 60, 64]), (41, [53, 57, 60]), (43, [55, 59, 62]), (40, [52, 56, 59])]
else:
    BPM = 140; PROG = [(45, [57, 60, 64]), (41, [53, 57, 60]), (48, [55, 60, 64]), (43, [55, 59, 62])]
B = 60 / BPM; S16 = B / 4; BAR = 4 * B
if style == 'trailer' and DROP is None:
    hits = [c['t'] for c in CUES if c['k'] == 'hit']; DROP = hits[min(2, len(hits) - 1)] if hits else DUR / 3
def chord(t): return PROG[int(t // BAR) % 4]
def intense(t):
    if style == 'trailer':
        return .25 if t < DROP else 1.0
    return min(1, .75 + t / 8)

# ---------------- drums ----------------
step = 0; t = 0.0
while t < DUR - .05:
    s = step % 16; e = intense(t)
    if style == 'comedy':
        if s in (0, 8): hitk(t, .8)
        if s in (4, 12): put(drm, clap(), t, .45)
        if s % 4 == 2: put(drm, wood(), t, .25, pan=.3)
        if s % 2 == 1: put(drm, hat(), t, .1, pan=-.2)
    elif style == 'trailer' and t < DROP:
        if s in (0, 3): hitk(t, .55)   # heartbeat
    else:
        if s in (0, 6, 10) or (s == 14 and (step // 16) % 2): hitk(t, .95)
        if s in (4, 12): put(drm, snare(), t, .5); put(drm, clap(), t, .3)
        put(drm, hat(), t, (.24 if s % 4 == 2 else .13) * e, pan=.25)
        if s in (2, 10): put(drm, hat(True), t, .1, pan=-.25)
        if (step // 16) % 4 == 3 and s >= 12: put(drm, hat(), t + S16 / 2, .12)  # roll
    step += 1; t += S16

# ---------------- bass ----------------
t = 0.0; step = 0
while t < DUR - .05:
    s = step % 16; root, _ = chord(t)
    if style == 'comedy':
        if s % 2 == 0:
            m = root - 12 + (7 if s % 4 == 2 else 0); n = int(S16 * 1.6 * SR); tt = np.arange(n) / SR
            b = np.sin(2 * np.pi * midi(m) * tt) * env(n, .003, .08); put(mus, b, t, .55)
    elif not (style == 'trailer' and t < DROP):
        if s in (0, 3, 6, 8, 10, 11, 14):
            f = midi(root - 12); n = int(S16 * (3 if s in (0, 8) else 2) * SR); tt = np.arange(n) / SR
            ph = 2 * np.pi * np.cumsum(f * (1 + .7 * np.exp(-tt * 60))) / SR
            b = np.tanh((np.sin(ph) + .3 * np.sin(2 * ph)) * 2) * env(n, .004, .3) * np.minimum(1, (n - np.arange(n)) / (.01 * SR))
            put(mus, b, t, .5)
    step += 1; t += S16

# ---------------- harmony / ostinato ----------------
for k in range(int(DUR // BAR) + 1):
    root, notes = PROG[k % 4]; n = int((BAR + .2) * SR)
    if style == 'trailer':
        drone = saw(midi(root - 12), n, det=.004) + saw(midi(root - 5), n, det=.004) * .6
        a = np.minimum(1, np.arange(n) / (.3 * SR)) * np.minimum(1, (n - np.arange(n)) / (.3 * SR))
        put(mus, drone * a, k * BAR, .12)
    pad = sum(saw(midi(m), n, det=.006) for m in notes)
    a = np.minimum(1, np.arange(n) / (.12 * SR)) * np.minimum(1, (n - np.arange(n)) / (.2 * SR))
    put(mus, pad * a / 3, k * BAR, .1 if style != 'comedy' else .05)
t = 0.0; step = 0
while t < DUR - .05:
    root, notes = chord(t)
    if style == 'comedy':  # pizzicato melody, bouncy
        mel = [notes[0] + 12, notes[2], notes[1] + 12, notes[2], notes[0] + 12, notes[1], notes[2] + 12, notes[1]]
        if step % 2 == 0:
            n = int(.2 * SR); x = np.arange(n) / SR; m = mel[(step // 2) % 8]
            v = (np.sin(2 * np.pi * midi(m) * x) + .3 * np.sin(4 * np.pi * midi(m) * x)) * env(n, .002, .05)
            put(mus, v, t, .22, pan=(.3 if step % 4 else -.3))
    else:  # staccato string ostinato 16ths
        if not (style == 'trailer' and t < DROP) or step % 4 == 0:
            seq = [notes[0], notes[0], notes[2], notes[0], notes[1], notes[0], notes[2], notes[1] + 12]
            n = int(.14 * SR); v = saw(midi(seq[step % 8]), n, det=.004) * env(n, .002, .05)
            put(mus, v, t, .1 * (0.5 if (style == 'trailer' and t < DROP) else 1), pan=(.35 if step % 2 else -.35))
    step += 1; t += S16

mus = lowpass(mus, 7000 if style != 'trailer' else 5000)
mus *= (1 - .45 * kenv)[:, None]

# ---------------- SFX from cues ----------------
def impact(big=1.0):
    n = int(1.6 * SR); x = np.arange(n) / SR
    boom = np.sin(2 * np.pi * np.cumsum(34 + 150 * np.exp(-x * 16)) / SR) * env(n, .002, .5)
    nz = np.convolve(rng.standard_normal(n), np.ones(10) / 10, 'same') * env(n, .001, .1)
    return np.tanh((boom + nz * 1.5 + noise(n) * env(n, .002, .6) * .2) * 1.4 * big)
def braam():
    n = int(1.8 * SR); root = PROG[0][0] - 12
    s = sum(saw(midi(m), n, det=.01) for m in [root, root + 7, root + 12])
    s = lowpass(s, 600) * env(n, .03, .9); return np.tanh(s * 1.5)
def whoosh(d=.45):
    n = int(d * SR); x = np.arange(n) / SR
    return np.convolve(rng.standard_normal(n), np.ones(40) / 40, 'same') * np.sin(np.pi * x / d) ** 2 * 2.5
def boing():
    n = int(.5 * SR); x = np.arange(n) / SR
    f = 220 + 500 * np.abs(np.sin(2 * np.pi * 6 * x)) * np.exp(-x * 3)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .003, .25)
def cash():
    n = int(.8 * SR); x = np.arange(n) / SR
    bell = sum(np.sin(2 * np.pi * f * x) * env(n, .001, d) for f, d in [(2637, .3), (3520, .25), (5274, .15)])
    return bell + noise(n) * env(n, .001, .03) * .6
def chime():
    n = int(.9 * SR); x = np.arange(n) / SR
    a = np.sin(2 * np.pi * 1318.5 * x) * env(n, .003, .25); b = np.sin(2 * np.pi * 1760 * x) * env(n, .003, .3)
    return a + np.concatenate([np.zeros(int(.12 * SR)), b[: n - int(.12 * SR)]])
def popfx(up=True):
    n = int(.09 * SR); x = np.arange(n) / SR
    f = (600 + 900 * x / .09) if up else (1400 - 700 * x / .09)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .001, .03)
def alarm():
    n = int(1.2 * SR); x = np.arange(n) / SR
    f = 700 + 300 * (np.sin(2 * np.pi * 2.5 * x) > 0)
    return np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * .3 * np.minimum(1, (1.2 - x) / .2)
def glitch():
    n = int(.25 * SR); return sq(90, n) * rng.random(n) * env(n, .001, .08)
def tick():
    n = int(.03 * SR); x = np.arange(n) / SR
    return (np.sin(2 * np.pi * 2400 * x) * .6 + rng.standard_normal(n) * .4) * env(n, .0005, .006)
first = True
for c in CUES:
    k, t = c['k'], c['t']
    if k == 'hit':
        put(fx, impact(), t - .005, .85)
        if style != 'comedy': put(fx, braam(), t, .35 if not first else .5)
        first = False
    elif k == 'whoosh': put(fx, whoosh(), t - .2, .3)
    elif k == 'boing': put(fx, boing(), t, .35)
    elif k == 'cash': put(fx, cash(), t, .35)
    elif k == 'chime': put(fx, chime(), t, .4)
    elif k == 'pop': put(fx, popfx(True), t, .35)
    elif k == 'send': put(fx, popfx(False), t, .3)
    elif k == 'alarm': put(fx, alarm(), t, .25)
    elif k == 'glitch': put(fx, glitch(), t, .2)
    elif k == 'tick': put(fx, tick(), t, .5)
# riser into the trailer drop
if style == 'trailer' and DROP and DROP > 1.5:
    d = 1.4; n = int(d * SR); x = np.arange(n) / SR
    r = (noise(n) * .5 + np.sin(2 * np.pi * np.cumsum(300 + 1800 * (x / d) ** 2) / SR) * .3) * (x / d) ** 2
    put(fx, r, DROP - d, .4)

# ending chord ring-out
n = int(1.4 * SR); root, notes = PROG[0]
ring = sum(saw(midi(m), n, det=.005) for m in notes + [notes[0] + 12])
put(mus, lowpass(ring, 3000) * env(n, .01, .7) / 4, max(0, DUR - 1.45), .35)

mix = drm * .9 + mus + fx * .85
mix *= (np.clip((DUR - T) / .5, 0, 1) * np.minimum(1, T / .01))[:, None]
mix /= np.abs(mix).max(); mix = np.tanh(mix * 1.6) / np.tanh(1.6) * .9
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype('<i2').tobytes())
print('music ok', style, DUR)
