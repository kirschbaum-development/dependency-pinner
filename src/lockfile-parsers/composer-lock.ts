export function parseComposerLock(content: string): Map<string, string> {
  const lockfile = JSON.parse(content);
  const versions = new Map<string, string>();

  for (const pkg of lockfile.packages || []) {
    if (pkg.name && pkg.version) {
      versions.set(pkg.name, pkg.version.replace(/^v/, ""));
    }
  }

  for (const pkg of lockfile["packages-dev"] || []) {
    if (pkg.name && pkg.version) {
      versions.set(pkg.name, pkg.version.replace(/^v/, ""));
    }
  }

  return versions;
}
