import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
// apps/api/src -> apps/api -> apps -> repo root
const repoRoot = path.resolve(currentDir, "..", "..", "..");

// Load the app-level .env first, then the repo-root .env. dotenv never
// overrides variables already present in process.env, so app-level values
// win and root-level values (DATABASE_URL, JWT secrets, ...) fill the rest.
// This keeps the API working no matter which directory it is started from.
dotenv.config({ path: path.join(repoRoot, "apps", "api", ".env") });
dotenv.config({ path: path.join(repoRoot, ".env") });
