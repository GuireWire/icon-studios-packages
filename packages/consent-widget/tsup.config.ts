import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  external: ["react", "react-dom", "next", "@c15t/nextjs"],
  // Every entry file in this package is a client component — tsup doesn't
  // preserve "use client" directives from source on its own, so re-add it
  // to the compiled output instead of hoping esbuild keeps it.
  banner: {
    js: '"use client";',
  },
});
