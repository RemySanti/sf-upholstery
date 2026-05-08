const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const files = fs.readdirSync(root).filter((f) => f.endsWith(".html"));

const replacements = [
  [/Ã¢â‚¬”—/g, "—"],
  [/Ã¢â‚¬”/g, "—"],
  [/Ã¢â‚¬“/g, "–"],
  [/Ã‚·/g, "·"],
  [/Ã‚©/g, "©"],
  [/Ã—/g, "×"],
  [/Ã¢â‚¬Å“/g, "“"],
  [/Ã¢â‚¬/g, "”"],
  [/Ã¢â‚¬Ëœ/g, "‘"],
  [/Ã¢â‚¬â„¢/g, "’"],
  [/Ã¢¬¡/g, "⬡"],
  [/Ã¢—Ë†/g, "◈"],
  [/Ã¢—â€¡/g, "◇"],
  [/Ã¢¬—/g, "⬗"],
  [/Ã¢Å“¦/g, "✦"],
  [/Ã¢â€ —/g, "↗"],
  [/â€”/g, "—"],
  [/â€“/g, "–"],
  [/Â·/g, "·"],
  [/Â©/g, "©"],
  [/Â/g, ""],
  [/â€œ/g, "“"],
  [/â€/g, "”"],
  [/â€˜/g, "‘"],
  [/â€™/g, "’"],
  [/â€¦/g, "…"],
  [/Ã¢â€ â€”/g, "↗"],
  [/Ã¢Â¬Â¡/g, "⬡"],
  [/Ã¢â€”Ë†/g, "◈"],
  [/Ã¢â€”â€¡/g, "◇"],
  [/Ã¢Â¬â€”/g, "⬗"],
  [/Ã¢Å“Â¦/g, "✦"],
];

for (const name of files) {
  const filePath = path.join(root, name);
  let content = fs.readFileSync(filePath, "utf8");
  for (const [pattern, value] of replacements) {
    content = content.replace(pattern, value);
  }
  fs.writeFileSync(filePath, content, "utf8");
}

console.log(`Normalized ${files.length} HTML files.`);
