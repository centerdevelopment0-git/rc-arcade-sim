---
name: web-interface-guidelines
description: Review web UI code (HTML, CSS, JS) against Vercel's Web Interface Guidelines: accessibility, focus states, forms, touch, animation, typography, content. Use when asked to review UI, check accessibility, audit design or UX of a web page.
---

# Web Interface Guidelines

Review web UI files for compliance with the rules in [GUIDELINES.md](GUIDELINES.md).

This is a pinned local copy of [vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines) (`434b7f9`, MIT). The upstream skill fetches the rules from the internet on every run; this copy reads them from disk instead so the rules cannot change without a reviewed commit.

## How it works

1. Read [GUIDELINES.md](GUIDELINES.md).
2. Read the files the user named. If none were named, ask which files to review.
3. Check every rule that applies to the stack in front of you. Rules written for React or Tailwind apply to plain HTML/CSS by their intent (for example `focus-visible:ring-*` means any visible `:focus-visible` style).
4. Report findings in the terse `file:line` format at the end of GUIDELINES.md.

Web pages only. For the Flutter app, use `make-interfaces-feel-better` and the project UI guide instead.
