import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { inventory, project, validate } from "./project-knowledge.mjs";

const notes = (body) => new Map([
  ["README.md", "# Knowledge\n\n[Alpha](concepts/alpha.md)"],
  ["concepts/alpha.md", "# Alpha\n\n" + body],
  ["patterns/beta.md", "# Beta\n"],
]);

test("real Markdown links, references, code examples and Related links", () => {
  validate(notes("[Beta][b]\n\n[b]: ../patterns/beta.md\n\n```md\n[example](missing.md)\n```\n\n## Related\n\n- [Beta](../patterns/beta.md)"));
  validate(notes("[external](https://example.org)\n\n## Related\n\n- Not yet a note"));
});
test("broken, nonpublished and nonportable links fail", () => {
  for (const url of ["missing.md", "../site/README.md", "../README.md", "/patterns/beta.md",
    "../../outside.md", "../patterns", "%ZZ", "file:///tmp/file", "%2Fpatterns/beta.md"]) {
    assert.throws(() => validate(notes("[bad](" + url + ")")), /link|URI/i);
  }
  assert.throws(() => validate(notes("[bad][ref]\n\n[ref]: missing.md")), /broken/);
  assert.throws(() => validate(notes("[[Beta]]")), /wiki/);
});
test("Related section after blank lines does not hide existing titles", () => {
  assert.throws(() => validate(notes("## Related\n\n- Unknown\n- Beta\n\n## Sources\n")), /Related item "Beta"/);
  assert.throws(() => validate(notes("## Related\n\n- [Beta](alpha.md)")), /Related item "Beta"/);
});
test("projection only uses validated inventory; invalid input leaves output intact", (t) => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "ek-projection-"));
  t.after(() => fs.rmSync(repo, { recursive: true, force: true }));
  for (const dir of ["concepts", "patterns", "systems", "docs"]) fs.mkdirSync(path.join(repo, dir));
  for (const [file, content] of notes("[Beta](../patterns/beta.md)")) fs.writeFileSync(path.join(repo, file), content);
  fs.writeFileSync(path.join(repo, "docs", "not-public.md"), "not in projection");
  const output = path.join(repo, "generated");
  assert.equal(project(repo, output), 3);
  assert.equal(fs.readFileSync(path.join(output, "index.md"), "utf8"), notes("").get("README.md"));
  assert.equal(fs.existsSync(path.join(output, "docs")), false);
  fs.writeFileSync(path.join(repo, "concepts", "alpha.md"), "[bad](missing.md)");
  assert.throws(() => project(repo, output), /broken/);
  assert.equal(fs.existsSync(path.join(output, "index.md")), true);
  fs.writeFileSync(path.join(repo, "concepts", "unexpected.txt"), "unreviewed");
  assert.throws(() => inventory(repo), /expected Markdown/);
  fs.rmSync(path.join(repo, "concepts", "unexpected.txt"));
  fs.symlinkSync(path.join(repo, "docs", "not-public.md"), path.join(repo, "concepts", "leak.md"));
  assert.throws(() => inventory(repo), /symlink/);
});
