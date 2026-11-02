# Poppins has no tabular figures

Checked on 2026-11-02 while choosing the typeface (round 1, question 3).

## Finding

Poppins is the typeface of monashcoding.com, MonMap and Jobs Board. It has no `tnum` OpenType feature, and its default digits have different advance widths. So `font-variant-numeric: tabular-nums` (Tailwind `tabular-nums`) has no effect on Poppins:

- MonMap's `tabular-nums` classes on unit codes, credit points and marks do nothing.
- A number set in Poppins changes width as its value changes. Live vote counts and countdowns jitter, and columns of right-aligned numbers have ragged left edges.

Inter, the face MAC Study names in its font stack, has `tnum`.

## Evidence

Font files from [google/fonts](https://github.com/google/fonts) (`ofl/poppins/Poppins-Regular.ttf`, `ofl/poppins/Poppins-Bold.ttf`, `ofl/inter/Inter[opsz,wght].ttf`), inspected with fontTools:

| Font | `tnum` feature | Distinct default digit widths (font units) |
|---|---|---|
| Poppins Regular | no | 320, 546, 575, 589, 628, 629, 630, 631, 635 |
| Poppins Bold | no | 376, 535, 571, 605, 615, 637, 648, 650, 652, 677 |
| Inter (variable) | yes | proportional by default; equal with `tnum` |

Rendered widths in Chromium at 15px, weight 600, with `font-variant-numeric: tabular-nums` applied. Each row is one string in each font:

| String | Poppins (px) | Inter (px) |
|---|---|---|
| `11,111` | 31.0 | 52.6 |
| `88,888` | 52.0 | 52.6 |
| `47,104` | 47.0 | 52.6 |
| `01:11:11` | 44.7 | 66.3 |
| `08:48:08` | 66.1 | 66.3 |

## Reproduce

```python
import io, urllib.request
from fontTools.ttLib import TTFont

url = "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Regular.ttf"
font = TTFont(io.BytesIO(urllib.request.urlopen(url).read()))
features = {r.FeatureTag for r in font["GSUB"].table.FeatureList.FeatureRecord}
cmap, hmtx = font.getBestCmap(), font["hmtx"].metrics
print("tnum" in features, sorted({hmtx[cmap[ord(d)]][0] for d in "0123456789"}))
```

## Consequence

Poppins was still chosen as the only typeface (round 1, question 3). `STYLE_GUIDE.md` therefore never relies on `tabular-nums`. Its typography section has a recipe for live counters that reserves the width instead.
