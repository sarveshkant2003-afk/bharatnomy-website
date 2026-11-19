# Bharatnomy website spec: how to use these files

1. Create an empty folder for the site (or a new GitHub repo) and put all seven .md files in its root:
   `CLAUDE.md`, `DESIGN.md`, `CONTENT.md`, `PAGES.md`, `MAP.md`, `SCROLL.md`, and this `README.md`.
2. Open Claude Code in that folder.
3. Install ScrollCraft first:
   ```
   /plugin marketplace add nateherkai/scroll-craft
   /plugin install nateherk-design
   ```
   (Run `/reload-plugins` if it asks.)
4. Paste this as your first message:

   > Read CLAUDE.md, then every spec file in the order it lists. Do not write code yet. Summarise the plan back to me in 10 lines, list anything that is unclear or contradictory, then start Phase 0. Stop at the end of each phase and show me what you did (for Phase 1, the data summary; for Phase 2, screenshots of the /_kit page).

5. Review at each checkpoint. The two places that most need your eye:
   - **Phase 1 data summary:** check that all 35 districts joined and the columns match.
   - **Phase 2 kit page:** this is where the look is decided. If anything looks generic, say exactly what and point it back to DESIGN.md.

Tip: if Claude Code drifts toward generic layouts mid-build, tell it: "Re-read the anti-slop rules in CLAUDE.md and the refuse list in ScrollCraft's taste.md, then list every violation on the current page and fix them."
