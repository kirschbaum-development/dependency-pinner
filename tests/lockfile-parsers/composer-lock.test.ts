import { describe, it, expect } from "vitest";
import { parseComposerLock } from "../../src/lockfile-parsers/composer-lock";

describe("parseComposerLock", () => {
  it("parses packages and packages-dev", () => {
    const content = JSON.stringify({
      packages: [
        { name: "laravel/framework", version: "v11.44.2" },
        { name: "guzzlehttp/guzzle", version: "7.8.1" },
      ],
      "packages-dev": [
        { name: "phpunit/phpunit", version: "v11.5.3" },
      ],
    });

    const result = parseComposerLock(content);
    expect(result.get("laravel/framework")).toBe("11.44.2");
    expect(result.get("guzzlehttp/guzzle")).toBe("7.8.1");
    expect(result.get("phpunit/phpunit")).toBe("11.5.3");
  });

  it("strips v prefix from versions", () => {
    const content = JSON.stringify({
      packages: [{ name: "some/package", version: "v2.0.0" }],
      "packages-dev": [],
    });

    const result = parseComposerLock(content);
    expect(result.get("some/package")).toBe("2.0.0");
  });

  it("returns empty map for empty lockfile", () => {
    const content = JSON.stringify({ packages: [], "packages-dev": [] });
    const result = parseComposerLock(content);
    expect(result.size).toBe(0);
  });
});
