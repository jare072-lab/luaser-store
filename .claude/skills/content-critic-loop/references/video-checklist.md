# Video critique checklist

## Getting something to actually look at

Full frame-by-frame video review isn't available in this environment by default — there's no
`ffmpeg` installed, so you can't be certain you're not missing a mid-video anatomy glitch or
lip-sync drift purely from static frames. Don't let that become an excuse to skip the check
though. In order of preference:

1. **Check for ffmpeg first**: run `ffmpeg -version`. If it's there, use
   `scripts/extract_frames.sh <video_path> <out_dir>` to pull several evenly-spaced frames
   (start, ~25%, ~50%, ~75%, end) and Read each one. This catches most limb/object artifacts,
   which tend to be visible as soon as you look at more than one frame.
2. **No ffmpeg**: use the thumbnail Higgsfield already generated — `higgsfield generate get
   <job_id> --json` returns a `picture`/thumbnail URL for the job. Download and Read that. It's
   one frame, usually near the start, so it will catch logo/branding/first-impression issues
   but won't reliably catch a mid-clip glitch. Say so plainly in the verdict rather than
   reporting a false PASS on anatomy/lip-sync — e.g. "thumbnail looks clean; full playback not
   reviewed, ask the user to confirm mid-video" rather than silently marking those checks as
   passed.
3. If neither is available and the defect category matters a lot for this piece (a UGC
   testimonial where lip-sync is the whole point, say), it's fine to ask the user for a quick
   yes/no on that one specific thing rather than guessing — that's a 10-second ask, not a
   burden, and much cheaper than a wrong delivery.

## What to look for

### Anatomy / physical plausibility
- **Extra or duplicate limbs, hands, fingers** — this is the single most common generative
  video artifact on this project. Check hand count and position in every frame you do get.
- **Objects that shouldn't be near the face/mouth** — if the prompt didn't call for the subject
  to be holding/eating/drinking something, confirm nothing stray ended up there. This happened
  once when a prompt described multiple actions in one shot (sipping a drink *and* touching
  hair) and the model conflated them into an extra hand holding a phantom object.
- **General deformation** — warped facial features, garbled background text/logos in the scene
  (separate from the intentional brand logo).

### Audio / speech
- **Lip movement actually matches the audio.** If the mouth is static or moving out of sync
  with the words, that's a fail even if the words themselves are correct — the user has
  explicitly called this out ("ni siquiera está moviendo los labios").
- **Brand name pronounced correctly.** "Lúa" should read as two clear syllables, LU-A — check
  it wasn't rendered/heard as "Lula" or run together with the next word. If the source prompt
  didn't include an explicit phonetic hint and a wrong-answer example, that's very likely why
  it went wrong, and this is exactly what to fix in the repair step.
- **No fused/garbled words** — e.g. text meant to have a line break or space that got
  concatenated in the prompt string will often come out fused in the spoken audio too, not just
  visually.

### Consent (hard stop, see main SKILL.md — not part of the retry loop)
- **Is this a synthetic/generic persona, or a real identifiable person?** If a real person's
  photo was provided as a reference for a talking/endorsing video and there's no clear
  indication the user has that person's consent for this specific use, stop and ask — don't
  iterate around it.

### Content accuracy
- **Right product** — does the video actually show/describe the product that was asked for
  (e.g. the correct frappé flavor, not a generic stand-in)?
- **Right promo details** — dates, offer terms ("10 frappés gratis del 15 al 30 de agosto") if
  spoken or captioned, matching what's actually being offered right now, not a stale promo from
  an earlier draft.
