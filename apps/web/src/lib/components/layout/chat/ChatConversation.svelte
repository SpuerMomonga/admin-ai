<script lang='ts'>
  import { browser } from '$app/environment'
  import { Button } from '$lib/components/ui/button'
  import { ScrollArea } from '$lib/components/ui/scroll-area'
  import TooltipButton from '$lib/components/ui/tooltip-button.svelte'
  import { m } from '$lib/paraglide/messages'
  import { setMessageFeedback, setPendingTaskDraft } from '$lib/stores/conversation'
  import { preferencesStore } from '$lib/stores/preferences'
  import { tasksStore } from '$lib/stores/tasks'
  import { Check, Copy, ThumbsDown, ThumbsUp } from '@lucide/svelte'

  const { taskId } = $props<{ taskId: string | null }>()
  let copiedMessageId = $state<string | null>(null)

  const activeTask = $derived($tasksStore.tasks.find(task => task.id === taskId) ?? null)
  const starterSuggestions = [
    m.workspace_empty_prompt_one(),
    m.workspace_empty_prompt_two(),
    m.workspace_empty_prompt_three(),
  ]

  function formatTime(value: string) {
    return new Intl.DateTimeFormat($preferencesStore.locale, {
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

  function applySuggestion(prompt: string) {
    const nextPrompt = prompt.trim()

    if (nextPrompt.length === 0) {
      return
    }

    setPendingTaskDraft(nextPrompt)
  }
</script>

<section class='flex min-h-0 flex-1 flex-col overflow-hidden'>
  {#if activeTask}
    <ScrollArea class='min-h-0 flex-1' viewportClass='px-3 py-3' scrollbars='vertical'>
      <div class='flex flex-col gap-3'>
        {#each activeTask.messages as message (message.id)}
          <div class={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
            <article class={`text-sm leading-6 ${message.role === 'assistant' ? 'max-w-[86%] text-foreground' : 'w-fit max-w-[86%] rounded-[10px] bg-brand px-2.5 py-2 text-brand-foreground'}`}>
              <p class='wrap-break-word whitespace-pre-wrap'>{message.content}</p>
              {#if message.role === 'assistant'}
                <div class='mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground'>
                  <div class='flex items-center gap-0.5'>
                    <TooltipButton
                      content={m.copy_message()}
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
                      content={m.upvote_message()}
                      class={`inline-flex size-6 items-center justify-center rounded-[6px] text-muted-foreground transition hover:bg-shell-muted-panel hover:text-foreground ${message.feedback === 'up' ? 'text-brand' : ''}`}
                      onclick={() => taskId && setMessageFeedback(taskId, message.id, 'up')}
                    >
                      <ThumbsUp class='size-3.5' />
                    </TooltipButton>

                    <TooltipButton
                      content={m.downvote_message()}
                      class={`inline-flex size-6 items-center justify-center rounded-[6px] text-muted-foreground transition hover:bg-shell-muted-panel hover:text-foreground ${message.feedback === 'down' ? 'text-brand' : ''}`}
                      onclick={() => taskId && setMessageFeedback(taskId, message.id, 'down')}
                    >
                      <ThumbsDown class='size-3.5' />
                    </TooltipButton>
                  </div>

                  <span class='ml-1'>{formatTime(message.createdAt)}</span>
                </div>
              {/if}
            </article>
          </div>
        {/each}
      </div>
    </ScrollArea>
  {:else}
    <div class='flex flex-1 items-center justify-center px-6 py-8'>
      <div class='mx-auto flex w-full min-w-0 max-w-2xl flex-col items-center text-center'>
        <h2 class='max-w-full px-4 text-3xl font-semibold tracking-tight text-foreground wrap-break-word sm:text-4xl'>
          {m.workspace_empty_title()}
        </h2>

        <div class='mt-4 flex w-full min-w-0 flex-wrap justify-center gap-2'>
          {#each starterSuggestions as suggestion}
            <Button
              variant='outline'
              size='sm'
              class='max-w-full whitespace-normal wrap-break-word text-center sm:whitespace-nowrap'
              onclick={() => applySuggestion(suggestion)}
            >
              {suggestion}
            </Button>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</section>
