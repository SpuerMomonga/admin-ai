import type { AdminPanel, AdminTabsState } from './shared/types'
import { writable } from 'svelte/store'
import { defaultAdminPath, normalizeAdminPath, normalizeAdminPathList, orderAdminPaths, resolveAdminPanelFromPathname } from './shared/admin-paths'
import { persistState, readStoredState, storageKeys } from './shared/storage'
import { updateTasksState } from './tasks'

export { buildWorkspacePath, orderAdminPaths, resolveAdminPanelFromPathname, resolveAdminPathFromPathname } from './shared/admin-paths'
export type { AdminPanel } from './shared/types'

function normalizeAdminTabsState(input: unknown): AdminTabsState {
  const payload = input as Partial<AdminTabsState>
  const visitedAdminPaths = normalizeAdminPathList(payload.visitedAdminPaths, [defaultAdminPath])
  const activeAdminPath = visitedAdminPaths.includes(normalizeAdminPath(payload.activeAdminPath))
    ? normalizeAdminPath(payload.activeAdminPath)
    : visitedAdminPaths[0] ?? defaultAdminPath
  const pinnedAdminPaths = normalizeAdminPathList(payload.pinnedAdminPaths, [defaultAdminPath])
    .filter(path => visitedAdminPaths.includes(path))
  const adminSplitPath = payload.adminSplitPath
    ? normalizeAdminPath(payload.adminSplitPath)
    : null
  const adminMaximizedPath = payload.adminMaximizedPath
    ? normalizeAdminPath(payload.adminMaximizedPath)
    : null

  return {
    activeAdminPath,
    visitedAdminPaths: Array.from(new Set([...visitedAdminPaths, activeAdminPath])),
    pinnedAdminPaths: Array.from(new Set(pinnedAdminPaths)),
    adminMaximizedPath: adminMaximizedPath && visitedAdminPaths.includes(adminMaximizedPath) ? adminMaximizedPath : null,
    adminSplitPath: adminSplitPath && visitedAdminPaths.includes(adminSplitPath) && adminSplitPath !== activeAdminPath ? adminSplitPath : null,
  }
}

const initialState = readStoredState<AdminTabsState>(
  storageKeys.adminTabs,
  {
    activeAdminPath: defaultAdminPath,
    visitedAdminPaths: [defaultAdminPath],
    pinnedAdminPaths: [defaultAdminPath],
    adminMaximizedPath: null,
    adminSplitPath: null,
  },
  normalizeAdminTabsState,
)

const store = writable<AdminTabsState>(initialState)

store.subscribe((value) => {
  persistState(storageKeys.adminTabs, value)
})

function createAdminTabsPatch(
  state: AdminTabsState,
  {
    visitedAdminPaths,
    activeAdminPath,
    pinnedAdminPaths = state.pinnedAdminPaths,
    adminSplitPath = state.adminSplitPath,
    adminMaximizedPath = state.adminMaximizedPath,
  }: {
    visitedAdminPaths: string[]
    activeAdminPath: string
    pinnedAdminPaths?: string[]
    adminSplitPath?: string | null
    adminMaximizedPath?: string | null
  },
) {
  const dedupedVisitedAdminPaths = Array.from(new Set(visitedAdminPaths.map(normalizeAdminPath)))
  const nextActiveAdminPath = dedupedVisitedAdminPaths.includes(activeAdminPath)
    ? activeAdminPath
    : dedupedVisitedAdminPaths[0] ?? defaultAdminPath
  const nextPinnedAdminPaths = Array.from(new Set(pinnedAdminPaths))
    .filter(path => dedupedVisitedAdminPaths.includes(path))

  return {
    activeAdminPath: nextActiveAdminPath,
    visitedAdminPaths: dedupedVisitedAdminPaths,
    pinnedAdminPaths: nextPinnedAdminPaths,
    adminSplitPath: adminSplitPath && dedupedVisitedAdminPaths.includes(adminSplitPath) && adminSplitPath !== nextActiveAdminPath
      ? adminSplitPath
      : null,
    adminMaximizedPath: adminMaximizedPath && dedupedVisitedAdminPaths.includes(adminMaximizedPath)
      ? adminMaximizedPath
      : null,
  } satisfies AdminTabsState
}

export const adminTabsStore = store

export function activateRoute(taskId: string, adminPath: string | AdminPanel) {
  const nextAdminPath = normalizeAdminPath(adminPath)

  updateTasksState(state => ({
    ...state,
    activeTaskId: state.tasks.some(task => task.id === taskId) ? taskId : state.activeTaskId,
  }))

  store.update(state => createAdminTabsPatch(state, {
    activeAdminPath: nextAdminPath,
    visitedAdminPaths: state.visitedAdminPaths.includes(nextAdminPath)
      ? state.visitedAdminPaths
      : [...state.visitedAdminPaths, nextAdminPath],
  }))
}

export function openAdminPath(path: string | AdminPanel, options: { activate?: boolean } = {}) {
  const nextAdminPath = normalizeAdminPath(path)
  const shouldActivate = options.activate !== false

  store.update((state) => {
    const nextVisitedAdminPaths = state.visitedAdminPaths.includes(nextAdminPath)
      ? state.visitedAdminPaths
      : [...state.visitedAdminPaths, nextAdminPath]
    const isSwappingWithSplitPath = shouldActivate && state.adminSplitPath === nextAdminPath && state.activeAdminPath !== nextAdminPath

    return createAdminTabsPatch(state, {
      activeAdminPath: shouldActivate ? nextAdminPath : state.activeAdminPath,
      visitedAdminPaths: nextVisitedAdminPaths,
      adminSplitPath: isSwappingWithSplitPath ? state.activeAdminPath : state.adminSplitPath,
    })
  })
}

export function closeAdminPath(path: string | AdminPanel) {
  const targetPath = normalizeAdminPath(path)
  const snapshot = getAdminTabsSnapshot()

  if (snapshot.pinnedAdminPaths.includes(targetPath)) {
    return snapshot.activeAdminPath
  }

  let fallbackPath = snapshot.activeAdminPath

  store.update((state) => {
    const orderedPaths = orderAdminPaths(state.visitedAdminPaths, state.pinnedAdminPaths)
    const targetIndex = orderedPaths.indexOf(targetPath)
    const remainingVisitedAdminPaths = state.visitedAdminPaths.filter(path => path !== targetPath)
    const nextVisitedAdminPaths = remainingVisitedAdminPaths.length > 0 ? remainingVisitedAdminPaths : [defaultAdminPath]

    fallbackPath = state.activeAdminPath === targetPath
      ? nextVisitedAdminPaths[Math.max(targetIndex - 1, 0)] ?? nextVisitedAdminPaths[0] ?? defaultAdminPath
      : state.activeAdminPath

    if (!nextVisitedAdminPaths.includes(fallbackPath)) {
      fallbackPath = nextVisitedAdminPaths[0] ?? defaultAdminPath
    }

    return createAdminTabsPatch(state, {
      activeAdminPath: fallbackPath,
      visitedAdminPaths: nextVisitedAdminPaths,
      pinnedAdminPaths: state.pinnedAdminPaths.filter(path => path !== targetPath),
      adminSplitPath: state.adminSplitPath === targetPath ? null : state.adminSplitPath,
      adminMaximizedPath: state.adminMaximizedPath === targetPath ? null : state.adminMaximizedPath,
    })
  })

  return fallbackPath
}

export function pinAdminPath(path: string | AdminPanel) {
  const targetPath = normalizeAdminPath(path)

  store.update(state => createAdminTabsPatch(state, {
    activeAdminPath: state.activeAdminPath,
    visitedAdminPaths: state.visitedAdminPaths.includes(targetPath)
      ? state.visitedAdminPaths
      : [...state.visitedAdminPaths, targetPath],
    pinnedAdminPaths: Array.from(new Set([...state.pinnedAdminPaths, targetPath])),
  }))
}

export function unpinAdminPath(path: string | AdminPanel) {
  const targetPath = normalizeAdminPath(path)

  store.update(state => createAdminTabsPatch(state, {
    activeAdminPath: state.activeAdminPath,
    visitedAdminPaths: state.visitedAdminPaths,
    pinnedAdminPaths: state.pinnedAdminPaths.filter(path => path !== targetPath),
  }))
}

export function closeAdminPathsByDirection(path: string | AdminPanel, direction: 'left' | 'right') {
  const targetPath = normalizeAdminPath(path)

  store.update((state) => {
    const orderedPaths = orderAdminPaths(state.visitedAdminPaths, state.pinnedAdminPaths)
    const targetIndex = orderedPaths.indexOf(targetPath)

    if (targetIndex === -1) {
      return state
    }

    const nextVisitedAdminPaths = orderedPaths.filter((adminPath, index) => {
      if (state.pinnedAdminPaths.includes(adminPath)) {
        return true
      }

      return direction === 'left' ? index >= targetIndex : index <= targetIndex
    })

    const nextActiveAdminPath = nextVisitedAdminPaths.includes(state.activeAdminPath) ? state.activeAdminPath : targetPath

    return createAdminTabsPatch(state, {
      activeAdminPath: nextActiveAdminPath,
      visitedAdminPaths: nextVisitedAdminPaths,
    })
  })
}

export function closeOtherAdminPaths(path: string | AdminPanel) {
  const targetPath = normalizeAdminPath(path)

  store.update(state => createAdminTabsPatch(state, {
    activeAdminPath: targetPath,
    visitedAdminPaths: Array.from(new Set([...state.pinnedAdminPaths, targetPath])),
  }))
}

export function reorderAdminPaths(sourcePath: string | AdminPanel, targetPath: string | AdminPanel) {
  const source = normalizeAdminPath(sourcePath)
  const target = normalizeAdminPath(targetPath)

  if (source === target) {
    return
  }

  store.update((state) => {
    const orderedPaths = orderAdminPaths(state.visitedAdminPaths, state.pinnedAdminPaths)
    const sourceIndex = orderedPaths.indexOf(source)
    const targetIndex = orderedPaths.indexOf(target)

    if (sourceIndex === -1 || targetIndex === -1) {
      return state
    }

    const nextOrderedPaths = [...orderedPaths]
    const [movedPath] = nextOrderedPaths.splice(sourceIndex, 1)

    if (!movedPath) {
      return state
    }

    nextOrderedPaths.splice(targetIndex, 0, movedPath)

    return createAdminTabsPatch(state, {
      activeAdminPath: state.activeAdminPath,
      visitedAdminPaths: nextOrderedPaths,
    })
  })
}

export function maximizeAdminPath(path: string | AdminPanel) {
  const targetPath = normalizeAdminPath(path)
  openAdminPath(targetPath)

  store.update(state => ({
    ...state,
    adminMaximizedPath: targetPath,
    adminSplitPath: state.adminSplitPath === targetPath ? null : state.adminSplitPath,
  }))
}

export function restoreAdminPath() {
  store.update(state => ({ ...state, adminMaximizedPath: null }))
}

export function splitAdminPath(path: string | AdminPanel) {
  const targetPath = normalizeAdminPath(path)
  const snapshot = getAdminTabsSnapshot()
  const secondaryPath = targetPath === snapshot.activeAdminPath
    ? snapshot.visitedAdminPaths.find(path => path !== snapshot.activeAdminPath) ?? null
    : targetPath

  if (!secondaryPath) {
    return false
  }

  openAdminPath(secondaryPath, { activate: false })

  store.update(state => ({
    ...state,
    adminSplitPath: secondaryPath === state.activeAdminPath ? null : secondaryPath,
    adminMaximizedPath: null,
  }))

  return true
}

export function closeAdminSplit() {
  store.update(state => ({ ...state, adminSplitPath: null }))
}

export function swapAdminSplit() {
  const snapshot = getAdminTabsSnapshot()

  if (!snapshot.adminSplitPath) {
    return
  }

  store.update((state) => {
    if (!state.adminSplitPath) {
      return state
    }

    return createAdminTabsPatch(state, {
      activeAdminPath: state.adminSplitPath,
      visitedAdminPaths: state.visitedAdminPaths,
      adminSplitPath: state.activeAdminPath,
    })
  })
}

export function getAdminTabsSnapshot() {
  let snapshot = initialState
  store.subscribe(value => snapshot = value)()
  return {
    ...snapshot,
    activePanel: resolveAdminPanelFromPathname(snapshot.activeAdminPath) ?? 'general',
  }
}
