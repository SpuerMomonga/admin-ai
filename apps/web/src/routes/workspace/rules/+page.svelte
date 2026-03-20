<script lang='ts'>
  import { translate as t, translateRuleApprovalMode, translateRuleCachePolicy, translateRuleExecutionPolicy, translateRuleResponseStyle } from '$lib/i18n'
  import { appShell } from '$lib/stores/app-shell'
</script>

<section class='grid gap-3'>
  <article class='shell-card'>
    <p class='shell-card-label'>{t('rules_title')}</p>
    <h3 class='shell-card-title'>{t('panel_rules')}</h3>
    <p class='shell-card-copy'>{t('rules_description')}</p>
  </article>

  <article class='shell-card'>
    <div class='grid gap-3 lg:grid-cols-2'>
      <label class='shell-field'>
        <span>{t('rules_approval_label')}</span>
        <select class='shell-select' value={$appShell.settings.rules.approvalMode} onchange={event => appShell.updateSettingsSection('rules', { approvalMode: event.currentTarget.value as 'manual' | 'guided' })}>
          <option value='guided'>{translateRuleApprovalMode('guided')}</option>
          <option value='manual'>{translateRuleApprovalMode('manual')}</option>
        </select>
      </label>

      <label class='shell-field'>
        <span>{t('rules_style_label')}</span>
        <select class='shell-select' value={$appShell.settings.rules.responseStyle} onchange={event => appShell.updateSettingsSection('rules', { responseStyle: event.currentTarget.value as 'compact' | 'structured' })}>
          <option value='compact'>{translateRuleResponseStyle('compact')}</option>
          <option value='structured'>{translateRuleResponseStyle('structured')}</option>
        </select>
      </label>

      <label class='shell-field'>
        <span>{t('rules_cache_label')}</span>
        <select class='shell-select' value={$appShell.settings.rules.cachePolicy} onchange={event => appShell.updateSettingsSection('rules', { cachePolicy: event.currentTarget.value as 'session_and_reload' | 'session_only' })}>
          <option value='session_and_reload'>{translateRuleCachePolicy('session_and_reload')}</option>
          <option value='session_only'>{translateRuleCachePolicy('session_only')}</option>
        </select>
      </label>

      <label class='shell-field'>
        <span>{t('rules_execution_label')}</span>
        <select class='shell-select' value={$appShell.settings.rules.executionPolicy} onchange={event => appShell.updateSettingsSection('rules', { executionPolicy: event.currentTarget.value as 'safe_first' | 'balanced' })}>
          <option value='safe_first'>{translateRuleExecutionPolicy('safe_first')}</option>
          <option value='balanced'>{translateRuleExecutionPolicy('balanced')}</option>
        </select>
      </label>
    </div>

    <p class='mt-3 text-sm leading-6 text-muted-foreground'>{t('panel_cache_hint')}</p>
  </article>
</section>
