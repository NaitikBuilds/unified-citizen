/**
 * Joins class names, dropping falsy values.
 * Kept intentionally tiny — no extra dependency needed.
 */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(' ')
}
