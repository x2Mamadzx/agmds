// Vercel serverless entry point — wraps the Express app.
// Built by esbuild into a self-contained bundle (no workspace imports at runtime).
export { default } from '../artifacts/api-server/dist/app.mjs';
