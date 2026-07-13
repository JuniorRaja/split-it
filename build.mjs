// Compile app.jsx -> app.js (classic JSX transform, no runtime Babel).
// Usage: npm install && node build.mjs
import { readFileSync, writeFileSync } from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const Babel = require("@babel/standalone");

const src = readFileSync(new URL("./app.jsx", import.meta.url), "utf8");
const out = Babel.transform(src, {
  presets: [["react", { runtime: "classic" }]],
  comments: false,
}).code;
writeFileSync(new URL("./app.js", import.meta.url), "/* Generated from app.jsx — do not edit. Run: node build.mjs */\n" + out);
console.log(`built app.js (${(out.length / 1024).toFixed(1)} KB)`);
console.log("Remember to bump the ?v= query on app.js in index.html when deploying changes.");
