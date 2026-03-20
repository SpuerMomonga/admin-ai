<script lang='ts'>
  import ChatComposer from '$lib/components/workspace/chat/ChatComposer.svelte'
  import ChatConversation from '$lib/components/workspace/chat/ChatConversation.svelte'
  import ChatHeader from '$lib/components/workspace/chat/ChatHeader.svelte'
  import { type AdminPanel } from '$lib/stores/app-shell'

  let { taskId, panel } = $props<{ taskId: string | null, panel: AdminPanel }>()
</script>

<section class='workspace-pane workspace-center-pane flex h-full min-h-0 min-w-0 flex-col overflow-hidden'>
  <ChatHeader {taskId} {panel} />
  <ChatConversation {taskId} {panel} />
  <ChatComposer {taskId} {panel} />
</section>
