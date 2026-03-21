import type { ColumnWidths, NavigationState } from './shared/types'
import { writable } from 'svelte/store'
import { persistState, readStoredState, storageKeys } from './shared/storage'

export type { ColumnWidths } from './shared/types'

const minDesktopLeftWidth = 180
const maxDesktopLeftWidth = 420
const minDesktopRightWidth = 280
const maxDesktopRightWidth = 1600

function clampWidth(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function normalizeCollapsedPanels(leftCollapsed: boolean, rightCollapsed: boolean) {
  if (leftCollapsed && rightCollapsed) {
    return {
      leftCollapsed: false,
      rightCollapsed: false,
    }
  }

  return {
    leftCollapsed,
    rightCollapsed,
  }
}

function normalizeNavigationState(input: unknown): NavigationState {
  const payload = input as Partial<NavigationState>
  const collapsedPanels = normalizeCollapsedPanels(Boolean(payload.leftCollapsed), Boolean(payload.rightCollapsed))

  return {
    leftCollapsed: collapsedPanels.leftCollapsed,
    rightCollapsed: collapsedPanels.rightCollapsed,
    adminSidebarCollapsed: Boolean(payload.adminSidebarCollapsed),
    columnWidths: {
      left: typeof payload.columnWidths?.left === 'number'
        ? clampWidth(payload.columnWidths.left, minDesktopLeftWidth, maxDesktopLeftWidth)
        : 220,
      right: typeof payload.columnWidths?.right === 'number'
        ? clampWidth(payload.columnWidths.right, minDesktopRightWidth, maxDesktopRightWidth)
        : 720,
    },
  }
}

const initialState = readStoredState<NavigationState>(
  storageKeys.navigation,
  {
    leftCollapsed: false,
    rightCollapsed: false,
    adminSidebarCollapsed: false,
    columnWidths: {
      left: 220,
      right: 720,
    },
  },
  normalizeNavigationState,
)

const store = writable<NavigationState>(initialState)

store.subscribe((value) => {
  persistState(storageKeys.navigation, value)
})

export const navigationStore = store

export function toggleLeftCollapsed() {
  store.update((state) => {
    const collapsedPanels = normalizeCollapsedPanels(!state.leftCollapsed, state.rightCollapsed)
    return {
      ...state,
      leftCollapsed: collapsedPanels.leftCollapsed,
      rightCollapsed: collapsedPanels.rightCollapsed,
    }
  })
}

export function toggleRightCollapsed() {
  store.update((state) => {
    const collapsedPanels = normalizeCollapsedPanels(state.leftCollapsed, !state.rightCollapsed)
    return {
      ...state,
      leftCollapsed: collapsedPanels.leftCollapsed,
      rightCollapsed: collapsedPanels.rightCollapsed,
    }
  })
}

export function toggleAdminSidebarCollapsed() {
  store.update(state => ({
    ...state,
    adminSidebarCollapsed: !state.adminSidebarCollapsed,
  }))
}

export function setLeftCollapsed(leftCollapsed: boolean) {
  store.update((state) => {
    const collapsedPanels = normalizeCollapsedPanels(leftCollapsed, state.rightCollapsed)
    return {
      ...state,
      leftCollapsed: collapsedPanels.leftCollapsed,
      rightCollapsed: collapsedPanels.rightCollapsed,
    }
  })
}

export function setRightCollapsed(rightCollapsed: boolean) {
  store.update((state) => {
    const collapsedPanels = normalizeCollapsedPanels(state.leftCollapsed, rightCollapsed)
    return {
      ...state,
      leftCollapsed: collapsedPanels.leftCollapsed,
      rightCollapsed: collapsedPanels.rightCollapsed,
    }
  })
}

export function setColumnWidth(side: keyof ColumnWidths, width: number) {
  store.update(state => ({
    ...state,
    columnWidths: {
      ...state.columnWidths,
      [side]: side === 'left'
        ? clampWidth(width, minDesktopLeftWidth, maxDesktopLeftWidth)
        : clampWidth(width, minDesktopRightWidth, maxDesktopRightWidth),
    },
  }))
}

export function getNavigationSnapshot() {
  let snapshot = initialState
  store.subscribe(value => snapshot = value)()
  return snapshot
}
