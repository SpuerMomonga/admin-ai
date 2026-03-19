<script lang='ts'>
  import { browser } from '$app/environment'
  import { translate as t } from '$lib/i18n'
  import { appShell } from '$lib/stores/app-shell'
  import { Tooltip } from '@admin-ai/ui'
  import { Check, Copy, ThumbsDown, ThumbsUp } from '@lucide/svelte'

  let { taskId } = $props<{ taskId: string }>()
  let copiedMessageId = $state<string | null>(null)

  const activeTask = $derived($appShell.tasks.find(task => task.id === taskId) ?? null)

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
                <Tooltip
                  content={t('copy_message')}
                  class={`inline-flex size-6 items-center justify-center rounded-[6px] text-muted-foreground transition hover:bg-shell-muted-panel hover:text-foreground ${copiedMessageId === message.id ? 'text-brand' : ''}`}
                  onclick={() => copyMessage(message.id, message.content)}
                >
                  {#if copiedMessageId === message.id}
                    <Check class='size-3.5' />
                  {:else}
                    <Copy class='size-3.5' />
                  {/if}
                </Tooltip>

                <Tooltip
                  content={t('upvote_message')}
                  class={`inline-flex size-6 items-center justify-center rounded-[6px] text-muted-foreground transition hover:bg-shell-muted-panel hover:text-foreground ${message.feedback === 'up' ? 'text-brand' : ''}`}
                  onclick={() => appShell.setMessageFeedback(taskId, message.id, 'up')}
                >
                  <ThumbsUp class='size-3.5' />
                </Tooltip>

                <Tooltip
                  content={t('downvote_message')}
                  class={`inline-flex size-6 items-center justify-center rounded-[6px] text-muted-foreground transition hover:bg-shell-muted-panel hover:text-foreground ${message.feedback === 'down' ? 'text-brand' : ''}`}
                  onclick={() => appShell.setMessageFeedback(taskId, message.id, 'down')}
                >
                  <ThumbsDown class='size-3.5' />
                </Tooltip>
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
    <div class='flex flex-1 items-center justify-center px-6 text-sm text-muted-foreground'>
      {t('tasks_empty')}
    </div>
  {/if}
</section>
