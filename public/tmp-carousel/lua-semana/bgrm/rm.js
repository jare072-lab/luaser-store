const { removeBackground } = require("@imgly/background-removal-node");
const fs = require("fs"); const path = require("path");
(async () => {
  const [inp, out] = process.argv.slice(2);
  const src = new Blob([fs.readFileSync(inp)], { type: "image/jpeg" });
  const blob = await removeBackground(src, { model: process.env.BGM || "medium", output: { format: "image/png", quality: 1 } });
  const buf = Buffer.from(await blob.arrayBuffer());
  fs.writeFileSync(out, buf); console.log("ok", out, buf.length);
})().catch(e => { console.error("ERR", e.message); process.exit(1); });
