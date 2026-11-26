import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

// Use the checked-out Quartz parser and its npm-ci lockfile.
const require = createRequire(new URL("../../.quartz-src/package.json", import.meta.url));
const load = (name) => import(pathToFileURL(require.resolve(name)).href);
const [{ unified }, { default: remarkParse }, { default: remarkFrontmatter }] =
  await Promise.all(["unified", "remark-parse", "remark-frontmatter"].map(load));
const parser = unified().use(remarkParse).use(remarkFrontmatter);
const root = fileURLToPath(new URL("../../", import.meta.url));
const roots = ["README.md", "concepts", "patterns", "systems"];
const ignored = new Set(["private", "templates", ".obsidian"]);

export function inventory(repository) {
  const documents = new Map();
  function walk(rel) {
    const location = path.join(repository, rel);
    const stat = fs.lstatSync(location);
    if (stat.isSymbolicLink()) throw new Error("symlink in knowledge scope: " + rel);
    if (stat.isDirectory()) {
      if (ignored.has(path.posix.basename(rel))) {
        throw new Error("nonpublic directory in knowledge scope: " + rel);
      }
      for (const name of fs.readdirSync(location).sort()) walk(path.posix.join(rel, name));
      return;
    }
    if (!stat.isFile() || !rel.endsWith(".md")) {
      throw new Error("expected Markdown source, got: " + rel);
    }
    documents.set(rel, fs.readFileSync(location, "utf8"));
  }
  for (const entry of roots) walk(entry);
  return documents;
}

function visit(node, fn) {
  fn(node);
  for (const child of node.children ?? []) visit(child, fn);
}
function textOf(node) {
  return node.value ?? (node.children ?? []).map(textOf).join("");
}

function target(file, url) {
  if (url.startsWith("#")) return null;
  if (/^(https?:|mailto:)/i.test(url)) return null;
  if (/^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(url)) {
    throw new Error("unsupported nonrelative link: " + url);
  }
  const decoded = decodeURIComponent(url.split(/[?#]/, 1)[0]);
  if (!decoded || decoded.startsWith("/") || decoded.includes("\\") || decoded.includes("\0")) {
    throw new Error("invalid relative link: " + url);
  }
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(file), decoded));
  // README is projected as index.md, not a portable cross-document target.
  if (resolved === "README.md" || resolved === ".." || resolved.startsWith("../")) {
    throw new Error("link has no portable knowledge projection: " + url);
  }
  return resolved;
}

export function validate(documents) {
  const parsed = new Map();
  const owners = new Map();
  for (const [file, source] of documents) {
    const tree = parser.parse(source);
    parsed.set(file, tree);
    const title = tree.children.find((node) => node.type === "heading" && node.depth === 1);
    if (title) {
      const name = textOf(title).trim();
      owners.set(name, [...(owners.get(name) ?? []), file]);
    }
  }
  const errors = [];
  for (const [file, tree] of parsed) {
    const definitions = new Map();
    visit(tree, (node) => {
      if (node.type === "definition" && !definitions.has(node.identifier)) {
        definitions.set(node.identifier, node.url);
      }
    });
    function linkTarget(node) {
      if (node.type === "link" || node.type === "image") return node.url;
      if (node.type === "linkReference" || node.type === "imageReference") {
        return definitions.get(node.identifier);
      }
    }
    function check(node) {
      const url = linkTarget(node);
      if (url !== undefined) {
        try {
          const resolved = target(file, url);
          if (resolved !== null && !documents.has(resolved)) {
            errors.push(file + ": broken or nonpublished internal link " + url);
          }
        } catch (error) {
          errors.push(file + ": " + error.message);
        }
      }
      if (node.type === "text" && /\[\[[^\n]+?\]\]/.test(node.value)) {
        errors.push(file + ": use relative Markdown links instead of wiki links");
      }
      if (node.type === "html" && /\b(?:href|src)\s*=/i.test(node.value)) {
        errors.push(file + ": use Markdown for links/images");
      }
    }
    visit(tree, check);
    let related = false;
    for (const node of tree.children) {
      if (node.type === "heading" && node.depth <= 2) {
        related = node.depth === 2 && textOf(node).trim() === "Related";
      } else if (related && node.type === "list") {
        for (const item of node.children) {
          const label = textOf(item).trim();
          const candidates = (owners.get(label) ?? []).filter((owner) => owner !== file);
          if (!candidates.length) continue;
          let correct = false;
          visit(item, (child) => {
            if (child.type !== "link" && child.type !== "linkReference") return;
            try { correct ||= candidates.includes(target(file, linkTarget(child))); }
            catch { /* general link validation reports invalid target */ }
          });
          if (!correct) errors.push(file + ': Related item "' + label + '" must link to its existing note');
        }
      }
    }
  }
  if (errors.length) throw new Error(errors.join("\n"));
}

export function project(repository, output) {
  const documents = inventory(repository);
  validate(documents);
  // Validate completely before replacing generated output.
  if (fs.existsSync(output) && !fs.lstatSync(output).isDirectory()) {
    throw new Error("projection output must be a real directory");
  }
  fs.rmSync(output, { recursive: true, force: true });
  fs.mkdirSync(output, { recursive: true });
  for (const [file, content] of documents) {
    const dest = path.join(output, file === "README.md" ? "index.md" : file);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, content);
  }
  return documents.size;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const count = project(root, path.join(root, ".quartz-src", "content"));
  console.log("Knowledge validation and projection: PASS (" + count + " Markdown files)");
}
