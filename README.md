# MAC style guide

One visual language for Monash Association of Coding apps, unified from four existing MAC apps. The choices where those apps disagree were made for eox-vote, in two rounds of questions on 2026-11-02; later decisions are dated where the guide states them. Everything except the voting-specific components applies to any MAC app.

| Path | Contents |
|---|---|
| [`STYLE_GUIDE.md`](STYLE_GUIDE.md) | The guide: colour, type, shape, depth, illustration, density, motion, copy, component recipes and a ready-to-paste Tailwind v4 `globals.css`. |
| [`decisions/`](decisions) | What was asked, the options, where each option came from, and the answers. [Round 1](decisions/round-1.md) covers visual identity; [round 2](decisions/round-2.md) covers components, voice and motion. |
| [`boards/`](boards) | The comparison boards used to ask the questions. Open them in a browser; they load Poppins from Google Fonts. |
| [`research/`](research) | Per-app styling audits with line-level citations, live screenshots, and the [Poppins tabular figures check](research/poppins-tabular-figures.md). |
| [`assets/mascots/`](assets/mascots/README.md) | All 21 Min and Max SVGs found in MAC sources (monashcoding-site, mac-study and a Figma export), with a preview index. |

## Sources

| App | Repo | Commit audited | Commit date |
|---|---|---|---|
| monashcoding.com | [monashcoding/monashcoding-site](https://github.com/monashcoding/monashcoding-site) | `b2064ea76af01bdd6a1cdefdd7afbcc33ab96a19` | 2026-10-29 |
| MonMap | [monashcoding/monmap](https://github.com/monashcoding/monmap) | `405de871d2aa2c5df23d872884236c22cc97cb0b` | 2026-10-31 |
| MAC Study | [monashcoding/mac-study](https://github.com/monashcoding/mac-study) | `ec539128237885819bf9c6dc42779e75fa6c9346` | 2026-10-19 |
| Jobs Board | [monashcoding/mploy-app](https://github.com/monashcoding/mploy-app) | `e7b33095b09465cf8771e0a69acd8d4e233d2554` | 2026-07-26 |

Citations such as `packages/webapp/app/globals.css:96` refer to those commits. Screenshots were taken from the live sites on 2026-11-02 at 1440 x 900 (MAC Study mobile at 390 x 844).

The boards are kept exactly as they were shown when the questions were asked. Their captions use line numbers from a first-pass audit, some of which were later corrected; `research/` and `STYLE_GUIDE.md` have the checked line numbers.
