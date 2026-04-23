/**
 * Jest config — sadece pure utility (lib/utils/**) testleri için.
 * React Native bileşeni test etmiyoruz; bu yüzden jest-expo preset yerine
 * ts-jest ile node ortamında daha hızlı çalıştırıyoruz.
 */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["<rootDir>/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: { jsx: "react", esModuleInterop: true } }],
  },
};
