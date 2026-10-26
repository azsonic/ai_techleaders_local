/** Up to two capital letters from a display name, for an avatar with no image. "Anna Kowalska" gives "AK". */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return "?"
  const letters = words.length === 1 ? [...words[0]].slice(0, 2) : [words[0][0], words[words.length - 1][0]]
  return letters.join("").toUpperCase()
}
