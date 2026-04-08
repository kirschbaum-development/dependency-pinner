export function parseBunLock(content: string): Map<string, string> {
  const lockfile = JSON.parse(content);
  const versions = new Map<string, string>();

  const packages = lockfile.packages || {};
  for (const [name, entry] of Object.entries(packages)) {
    if (!Array.isArray(entry) || entry.length === 0) continue;

    const identifier = entry[0] as string;

    const atIndex = identifier.lastIndexOf("@");
    if (atIndex > 0) {
      versions.set(name, identifier.substring(atIndex + 1));
    }
  }

  return versions;
}
