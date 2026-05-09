import fs from "fs";
import path from "path";

const ROOT_DIR = "./src";
const OUTPUT_FILE = "./all_code.txt";

const ALLOWED_EXTENSIONS = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".css",
];

const IGNORE_FOLDERS = [
  "node_modules",
  ".git",
  "dist",
  "build",
];

function shouldIgnore(filePath) {
  return IGNORE_FOLDERS.some(folder =>
    filePath.includes(folder)
  );
}

function isAllowedFile(filePath) {
  return ALLOWED_EXTENSIONS.includes(
    path.extname(filePath)
  );
}

function readFilesRecursively(dir, outputStream) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);

    if (shouldIgnore(fullPath)) continue;

    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      readFilesRecursively(fullPath, outputStream);
    } else if (isAllowedFile(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf-8");

      outputStream.write(
        `\n\n========================================\n`
      );

      outputStream.write(`FILE: ${fullPath}\n`);

      outputStream.write(
        `========================================\n\n`
      );

      outputStream.write(content);
    }
  }
}

function main() {
  const outputStream = fs.createWriteStream(OUTPUT_FILE);

  readFilesRecursively(ROOT_DIR, outputStream);

  outputStream.end();

  console.log(`✅ Exported codebase to ${OUTPUT_FILE}`);
}

main();