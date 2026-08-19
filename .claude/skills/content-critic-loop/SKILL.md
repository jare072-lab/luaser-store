---
name: content-critic-loop
description: |
  Runs a generated Lúa Eventos / Luaser video or image (from `higgsfield generate create ...`
  or the local public/tmp-carousel/*.js compositing scripts) through a critical review pass
  before it gets delivered to the user, and automatically regenerates up to 3 times if the
  review finds real problems. Use this skill every time you finish generating a video or
  image for these brands and are about to send it or place it on the site/ads — do not deliver
  Higgsfield or compositing output straight to the user without running it through this skill
  first, even if the user did not explicitly ask for a review. Especially trigger on: UGC
  avatar videos, marketing_studio_video output, any composited social post/story with a logo
  and text overlay, and anything the user previously flagged as "se ve falso", "mal
  pronunciado", "el logo está mal", or similar quality complaints — those are exactly the
  failure modes this skill exists to catch before the user sees them again.
allowed-tools: Bash, Read
---

# Content Critic Loop

## Why this exists

Over this project, several pieces of generated content reached the user with problems that
were visible on a simple look: a second hand appearing out of nowhere, the brand name
pronounced "Lula" instead of "Lúa", a logo silently swapped for a different photo, emoji
rendering as blank boxes, captions overlapping the logo. Each one cost a regeneration cycle
and eroded trust. None of these problems are subtle — they just weren't looked at critically
before being sent. This skill is that critical look, made a mandatory step instead of an
afterthought.

The point isn't to be a rubber stamp. A critic that always says "looks good" is worse than no
critic — it gives false confidence. Look at the actual pixels with the same skepticism the
user would apply, because you're standing in for them at the one point where a redo is cheap
(before delivery) instead of expensive (after they've noticed).

## When to run this

Any time you generate a video or image via the `higgsfield` CLI or via a local
`public/tmp-carousel/*.js` compositing script for Lúa Eventos or Luaser content, run it
through this loop before sending it to the user or using it anywhere (site, ads, social).
This applies whether or not the user explicitly asked for a review — silently delivering
unreviewed generative output is the exact gap this skill closes.

## The loop

```
generate → critique → pass? → deliver
              ↓ fail
         repair prompt → regenerate → critique → ... (up to 3 attempts total)
              ↓ still failing after 3
         stop, report to user exactly what's wrong and what you tried
```

### Step 1 — Generate

Produce the content as you normally would (`higgsfield generate create ...` or the compositing
script). Keep the exact prompt/params you used — the critique and repair steps need them.

### Step 2 — Critique

Inspect the actual output, not the generation parameters. For an image, use the Read tool on
the file directly — look at it the way you'd look at a photo someone sent you, not the way you'd
proofread a spec. For a video, see `references/video-checklist.md` for how to get a frame to
look at (full frame-by-frame video review isn't available in this environment, and the checklist
explains what to do instead — don't skip the check just because it's harder).

Load `references/image-checklist.md` or `references/video-checklist.md` (matching the content
type) for the specific defect list — it's the accumulated list of every way this has gone wrong
on this project so far, and it's more precise than trying to remember it from scratch.

Produce a verdict:
- **PASS** — no problems found, or only trivial ones not worth a regeneration cycle over.
- **FAIL** — itemized list of specific, concrete problems. "Looks a bit off" is not
  itemized; "the logo in the top-right corner is a different logo than logo_src.jpg" is.

Be honest about severity. A slightly imperfect crop is not the same class of problem as a
mispronounced brand name or an extra limb — but don't wave through the ones that actually
matter because the overall piece is otherwise nice. The user has specifically been burned by
"pretty good except for the one glaring thing," so the one glaring thing is what to look for.

### Step 3 — Repair (only on FAIL)

For each itemized problem, work out what in the *prompt* (not the tool call syntax) caused it
and adjust that specific thing. Don't rewrite the whole prompt from scratch — regenerating
with only a vague sense of "make it better" tends to fix one problem and introduce another.
Concrete repairs look like:
- Extra limb / object near mouth → simplify the described action, state explicitly that only
  one hand is ever in frame and nothing else is near the face (see `references/video-checklist.md`
  for phrasing that has worked before).
- Mispronounced brand name → spell it out phonetically in the prompt and give a wrong-answer
  example to avoid, e.g. "pronounce 'Lúa' as two clear syllables LU-A, NOT 'Lula'".
- Logo wrong/missing → check the `--image-references` / `--image` flags actually pointed at
  `LOGO LUA.jpg` (or the correct brand asset) and not a mismatched file — this has happened
  from mislabeling files, not from the model ignoring a correct reference.
- Emoji rendering as boxes → this is a known limitation of SVG text + Arial in the compositing
  scripts, not a per-run fluke — strip emoji from rendered text entirely (see the
  `stripEmoji` pattern already used in `public/tmp-carousel/*.js`) rather than retrying.
- Text overlapping logo/other text → adjust the layout coordinates in the compositing script
  (more vertical gap, move logo to the opposite corner) rather than retrying the same layout
  and hoping.
- Looks fake/AI-plastic for something that was supposed to be a real customer photo → this
  usually means a generative "edit" model was used instead of true compositing. Switch to the
  real-photo-overlay approach (sharp compositing of the actual photo file, text/logo layered
  on top, nothing about the photo itself regenerated) — this has consistently tested better
  with this user than any AI food-photography model.

Regenerate with the repaired prompt/script, then go back to Step 2. Track the attempt count.

### Step 4 — Stop condition

After 3 total attempts (1 original + 2 repairs) still failing, stop. Do not attempt a 4th
silently and do not deliver the flawed content anyway. Tell the user plainly:
- what you tried (briefly, not a full transcript)
- what's still wrong
- what you'd suggest next (a different model, a different source photo, doing it as
  real-photo compositing instead of generation, or asking the user for a cleaner reference)

This is a better outcome than a 4th silent regeneration or delivering something you already
know has a problem — the user has explicitly said before that a wrong delivery is worse than
a delay.

### Step 5 — Deliver (on PASS)

Send the content to the user as normal. Briefly note that it passed review — one line, not a
report — so they know this step happened without you narrating the whole loop.

## One hard stop, not part of the retry loop

If the content involves a **real, identifiable person's likeness** (a photo of an actual
person, not a synthetic/generic model) being used to say or endorse something without
clear evidence the user has consent for that specific use, do not regenerate around this —
it's not a quality defect to iterate past. Stop immediately, explain why, and ask the user to
confirm consent or switch to a synthetic persona. This has come up before in this project and
the correct move was to pause and ask, not to try a different prompt.

## Reference files

- `references/image-checklist.md` — the full defect checklist for composited/generated images
  (logo, text, emoji, layout, authenticity)
- `references/video-checklist.md` — the checklist for videos, including how to get a frame to
  actually look at without ffmpeg installed, and the anatomy/lip-sync/pronunciation defects to
  watch for
