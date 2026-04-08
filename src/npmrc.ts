import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

export function updateNpmrc(dir: string, options: string[]): void {
  if (options.length === 0) return;

  const npmrcPath = join(dir, ".npmrc");
  let content = "";

  if (existsSync(npmrcPath)) {
    content = readFileSync(npmrcPath, "utf-8");
  }

  const existingKeys = new Set(
    content
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => l.split("=")[0].trim()),
  );

  const toAdd = options.filter((opt) => !existingKeys.has(opt.split("=")[0]));

  if (toAdd.length === 0) return;

  const newContent =
    content.trimEnd() + (content.trim() ? "\n" : "") + toAdd.join("\n") + "\n";
  writeFileSync(npmrcPath, newContent);
}
