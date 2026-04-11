# M20R1 Landing Page

A polished single-page React and Vite landing page for M20R1's infrastructure and governance story.

## What changed

- Replaced leftover Vite starter copy with a custom brand narrative and stronger visual hierarchy.
- Moved the presentation into a responsive CSS system with a clearer design language.
- Added a working inquiry prototype that validates fields and copies a structured brief to the clipboard.
- Improved accessibility with semantic sections, visible focus states, and reduced-motion support.

## Scripts

- `npm run dev` starts the local Vite dev server.
- `npm run build` creates the production bundle.
- `npm run lint` checks the React source with ESLint.

## Next production step

The contact form is intentionally front-end only right now. To make it live, connect the submit handler in [`src/App.jsx`](./src/App.jsx) to Formspree, Resend, a serverless function, or your own backend route.
