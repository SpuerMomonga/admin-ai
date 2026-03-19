<script lang='ts'>
  import { translate as t } from '$lib/i18n'
  import { appShell, knowledgeBases, type ChatMode } from '$lib/stores/app-shell'
  import { SendHorizontal } from '@lucide/svelte'

  let { taskId } = $props<{ taskId: string }>()

  const activeTask = $derived($appShell.tasks.find(task => task.id === taskId) ?? null)

  function submit() {
    appShell.submitTaskDraft(taskId)
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault()
      submit()
    }
  }
</script>

{#if activeTask}
  <section class='px-3 pb-3 pt-2'>
    <div class='rounded-[10px] border border-shell-border bg-shell-surface px-3 py-3 shadow-[0_6px_18px_rgba(15,23,42,0.04)]'>
      <textarea
        class='min-h-[72px] w-full resize-none border-0 bg-transparent px-0 py-0 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground'
        rows='3'
        value={activeTask.draft}
        placeholder={t('composer_placeholder')}
        onkeydown={handleKeydown}
        oninput={(event) => appShell.setTaskDraft(taskId, event.currentTarget.value)}
      ></textarea>

      <div class='mt-3 flex items-center justify-between gap-3'>
        <div class='flex min-w-0 items-center gap-2'>
          <select
            class='h-7 appearance-none rounded-[6px] border-0 bg-transparent px-2 py-1 text-[11px] font-medium text-muted-foreground outline-none transition hover:bg-shell-muted-panel hover:text-foreground focus:bg-shell-muted-panel focus:text-foreground'
            value={activeTask.mode}
            aria-label={t('active_mode')}
            onchange={(event) => appShell.setTaskMode(taskId, event.currentTarget.value as ChatMode)}
          >
            <option value='conversation'>{t('conversation_mode')}</option>
            <option value='operation'>{t('operation_mode')}</option>
          </select>

          <select
            class='h-7 appearance-none rounded-[6px] border-0 bg-transparent px-2 py-1 text-[11px] font-medium text-muted-foreground outline-none transition hover:bg-shell-muted-panel hover:text-foreground focus:bg-shell-muted-panel focus:text-foreground'
            value={activeTask.knowledgeBaseId}
            aria-label={t('knowledge_base_label')}
            onchange={(event) => appShell.setTaskKnowledgeBase(taskId, event.currentTarget.value)}
          >
            {#each knowledgeBases as knowledgeBase}
              <option value={knowledgeBase.id}>{knowledgeBase.badge}</option>
            {/each}
          </select>
        </div>

        <button
          type='button'
          class='shell-primary-button size-8 justify-center px-0'
          aria-label={t('send')}
          title={t('send')}
          onclick={submit}
        >
          <SendHorizontal class='size-4' />
        </button>
      </div>
    </div>
  </section>
{/if}
