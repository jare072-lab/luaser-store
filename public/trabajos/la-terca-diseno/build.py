import re
WALL = 'url(data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%27320%27%20height%3D%27320%27%3E%3Cfilter%20id%3D%27n%27%3E%3CfeTurbulence%20type%3D%27fractalNoise%27%20baseFrequency%3D%270.95%27%20numOctaves%3D%273%27%20stitchTiles%3D%27stitch%27%2F%3E%3CfeColorMatrix%20values%3D%270%200%200%200%200.42%200%200%200%200%200.40%200%200%200%200%200.37%200%200%200%200.22%200%27%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%27100%25%27%20height%3D%27100%25%27%20filter%3D%27url%28%23n%29%27%2F%3E%3C%2Fsvg%3E)'

def layer(mask, style, wrap=""):
    return (f'<div style="position: absolute; inset: 0; {wrap}">'
            f'<div style="position: absolute; inset: 0; -webkit-mask-image: url(./{mask}); mask-image: url(./{mask}); -webkit-mask-size: 100% 100%; mask-size: 100% 100%; {style}"></div></div>')

GOLD = ("background: linear-gradient(160deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0) 28%, rgba(0,0,0,0.16) 52%, rgba(255,255,255,0.26) 74%, rgba(255,255,255,0) 100%), "
        "linear-gradient(112deg, #6e520f 0%, #b8932a 9%, #f3dc85 18%, #fff5c2 23%, #d9b64a 31%, #9c7a1c 40%, #c9a63a 48%, #f7e6a1 56%, #ead27a 60%, #a8861f 70%, #7c5f10 80%, #cfae44 90%, #f1d986 100%);")

def sign():
    parts = []
    # LED ambient glow on the wall
    parts.append(layer("panel.png", "background: {{ledColor}};", "filter: blur(46px); opacity: {{glowOpacity}}; transform: scale(1.08);"))
    # panel shadow on wall
    parts.append(layer("panel.png", "background: #1a1409;", "filter: blur(12px); opacity: 0.22; transform: translate(12px, 20px);"))
    # letter shadow on wall
    parts.append(layer("letras.png", "background: #2a1d08;", "filter: blur(7px); opacity: 0.38; transform: translate(16px, 26px);"))
    # clear acrylic panel
    parts.append(layer("panel.png", "background: linear-gradient(148deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 38%, rgba(255,255,255,0.03) 62%, rgba(255,255,255,0.18) 100%);",
                       "filter: drop-shadow(0 0 1px rgba(255,255,255,0.85)) drop-shadow(0 1px 1px rgba(80,70,50,0.35));"))
    # LED strip
    parts.append(layer("led.png", "background: {{ledColor}}; opacity: {{ledOpacity}};", "filter: {{ledFilter}};"))
    # LED strip hot core
    parts.append(layer("led.png", "background: #ffffff; opacity: {{coreOpacity}};", "transform: scale(0.995);"))
    # letter thickness (3 mm edge)
    parts.append(layer("letras.png", "background: #7a5a12;", "transform: translate(3px, 4px);"))
    # gold mirror letters
    parts.append(layer("letras.png", GOLD, "filter: drop-shadow(0 0 0.5px rgba(80,60,10,0.6));"))
    # standoffs
    for x,y in [(225,107),(791,169),(192,545),(895,552)]:
        parts.append(f'<div style="position: absolute; left: {x-14}px; top: {y-14}px; width: 28px; height: 28px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #f4f4f2 0%, #c9c9c6 45%, #8f918f 78%, #5d605f 100%); box-shadow: 0 2px 4px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.4);"></div>')
    return "\n".join(parts)

def artboard(transform, title):
    return f'''<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <style>
    body {{ margin: 0; font-family: system-ui, sans-serif; }}
    a {{ color: #b8932a; }} a:hover {{ color: #7a5a12; }}
  </style>
</helmet>
<div style="position: relative; width: 1200px; height: 900px; overflow: hidden; background-color: #d3cfc8; background-image: {WALL};">
  <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.10) 100%);"></div>
  <div style="position: absolute; left: 100px; top: 92px; width: 1000px; height: 715px; {transform}">
{sign()}
  </div>
</div>
</x-dc>
<script data-dc-script data-props='{{"ledColor":{{"editor":"color","default":"#ffd9a3","options":["#ffd9a3","#f2f6ff","#ffb347"],"section":"LED"}},"encendido":{{"editor":"boolean","default":true,"section":"LED"}},"$preview":{{"width":1200,"height":900}}}}'>
class Component extends DCLogic {{
  renderVals() {{
    const c = this.props.ledColor ?? '#ffd9a3';
    const on = this.props.encendido ?? true;
    return {{
      ledColor: c,
      ledOpacity: on ? 1 : 0.35,
      coreOpacity: on ? 0.75 : 0,
      glowOpacity: on ? 0.45 : 0,
      ledFilter: on
        ? 'drop-shadow(0 0 3px ' + c + ') drop-shadow(0 0 10px ' + c + ') drop-shadow(0 0 22px ' + c + ')'
        : 'none',
    }};
  }}
}}
</script>
</body>
</html>
'''

main = artboard("", "frontal")
ang = artboard("transform: perspective(1500px) rotateY(-24deg) rotateX(3deg) scale(0.96); transform-origin: 62% 50%;", "angulo")
open("Main.dc.html","w").write(main)
open("Angulo.dc.html","w").write(ang)

# plain previews for a browser check
def preview(src):
    p = src.replace("{{ledColor}}", "#ffd9a3").replace("{{ledOpacity}}","1").replace("{{coreOpacity}}","0.75").replace("{{glowOpacity}}","0.55")
    p = p.replace("{{ledFilter}}", "drop-shadow(0 0 3px #ffd9a3) drop-shadow(0 0 10px #ffd9a3) drop-shadow(0 0 22px #ffd9a3)")
    p = re.sub(r"<script data-dc-script.*?</script>", "", p, flags=re.S).replace('<script src="./support.js"></script>','')
    import base64
    for n in ["letras.png","led.png","panel.png"]:
        p = p.replace("url(./"+n+")", "url(data:image/png;base64," + base64.b64encode(open(n,"rb").read()).decode() + ")")
    return p
open("preview-main.html","w").write(preview(main))
open("preview-angulo.html","w").write(preview(ang))

import json
json.dump({
  "artboards": [
    {"file": "Main.dc.html", "title": "Vista frontal", "x": 0, "y": 0, "w": 1200, "h": 900},
    {"file": "Angulo.dc.html", "title": "Vista en ángulo", "x": 1300, "y": 0, "w": 1200, "h": 900}
  ],
  "annotations": [
    {"id": "materiales", "x": 0, "y": -170, "w": 520, "text": "La Terca · Mini Quinta — letrero\nLetras y palmera: acrílico espejo dorado 3 mm\nFondo: acrílico cristal (transparente) 3 mm, corte siguiendo el contorno\nLuz: neón LED 12 V blanco cálido por el contorno + 4 separadores de aluminio\nMedida: [POR DEFINIR] cm de ancho"}
  ],
  "launch": {"view": "canvas"}
}, open("canvas.json","w"), ensure_ascii=False, indent=2)
print("built")
