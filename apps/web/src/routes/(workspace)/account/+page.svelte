<script lang='ts'>
  import { Card } from '$lib/components/ui/card'
  import { m } from '$lib/paraglide/messages.js'
  import { authStore } from '$lib/stores/auth'

  const profileFields = $derived.by(() => [
    { label: m.account_name_label(), value: $authStore.user.displayName },
    { label: m.account_email_label(), value: $authStore.user.email },
    { label: m.account_role_label(), value: $authStore.user.role },
  ])
</script>

<section class='grid gap-3'>
  <Card size='sm' class='px-4'>
    <p class='shell-card-label'>{m.account_title()}</p>
    <h3 class='shell-card-title'>{$authStore.user.displayName}</h3>
    <p class='shell-card-copy'>{m.account_description()}</p>
  </Card>

  <Card size='sm' class='px-4'>
    <div class='grid gap-3 lg:grid-cols-2'>
      {#each profileFields as field}
        <div class='rounded-[8px] border border-shell-border bg-shell-muted-panel px-3 py-3'>
          <p class='shell-card-label'>{field.label}</p>
          <p class='mt-1 text-sm font-medium text-foreground'>{field.value}</p>
        </div>
      {/each}
    </div>
  </Card>
</section>
