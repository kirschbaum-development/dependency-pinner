export function isExactVersion(constraint: string): boolean {
  if (!constraint || constraint === "latest") return false;
  if (/[\^~>=<*|]/.test(constraint)) return false;
  if (constraint.includes(" ") || constraint.includes(",")) return false;
  if (/\d+\.x/i.test(constraint)) return false;
  return /^\d+(\.\d+)*(-[\w.+]+)?$/.test(constraint);
}

export function isSkippableConstraint(constraint: string): boolean {
  if (
    /^(github:|git[+:]|git:\/\/|https?:|file:|link:|workspace:|npm:)/.test(
      constraint,
    )
  )
    return true;
  if (/^dev-/.test(constraint)) return true;
  return false;
}
