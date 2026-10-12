# NTHNY DevFlow v0.1

NTHNY DevFlow is an early-stage developer workflow prototype for organizing software projects, tracking requirements, documenting systems, and running structured manual code reviews.

## Status

**Prototype / MVP v0.1**

This repository intentionally does **not** claim a production AI integration, paying customers, outside funding, or commercial traction.

## What works in v0.1

- Create, edit, and delete software projects
- Track functional and non-functional requirements
- Update requirement status and project progress
- Run structured manual code-review sessions
- Save code snippets, review checks, and findings
- Maintain project documentation
- Export project documentation as Markdown
- Export all DevFlow data as JSON
- Browser persistence using `localStorage`
- Responsive NTHNY-styled interface

## Tech stack

- HTML5
- CSS3
- Vanilla JavaScript
- Browser `localStorage`

No backend is required for v0.1, so the prototype can run directly on GitHub Pages.

## Run locally

1. Download or clone the repository.
2. Open `index.html` in a modern browser.

For a local development server:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish with GitHub Pages

1. Create a GitHub repository, for example `nthny-devflow`.
2. Upload `index.html`, `styles.css`, and `app.js`.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select your main branch and `/ (root)`.
6. Save.

## Data & privacy

v0.1 stores data only in the current browser using `localStorage`. It is a prototype and should not be used for sensitive production data.

## AI / Claude roadmap

A later version may add secure AI-assisted features such as:

- structured code review
- requirement analysis
- system and database reasoning
- technical documentation assistance
- UI/UX review

Any API integration should be implemented through a secure backend so API keys are never exposed in client-side JavaScript.

## Suggested roadmap

### v0.2
- Authentication
- Backend database
- Multi-device project persistence
- Better activity history
- Markdown import/export

### v0.3
- Secure server-side Claude API integration
- AI code review
- Requirement analysis
- Documentation assistance

### v0.4
- Team workspaces
- Comments
- Review history
- Product analytics

## Founder

NTHNY is founded and led by **Ramon Anthony V. Dela Fuente**.

Website: https://nthny.dev  
Company email: ramon@nthny.dev
