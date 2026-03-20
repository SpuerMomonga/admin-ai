import type { AdminPanel } from './types'

export const adminPanels = ['general', 'preferences', 'account', 'models', 'knowledge', 'rules'] as const satisfies ReadonlyArray<AdminPanel>
export const defaultAdminPath = '/general'

export function isAdminPanel(value: string): value is AdminPanel {
  return adminPanels.includes(value as AdminPanel)
}

export function resolveAdminPanelFromPathname(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const maybePanel = segments[0]

  return maybePanel && isAdminPanel(maybePanel) ? maybePanel : null
}

export function resolveAdminPathFromPathname(pathname: string) {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`
  return resolveAdminPanelFromPathname(normalized) ? normalized : null
}

export function normalizeAdminPath(path: string | AdminPanel | null | undefined) {
  if (!path) {
    return defaultAdminPath
  }

  const normalized = path.startsWith('/') ? path : `/${path}`
  return resolveAdminPanelFromPathname(normalized) ? normalized : defaultAdminPath
}

export function normalizeAdminPathList(paths: Array<string | AdminPanel> | undefined, fallback: string[]) {
  if (!Array.isArray(paths)) {
    return fallback
  }

  const normalized = paths
    .map((path) => {
      if (!path) {
        return null
      }

      const nextPath = path.startsWith('/') ? path : `/${path}`
      return resolveAdminPanelFromPathname(nextPath) ? nextPath : null
    })
    .filter((path): path is string => Boolean(path))

  return normalized.length > 0 ? Array.from(new Set(normalized)) : fallback
}

export function orderAdminPaths(visitedAdminPaths: string[], pinnedAdminPaths: string[]) {
  const pinned = pinnedAdminPaths.filter(path => visitedAdminPaths.includes(path))
  const regular = visitedAdminPaths.filter(path => !pinned.includes(path))

  return [...pinned, ...regular]
}

export function buildWorkspacePath(taskId: string | null | undefined, adminPath: string | AdminPanel) {
  const nextAdminPath = normalizeAdminPath(adminPath)

  if (!taskId) {
    return nextAdminPath
  }

  const searchParams = new URLSearchParams({ taskId })
  return `${nextAdminPath}?${searchParams.toString()}`
}
