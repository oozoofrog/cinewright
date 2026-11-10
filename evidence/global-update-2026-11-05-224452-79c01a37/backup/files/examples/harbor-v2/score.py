"""Original 24-second ambient cue. Standard-library synthesis with a fixed seed."""
from pathlib import Path
from array import array
import json
import math
import random
import wave

rate = 48000
duration = 24
count = rate * duration
rng = random.Random(11042026)
score = [array('d', [0]) * count for _ in range(2)]
tau = math.tau
for channel in range(2):
    low = 0.0
    slow = 0.0
    for i in range(count):
        low += (rng.uniform(-1, 1) - low) * .13
        slow += (low - slow) * .008
        score[channel][i] = (low - slow) * .055 * (1 + .45 * math.sin(i / rate * .67 + channel * .5))

def note(at, frequency, length, gain, pan=0, bell=False):
    start = round(at * rate)
    n = min(round(length * rate), count - start)
    for i in range(n):
        t = i / rate
        if bell:
            envelope = (1 - math.exp(-t * 1400)) * math.exp(-t * 3.7)
            value = math.sin(t * frequency * tau) + .3 * math.sin(t * frequency * tau * 1.38)
        else:
            envelope = min(t / .45, 1) * min((length - t) / 1.2, 1)
            value = math.sin(t * frequency * tau) + .14 * math.sin(t * frequency * tau * 2)
        value *= envelope * gain
        score[0][start + i] += value * (1 - pan)
        score[1][start + i] += value * (1 + pan)

for at, notes in [(0, [146.83, 220., 293.66]), (7, [130.81, 196., 261.63]),
                  (11, [174.61, 220., 293.66]), (18, [146.83, 220., 329.63])]:
    for i, pitch in enumerate(notes):
        note(at, pitch, min(8, duration - at), .025, (i - 1) * .2)
for at, pitch in [(1, 880), (4.8, 659.25), (7, 587.33), (8.3, 739.99),
                  (11, 880), (13.5, 659.25), (16, 587.33), (18.4, 440), (21, 880)]:
    note(at, pitch, 2.0, .16 if at in (1, 21) else .035, -.12, True)
pcm = array('h')
peak = 0
for i in range(count):
    fade = min(i / rate / .8, 1) * min((duration - i / rate) / 1.1, 1)
    for channel in range(2):
        value = score[channel][i] * fade
        peak = max(peak, abs(value))
        assert abs(value) < .95
        pcm.append(round(value * 32767))
destination = Path(__file__).parent / 'assets/score.wav'
with wave.open(str(destination), 'wb') as output:
    output.setparams((2, 2, rate, count, 'NONE', 'not compressed'))
    output.writeframes(pcm.tobytes())
print(json.dumps({'samples': count, 'rate': rate, 'peak': peak, 'seed': 11042026,
                  'cueFrames': [24, 504], 'directListening': 'unverified'}, indent=2))
