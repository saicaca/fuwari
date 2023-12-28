export function pathsEqual(path1: string, path2: string) {
  const normalizedPath1 = path1.replace(/^\/|\/$/g, '').toLowerCase()
  const normalizedPath2 = path2.replace(/^\/|\/$/g, '').toLowerCase()
  return normalizedPath1 === normalizedPath2
}

function joinUrl(...parts: string[]): string {
  const joined = parts.join('/')
  return joined.replace(/([^:]\/)\/+/g, '$1')
}

export function getPostUrlBySlug(slug: string): string | null {
  if (!slug) return null
  return `/posts/${slug}`
}

export function getCategoryUrl(category: string): string | null {
  if (!category) return null
  return `/archive/category/${category}`
}

export function getDir(path: string): string {
    const lastSlashIndex = path.lastIndexOf('/')
    if (lastSlashIndex < 0) {
        return '/'
    }
    return path.substring(0, lastSlashIndex + 1)
}