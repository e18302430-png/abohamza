import numpy as np, wave
SR = 48000; DUR = 48.5
N = int(SR * DUR); L = np.zeros(N); R = np.zeros(N)
t_all = np.arange(N) / SR
rng = np.random.default_rng(7)

def add(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR); j = min(N, i + len(sig))
    if j <= i: return
    s = sig[: j - i] * gain
    L[i:j] += s * (1 - max(0, pan)); R[i:j] += s * (1 + min(0, pan))

def env(n, a=0.005, d=0.2):
    t = np.arange(n) / SR
    return np.minimum(1, t / a) * np.exp(-t / d)

# 1) soft pad (A minor-ish), gentle throughout, fades out at end
pad = np.zeros(N)
for f, g in [(110, .5), (164.8, .35), (220, .3), (261.6, .18), (329.6, .12)]:
    pad += g * np.sin(2 * np.pi * f * t_all + 0.3 * np.sin(2 * np.pi * 0.11 * t_all))
pad *= 0.05 * np.minimum(1, t_all / 2) * np.clip((DUR - t_all) / 2.5, 0, 1)
L += pad; R += pad

# 2) beat 100 BPM, builds from 17.4
beat = 60 / 100
def kick():
    n = int(.35 * SR); t = np.arange(n) / SR
    f = 50 + 110 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .002, .14)
def hat():
    n = int(.06 * SR); return rng.standard_normal(n) * env(n, .001, .015) * .5
def snare():
    n = int(.25 * SR); t = np.arange(n) / SR
    return (rng.standard_normal(n) * .6 + .4 * np.sin(2 * np.pi * 190 * t)) * env(n, .001, .07)
k = 0
tb = 17.4
while tb < 46.5:
    if 40.0 <= tb < 40.25 or 43.4 <= tb < 43.7: tb += beat / 2; k += 1; continue
    build = min(1, 0.45 + (tb - 17.4) / 20)
    if k % 2 == 0: add(kick(), tb, .55 * build)
    if k % 4 == 2: add(snare(), tb, .22 * build)
    add(hat(), tb + beat / 4, .12 * build, pan=.3)
    tb += beat / 2; k += 1
# pre-beat pulse (soft kick every beat before 17.4 from 11.4)
tb = 11.4
while tb < 17.4:
    add(kick(), tb, .18); tb += beat

# 3) accelerating printer/clock tick 5.6 -> 11.2
def tick():
    n = int(.03 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 2400 * t) * .6 + rng.standard_normal(n) * .4) * env(n, .0005, .006)
tt = 5.6
while tt < 11.2:
    add(tick(), tt, .35, pan=-.2)
    tt += 0.42 - 0.32 * (tt - 5.6) / 5.6

# 4) impacts on slams
def impact():
    n = int(1.4 * SR); t = np.arange(n) / SR
    f = 38 + 140 * np.exp(-t * 18)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .002, .45)
    noise = rng.standard_normal(n) * env(n, .001, .08) * .5
    # low-pass the noise a bit
    noise = np.convolve(noise, np.ones(12) / 12, 'same')
    return boom + noise * 1.6
for h in [3.3, 13.9, 14.6, 15.9, 18.4, 18.85, 37.7, 40.25, 41.3, 43.7]:
    add(impact(), h - .01, .85 if h != 14.6 else .5)
# whoosh before big title (17.4) and logo
def whoosh(d=.6):
    n = int(d * SR); t = np.arange(n) / SR
    s = np.convolve(rng.standard_normal(n), np.ones(40) / 40, 'same')
    return s * np.sin(np.pi * t / d) ** 2 * 2.5
add(whoosh(), 17.8, .35); add(whoosh(.5), 43.2, .3); add(whoosh(.4), 21.0, .25)

# 5) notification chime at 30.2
def chime():
    n = int(.9 * SR); t = np.arange(n) / SR
    a = np.sin(2 * np.pi * 1318.5 * t) * env(n, .003, .25)
    b = np.sin(2 * np.pi * 1760 * t) * env(n, .003, .3)
    return a + np.concatenate([np.zeros(int(.12 * SR)), b[: n - int(.12 * SR)]])
add(chime(), 30.2, .35)

# 6) small beeps: scanner, each bar, profit counter
def beep(f=1950, d=.08):
    n = int(d * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * f * t) * env(n, .002, d / 2.5)
add(beep(1500, .18), 23.2, .3)
for i, b in enumerate([24.8, 25.9, 27.0]): add(beep(1200 + i * 150), b, .25)
add(beep(2200, .14), 28.2, .35); add(beep(2640, .14), 28.36, .3)
for i in range(6): add(beep(1800 + i * 60, .06), 31.0 + i * .25, .2)
# check-mark pops scene 6
for c in [34.6, 35.6, 36.6]: add(beep(1650, .07), c, .22)

mix = np.stack([L, R], 1)
mix = np.tanh(mix * 1.1) * .9
mix /= max(1e-9, np.abs(mix).max()) / .92
pcm = (mix * 32767).astype('<i2')
with wave.open('audio.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', len(pcm) / SR)
