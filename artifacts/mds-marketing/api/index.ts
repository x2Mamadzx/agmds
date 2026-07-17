// Vercel serverless entry point — imports the Express app directly from source.
// Vercel's @vercel/node runtime compiles the TypeScript and bundles all dependencies.
export { default } from '../../api-server/src/app';
