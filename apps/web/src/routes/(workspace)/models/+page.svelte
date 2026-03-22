<script lang='ts'>
  import { Card } from '$lib/components/ui/card'
  import { m } from '$lib/paraglide/messages.js'

  const modelFields = $derived.by(() => [
    { label: m.models_primary_label(), value: 'GPT-5.4' },
    { label: m.models_operation_label(), value: 'GPT-5.3-codex' },
    { label: m.models_routing_label(), value: m.models_routing_policy_complexity_first() },
  ])
</script>

<section class='grid gap-3'>
  <Card size='sm' class='px-4'>
    <p class='shell-card-label'>{m.models_title()}</p>
    <h3 class='shell-card-title'>GPT-5.4</h3>
    <p class='shell-card-copy'>{m.models_description()}</p>
  </Card>

  <Card size='sm' class='px-4'>
    <div class='grid gap-3 lg:grid-cols-3'>
      {#each modelFields as field}
        <div class='rounded-[8px] border border-shell-border bg-shell-muted-panel px-3 py-3'>
          <p class='shell-card-label'>{field.label}</p>
          <p class='mt-1 text-sm font-medium text-foreground'>{field.value}</p>
        </div>
      {/each}
    </div>
  </Card>
</section>
