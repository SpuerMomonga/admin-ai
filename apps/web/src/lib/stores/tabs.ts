import type { AdminPanel, TabsState } from '$lib/types/app'
import {
  defaultAdminPath,
  normalizeAdminPath,
  normalizeAdminPathList,
  orderAdminPaths,
  resolveAdminPanelFromPathname,
} from '$lib/admin/paths'
import { updateTasksState } from '$lib/stores/tasks'
import { persistState, readStoredState, storageKeys } from '$lib/utils/storage'
import { writable } from 'svelte/store'

export {
  buildWorkspacePath,
  orderAdminPaths,
  resolveAdminPanelFromPathname,
  resolveAdminPathFromPathname,
} from '$lib/admin/paths'
export type { AdminPanel } from '$lib/types/app'

function normalizeTabsState(input: unknown): TabsState {
  const payload = input as Partial<TabsState>
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

const initialState = readStoredState<TabsState>(
  storageKeys.tabs,
  {
    activeAdminPath: defaultAdminPath,
    visitedAdminPaths: [defaultAdminPath],
    pinnedAdminPaths: [defaultAdminPath],
    adminMaximizedPath: null,
    adminSplitPath: null,
  },
  normalizeTabsState,
)

const store = writable<TabsState>(initialState)

store.subscribe((value) => {
  persistState(storageKeys.tabs, value)
})

function createTabsPatch(
  state: TabsState,
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
  } satisfies TabsState
}

export const tabsStore = store

export function activateRoute(taskId: string, adminPath: string | AdminPanel) {
  const nextAdminPath = normalizeAdminPath(adminPath)

  updateTasksState(state => ({
    ...state,
    activeTaskId: state.tasks.some(task => task.id === taskId) ? taskId : state.activeTaskId,
  }))

  store.update(state => createTabsPatch(state, {
    activeAdminPath: nextAdminPath,
    visitedAdminPaths: state.visitedAdminPaths.includes(nextAdminPath)
      ? state.visitedAdminPaths
      : [...state.visitedAdminPaths, nextAdminPath],
  }))
}

export function openTab(path: string | AdminPanel, options: { activate?: boolean } = {}) {
  const nextAdminPath = normalizeAdminPath(path)
  const shouldActivate = options.activate !== false

  store.update((state) => {
    const nextVisitedAdminPaths = state.visitedAdminPaths.includes(nextAdminPath)
      ? state.visitedAdminPaths
      : [...state.visitedAdminPaths, nextAdminPath]
    const isSwappingWithSplitPath = shouldActivate && state.adminSplitPath === nextAdminPath && state.activeAdminPath !== nextAdminPath

    return createTabsPatch(state, {
      activeAdminPath: shouldActivate ? nextAdminPath : state.activeAdminPath,
      visitedAdminPaths: nextVisitedAdminPaths,
      adminSplitPath: isSwappingWithSplitPath ? state.activeAdminPath : state.adminSplitPath,
    })
  })
}

export function closeTab(path: string | AdminPanel) {
  const targetPath = normalizeAdminPath(path)
  const snapshot = getTabsSnapshot()

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

    return createTabsPatch(state, {
      activeAdminPath: fallbackPath,
      visitedAdminPaths: nextVisitedAdminPaths,
      pinnedAdminPaths: state.pinnedAdminPaths.filter(path => path !== targetPath),
      adminSplitPath: state.adminSplitPath === targetPath ? null : state.adminSplitPath,
      adminMaximizedPath: state.adminMaximizedPath === targetPath ? null : state.adminMaximizedPath,
    })
  })

  return fallbackPath
}

export function pinTab(path: string | AdminPanel) {
  const targetPath = normalizeAdminPath(path)

  store.update(state => createTabsPatch(state, {
    activeAdminPath: state.activeAdminPath,
    visitedAdminPaths: state.visitedAdminPaths.includes(targetPath)
      ? state.visitedAdminPaths
      : [...state.visitedAdminPaths, targetPath],
    pinnedAdminPaths: Array.from(new Set([...state.pinnedAdminPaths, targetPath])),
  }))
}

export function unpinTab(path: string | AdminPanel) {
  const targetPath = normalizeAdminPath(path)

  store.update(state => createTabsPatch(state, {
    activeAdminPath: state.activeAdminPath,
    visitedAdminPaths: state.visitedAdminPaths,
    pinnedAdminPaths: state.pinnedAdminPaths.filter(path => path !== targetPath),
  }))
}

export function closeTabsByDirection(path: string | AdminPanel, direction: 'left' | 'right') {
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

    return createTabsPatch(state, {
      activeAdminPath: nextActiveAdminPath,
      visitedAdminPaths: nextVisitedAdminPaths,
    })
  })
}

export function closeOtherTabs(path: string | AdminPanel) {
  const targetPath = normalizeAdminPath(path)

  store.update(state => createTabsPatch(state, {
    activeAdminPath: targetPath,
    visitedAdminPaths: Array.from(new Set([...state.pinnedAdminPaths, targetPath])),
  }))
}

export function reorderTabs(sourcePath: string | AdminPanel, targetPath: string | AdminPanel) {
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

    return createTabsPatch(state, {
      activeAdminPath: state.activeAdminPath,
      visitedAdminPaths: nextOrderedPaths,
    })
  })
}

export function maximizeTab(path: string | AdminPanel) {
  const targetPath = normalizeAdminPath(path)
  openTab(targetPath)

  store.update(state => ({
    ...state,
    adminMaximizedPath: targetPath,
    adminSplitPath: state.adminSplitPath === targetPath ? null : state.adminSplitPath,
  }))
}

export function restoreTab() {
  store.update(state => ({ ...state, adminMaximizedPath: null }))
}

export function splitTab(path: string | AdminPanel) {
  const targetPath = normalizeAdminPath(path)
  const snapshot = getTabsSnapshot()
  const secondaryPath = targetPath === snapshot.activeAdminPath
    ? snapshot.visitedAdminPaths.find(path => path !== snapshot.activeAdminPath) ?? null
    : targetPath

  if (!secondaryPath) {
    return false
  }

  openTab(secondaryPath, { activate: false })

  store.update(state => ({
    ...state,
    adminSplitPath: secondaryPath === state.activeAdminPath ? null : secondaryPath,
    adminMaximizedPath: null,
  }))

  return true
}

export function closeSplitTab() {
  store.update(state => ({ ...state, adminSplitPath: null }))
}

export function swapSplitTab() {
  const snapshot = getTabsSnapshot()

  if (!snapshot.adminSplitPath) {
    return
  }

  store.update((state) => {
    if (!state.adminSplitPath) {
      return state
    }

    return createTabsPatch(state, {
      activeAdminPath: state.adminSplitPath,
      visitedAdminPaths: state.visitedAdminPaths,
      adminSplitPath: state.activeAdminPath,
    })
  })
}

export function getTabsSnapshot() {
  let snapshot = initialState
  store.subscribe(value => snapshot = value)()
  return {
    ...snapshot,
    activePanel: resolveAdminPanelFromPathname(snapshot.activeAdminPath) ?? 'general',
  }
}
