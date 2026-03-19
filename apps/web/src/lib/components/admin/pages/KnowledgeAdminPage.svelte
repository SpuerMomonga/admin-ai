<script lang='ts'>
  import { translate as t } from '$lib/i18n'
  import { appShell, knowledgeBases } from '$lib/stores/app-shell'
</script>

<section class='grid gap-3'>
  <article class='shell-card'>
    <p class='shell-card-label'>{t('knowledge_title')}</p>
    <h3 class='shell-card-title'>{knowledgeBases.find(base => base.id === $appShell.settings.knowledge.activeBaseId)?.badge ?? 'OPS'}</h3>
    <p class='shell-card-copy'>{t('knowledge_description')}</p>
  </article>

  <article class='shell-card'>
    <div class='grid gap-3 lg:grid-cols-[200px_200px_minmax(0,1fr)]'>
      <label class='shell-field'>
        <span>{t('knowledge_default_label')}</span>
        <select class='shell-select' value={$appShell.settings.knowledge.activeBaseId} onchange={(event) => appShell.updateSettingsSection('knowledge', { activeBaseId: event.currentTarget.value })}>
          {#each knowledgeBases as knowledgeBase}
            <option value={knowledgeBase.id}>{knowledgeBase.badge}</option>
          {/each}
        </select>
      </label>

      <label class='shell-field'>
        <span>{t('knowledge_scope_label')}</span>
        <select class='shell-select' value={$appShell.settings.knowledge.queryScope} onchange={(event) => appShell.updateSettingsSection('knowledge', { queryScope: event.currentTarget.value as 'current' | 'global' })}>
          <option value='current'>{t('knowledge_scope_current')}</option>
          <option value='global'>{t('knowledge_scope_global')}</option>
        </select>
      </label>

      <label class='shell-field'>
        <span>{t('knowledge_search_label')}</span>
        <input
          class='shell-input'
          value={$appShell.settings.knowledge.searchQuery}
          oninput={(event) => appShell.updateSettingsSection('knowledge', { searchQuery: event.currentTarget.value })}
        />
      </label>
    </div>

    <div class='mt-3 grid gap-3 md:grid-cols-3'>
      {#each knowledgeBases as knowledgeBase}
        <button
          type='button'
          class={`rounded-[8px] border px-3 py-3 text-left transition ${$appShell.settings.knowledge.activeBaseId === knowledgeBase.id ? 'border-brand/35 bg-brand/10 shadow-[0_8px_18px_rgba(0,78,162,0.1)]' : 'border-shell-border bg-shell-muted-panel hover:border-brand/20 hover:bg-brand/5'}`}
          onclick={() => appShell.updateSettingsSection('knowledge', { activeBaseId: knowledgeBase.id })}
        >
          <p class='text-sm font-semibold text-foreground'>{knowledgeBase.badge}</p>
          <p class='mt-2 text-xs leading-5 text-muted-foreground'>{knowledgeBase.id}</p>
        </button>
      {/each}
    </div>
  </article>
</section>
