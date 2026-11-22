"use strict";

const fs = require("node:fs");
const path = require("node:path");

function walkMarkdown(entry) {
  const resolved = path.resolve(entry);
  if (!fs.existsSync(resolved)) throw new Error("knowledge path does not exist: " + entry);
  const stat = fs.statSync(resolved);
  if (stat.isFile()) return resolved.endsWith(".md") ? [resolved] : [];
  if (!stat.isDirectory()) return [];

  const found = [];
  for (const child of fs.readdirSync(resolved, { withFileTypes: true })) {
    const childPath = path.join(resolved, child.name);
    if (child.isDirectory()) found.push(...walkMarkdown(childPath));
    else if (child.isFile() && child.name.endsWith(".md")) found.push(childPath);
  }
  return found;
}

function firstHeading(source) {
  const match = String(source).match(/^#\s+(.+?)\s*$/m);
  return match ? match[1].trim() : null;
}

function markdownLinks(source) {
  const links = [];
  const pattern = /!?\[[^\]]*\]\(\s*<?([^\s)>]+)>?(?:\s+["'][^"']*["'])?\s*\)/g;
  for (const match of String(source).matchAll(pattern)) links.push(match[1]);
  return links;
}

function relatedItems(source) {
  const normalized = String(source).replace(/\r\n/g, "\n");
  const match = normalized.match(/^##\s+Related\s*$([\s\S]*?)(?=^##\s+|\s*$)/m);
  if (!match) return [];
  return match[1]
    .split("\n")
    .map((line) => line.match(/^\s*-\s+(.+?)\s*$/))
    .filter(Boolean)
    .map((item) => item[1].trim());
}

function targetPath(sourceFile, rawTarget, repositoryRoot) {
  if (!rawTarget || rawTarget.startsWith("#")) return null;
  if (rawTarget.startsWith("//") || /^[A-Za-z][A-Za-z0-9+.-]*:/.test(rawTarget)) return null;

  const withoutFragment = rawTarget.split(/[?#]/, 1)[0];
  if (!withoutFragment) return null;

  let decoded;
  try {
    decoded = decodeURI(withoutFragment);
  } catch {
    throw new Error("invalid URI in Markdown link: " + rawTarget);
  }

  return decoded.startsWith("/")
    ? path.resolve(repositoryRoot, "." + decoded)
    : path.resolve(path.dirname(sourceFile), decoded);
}

function main(argv) {
  if (argv.length === 0) {
    throw new Error("usage: node validate-knowledge-links.cjs <markdown-file-or-directory> [...]");
  }

  const repositoryRoot = process.cwd();
  const files = [...new Set(argv.flatMap(walkMarkdown))].sort();
  const documents = new Map();
  const titleOwners = new Map();

  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    documents.set(file, source);
    const title = firstHeading(source);
    if (!title) continue;
    const owners = titleOwners.get(title) || [];
    owners.push(file);
    titleOwners.set(title, owners);
  }

  const violations = [];
  for (const [file, source] of documents) {
    const display = path.relative(repositoryRoot, file).split(path.sep).join("/");

    for (const rawTarget of markdownLinks(source)) {
      let resolved;
      try {
        resolved = targetPath(file, rawTarget, repositoryRoot);
      } catch (error) {
        violations.push(display + ": " + error.message);
        continue;
      }
      if (!resolved) continue;
      if (!fs.existsSync(resolved)) {
        violations.push(display + ": broken internal link " + rawTarget);
      }
    }

    for (const item of relatedItems(source)) {
      if (/^\[[^\]]+\]\(/.test(item) || /^\[\[[\s\S]+\]\]$/.test(item)) continue;
      const owners = titleOwners.get(item) || [];
      const otherOwners = owners.filter((owner) => owner !== file);
      if (otherOwners.length > 0) {
        const candidates = otherOwners
          .map((owner) => path.relative(path.dirname(file), owner).split(path.sep).join("/"))
          .join(", ");
        violations.push(
          display + ': Related item "' + item + '" matches an existing document and must be an internal Markdown link (' + candidates + ")"
        );
      }
    }
  }

  if (violations.length > 0) {
    for (const violation of violations) console.error("ERROR: " + violation);
    process.exitCode = 1;
    return;
  }

  console.log("Knowledge link validation: PASS (" + files.length + " Markdown files)");
}

if (require.main === module) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error("ERROR: " + error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  walkMarkdown,
  firstHeading,
  markdownLinks,
  relatedItems,
  targetPath,
  main
};
