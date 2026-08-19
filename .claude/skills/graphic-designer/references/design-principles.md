# Design principles, worked out

These are the same fundamentals from SKILL.md, expanded with the reasoning and a few worked
examples from this project so the "why" is available, not just the rule.

## Hierarchy

A viewer scanning a feed spends under a second on any given post before deciding to keep
scrolling or stop. If a flyer has a price, a headline, a logo, a promo badge, and a CTA all
competing at similar size and weight, the viewer's eye has nowhere obvious to land and the
piece loses that first second doing nothing.

Worked example from this project: the "10 FRAPPÉS GRATIS" promo card works because exactly one
line is the loudest thing on the card (the offer itself), the date range is smaller and sits
below it, and the logo is smaller still and positioned away from the text entirely. Compare
that to an early draft where headline text ran into the logo circle — that failure wasn't a
rendering bug, it was a hierarchy problem: two elements (headline, logo) both trying to anchor
the top of the frame with no one clearly in charge of that space.

Rule of thumb: decide the ONE thing this piece needs someone to walk away knowing, make that
the largest/boldest element, and make everything else visibly secondary.

## Contrast for legibility

White text on a photo only works where the photo is dark/uncluttered enough behind it. Two
reliable techniques used on this project:
- A gradient scrim (dark at the text edge, fading to transparent) laid over the top portion of
  the photo before placing text — this is what `bottomBand`/full-bleed layouts in
  `flyer.js` do.
- A solid color panel (not over the photo at all) for the text, with the photo occupying the
  rest of the frame — this is the `sidePanel` layout, and it's the right call when the whole
  photo needs to stay visible without a scrim dimming any of it.

Don't assume a scrim opacity that worked on one photo will work on the next — a busier or
brighter photo may need a stronger gradient. Check the actual rendered output.

## Alignment and margins

Every text block in a given piece should share a left edge (or be deliberately centered,
consistently). A flyer.js layout with `margin`/`left` constants baked in enforces this
automatically — if extending the script with a new layout, define the margin as a named
constant once and reuse it, rather than eyeballing pixel offsets per element.

## Whitespace

Every version of this project's content that tried to say too much on one piece — a headline,
a subhead, three feature bullets, a badge, and a CTA all on one 1080×1080 square — read as
cluttered even when each individual line was well-written. The fix isn't smaller text, it's
fewer things: pick the one or two things this specific piece needs to communicate and cut the
rest to a different piece (a carousel slide, a story, a second post) rather than cramming.

## Typography within the available constraints

The compositing pipeline renders text via SVG + system fonts (effectively Arial/sans-serif —
no custom font embedding is set up). Within that real constraint, the tools that actually
create visual interest are:
- **Scale contrast**: a big bold headline next to a small letter-spaced uppercase label (see
  the `eyebrow` pattern already used across `flyer.js`) does most of the "this looks designed"
  work.
- **Weight**: bold (700-800) for anything meant to be the anchor, regular/normal weight for
  supporting text — don't set everything bold, it flattens the hierarchy it's supposed to
  create.
- **Letter-spacing on small caps labels** (`letter-spacing="3"` in the existing SVG templates)
  reads as an intentional "label" rather than an accidental short line of body text.

If a piece genuinely needs a distinctive display typeface (e.g. a printed poster where quality
matters more than pipeline speed), that's a case for Higgsfield's `gpt_image_2` generating the
typography directly as part of an image (it handles on-image text well) rather than trying to
stretch the SVG/Arial pipeline past what it's good at — use judgment on which tool fits.

## Color

Pulling every color from `references/brand-guides.md` rather than picking new hex values per
piece is what makes a scattered set of individual posts read as one consistent brand over time.
The one exception worth making deliberately: a genuine urgency/scarcity moment (a countdown, a
limited stock badge) can use the brand's designated urgency color (terracotta/neon-pink for
both brands here) precisely because it's used *only* for that, so it still carries meaning
instead of becoming just another decorative color.
