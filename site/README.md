# Quartz viewer

This directory contains only the presentation-layer configuration for the Engineering Knowledge site.

## Architecture

The Markdown knowledge base remains the source of truth at the repository root:

- `README.md`
- `concepts/`
- `patterns/`
- `systems/`

The GitHub Actions workflow checks out a pinned Quartz 5 revision, projects those files into Quartz's `content/` directory, applies `site/quartz.config.yaml`, builds the static site, and deploys it to GitHub Pages after merge to `main`.

No knowledge document is moved or duplicated in the repository.

## Quartz version

The Git submodule gitlink `.quartz-src` is the sole immutable source revision.
Inspect it with `git ls-tree HEAD .quartz-src`. The approved upstream channel
is the `v5` branch in `.gitmodules`; native Dependabot `gitsubmodule` manages
reviewed gitlink updates, and `github-actions` manages Action SHAs. A submodule
PR must pass the same full Quartz validation as any other PR. Do not copy the
current SHA into documentation or introduce another updater. Node uses the
provider's newest LTS selector with `check-latest: true`; runner `ubuntu-latest`.

## Canonical Pages URL

`https://ek.ox0.uk/`

GitHub Pages remains the hosting platform, with `ek.ox0.uk` configured as the custom domain. Cloudflare provides DNS only for this hostname.

The Quartz `baseUrl` is `ek.ox0.uk` so RSS, sitemap, and other canonical URLs are generated for the custom domain.

## One-time repository setting

GitHub Pages must use **GitHub Actions** as its source:

`Settings → Pages → Build and deployment → Source → GitHub Actions`

The workflow validates all pull requests using a read-only build job. The
projection script validates and copies only the Markdown knowledge inventory
(README becomes index.md) using the pinned Quartz parser; tests include
broken links, Related relationships and projection isolation. Only changes to
publication inputs on `main` trigger deployment. Only the deploy job receives
Pages/OIDC write permissions. Successful current-composition PR build is a
repository merge obligation even when live GitHub settings do not enforce it.
Actual Pages settings and deployed output must be checked when claiming
publication success; historical CI does not prove current settings.

## Current scope

Initial viewer only:

- folder explorer
- full-text search
- Korean locale
- dark mode
- reader mode
- breadcrumbs
- table of contents
- backlinks
- graph view
- GitHub Pages deployment

Status/tag dashboards are intentionally deferred until EK document metadata is migrated to frontmatter in a separate work unit.
