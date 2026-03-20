import type { AppLocale } from '$lib/stores/i18n'
import type { AccountSettings, KnowledgeSettings, ModelSettings, RuleSettings } from './shared/types'
import { m } from '$lib/paraglide/messages.js'
import { getCurrentLocale } from '$lib/stores/i18n'
import { writable } from 'svelte/store'
import { persistState, readStoredState, storageKeys } from './shared/storage'

export interface AppSettings {
  account: AccountSettings
  models: ModelSettings
  knowledge: KnowledgeSettings
  rules: RuleSettings
}

export interface SettingsState {
  settings: AppSettings
}

function createDefaultSettings(locale: AppLocale): AppSettings {
  return {
    account: {
      displayName: 'SpuerMomonga',
      email: 'admin-ai@example.com',
      role: 'Admin',
    },
    models: {
      primaryModel: 'GPT-5.4',
      operationModel: 'GPT-5.3-codex',
      routingPolicy: m.models_routing_policy_complexity_first({}, { locale }) as string,
    },
    knowledge: {
      activeBaseId: 'ops-playbook',
      queryScope: 'current',
      searchQuery: '',
    },
    rules: {
      approvalMode: 'guided',
      responseStyle: 'compact',
      cachePolicy: 'session_and_reload',
      executionPolicy: 'safe_first',
    },
  }
}

function normalizeSettingsState(input: unknown): SettingsState {
  const defaults = createDefaultSettings(getCurrentLocale())
  const payload = input as Partial<SettingsState>

  return {
    settings: {
      account: {
        displayName: payload.settings?.account?.displayName ?? defaults.account.displayName,
        email: payload.settings?.account?.email ?? defaults.account.email,
        role: payload.settings?.account?.role ?? defaults.account.role,
      },
      models: {
        primaryModel: payload.settings?.models?.primaryModel ?? defaults.models.primaryModel,
        operationModel: payload.settings?.models?.operationModel ?? defaults.models.operationModel,
        routingPolicy: payload.settings?.models?.routingPolicy ?? defaults.models.routingPolicy,
      },
      knowledge: {
        activeBaseId: payload.settings?.knowledge?.activeBaseId ?? defaults.knowledge.activeBaseId,
        queryScope: payload.settings?.knowledge?.queryScope === 'global' ? 'global' : defaults.knowledge.queryScope,
        searchQuery: payload.settings?.knowledge?.searchQuery ?? defaults.knowledge.searchQuery,
      },
      rules: {
        approvalMode: payload.settings?.rules?.approvalMode === 'manual' ? 'manual' : defaults.rules.approvalMode,
        responseStyle: payload.settings?.rules?.responseStyle === 'structured' ? 'structured' : defaults.rules.responseStyle,
        cachePolicy: payload.settings?.rules?.cachePolicy === 'session_only' ? 'session_only' : defaults.rules.cachePolicy,
        executionPolicy: payload.settings?.rules?.executionPolicy === 'balanced' ? 'balanced' : defaults.rules.executionPolicy,
      },
    },
  }
}

const initialState = readStoredState<SettingsState>(
  storageKeys.settings,
  { settings: createDefaultSettings(getCurrentLocale()) },
  normalizeSettingsState,
)

const store = writable<SettingsState>(initialState)

store.subscribe((value) => {
  persistState(storageKeys.settings, value)
})

export const settingsStore = store

export function updateSettingsSection<K extends keyof AppSettings>(section: K, patch: Partial<AppSettings[K]>) {
  store.update(state => ({
    ...state,
    settings: {
      ...state.settings,
      [section]: {
        ...state.settings[section],
        ...patch,
      },
    },
  }))
}
