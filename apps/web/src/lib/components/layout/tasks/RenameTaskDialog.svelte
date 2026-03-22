<script lang='ts'>
  import { Button } from '$lib/components/ui/button'
  import * as Dialog from '$lib/components/ui/dialog'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import { m } from '$lib/paraglide/messages.js'
  import { tick } from 'svelte'

  let {
    open = $bindable(false),
    taskTitle,
    onsubmit,
  }: {
    open?: boolean
    taskTitle: string
    onsubmit: (title: string) => void
  } = $props()

  let inputElement = $state<HTMLInputElement | null>(null)
  let draft = $state('')

  const canSubmit = $derived(draft.trim().length > 0 && draft.trim() !== taskTitle.trim())

  $effect(() => {
    if (!open) {
      return
    }

    draft = taskTitle

    void tick().then(() => {
      inputElement?.focus()
      inputElement?.select()
    })
  })

  function close() {
    open = false
  }

  function submit(event?: SubmitEvent) {
    event?.preventDefault()

    if (!canSubmit) {
      return
    }

    onsubmit(draft.trim())
    close()
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content class='max-w-sm border border-shell-border bg-shell-elevated/98 p-5 shadow-[0_24px_48px_rgba(15,23,42,0.18)] backdrop-blur-xl'>
    <form class='grid gap-4' onsubmit={submit}>
      <Dialog.Header>
        <Dialog.Title class='text-base font-semibold text-foreground'>
          {m.rename_task_prompt()}
        </Dialog.Title>
        <Dialog.Description>
          {m.rename_task_description()}
        </Dialog.Description>
      </Dialog.Header>

      <div class='grid gap-2'>
        <Label for='rename-task-title'>{m.task_title_label()}</Label>
        <Input
          id='rename-task-title'
          bind:ref={inputElement}
          bind:value={draft}
          placeholder={taskTitle}
          maxlength={80}
        />
      </div>

      <Dialog.Footer class='mt-1 sm:justify-end'>
        <Button type='button' variant='outline' onclick={close}>
          {m.cancel()}
        </Button>
        <Button type='submit' disabled={!canSubmit}>
          {m.rename_task()}
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
