# AgentHazard Project Page

This repository hosts the project website for the paper _Mobile GUI Agents under Real-world Threats: Are We There Yet?_ (MobiSys 2026).

## Local editing

- Main page content lives in `index.html`.
- Site styling lives in `static/css/index.css`.
- Images and other static assets live under `static/`.
- The site favicon is `static/images/favicon.ico`.

Since this repo is now a project-specific website rather than a reusable template, the README only documents the files that matter for maintaining this page.

## Structure

- `index.html`: page content, metadata, and section structure
- `static/css/index.css`: layout, typography, responsive behavior, and component styling
- `static/images/`: favicon, figures, and social preview assets
- `static/js/`: client-side interactions, if present

## Updating the website

- Edit text content, links, and metadata directly in `index.html`.
- Keep social preview metadata such as `og:*` and `twitter:*` tags in sync with the published page.
- Add optimized images to `static/images/` and reference them with relative paths.
- When replacing the favicon, update `static/images/favicon.ico` and ensure the `<link rel="icon">` tag in `index.html` points to it.

## Deployment

This repo is intended to be published with GitHub Pages from the repository root.

## License

Unless noted otherwise, the website content in this repository is provided for the AgentHazard project page. Check the paper, linked artifacts, and any third-party assets for their respective licensing terms.
