const AVATAR_COLORS = [
  'bg-red-600',
  'bg-orange-600',
  'bg-amber-600',
  'bg-yellow-600',
  'bg-lime-600',
  'bg-green-600',
  'bg-emerald-600',
  'bg-teal-600',
  'bg-cyan-600',
  'bg-sky-600',
  'bg-blue-600',
  'bg-indigo-600',
  'bg-violet-600',
  'bg-purple-600',
  'bg-fuchsia-600',
  'bg-pink-600',
  'bg-rose-600',
]

export function avatarColor(name: string | null | undefined): string {
  const char = (name && name.length > 0) ? name[0].toUpperCase() : '?'
  const code = char.charCodeAt(0)
  return AVATAR_COLORS[code % AVATAR_COLORS.length]
}
