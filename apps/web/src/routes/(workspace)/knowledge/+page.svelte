<script lang='ts'>
  import { Card } from '$lib/components/ui/card'
  import { m } from '$lib/paraglide/messages'
  import { knowledgeBases } from '$lib/stores/conversation'

  const knowledgeSummary = $derived.by(() => [
    { label: m.knowledge_default_label(), value: 'OPS' },
    { label: m.knowledge_scope_label(), value: m.knowledge_scope_current() },
  ])
</script>

<section class='grid gap-3'>
  <Card size='sm' class='px-4'>
    <p class='shell-card-label'>{m.knowledge_title()}</p>
    <h3 class='shell-card-title'>OPS</h3>
    <p class='shell-card-copy'>{m.knowledge_description()}</p>
  </Card>

  <Card size='sm' class='px-4'>
    <div class='grid gap-3 lg:grid-cols-3'>
      {#each knowledgeSummary as field}
        <div class='rounded-[8px] border border-shell-border bg-shell-muted-panel px-3 py-3'>
          <p class='shell-card-label'>{field.label}</p>
          <p class='mt-1 text-sm font-medium text-foreground'>{field.value}</p>
        </div>
      {/each}
    </div>

    <div class='mt-3 grid gap-3 md:grid-cols-3'>
      {#each knowledgeBases as knowledgeBase}
        <div class={`rounded-[8px] border px-3 py-3 ${knowledgeBase.id === 'ops-playbook' ? 'border-brand/35 bg-brand/10 shadow-[0_8px_18px_rgba(0,78,162,0.1)]' : 'border-shell-border bg-shell-muted-panel'}`}>
          <p class='text-sm font-semibold text-foreground'>{knowledgeBase.badge}</p>
          <p class='mt-2 text-xs leading-5 text-muted-foreground'>{knowledgeBase.id}</p>
        </div>
      {/each}
    </div>
  </Card>
</section>
