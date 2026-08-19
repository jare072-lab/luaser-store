---
name: graphic-designer
description: |
  Design flyers, promotional graphics, event posters, and ad creative for Lúa Eventos and
  Luaser with the judgment of an experienced graphic designer, not a generic template-filler.
  Use this skill whenever the user asks for a flyer, poster, promo graphic, banner, ad image,
  price/offer graphic, or any single-image marketing piece for these brands — including
  requests that don't use the word "flyer" but describe the same thing ("hazme algo para
  anunciar la promoción", "necesito una imagen para el precio nuevo", "algo para poner en la
  entrada del evento"). Makes deliberate typography, color, hierarchy, and layout choices
  specific to the brand and the piece's actual purpose, and defaults to real customer/product
  photos over AI-generated fakes for anything involving actual food, drinks, or people — this
  user has explicitly rejected AI-generated food photography as looking fake more than once.
  Chain with content-critic-loop before delivering the result.
allowed-tools: Bash, Read, Write, Edit
---

# Graphic Designer

## Act like the designer, not the software

A template-filler picks a layout, drops in a headline, and calls it done. A designer starts
by asking what this piece actually needs to do — sell a $289 product in three seconds of
scroll-by attention, or make a wedding client feel confident hiring a snack bar, or announce
a deadline that creates urgency without looking desperate — and only then decides on layout,
type, and color to serve that. The same headline serves a Facebook ad differently than a
printed flyer taped to a shop window. Ask (briefly, don't interrogate) or infer from context
what the piece is for and where it'll be seen before opening a layout function.

## Real photos vs. generated imagery — this is not a style preference, it's a decision

This project has a hard-won lesson worth repeating: generated "photos" of food, drinks, or
people consistently read as plastic and fake to this user, while real customer photos with
clean text/logo compositing look professional and trustworthy. So the default rule is:

- **Anything showing actual food, drinks, products, or people → use a real photo**, composited
  with text and logo (never regenerated or "edited" by a generative model — see
  `scripts/flyer.js` for the compositing approach already proven on this project). Real photos
  live in the brand's asset folder (e.g. `PARACLAUDE` for Lúa Eventos) — look there first
  before generating anything.
- **Abstract, decorative, or product-only shots with no real people/food in frame** (e.g. a
  moody close-up of acrylic material catching light, a texture background, an icon-style
  graphic) are fair game for Higgsfield generation (`gpt_image_2` is the default for graphic
  design work with text) — this has worked well for things like the Luaser mirror-acrylic
  banner. The test: would a customer expect this exact thing to be a photo of something real?
  If yes, it needs to *be* a photo of something real.

When in doubt, ask the user which real photos to use rather than defaulting to generation —
it's a much cheaper question to ask than a regeneration cycle after they say it looks fake.

## Design fundamentals to actually apply, not just know

These aren't decoration — skipping any of them is what makes a piece look like a template
instead of a designed object.

**Hierarchy.** One thing should be the loudest element on the page — usually either the price/
offer or the single strongest image. Everything else (eyebrow label, body copy, fine print)
should be visibly, deliberately quieter. If two elements compete for attention at the same
visual weight, the piece has no hierarchy and the eye doesn't know where to land first.

**Contrast for legibility, not just decoration.** White text needs a dark-enough surface behind
it to read at a glance — a gradient scrim behind text over a busy photo, a solid panel, or a
dark portion of the photo itself. Check this on the actual composited output, not just in the
abstract; a gradient that looked fine as a design idea can still leave text illegible over a
bright patch of a specific photo.

**Alignment and a consistent margin.** Pick one left (or center) edge for text blocks and hold
it — text that starts at a different x-position per line reads as sloppy even if each line
individually looks fine. Give the piece a consistent outer margin (the flyer.js layouts default
to reasonable margins; don't crowd text to the literal edge of the frame).

**Whitespace is a choice, not empty space to fill.** A flyer with breathing room around the
headline reads as confident and premium; a flyer where every inch is packed with text and
badges reads as desperate or cheap. Resist adding "just one more" badge/sticker/emoji unless it
earns its place. This project's least-liked outputs were the ones trying to say too much at once.

**Typography pairing.** SVG-rendered text in the compositing scripts is limited to system fonts
(Arial-family by default) — within that constraint, the lever that's actually available is
*weight and scale contrast*: a bold, large headline against a lighter, smaller eyebrow/label
does more work than trying to vary typefaces. Never rely on emoji glyphs in composited text —
see `content-critic-loop`'s image checklist for why (they render as blank boxes in this
pipeline); use `stripEmoji` and lean on wording, icons drawn in SVG, or color instead.

**Color: pull from the brand palette, don't invent one per piece.** See
`references/brand-guides.md` for the current palette and logo asset for each brand. Using the
established colors is what makes a piece read as "this brand" at a glance rather than a
one-off. If a new accent color is genuinely needed for a specific promo (e.g. an urgency
color), make it a deliberate, sparing addition — not a wholesale palette swap.

For the fuller version of these principles with more examples, see
`references/design-principles.md`.

## Workflow

1. **Clarify the brief** if it's not already obvious: which brand, what's the piece actually
   promoting (a price, an event, a general brand moment), where will it be used (feed post,
   story, printed flyer, ad), and is there a specific real photo to use or should you pick one.
2. **Choose real-photo compositing or generation** per the rule above.
3. **Pick or extend a layout** in `scripts/flyer.js` — it already has several proven templates
   (full-bleed headline, bottom band, side panel, polaroid-frame, quote/promo card). Reuse
   before inventing a new one; extend the script with a new template function if none of the
   existing ones serve the brief, rather than one-off scripting each time.
4. **Render and look at the actual output** — open it with Read, not just trust the code ran
   without error. Layout bugs (text/logo collisions, illegible contrast on this specific photo)
   only show up by looking.
5. **Run it through `content-critic-loop`** before delivering — this skill produces the piece,
   that skill is the check that it's actually good before the user sees it.

## Reference files

- `references/design-principles.md` — the longer version of the fundamentals above, with more
  worked examples
- `references/brand-guides.md` — Lúa Eventos and Luaser color palettes, logo asset paths, voice
- `scripts/flyer.js` — reusable compositing templates (extend this rather than writing new
  one-off scripts per request)
