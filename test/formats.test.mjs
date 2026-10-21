// Native format regressions, exercised through this port's generator.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {resolveAll,ANSI_ORDER} from '../scripts/palette.mjs';
import {generate} from '../src/generate.mjs';

const flavors = resolveAll();

const konsoleScheme=f=>generate([f])[0].content;

const konsole = {files: f=>generate([f]).filter(x=>x.path!=='living-code.json'), all: fs=>generate(fs).filter(x=>x.path==='living-code.json'||x.path==='theme.css'||x.path.startsWith('snippets/')), install:readFileSync(new URL('../README.md',import.meta.url),'utf8')};

test("Konsole schemes define Background, Foreground and all 8 colors in normal, faint and intense", () => {
  for (const f of flavors) {
    const sections = new Map();
    let cur;
    for (const line of konsoleScheme(f).split("\n")) {
      const h = line.match(/^\[(\w+)\]$/);
      if (h) { cur = {}; sections.set(h[1], cur); } else if (line.includes("=")) { const [k, ...v] = line.split("="); cur[k] = v.join("="); }
    }
    const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(",");
    for (const s of ["Background", "BackgroundFaint", "BackgroundIntense", "Foreground", "ForegroundFaint", "ForegroundIntense"]) assert.match(sections.get(s).Color, /^\d+,\d+,\d+$/, s);
    ANSI_ORDER.forEach((_, i) => {
      assert.equal(sections.get(`Color${i}`).Color, rgb(f.ansi.normal[i]));
      assert.equal(sections.get(`Color${i}Intense`).Color, rgb(f.ansi.bright[i]));
      assert.ok(sections.has(`Color${i}Faint`));
    });
    assert.equal(sections.get("Background").Color, rgb(f.r("bg")));
    assert.equal(sections.get("General").Description, f.name);
  }
  assert.match(konsole.install, /~\/\.local\/share\/konsole/);
});
