<script lang='ts'>
  import type { AdminPanel } from '$lib/stores/app-shell'
  import ChatComposer from '$lib/components/layout/chat/ChatComposer.svelte'
  import ChatConversation from '$lib/components/layout/chat/ChatConversation.svelte'
  import ChatHeader from '$lib/components/layout/chat/ChatHeader.svelte'

  const { taskId, panel } = $props<{ taskId: string | null, panel: AdminPanel }>()
</script>

<section class='workspace-pane workspace-center-pane flex h-full min-h-0 min-w-0 flex-col overflow-hidden'>
  <ChatHeader {taskId} {panel} />
  <ChatConversation {taskId} {panel} />
  <ChatComposer {taskId} {panel} />
</section>
