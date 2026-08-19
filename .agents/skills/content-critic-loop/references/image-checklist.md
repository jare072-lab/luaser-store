# Image critique checklist

Read the actual output file with the Read tool before checking anything off. Go through each
item deliberately — it's easy to glance at a busy image, register "looks fine," and miss the
one thing that's wrong, which is exactly how these got through before.

## Brand identity

- **Logo present** — is the Lúa Eventos / Luaser logo actually in the image where the design
  called for one? A missing logo is easy to miss if the rest of the composition looks complete.
- **Logo correct** — is it actually the logo (`LOGO LUA.jpg` or the correct brand asset), not a
  different photo that got passed to the wrong argument? This has happened from copy-paste
  mistakes when listing multiple reference photos — cross-check the file path used against
  what's visible.
- **Logo not duplicated or malformed** — compositing bugs can stamp it twice, clip it, or
  stretch it out of its circle.
- **Logo placement doesn't collide with text** — check the corner it's in doesn't overlap the
  headline, especially the first line.

## Text

- **Emoji render correctly** — if the design used emoji in text that gets rendered via SVG/Arial
  (the compositing scripts), check for blank boxes/tofu characters. This is a known limitation,
  not a rare glitch — assume it happened unless you see clean emoji or no emoji at all.
- **No overlapping text** — headline over subhead, headline over logo, caption over the photo's
  own busy detail making it unreadable.
- **No cut-off or clipped text** — lines running off the edge, last line trimmed by the frame.
- **Text matches what was asked** — right product name, right price/promo dates, right day of
  week if this is part of a dated content calendar. A wrong word here (e.g. "GRATISal" from a
  missing space, or a stale promo date) is easy to introduce during a copy-paste of the headline
  string and easy to miss on a fast read.
- **Correct language/spelling** — Spanish text should read naturally, not like a direct
  mistranslation, and brand name spelled correctly (Lúa, not Lua/Lula/other variants) unless the
  design intentionally omits the accent.

## Photo content

- **Right photo for the right caption** — the single most common mistake on this project has
  been assigning the wrong real photo to a headline (e.g. a photo of a person holding an orange
  drink used for a caption about a five-cup lineup). Cross-check: does what's actually in the
  frame match what the caption/context claims it shows?
- **Real photo left unaltered when that was the intent** — if the brief was "use my real photo,
  don't let AI redraw it," confirm the output is a true composite (original pixels + overlay)
  and not a generative "edit" pass that reinterpreted the photo. Reinterpreted food/drink photos
  from generative edit models consistently look plastic/uncanny and the user has flagged this
  specifically — if in doubt, compare fine detail (background texture, hand position) against
  the source photo file.
- **No AI-plastic look where a real photo was expected** — waxy skin, too-perfect symmetry,
  garbled background text, is a sign a generative model touched something that should have been
  a straight composite.

## Layout sanity

- **Aspect ratio matches intended placement** (1:1 feed, 9:16 story) — a story-sized image
  cropped into a square slot (or vice versa) will have awkward empty bars or cut subjects.
- **Nothing important sits in a corner/edge that a platform UI element (profile icon, caption
  area) would cover** — mainly relevant for Stories.
