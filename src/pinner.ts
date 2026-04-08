import { readFileSync, writeFileSync } from "fs";
import type { PinChange, PinResult, SkippedPackage } from "./types";
import { isExactVersion, isSkippableConstraint } from "./utils";

export interface ComputePinChangesOptions {
  manifestPath: string;
  lockFileVersions: Map<string, string>;
  depTypes: string[];
}

export function computePinChanges(options: ComputePinChangesOptions): PinResult {
  const content = readFileSync(options.manifestPath, "utf-8");
  const manifest = JSON.parse(content);
  const changes: PinChange[] = [];
  const skipped: SkippedPackage[] = [];
  const alreadyPinned: string[] = [];

  for (const depType of options.depTypes) {
    const deps = manifest[depType] || {};
    for (const [name, constraint] of Object.entries(deps)) {
      const constraintStr = constraint as string;

      if (isExactVersion(constraintStr)) {
        alreadyPinned.push(name);
        continue;
      }

      if (isSkippableConstraint(constraintStr)) {
        skipped.push({ packageName: name, reason: "non-version constraint" });
        continue;
      }

      const resolvedVersion = options.lockFileVersions.get(name);
      if (!resolvedVersion) {
        skipped.push({ packageName: name, reason: "not found in lock file" });
        continue;
      }

      changes.push({
        packageName: name,
        depType,
        oldConstraint: constraintStr,
        newVersion: resolvedVersion,
      });
    }
  }

  return { changes, skipped, alreadyPinned };
}

function detectIndentation(content: string): number | string {
  const match = content.match(/\n([ \t]+)/);
  if (!match) return 2;
  if (match[1].includes("\t")) return "\t";
  return match[1].length;
}

export function applyPinChanges(
  manifestPath: string,
  changes: PinChange[],
): void {
  const content = readFileSync(manifestPath, "utf-8");
  const indent = detectIndentation(content);
  const manifest = JSON.parse(content);

  for (const change of changes) {
    if (manifest[change.depType]?.[change.packageName] !== undefined) {
      manifest[change.depType][change.packageName] = change.newVersion;
    }
  }

  writeFileSync(manifestPath, JSON.stringify(manifest, null, indent) + "\n");
}
