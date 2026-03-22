<script lang='ts'>
  import { Card } from '$lib/components/ui/card'
  import { m } from '$lib/paraglide/messages.js'

  const ruleFields = $derived.by(() => [
    { label: m.rules_approval_label(), value: m.rules_approval_guided() },
    { label: m.rules_style_label(), value: m.rules_style_compact() },
    { label: m.rules_cache_label(), value: m.rules_cache_session_and_reload() },
    { label: m.rules_execution_label(), value: m.rules_execution_safe_first() },
  ])
</script>

<section class='grid gap-3'>
  <Card size='sm' class='px-4'>
    <p class='shell-card-label'>{m.rules_title()}</p>
    <h3 class='shell-card-title'>{m.panel_rules()}</h3>
    <p class='shell-card-copy'>{m.rules_description()}</p>
  </Card>

  <Card size='sm' class='px-4'>
    <div class='grid gap-3 lg:grid-cols-2'>
      {#each ruleFields as field}
        <div class='rounded-[8px] border border-shell-border bg-shell-muted-panel px-3 py-3'>
          <p class='shell-card-label'>{field.label}</p>
          <p class='mt-1 text-sm font-medium text-foreground'>{field.value}</p>
        </div>
      {/each}
    </div>

    <p class='mt-3 text-sm leading-6 text-muted-foreground'>{m.panel_cache_hint()}</p>
  </Card>
</section>
