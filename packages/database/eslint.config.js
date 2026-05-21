import baseConfig from "@video-saas/config-eslint";

export default [
  {
    ignores: ["prisma.config.ts", "src/generated/**"],
  },
  ...baseConfig,
];
