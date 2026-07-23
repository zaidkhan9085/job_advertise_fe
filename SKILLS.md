# Claude Code Working Guidelines (`SKILLS.md`)

These guidelines apply to this repo (`frontend/the-jobs-advertise-webapp/`). The backend repo (`backend/`) has its own copy of this file — they are separate git repos and are kept in sync manually.

## How We Work

### 1. Git Workflow

* Always create a new branch for every task.
* Branch types:
  * `feature/*` – New features
  * `bugfix/*` – Bug fixes
  * `refactor/*` – Code improvements
  * `hotfix/*` – Critical production fixes
* Never commit directly to the main branch.
* **Always ask for confirmation before creating a commit or merging any branch.**

---

### 2. Dynamic & Maintainable UI

* Build the UI to be fully reusable and configurable.
* Create a **global theme system** using Tailwind CSS (do **not** use MUI).
* Colors, spacing, typography, border radius, shadows, buttons, cards, etc. should be controlled from a single theme/config file.
* Future design changes should require modifying as few files as possible—ideally one central configuration.

---

### 3. Backend Architecture

* Follow a clean architecture with proper separation of:
  * Routes
  * Controllers
  * Services
  * Middleware
  * Validation
* Remove dead, duplicate, and unused code.
* Keep the codebase readable, modular, and maintainable.
* Follow consistent naming conventions.

---

### 4. Authentication & Error Handling

* Implement robust authentication and authorization.
* Add centralized error handling.
* Log meaningful errors for debugging.
* Return consistent API response formats.
* Handle edge cases gracefully.

---

### 5. Modern Development Practices

* Do **not** introduce deprecated packages, APIs, or coding patterns.
* Prefer actively maintained libraries and current best practices.
* Keep dependencies updated and avoid unnecessary packages.

---

## General Rules

* Understand the existing code before making changes.
* Do not break existing functionality.
* Reuse components and utilities instead of duplicating code.
* Keep the project scalable and production-ready.
* Before making any major architectural decision, explain the reasoning and ask for confirmation.
* If you find a better approach than the existing implementation, suggest it before implementing it.
* Always prioritize clean, maintainable, and future-proof code over quick fixes.
