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

Pinned upstream commit:

`7cfb0796165c848be5438117e9806802123bf676`

The pin is intentional. Updating Quartz should be a separate reviewed change with a successful build before changing this SHA.

## Canonical Pages URL

`https://ek.ox0.uk/`

GitHub Pages remains the hosting platform, with `ek.ox0.uk` configured as the custom domain. Cloudflare provides DNS only for this hostname.

The Quartz `baseUrl` is `ek.ox0.uk` so RSS, sitemap, and other canonical URLs are generated for the custom domain.

## One-time repository setting

GitHub Pages must use **GitHub Actions** as its source:

`Settings → Pages → Build and deployment → Source → GitHub Actions`

The workflow validates the Quartz build on pull requests, but deploys only on pushes to `main`.

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
