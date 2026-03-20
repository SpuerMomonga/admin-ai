<script lang='ts'>
  import type { AdminPanel } from '$lib/stores/app-shell'
  import { browser } from '$app/environment'
  import { goto } from '$app/navigation'
  import { Button } from '$lib/components/ui/button'
  import TooltipButton from '$lib/components/ui/tooltip-button.svelte'
  import { translate as t } from '$lib/i18n'
  import { appShell, buildWorkspacePath } from '$lib/stores/app-shell'
  import { Check, Copy, ThumbsDown, ThumbsUp } from '@lucide/svelte'

  const { taskId, panel } = $props<{ taskId: string | null, panel: AdminPanel }>()
  let copiedMessageId = $state<string | null>(null)

  const activeTask = $derived($appShell.tasks.find(task => task.id === taskId) ?? null)
  const starterSuggestions = [
    t('workspace_empty_prompt_one'),
    t('workspace_empty_prompt_two'),
    t('workspace_empty_prompt_three'),
  ]

  function formatTime(value: string) {
    return new Intl.DateTimeFormat($appShell.locale, {
      hour: '2-digit',
      minute: '2-digit',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(value))
  }

  async function copyMessage(messageId: string, content: string) {
    if (!browser) {
      return
    }

    try {
      await navigator.clipboard.writeText(content)
      copiedMessageId = messageId
      window.setTimeout(() => {
        if (copiedMessageId === messageId) {
          copiedMessageId = null
        }
      }, 1200)
    }
    catch {
      copiedMessageId = null
    }
  }

  async function submitSuggestion(prompt: string) {
    const nextPrompt = prompt.trim()

    if (nextPrompt.length === 0) {
      return
    }

    const nextTaskId = appShell.createTask()
    appShell.setTaskDraft(nextTaskId, nextPrompt)
    appShell.submitTaskDraft(nextTaskId)
    await goto(buildWorkspacePath(nextTaskId, panel))
  }
</script>

<section class='flex min-h-0 flex-1 flex-col overflow-hidden'>
  {#if activeTask}
    <div class='flex-1 space-y-3 overflow-y-auto px-3 py-3 no-scrollbar'>
      {#each activeTask.messages as message (message.id)}
        <article class={`max-w-[86%] text-sm leading-6 ${message.role === 'assistant' ? 'text-foreground' : 'ml-auto rounded-[10px] bg-brand px-3 py-2.5 text-brand-foreground'}`}>
          <p>{message.content}</p>
          {#if message.role === 'assistant'}
            <div class='mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground'>
              <div class='flex items-center gap-0.5'>
                <TooltipButton
                  content={t('copy_message')}
                  class={`inline-flex size-6 items-center justify-center rounded-[6px] text-muted-foreground transition hover:bg-shell-muted-panel hover:text-foreground ${copiedMessageId === message.id ? 'text-brand' : ''}`}
                  onclick={() => copyMessage(message.id, message.content)}
                >
                  {#if copiedMessageId === message.id}
                    <Check class='size-3.5' />
                  {:else}
                    <Copy class='size-3.5' />
                  {/if}
                </TooltipButton>

                <TooltipButton
                  content={t('upvote_message')}
                  class={`inline-flex size-6 items-center justify-center rounded-[6px] text-muted-foreground transition hover:bg-shell-muted-panel hover:text-foreground ${message.feedback === 'up' ? 'text-brand' : ''}`}
                  onclick={() => taskId && appShell.setMessageFeedback(taskId, message.id, 'up')}
                >
                  <ThumbsUp class='size-3.5' />
                </TooltipButton>

                <TooltipButton
                  content={t('downvote_message')}
                  class={`inline-flex size-6 items-center justify-center rounded-[6px] text-muted-foreground transition hover:bg-shell-muted-panel hover:text-foreground ${message.feedback === 'down' ? 'text-brand' : ''}`}
                  onclick={() => taskId && appShell.setMessageFeedback(taskId, message.id, 'down')}
                >
                  <ThumbsDown class='size-3.5' />
                </TooltipButton>
              </div>

              <span class='ml-1'>{formatTime(message.createdAt)}</span>
            </div>
          {:else}
            <p class='mt-1.5 text-[11px] text-brand-foreground/75'>
              {formatTime(message.createdAt)}
            </p>
          {/if}
        </article>
      {/each}
    </div>
  {:else}
    <div class='flex flex-1 items-center justify-center px-6 py-8'>
      <div class='mx-auto flex w-full min-w-0 max-w-2xl flex-col items-center text-center'>
        <h2 class='max-w-full px-4 text-3xl font-semibold tracking-tight text-foreground break-words sm:text-4xl'>
          {t('workspace_empty_title')}
        </h2>

        <div class='mt-4 flex w-full min-w-0 flex-wrap justify-center gap-2'>
          {#each starterSuggestions as suggestion}
            <Button
              variant='outline'
              size='sm'
              class='max-w-full whitespace-normal break-words text-center sm:whitespace-nowrap'
              onclick={() => void submitSuggestion(suggestion)}
            >
              {suggestion}
            </Button>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</section>
