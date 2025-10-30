export function slugify(input: string) {
  return input
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace with -
    .replace(/-+/g, '-'); // collapse dashes
}