// This port owns its application mappings. Inputs come only from the pinned local palette.
import { ANSI_ORDER } from '../scripts/palette.mjs';

const rgbOf = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

const rgbComma = (hex) => rgbOf(hex).join(",");

const konsoleScheme = (f) => {
  const section = (name, hex, extra = "") => `[${name}]\nColor=${rgbComma(hex)}\n${extra}`;
  const out = [
    section("Background", f.r("bg")),
    section("BackgroundFaint", f.r("bg")),
    section("BackgroundIntense", f.r("bgDeep")),
    section("Foreground", f.r("fg")),
    section("ForegroundFaint", f.r("fgMuted")),
    section("ForegroundIntense", f.r("fg")),
  ];
  ANSI_ORDER.forEach((_, i) => {
    out.push(section(`Color${i}`, f.ansi.normal[i]));
    out.push(section(`Color${i}Faint`, f.ansi.normal[i]));
    out.push(section(`Color${i}Intense`, f.ansi.bright[i]));
  });
  out.push(`[General]\nBlur=false\nColorRandomization=false\nDescription=${f.name}\nOpacity=1\nWallpaper=\n`);
  return out.join("\n");
};

const konsole = {
files: (f) => [{ path: `${f.slug}.colorscheme`, content: konsoleScheme(f) }]
};

export function generate(flavors) {
  return [...flavors.flatMap(f => konsole.files(f)), ...(konsole.all?.(flavors) ?? [])].filter(f => !["LICENSE", "README.md", "package.json", "extension.toml"].includes(f.path.split("/").at(-1)));
}
