import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // 1. Console logs mogen tijdens development/testen, maar geef wel een seintje
      "no-console": "warn",

      // 2. TypeScript vangt 'undefined' variabelen al af. 
      // ESLint hoeft hier niet over te zeuren (dit fixt je localStorage/React errors)
      "no-undef": "off",

      // 3. De PRO regel: Ongebruikte vars zijn verboden, BEHALVE als ze beginnen met een _
      // Dit dwingt je om na te denken: "Heb ik dit nodig? Nee? Weggooien of _ gebruiken."
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ],
    },
  },
];

export default eslintConfig;