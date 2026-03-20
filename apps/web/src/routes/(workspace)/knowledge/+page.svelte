<script lang='ts'>
  import AppSelect from '$lib/components/ui/app-select.svelte'
  import { Button } from '$lib/components/ui/button'
  import { Card } from '$lib/components/ui/card'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import { knowledgeBases } from '$lib/stores/conversation'
  import { translate as t } from '$lib/stores/i18n'
  import { settingsStore, updateSettingsSection } from '$lib/stores/settings'

  const knowledgeBaseOptions = $derived.by(() => knowledgeBases.map(knowledgeBase => ({
    value: knowledgeBase.id,
    label: knowledgeBase.badge,
  })))
  const queryScopeOptions = $derived.by(() => [
    { value: 'current', label: t('knowledge_scope_current') },
    { value: 'global', label: t('knowledge_scope_global') },
  ])
</script>

<section class='grid gap-3'>
  <Card size='sm' class='px-4'>
    <p class='shell-card-label'>{t('knowledge_title')}</p>
    <h3 class='shell-card-title'>{knowledgeBases.find(base => base.id === $settingsStore.settings.knowledge.activeBaseId)?.badge ?? 'OPS'}</h3>
    <p class='shell-card-copy'>{t('knowledge_description')}</p>
  </Card>

  <Card size='sm' class='px-4'>
    <div class='grid gap-3 lg:grid-cols-[200px_200px_minmax(0,1fr)]'>
      <div class='grid gap-2'>
        <Label>{t('knowledge_default_label')}</Label>
        <AppSelect
          value={$settingsStore.settings.knowledge.activeBaseId}
          options={knowledgeBaseOptions}
          onValueChange={value => updateSettingsSection('knowledge', { activeBaseId: value })}
        />
      </div>

      <div class='grid gap-2'>
        <Label>{t('knowledge_scope_label')}</Label>
        <AppSelect
          value={$settingsStore.settings.knowledge.queryScope}
          options={queryScopeOptions}
          onValueChange={value => updateSettingsSection('knowledge', { queryScope: value as 'current' | 'global' })}
        />
      </div>

      <div class='grid gap-2'>
        <Label for='knowledge-query'>{t('knowledge_search_label')}</Label>
        <Input
          id='knowledge-query'
          value={$settingsStore.settings.knowledge.searchQuery}
          oninput={event => updateSettingsSection('knowledge', { searchQuery: event.currentTarget.value })}
        />
      </div>
    </div>

    <div class='mt-3 grid gap-3 md:grid-cols-3'>
      {#each knowledgeBases as knowledgeBase}
        <Button
          type='button'
          variant={$settingsStore.settings.knowledge.activeBaseId === knowledgeBase.id ? 'secondary' : 'outline'}
          class={`h-auto justify-start rounded-[8px] px-3 py-3 text-left ${$settingsStore.settings.knowledge.activeBaseId === knowledgeBase.id ? 'border-brand/35 bg-brand/10 text-brand shadow-[0_8px_18px_rgba(0,78,162,0.1)]' : ''}`}
          onclick={() => updateSettingsSection('knowledge', { activeBaseId: knowledgeBase.id })}
        >
          <div>
            <p class='text-sm font-semibold text-foreground'>{knowledgeBase.badge}</p>
            <p class='mt-2 text-xs leading-5 text-muted-foreground'>{knowledgeBase.id}</p>
          </div>
        </Button>
      {/each}
    </div>
  </Card>
</section>
