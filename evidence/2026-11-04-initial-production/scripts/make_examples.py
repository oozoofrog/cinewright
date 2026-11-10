"""Create reproducible scores and timing manifests for the local validation films."""
import argparse
import array
import json
import math
import pathlib
import shutil
import struct
import sys
import wave

ROOT = pathlib.Path(__file__).resolve().parents[3]
RATE = 48000
FPS = 24
SAMPLES_PER_FRAME = RATE // FPS
IN = 9600
AT = 6000
TAU = 2 * math.pi


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def score(project, frames, notes, hits, at=AT):
    length = frames * SAMPLES_PER_FRAME + IN + 12000
    left = [0.0] * length
    right = [0.0] * length

    def event(frame, freq, volume, dur, pan, timbre):
        start = IN - at + frame * SAMPLES_PER_FRAME
        n = min(round(dur * RATE), length - start)
        for i in range(n):
            t = i / RATE
            if timbre == "beacon":
                # Narrow-band strike with an abrupt, measurable leading pulse.
                value = math.cos(TAU * freq * t) * math.exp(-t * 57) * volume
                value *= min(1, (i + 1) / 28)
            elif timbre == "strike":
                value = (math.sin(TAU * freq * t) + 0.30 * math.sin(TAU * freq * 2.69 * t))
                value *= math.exp(-t * 19) * min(1, i / 58) * volume
            else:
                value = (math.sin(TAU * freq * t) + 0.21 * math.sin(TAU * freq * 2.006 * t))
                value *= min(1, t / 0.18) * math.exp(-t * 1.35) * volume
            left[start + i] += value * (1 - pan * 0.24)
            right[start + i] += value * (0.76 + pan * 0.24)

    for note in notes:
        event(*note)
    for frame, frequency in hits:
        event(frame, frequency, 0.74, 0.19, 0.5, "beacon")
    pcm = array.array("h")
    for a, b in zip(left, right):
        pcm.extend(round(32767 * max(-1, min(1, value))) for value in (a, b))
    if sys.byteorder != "little":
        pcm.byteswap()
    with wave.open(str(project / "assets/score.wav"), "wb") as wav:
        wav.setparams((2, struct.calcsize("h"), RATE, 0, "NONE", "not compressed"))
        wav.writeframes(pcm.tobytes())
    return {"asset": "assets/score.wav", "sourceIn": IN, "sourceOut": IN + frames * SAMPLES_PER_FRAME,
            "at": at, "gain": 1, "provenance": "Original authored synthesis, no estimated beat analysis"}


def harbor(project, variant):
    (project / "assets").mkdir(parents=True, exist_ok=True)
    is_map = variant == "map"
    is_landfall = variant == "landfall"
    frames = 456 if is_map else 432
    start, ret = (78, 228) if is_map else (88, 220) if is_landfall else (92, 258)
    first, second, arrival = 18, (51 if is_map else 58 if is_landfall else 61), (421 if is_map else 402)
    turn1, turn2 = start + 43, start + 90
    points = {"first-light": first, "second-light": second, "instrument": start,
              "turn-one": turn1, "turn-two": turn2, "return": ret, "arrival": arrival}
    notes = [(f, hz, amp, length, pan, style) for f, hz, amp, length, pan, style in [
        (6, 73.42, .13, 3, .15, "tone"), (second - 4, 110, .10, 2, .7, "tone"),
        (start, 73.42, .19, 4, .4, "tone"), (start, 181, .22, .35, .4, "strike"),
        (turn1, 391.99, .31, .6, .1, "strike"), (turn1 + 3, 146.84, .09, 2.2, .4, "tone"),
        (turn2, 329.63, .30, .4, .9, "strike"), (turn2 + 6, 164.81, .09, 2.6, .5, "tone"),
        (ret, 110, .15, 3.5, .7, "tone"), (ret + 18, 293.66, .12, .65, .1, "strike"),
        (ret + 55, 220, .17, 1.7, .35, "tone"), (ret + 96, 146.84, .11, 2.9, .65, "tone"),
        (arrival + 3, 293.66, .18, 1.2, .75, "tone")]]
    audio = score(project, frames, notes, [(first, 1390), (second, 1040), (arrival, 1390)])
    (project / "assets" / "coast-entry.svg").write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540">'
        '<path d="M32 50h16m-16 5h11m-11 5h6" fill="none" stroke="#bc9870" stroke-width="1.5"/>'
        '<text x="58" y="59" fill="#c6a882" font-family="monospace" font-size="12">01 / OUTER LIGHT</text>'
        '</svg>\n')
    write_json(project / "work.json", {
        "version": 1, "title": {"map": "신호의 항구 · 해도안", "return": "신호의 항구 · 귀환안",
                               "landfall": "신호의 항구 · 착안"}[variant],
        "size": [960, 540], "fps": FPS, "frames": frames, "background": "#111921",
        "points": points,
        "spans": {"해안": [0, start], "방위계": [start, ret], "항로": [ret, frames],
                  "연결 검토": [ret - 8, ret + 40]},
        "layers": [
            {"id": "instrument", "module": "instrument.mjs", "in": start, "z": 2},
            {"id": "shore", "module": "shore.mjs", "z": 0, "config": {"variant": variant},
             "exposure": [{"from": 0, "to": start, "every": 2, "value": "paper"},
                          {"from": start, "to": ret, "value": "diagram"},
                          {"from": ret, "to": frames, "every": 2, "value": "paper"}]},
            {"id": "folio", "asset": "assets/coast-entry.svg", "out": min(start, 72), "z": 1, "opacity": .86},
            {"id": "route-ink", "module": "route-ink.mjs", "in": ret, "z": 1, "config": {"variant": variant},
             "exposure": [{"from": ret, "to": frames, "every": 3, "value": "waypoints"}]},
        ],
        "channels": {
            "steering": {"producer": "$data", "consumers": ["instrument"], "space": "radian", "kind": "number",
                         "from": start, "to": frames, "mode": "linear",
                         "data": {"keys": [[start, .37], [turn1 - 4, .37], [turn1, -.23], [turn1 + 29, -.23],
                                           [turn2, .56], [ret - 17, -.38 if is_map else .21]]}},
            "projection": {"producer": "instrument", "consumers": ["shore"], "space": "canvas", "kind": "path",
                           "from": start, "to": frames},
            "route": {"producer": "shore", "consumers": ["route-ink"], "space": "canvas", "kind": "path",
                      "from": ret, "to": frames},
        },
        "audio": [audio],
        "probes": [{"label": label, "frame": f, "box": [.773, .519, .782, .541], "threshold": 65, "audioSearch": 50}
                   for label, f in [("첫 등화", first), ("마지막 등화", arrival)]],
    })


def press(project):
    frames = 216
    note_events = []
    for j in range(16):
        hz = [220, 261.63, 196, 329.63][j % 4] * [1, 0.75, 1.5, 1][j // 4]
        note_events.append((j * 12, hz, .42, .27, (j % 4) / 3, "strike"))
        if 8 <= j <= 11:
            note_events.extend((j * 12 + k, hz * 2, .12, .09, .5, "strike") for k in [3, 6, 9])
    audio = score(project, frames, note_events, [], at=0)
    write_json(project / "work.json", {
        "version": 1, "title": "인쇄기 · 러프", "size": [960, 540], "fps": FPS, "frames": frames,
        "points": {"double": 48, "matrix": 96, "lock": 180},
        "spans": {"한 줄": [0, 48], "어긋남": [48, 96], "활자판": [96, 180], "잠금": [180, frames]},
        "layers": [{"id": "letterpress", "module": "press.mjs",
                    "exposure": [{"from": 0, "to": 180, "every": 12, "value": "stamp"},
                                 {"from": 180, "to": frames, "every": 36, "value": "locked"}]}],
        "audio": [audio],
    })


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--map", type=pathlib.Path, help="Also create a separate map-arc project at a new path")
    parser.add_argument("--landfall", type=pathlib.Path, help="Create a revised landfall arc at a new path")
    args = parser.parse_args()
    original = ROOT / "examples/harbor"
    harbor(original, "return")
    press(ROOT / "examples/press")
    if args.map:
        shutil.copytree(original, args.map)
        harbor(args.map, "map")
    if args.landfall:
        shutil.copytree(original, args.landfall)
        harbor(args.landfall, "landfall")
