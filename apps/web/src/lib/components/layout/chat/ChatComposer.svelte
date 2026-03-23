<script lang='ts'>
  import type { ChatMode } from '$lib/stores/conversation'
  import { goto } from '$app/navigation'
  import AppSelect from '$lib/components/ui/app-select.svelte'
  import { Button } from '$lib/components/ui/button'
  import { Textarea } from '$lib/components/ui/textarea'
  import { m } from '$lib/paraglide/messages'
  import {
    knowledgeBases,
    pendingTaskComposerStore,
    resetPendingTaskComposer,
    setPendingTaskDraft,
    setPendingTaskKnowledgeBase,
    setPendingTaskMode,
    setTaskDraft,
    setTaskKnowledgeBase,
    setTaskMode,
    submitTaskDraft,
  } from '$lib/stores/conversation'
  import { buildWorkspacePath } from '$lib/stores/tabs'
  import { createTask, tasksStore } from '$lib/stores/tasks'
  import { SendHorizontal } from '@lucide/svelte'

  const { taskId, adminPath } = $props<{ taskId: string | null, adminPath: string }>()
  const activeTask = $derived($tasksStore.tasks.find(task => task.id === taskId) ?? null)
  const modeOptions = $derived.by(() => [
    { value: 'conversation', label: m.conversation_mode() },
    { value: 'operation', label: m.operation_mode() },
  ] satisfies Array<{ value: ChatMode, label: string }>)
  const knowledgeBaseOptions = $derived.by(() => knowledgeBases.map(knowledgeBase => ({
    value: knowledgeBase.id,
    label: knowledgeBase.badge,
  })))

  async function submit() {
    if (taskId) {
      submitTaskDraft(taskId)
      return
    }

    const prompt = $pendingTaskComposerStore.draft.trim()

    if (prompt.length === 0) {
      return
    }

    const nextTaskId = createTask({
      title: prompt,
      mode: $pendingTaskComposerStore.mode,
      knowledgeBaseId: $pendingTaskComposerStore.knowledgeBaseId,
      messages: [],
    })
    setTaskDraft(nextTaskId, prompt)
    submitTaskDraft(nextTaskId)
    resetPendingTaskComposer()
    await goto(buildWorkspacePath(nextTaskId, adminPath))
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault()
      void submit()
    }
  }
</script>

{#if activeTask}
  <section class='px-3 pb-3 pt-2'>
    <div class='rounded-[10px] border border-shell-border bg-shell-surface px-3 py-3 shadow-[0_6px_18px_rgba(15,23,42,0.04)]'>
      <Textarea
        class='min-h-18 resize-none border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0'
        value={activeTask.draft}
        placeholder={m.composer_placeholder()}
        onkeydown={handleKeydown}
        oninput={event => taskId && setTaskDraft(taskId, event.currentTarget.value)}
      />

      <div class='mt-3 flex items-center justify-between gap-3'>
        <div class='flex min-w-0 items-center gap-2'>
          <div class='shrink-0'>
            <AppSelect
              class='h-7'
              triggerClass='h-7 w-[102px] px-1.5 py-1 text-[11px] font-medium text-foreground hover:text-foreground'
              contentClass='min-w-[112px]'
              size='sm'
              plainWhenSelected={true}
              value={activeTask.mode}
              options={modeOptions}
              placeholder={m.active_mode()}
              onValueChange={value => taskId && setTaskMode(taskId, value as ChatMode)}
            />
          </div>

          <div class='shrink-0'>
            <AppSelect
              class='h-7'
              triggerClass='h-7 w-[68px] px-1.5 py-1 text-[11px] font-medium text-foreground hover:text-foreground'
              contentClass='min-w-[92px]'
              size='sm'
              plainWhenSelected={true}
              value={activeTask.knowledgeBaseId}
              options={knowledgeBaseOptions}
              placeholder={m.knowledge_base_label()}
              onValueChange={value => taskId && setTaskKnowledgeBase(taskId, value)}
            />
          </div>
        </div>

        <Button
          variant='default'
          size='icon-sm'
          aria-label={m.send()}
          title={m.send()}
          onclick={() => void submit()}
        >
          <SendHorizontal class='size-4' />
        </Button>
      </div>
    </div>
  </section>
{:else}
  <section class='px-3 pb-3 pt-2'>
    <div class='rounded-[10px] border border-shell-border bg-shell-surface px-3 py-3 shadow-[0_6px_18px_rgba(15,23,42,0.04)]'>
      <Textarea
        class='min-h-18 resize-none border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0'
        value={$pendingTaskComposerStore.draft}
        placeholder={m.composer_placeholder()}
        onkeydown={handleKeydown}
        oninput={event => setPendingTaskDraft(event.currentTarget.value)}
      />

      <div class='mt-3 flex items-center justify-between gap-3'>
        <div class='flex min-w-0 items-center gap-2'>
          <div class='shrink-0'>
            <AppSelect
              class='h-7'
              triggerClass='h-7 w-[102px] px-1.5 py-1 text-[11px] font-medium text-foreground hover:text-foreground'
              contentClass='min-w-[112px]'
              size='sm'
              plainWhenSelected={true}
              value={$pendingTaskComposerStore.mode}
              options={modeOptions}
              placeholder={m.active_mode()}
              onValueChange={value => setPendingTaskMode(value as ChatMode)}
            />
          </div>

          <div class='shrink-0'>
            <AppSelect
              class='h-7'
              triggerClass='h-7 w-[68px] px-1.5 py-1 text-[11px] font-medium text-foreground hover:text-foreground'
              contentClass='min-w-[92px]'
              size='sm'
              plainWhenSelected={true}
              value={$pendingTaskComposerStore.knowledgeBaseId}
              options={knowledgeBaseOptions}
              placeholder={m.knowledge_base_label()}
              onValueChange={value => setPendingTaskKnowledgeBase(value)}
            />
          </div>
        </div>

        <Button
          variant='default'
          size='icon-sm'
          aria-label={m.send()}
          title={m.send()}
          onclick={() => void submit()}
        >
          <SendHorizontal class='size-4' />
        </Button>
      </div>
    </div>
  </section>
{/if}
