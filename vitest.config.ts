import { defineConfig } from "vitest/config"
import path from "path"
import { fileURLToPath } from "url"

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: rootDir,
  cacheDir: path.resolve(rootDir, "node_modules/.vitest"),
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": rootDir,
    },
  },
})
