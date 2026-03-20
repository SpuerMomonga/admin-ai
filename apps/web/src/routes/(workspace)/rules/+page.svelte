<script lang='ts'>
  import AppSelect from '$lib/components/ui/app-select.svelte'
  import { Card } from '$lib/components/ui/card'
  import { Label } from '$lib/components/ui/label'
  import { translate as t, translateRuleApprovalMode, translateRuleCachePolicy, translateRuleExecutionPolicy, translateRuleResponseStyle } from '$lib/stores/i18n'
  import { settingsStore, updateSettingsSection } from '$lib/stores/settings'

  const approvalOptions = $derived.by(() => [
    { value: 'guided', label: translateRuleApprovalMode('guided') },
    { value: 'manual', label: translateRuleApprovalMode('manual') },
  ])
  const styleOptions = $derived.by(() => [
    { value: 'compact', label: translateRuleResponseStyle('compact') },
    { value: 'structured', label: translateRuleResponseStyle('structured') },
  ])
  const cacheOptions = $derived.by(() => [
    { value: 'session_and_reload', label: translateRuleCachePolicy('session_and_reload') },
    { value: 'session_only', label: translateRuleCachePolicy('session_only') },
  ])
  const executionOptions = $derived.by(() => [
    { value: 'safe_first', label: translateRuleExecutionPolicy('safe_first') },
    { value: 'balanced', label: translateRuleExecutionPolicy('balanced') },
  ])
</script>

<section class='grid gap-3'>
  <Card size='sm' class='px-4'>
    <p class='shell-card-label'>{t('rules_title')}</p>
    <h3 class='shell-card-title'>{t('panel_rules')}</h3>
    <p class='shell-card-copy'>{t('rules_description')}</p>
  </Card>

  <Card size='sm' class='px-4'>
    <div class='grid gap-3 lg:grid-cols-2'>
      <div class='grid gap-2'>
        <Label>{t('rules_approval_label')}</Label>
        <AppSelect
          value={$settingsStore.settings.rules.approvalMode}
          options={approvalOptions}
          onValueChange={value => updateSettingsSection('rules', { approvalMode: value as 'manual' | 'guided' })}
        />
      </div>

      <div class='grid gap-2'>
        <Label>{t('rules_style_label')}</Label>
        <AppSelect
          value={$settingsStore.settings.rules.responseStyle}
          options={styleOptions}
          onValueChange={value => updateSettingsSection('rules', { responseStyle: value as 'compact' | 'structured' })}
        />
      </div>

      <div class='grid gap-2'>
        <Label>{t('rules_cache_label')}</Label>
        <AppSelect
          value={$settingsStore.settings.rules.cachePolicy}
          options={cacheOptions}
          onValueChange={value => updateSettingsSection('rules', { cachePolicy: value as 'session_and_reload' | 'session_only' })}
        />
      </div>

      <div class='grid gap-2'>
        <Label>{t('rules_execution_label')}</Label>
        <AppSelect
          value={$settingsStore.settings.rules.executionPolicy}
          options={executionOptions}
          onValueChange={value => updateSettingsSection('rules', { executionPolicy: value as 'safe_first' | 'balanced' })}
        />
      </div>
    </div>

    <p class='mt-3 text-sm leading-6 text-muted-foreground'>{t('panel_cache_hint')}</p>
  </Card>
</section>
