import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { computePinChanges, applyPinChanges } from "../src/pinner";

describe("computePinChanges", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "dep-pinner-test-"));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("computes changes for range constraints", () => {
    const manifestPath = join(tempDir, "package.json");
    writeFileSync(
      manifestPath,
      JSON.stringify({
        dependencies: {
          lodash: "^4.17.0",
          express: "~4.18.0",
        },
      }),
    );

    const lockVersions = new Map([
      ["lodash", "4.17.21"],
      ["express", "4.18.2"],
    ]);

    const result = computePinChanges({
      manifestPath,
      lockFileVersions: lockVersions,
      depTypes: ["dependencies"],
    });

    expect(result.changes).toEqual([
      {
        packageName: "lodash",
        depType: "dependencies",
        oldConstraint: "^4.17.0",
        newVersion: "4.17.21",
      },
      {
        packageName: "express",
        depType: "dependencies",
        oldConstraint: "~4.18.0",
        newVersion: "4.18.2",
      },
    ]);
    expect(result.alreadyPinned).toEqual([]);
    expect(result.skipped).toEqual([]);
  });

  it("skips already-pinned versions", () => {
    const manifestPath = join(tempDir, "package.json");
    writeFileSync(
      manifestPath,
      JSON.stringify({
        dependencies: {
          lodash: "4.17.21",
          express: "^4.18.0",
        },
      }),
    );

    const lockVersions = new Map([
      ["lodash", "4.17.21"],
      ["express", "4.18.2"],
    ]);

    const result = computePinChanges({
      manifestPath,
      lockFileVersions: lockVersions,
      depTypes: ["dependencies"],
    });

    expect(result.changes).toHaveLength(1);
    expect(result.changes[0].packageName).toBe("express");
    expect(result.alreadyPinned).toEqual(["lodash"]);
  });

  it("skips non-version constraints", () => {
    const manifestPath = join(tempDir, "package.json");
    writeFileSync(
      manifestPath,
      JSON.stringify({
        dependencies: {
          "local-pkg": "file:../local",
          "git-pkg": "github:user/repo",
          lodash: "^4.17.0",
        },
      }),
    );

    const lockVersions = new Map([["lodash", "4.17.21"]]);

    const result = computePinChanges({
      manifestPath,
      lockFileVersions: lockVersions,
      depTypes: ["dependencies"],
    });

    expect(result.changes).toHaveLength(1);
    expect(result.skipped).toHaveLength(2);
    expect(result.skipped[0].reason).toBe("non-version constraint");
  });

  it("warns when package not found in lock file", () => {
    const manifestPath = join(tempDir, "package.json");
    writeFileSync(
      manifestPath,
      JSON.stringify({
        dependencies: {
          lodash: "^4.17.0",
          missing: "^1.0.0",
        },
      }),
    );

    const lockVersions = new Map([["lodash", "4.17.21"]]);

    const result = computePinChanges({
      manifestPath,
      lockFileVersions: lockVersions,
      depTypes: ["dependencies"],
    });

    expect(result.changes).toHaveLength(1);
    expect(result.skipped).toEqual([
      { packageName: "missing", reason: "not found in lock file" },
    ]);
  });

  it("handles multiple dep types", () => {
    const manifestPath = join(tempDir, "package.json");
    writeFileSync(
      manifestPath,
      JSON.stringify({
        dependencies: { lodash: "^4.17.0" },
        devDependencies: { vitest: "^1.0.0" },
      }),
    );

    const lockVersions = new Map([
      ["lodash", "4.17.21"],
      ["vitest", "1.6.0"],
    ]);

    const result = computePinChanges({
      manifestPath,
      lockFileVersions: lockVersions,
      depTypes: ["dependencies", "devDependencies"],
    });

    expect(result.changes).toHaveLength(2);
    expect(result.changes[0].depType).toBe("dependencies");
    expect(result.changes[1].depType).toBe("devDependencies");
  });

  it("handles composer require and require-dev", () => {
    const manifestPath = join(tempDir, "composer.json");
    writeFileSync(
      manifestPath,
      JSON.stringify({
        require: {
          "php": "^8.2",
          "laravel/framework": "^11.0",
        },
        "require-dev": {
          "phpunit/phpunit": "^11.0",
        },
      }),
    );

    const lockVersions = new Map([
      ["laravel/framework", "11.44.2"],
      ["phpunit/phpunit", "11.5.3"],
    ]);

    const result = computePinChanges({
      manifestPath,
      lockFileVersions: lockVersions,
      depTypes: ["require", "require-dev"],
    });

    expect(result.changes).toHaveLength(2);
    expect(result.changes[0].packageName).toBe("laravel/framework");
    expect(result.changes[1].packageName).toBe("phpunit/phpunit");
    expect(result.skipped).toEqual([
      { packageName: "php", reason: "not found in lock file" },
    ]);
  });

  it("skips composer dev- branch constraints", () => {
    const manifestPath = join(tempDir, "composer.json");
    writeFileSync(
      manifestPath,
      JSON.stringify({
        require: {
          "some/package": "dev-main",
          "other/package": "^1.0",
        },
      }),
    );

    const lockVersions = new Map([["other/package", "1.5.0"]]);

    const result = computePinChanges({
      manifestPath,
      lockFileVersions: lockVersions,
      depTypes: ["require"],
    });

    expect(result.changes).toHaveLength(1);
    expect(result.skipped).toHaveLength(1);
    expect(result.skipped[0].packageName).toBe("some/package");
  });
});

describe("applyPinChanges", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "dep-pinner-test-"));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("writes exact versions to the manifest", () => {
    const manifestPath = join(tempDir, "package.json");
    writeFileSync(
      manifestPath,
      JSON.stringify(
        {
          dependencies: { lodash: "^4.17.0", express: "~4.18.0" },
          devDependencies: { vitest: "^1.0.0" },
        },
        null,
        2,
      ) + "\n",
    );

    applyPinChanges(manifestPath, [
      {
        packageName: "lodash",
        depType: "dependencies",
        oldConstraint: "^4.17.0",
        newVersion: "4.17.21",
      },
      {
        packageName: "express",
        depType: "dependencies",
        oldConstraint: "~4.18.0",
        newVersion: "4.18.2",
      },
      {
        packageName: "vitest",
        depType: "devDependencies",
        oldConstraint: "^1.0.0",
        newVersion: "1.6.0",
      },
    ]);

    const updated = JSON.parse(readFileSync(manifestPath, "utf-8"));
    expect(updated.dependencies.lodash).toBe("4.17.21");
    expect(updated.dependencies.express).toBe("4.18.2");
    expect(updated.devDependencies.vitest).toBe("1.6.0");
  });

  it("preserves original indentation", () => {
    const manifestPath = join(tempDir, "package.json");
    const original = JSON.stringify(
      { dependencies: { lodash: "^4.17.0" } },
      null,
      4,
    ) + "\n";
    writeFileSync(manifestPath, original);

    applyPinChanges(manifestPath, [
      {
        packageName: "lodash",
        depType: "dependencies",
        oldConstraint: "^4.17.0",
        newVersion: "4.17.21",
      },
    ]);

    const content = readFileSync(manifestPath, "utf-8");
    expect(content).toContain('    "lodash"');
  });
});
