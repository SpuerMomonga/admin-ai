<script lang='ts'>
  import { goto } from '$app/navigation'
  import AppLogo from '$lib/components/AppLogo.svelte'
  import { Button } from '$lib/components/ui/button'
  import { Card } from '$lib/components/ui/card'
  import { Checkbox } from '$lib/components/ui/checkbox'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import { m } from '$lib/paraglide/messages.js'
  import { getAuthSnapshot, hydrateAuth, login } from '$lib/stores/auth'
  import { buildWorkspacePath, getTabsSnapshot } from '$lib/stores/tabs'
  import { getTasksSnapshot } from '$lib/stores/tasks'
  import { LockKeyhole, Sparkles } from '@lucide/svelte'
  import { onMount } from 'svelte'

  let account = $state('')
  let password = $state('')
  let rememberMe = $state(true)

  onMount(async () => {
    hydrateAuth()

    const authSnapshot = getAuthSnapshot()

    if (authSnapshot.isLoggedIn) {
      await goto(buildWorkspacePath(getTasksSnapshot().activeTaskId, getTabsSnapshot().activeAdminPath), { replaceState: true })
    }
  })

  async function submit() {
    login(account)

    await goto(buildWorkspacePath(getTasksSnapshot().activeTaskId, getTabsSnapshot().activeAdminPath))
  }
</script>

<section class='mx-auto grid min-h-screen w-full max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1.05fr)_440px] lg:px-6'>
  <div class='shell-panel flex flex-col justify-between overflow-hidden px-5 py-5'>
    <div>
      <div class='flex items-center justify-between gap-3'>
        <AppLogo />
        <div class='inline-flex items-center gap-2 rounded-full border border-shell-border bg-shell-muted-panel px-3 py-1.5 text-xs text-muted-foreground'>
          <Sparkles class='size-3.5 text-brand' />
          {m.welcome_back()}
        </div>
      </div>

      <div class='mt-10 max-w-2xl'>
        <p class='text-[11px] font-semibold uppercase tracking-[0.28em] text-brand'>{m.login_eyebrow()}</p>
        <h1 class='mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl'>{m.login_title()}</h1>
        <p class='mt-4 max-w-xl text-base leading-7 text-muted-foreground'>{m.login_description()}</p>
      </div>
    </div>

    <div class='mt-8 grid gap-3 md:grid-cols-3'>
      <Card size='sm' class='px-4'>
        <p class='shell-card-label'>01</p>
        <p class='mt-2 text-sm leading-6 text-muted-foreground'>{m.login_tip_one()}</p>
      </Card>
      <Card size='sm' class='px-4'>
        <p class='shell-card-label'>02</p>
        <p class='mt-2 text-sm leading-6 text-muted-foreground'>{m.login_tip_two()}</p>
      </Card>
      <Card size='sm' class='px-4'>
        <p class='shell-card-label'>03</p>
        <p class='mt-2 text-sm leading-6 text-muted-foreground'>{m.login_tip_three()}</p>
      </Card>
    </div>
  </div>

  <div class='shell-panel flex flex-col justify-between px-5 py-5'>
    <div>
      <div class='inline-flex items-center gap-2 rounded-full border border-shell-border bg-shell-muted-panel px-3 py-1.5 text-xs text-muted-foreground'>
        <LockKeyhole class='size-3.5 text-brand' />
        {m.login_side_title()}
      </div>

      <p class='mt-4 text-sm leading-6 text-muted-foreground'>{m.login_side_desc()}</p>

      <form class='mt-8 space-y-4' onsubmit={(event) => {
        event.preventDefault()
        void submit()
      }}>
        <div class='grid gap-2'>
          <Label for='login-account'>{m.account_label()}</Label>
          <Input
            id='login-account'
            bind:value={account}
            placeholder={m.account_placeholder()}
          />
        </div>

        <div class='grid gap-2'>
          <Label for='login-password'>{m.password_label()}</Label>
          <Input
            id='login-password'
            type='password'
            bind:value={password}
            placeholder={m.password_placeholder()}
          />
        </div>

        <div class='flex items-center gap-2 text-sm text-muted-foreground'>
          <Checkbox id='remember-me' bind:checked={rememberMe} />
          <Label for='remember-me' class='text-sm font-normal text-muted-foreground'>{m.remember_me()}</Label>
        </div>

        <Button type='submit' class='w-full justify-center'>
          {m.enter_workspace()}
        </Button>
      </form>
    </div>

    <Card size='sm' class='mt-6 border-shell-border bg-shell-muted-panel px-4'>
      <p class='text-sm font-semibold text-foreground'>{m.app_subtitle()}</p>
      <p class='mt-2 text-sm leading-6 text-muted-foreground'>{m.save_state_hint()}</p>
    </Card>
  </div>
</section>
