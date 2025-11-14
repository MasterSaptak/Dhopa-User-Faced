import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig(async () => {
  const { default: react } = await import("@vitejs/plugin-react")

  return {
    plugins: [react()],
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./__tests__/setup.ts"],
      include: ["__tests__/**/*.{test,spec}.{ts,tsx}"],
      exclude: ["**/__tests__/e2e/**", "**/*.e2e.{ts,tsx}", "node_modules/**"],
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./"),
      },
    },
  }
})
