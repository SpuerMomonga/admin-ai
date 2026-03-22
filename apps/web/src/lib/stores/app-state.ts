import type { AppState, ColumnWidths } from '$lib/types/app'
import { persistState, readStoredState, storageKeys } from '$lib/utils/storage'
import { writable } from 'svelte/store'

export type { ColumnWidths } from '$lib/types/app'

const minDesktopLeftWidth = 180
const maxDesktopLeftWidth = 420
const minDesktopRightWidth = 280
const maxDesktopRightWidth = 1600

function clampWidth(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function createDefaultAppState(): AppState {
  return {
    leftCollapsed: false,
    rightCollapsed: false,
    adminSidebarCollapsed: false,
    columnWidths: {
      left: 220,
      right: 720,
    },
    resizeState: {
      activeHandle: null,
      isResizing: false,
      pointerX: null,
    },
  }
}

function normalizeAppState(input: unknown): AppState {
  const payload = input as Partial<AppState>
  const defaults = createDefaultAppState()

  return {
    leftCollapsed: Boolean(payload.leftCollapsed),
    rightCollapsed: Boolean(payload.rightCollapsed),
    adminSidebarCollapsed: Boolean(payload.adminSidebarCollapsed),
    columnWidths: {
      left: typeof payload.columnWidths?.left === 'number'
        ? clampWidth(payload.columnWidths.left, minDesktopLeftWidth, maxDesktopLeftWidth)
        : defaults.columnWidths.left,
      right: typeof payload.columnWidths?.right === 'number'
        ? clampWidth(payload.columnWidths.right, minDesktopRightWidth, maxDesktopRightWidth)
        : defaults.columnWidths.right,
    },
    resizeState: defaults.resizeState,
  }
}

const initialState = readStoredState<AppState>(
  storageKeys.appState,
  createDefaultAppState(),
  normalizeAppState,
)

const store = writable<AppState>(initialState)

store.subscribe((value) => {
  persistState(storageKeys.appState, {
    leftCollapsed: value.leftCollapsed,
    rightCollapsed: value.rightCollapsed,
    adminSidebarCollapsed: value.adminSidebarCollapsed,
    columnWidths: value.columnWidths,
  })
})

export const appStateStore = store

export function toggleLeftCollapsed() {
  store.update(state => ({ ...state, leftCollapsed: !state.leftCollapsed }))
}

export function toggleRightCollapsed() {
  store.update(state => ({ ...state, rightCollapsed: !state.rightCollapsed }))
}

export function toggleAdminSidebarCollapsed() {
  store.update(state => ({
    ...state,
    adminSidebarCollapsed: !state.adminSidebarCollapsed,
  }))
}

export function setLeftCollapsed(leftCollapsed: boolean) {
  store.update(state => ({ ...state, leftCollapsed }))
}

export function setRightCollapsed(rightCollapsed: boolean) {
  store.update(state => ({ ...state, rightCollapsed }))
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

export function startColumnResize(side: 'left' | 'right', pointerX: number) {
  store.update(state => ({
    ...state,
    resizeState: {
      activeHandle: side,
      isResizing: true,
      pointerX,
    },
  }))
}

export function updateResizePointer(pointerX: number) {
  store.update(state => ({
    ...state,
    resizeState: {
      ...state.resizeState,
      pointerX,
    },
  }))
}

export function endColumnResize() {
  store.update(state => ({
    ...state,
    resizeState: {
      activeHandle: null,
      isResizing: false,
      pointerX: null,
    },
  }))
}

export function getAppStateSnapshot() {
  let snapshot = initialState
  store.subscribe(value => snapshot = value)()
  return snapshot
}
