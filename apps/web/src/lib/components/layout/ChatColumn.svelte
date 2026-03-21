<script lang='ts'>
  import ChatComposer from '$lib/components/layout/chat/ChatComposer.svelte'
  import ChatConversation from '$lib/components/layout/chat/ChatConversation.svelte'
  import ChatHeader from '$lib/components/layout/chat/ChatHeader.svelte'

  const { taskId, adminPath } = $props<{ taskId: string | null, adminPath: string }>()
</script>

<section class='workspace-pane workspace-center-pane flex h-full min-h-0 min-w-0 flex-col overflow-hidden'>
  <ChatHeader {taskId} {adminPath} />
  <ChatConversation {taskId} />
  <ChatComposer {taskId} {adminPath} />
</section>
