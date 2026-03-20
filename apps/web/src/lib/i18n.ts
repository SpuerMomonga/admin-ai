import { browser } from '$app/environment'
import { m } from '$lib/paraglide/messages.js'
import { getLocale, getTextDirection, locales, setLocale } from '$lib/paraglide/runtime.js'

export type AppLocale = typeof locales[number]

type AdminPanelLabel = 'general' | 'account' | 'models' | 'knowledge' | 'rules'
type TaskStatusLabel = 'in_progress' | 'completed' | 'failed'
type ThemeLabel = 'system' | 'light' | 'dark'
type RuleApprovalMode = 'guided' | 'manual'
type RuleResponseStyle = 'compact' | 'structured'
type RuleCachePolicy = 'session_and_reload' | 'session_only'
type RuleExecutionPolicy = 'safe_first' | 'balanced'
type ParameterlessMessage = (inputs?: Record<string, never>, options?: { locale?: AppLocale }) => string

const textMessages = {
  account_description: m.account_description,
  account_email_label: m.account_email_label,
  account_label: m.account_label,
  account_name_label: m.account_name_label,
  account_placeholder: m.account_placeholder,
  account_role_label: m.account_role_label,
  account_title: m.account_title,
  active_mode: m.active_mode,
  admin_label: m.admin_label,
  app_logo_subtitle: m.app_logo_subtitle,
  app_subtitle: m.app_subtitle,
  collapse_left: m.collapse_left,
  collapse_right: m.collapse_right,
  composer_placeholder: m.composer_placeholder,
  conversation_mode: m.conversation_mode,
  copy_message: m.copy_message,
  delete_task: m.delete_task,
  downvote_message: m.downvote_message,
  enter_workspace: m.enter_workspace,
  expand_left: m.expand_left,
  expand_right: m.expand_right,
  general_cache_card: m.general_cache_card,
  general_locale_card: m.general_locale_card,
  general_task_status_label: m.general_task_status_label,
  general_theme_card: m.general_theme_card,
  knowledge_base_label: m.knowledge_base_label,
  knowledge_default_label: m.knowledge_default_label,
  knowledge_description: m.knowledge_description,
  knowledge_scope_current: m.knowledge_scope_current,
  knowledge_scope_global: m.knowledge_scope_global,
  knowledge_scope_label: m.knowledge_scope_label,
  knowledge_search_label: m.knowledge_search_label,
  knowledge_title: m.knowledge_title,
  language: m.language,
  locale_en: m.locale_en,
  locale_label: m.locale_label,
  locale_zh_cn: m.locale_zh_cn,
  login_description: m.login_description,
  login_eyebrow: m.login_eyebrow,
  login_side_desc: m.login_side_desc,
  login_side_title: m.login_side_title,
  login_tip_one: m.login_tip_one,
  login_tip_three: m.login_tip_three,
  login_tip_two: m.login_tip_two,
  login_title: m.login_title,
  logout: m.logout,
  models_description: m.models_description,
  models_operation_label: m.models_operation_label,
  models_primary_label: m.models_primary_label,
  models_routing_label: m.models_routing_label,
  models_title: m.models_title,
  new_task: m.new_task,
  operation_mode: m.operation_mode,
  panel_account: m.panel_account,
  panel_cache_hint: m.panel_cache_hint,
  panel_general: m.panel_general,
  panel_knowledge: m.panel_knowledge,
  panel_models: m.panel_models,
  panel_rules: m.panel_rules,
  password_label: m.password_label,
  password_placeholder: m.password_placeholder,
  preferences: m.preferences,
  profile: m.profile,
  remember_me: m.remember_me,
  rename_task: m.rename_task,
  rename_task_prompt: m.rename_task_prompt,
  right_panel_title: m.right_panel_title,
  rules_approval_guided: m.rules_approval_guided,
  rules_approval_label: m.rules_approval_label,
  rules_approval_manual: m.rules_approval_manual,
  rules_cache_label: m.rules_cache_label,
  rules_cache_session_and_reload: m.rules_cache_session_and_reload,
  rules_cache_session_only: m.rules_cache_session_only,
  rules_description: m.rules_description,
  rules_execution_balanced: m.rules_execution_balanced,
  rules_execution_label: m.rules_execution_label,
  rules_execution_safe_first: m.rules_execution_safe_first,
  rules_style_compact: m.rules_style_compact,
  rules_style_label: m.rules_style_label,
  rules_style_structured: m.rules_style_structured,
  rules_title: m.rules_title,
  save_state_hint: m.save_state_hint,
  send: m.send,
  task_actions: m.task_actions,
  task_status_completed: m.task_status_completed,
  task_status_failed: m.task_status_failed,
  task_status_in_progress: m.task_status_in_progress,
  task_summary_label: m.task_summary_label,
  tasks_empty: m.tasks_empty,
  tasks_title: m.tasks_title,
  theme: m.theme,
  theme_dark: m.theme_dark,
  theme_label: m.theme_label,
  theme_light: m.theme_light,
  theme_system: m.theme_system,
  upvote_message: m.upvote_message,
  welcome_back: m.welcome_back,
  workspace_label: m.workspace_label,
  workspace_empty_description: m.workspace_empty_description,
  workspace_empty_hint_one: m.workspace_empty_hint_one,
  workspace_empty_hint_three: m.workspace_empty_hint_three,
  workspace_empty_hint_two: m.workspace_empty_hint_two,
  workspace_empty_prompt_one: m.workspace_empty_prompt_one,
  workspace_empty_prompt_three: m.workspace_empty_prompt_three,
  workspace_empty_prompt_two: m.workspace_empty_prompt_two,
  workspace_loading: m.workspace_loading,
  workspace_empty_title: m.workspace_empty_title,
  workspace_title: m.workspace_title,
} as const satisfies Record<string, ParameterlessMessage>

export type TranslationKey = keyof typeof textMessages

const adminPanelMessageKeys = {
  general: 'panel_general',
  account: 'panel_account',
  models: 'panel_models',
  knowledge: 'panel_knowledge',
  rules: 'panel_rules',
} as const satisfies Record<AdminPanelLabel, TranslationKey>

const taskStatusMessageKeys = {
  in_progress: 'task_status_in_progress',
  completed: 'task_status_completed',
  failed: 'task_status_failed',
} as const satisfies Record<TaskStatusLabel, TranslationKey>

const themeMessageKeys = {
  system: 'theme_system',
  light: 'theme_light',
  dark: 'theme_dark',
} as const satisfies Record<ThemeLabel, TranslationKey>

export const localeOptions = [
  {
    value: 'zh-CN',
    labelKey: 'locale_zh_cn',
  },
  {
    value: 'en',
    labelKey: 'locale_en',
  },
] as const satisfies ReadonlyArray<{ value: AppLocale, labelKey: TranslationKey }>

export function translate(key: TranslationKey, locale?: AppLocale) {
  return textMessages[key]({}, locale ? { locale } : undefined) as string
}

export function translateAdminPanel(panel: AdminPanelLabel) {
  return translate(adminPanelMessageKeys[panel])
}

export function translateTaskStatus(status: TaskStatusLabel) {
  return translate(taskStatusMessageKeys[status])
}

export function translateThemePreference(theme: ThemeLabel) {
  return translate(themeMessageKeys[theme])
}

export function translateLocaleName(locale: AppLocale) {
  return translate(locale === 'zh-CN' ? 'locale_zh_cn' : 'locale_en')
}

export function translateRuleApprovalMode(mode: RuleApprovalMode) {
  return translate(mode === 'guided' ? 'rules_approval_guided' : 'rules_approval_manual')
}

export function translateRuleResponseStyle(style: RuleResponseStyle) {
  return translate(style === 'compact' ? 'rules_style_compact' : 'rules_style_structured')
}

export function translateRuleCachePolicy(policy: RuleCachePolicy) {
  return translate(policy === 'session_and_reload' ? 'rules_cache_session_and_reload' : 'rules_cache_session_only')
}

export function translateRuleExecutionPolicy(policy: RuleExecutionPolicy) {
  return translate(policy === 'safe_first' ? 'rules_execution_safe_first' : 'rules_execution_balanced')
}

export function applyDocumentLocale(locale: AppLocale) {
  if (!browser) {
    return
  }

  document.documentElement.lang = locale
  document.documentElement.dir = getTextDirection(locale)
}

export function getCurrentLocale(): AppLocale {
  return getLocale() as AppLocale
}

export function setAppLocale(locale: AppLocale) {
  void setLocale(locale, { reload: false })
  applyDocumentLocale(locale)
}
