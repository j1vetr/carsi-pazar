/**
 * Jest config — iki proje:
 *  1) utils  : pure TS unit testleri (ts-jest, node env, hızlı)
 *  2) components : React Native bileşen testleri (jest-expo + RNTL)
 */
module.exports = {
  projects: [
    {
      displayName: "utils",
      preset: "ts-jest",
      testEnvironment: "node",
      testMatch: ["<rootDir>/__tests__/**/*.test.ts"],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
      },
      transform: {
        "^.+\\.tsx?$": ["ts-jest", { tsconfig: { jsx: "react", esModuleInterop: true } }],
      },
    },
    {
      displayName: "components",
      preset: "jest-expo",
      testMatch: ["<rootDir>/__tests__/**/*.test.tsx"],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
      },
    },
  ],
};
