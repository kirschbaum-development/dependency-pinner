import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { updateNpmrc } from "../src/npmrc";

describe("updateNpmrc", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "dep-pinner-test-"));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("creates .npmrc with selected options when file does not exist", () => {
    updateNpmrc(tempDir, ["save-exact=true", "ignore-scripts=true"]);

    const content = readFileSync(join(tempDir, ".npmrc"), "utf-8");
    expect(content).toBe("save-exact=true\nignore-scripts=true\n");
  });

  it("appends missing options to existing .npmrc", () => {
    writeFileSync(join(tempDir, ".npmrc"), "save-exact=true\n");

    updateNpmrc(tempDir, ["save-exact=true", "ignore-scripts=true"]);

    const content = readFileSync(join(tempDir, ".npmrc"), "utf-8");
    expect(content).toBe("save-exact=true\nignore-scripts=true\n");
  });

  it("does not duplicate existing options", () => {
    writeFileSync(
      join(tempDir, ".npmrc"),
      "save-exact=true\nignore-scripts=true\n",
    );

    updateNpmrc(tempDir, ["save-exact=true", "ignore-scripts=true"]);

    const content = readFileSync(join(tempDir, ".npmrc"), "utf-8");
    expect(content).toBe("save-exact=true\nignore-scripts=true\n");
  });

  it("preserves existing content when adding new options", () => {
    writeFileSync(join(tempDir, ".npmrc"), "registry=https://custom.registry\n");

    updateNpmrc(tempDir, ["save-exact=true"]);

    const content = readFileSync(join(tempDir, ".npmrc"), "utf-8");
    expect(content).toBe(
      "registry=https://custom.registry\nsave-exact=true\n",
    );
  });

  it("does nothing when no options selected", () => {
    updateNpmrc(tempDir, []);

    const exists = existsSync(join(tempDir, ".npmrc"));
    expect(exists).toBe(false);
  });
});
