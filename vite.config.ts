import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default ({ mode }: { mode: string }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    base: "/share-liked-songs/",
    resolve: {
      alias: {
        "@components": path.resolve(__dirname, "./src/components"),
        "@pages": path.resolve(__dirname, "./src/pages"),
        "@utils": path.resolve(__dirname, "./src/utils"),
        "@interfaces": path.resolve(__dirname, "./src/interfaces"),
        "@hooks": path.resolve(__dirname, "./src/hooks"),
      },
    },
    plugins: [react()],
    define: {
      BUILD_DATE: new Date().getFullYear(),
    },
  });
};
