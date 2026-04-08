import { describe, it, expect } from "vitest";
import { parsePackageLock } from "../../src/lockfile-parsers/package-lock";

describe("parsePackageLock", () => {
  it("parses v3 format (packages object)", () => {
    const content = JSON.stringify({
      lockfileVersion: 3,
      packages: {
        "": { name: "my-project", version: "1.0.0" },
        "node_modules/lodash": { version: "4.17.21" },
        "node_modules/@types/node": { version: "20.11.0" },
        "node_modules/express/node_modules/debug": { version: "2.6.9" },
      },
    });

    const result = parsePackageLock(content);
    expect(result.get("lodash")).toBe("4.17.21");
    expect(result.get("@types/node")).toBe("20.11.0");
    expect(result.has("debug")).toBe(false);
  });

  it("parses v1 format (dependencies object)", () => {
    const content = JSON.stringify({
      lockfileVersion: 1,
      dependencies: {
        lodash: { version: "4.17.21" },
        express: { version: "4.18.2" },
      },
    });

    const result = parsePackageLock(content);
    expect(result.get("lodash")).toBe("4.17.21");
    expect(result.get("express")).toBe("4.18.2");
  });

  it("returns empty map for empty lockfile", () => {
    const content = JSON.stringify({ lockfileVersion: 3, packages: {} });
    const result = parsePackageLock(content);
    expect(result.size).toBe(0);
  });
});
