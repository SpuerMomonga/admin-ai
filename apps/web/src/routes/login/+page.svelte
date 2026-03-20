<script lang='ts'>
  import { goto } from '$app/navigation'
  import { onMount } from 'svelte'
  import AppLogo from '$lib/components/AppLogo.svelte'
  import { translate as t } from '$lib/i18n'
  import { appShell, buildWorkspacePath } from '$lib/stores/app-shell'
  import { LockKeyhole, Sparkles } from '@lucide/svelte'

  let account = $state('')
  let password = $state('')
  let rememberMe = $state(true)

  onMount(async () => {
    appShell.hydrate()

    const snapshot = appShell.getSnapshot()

    if (snapshot.isLoggedIn) {
      await goto(buildWorkspacePath(null, snapshot.activePanel), { replaceState: true })
    }
  })

  async function submit() {
    appShell.login(account)

    const snapshot = appShell.getSnapshot()
    await goto(buildWorkspacePath(null, snapshot.activePanel))
  }
</script>

<section class='mx-auto grid min-h-screen w-full max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1.05fr)_440px] lg:px-6'>
  <div class='shell-panel flex flex-col justify-between overflow-hidden px-5 py-5'>
    <div>
      <div class='flex items-center justify-between gap-3'>
        <AppLogo />
        <div class='inline-flex items-center gap-2 rounded-full border border-shell-border bg-shell-muted-panel px-3 py-1.5 text-xs text-muted-foreground'>
          <Sparkles class='size-3.5 text-brand' />
          {t('welcome_back')}
        </div>
      </div>

      <div class='mt-10 max-w-2xl'>
        <p class='text-[11px] font-semibold uppercase tracking-[0.28em] text-brand'>{t('login_eyebrow')}</p>
        <h1 class='mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl'>{t('login_title')}</h1>
        <p class='mt-4 max-w-xl text-base leading-7 text-muted-foreground'>{t('login_description')}</p>
      </div>
    </div>

    <div class='mt-8 grid gap-3 md:grid-cols-3'>
      <article class='shell-card'>
        <p class='shell-card-label'>01</p>
        <p class='mt-2 text-sm leading-6 text-muted-foreground'>{t('login_tip_one')}</p>
      </article>
      <article class='shell-card'>
        <p class='shell-card-label'>02</p>
        <p class='mt-2 text-sm leading-6 text-muted-foreground'>{t('login_tip_two')}</p>
      </article>
      <article class='shell-card'>
        <p class='shell-card-label'>03</p>
        <p class='mt-2 text-sm leading-6 text-muted-foreground'>{t('login_tip_three')}</p>
      </article>
    </div>
  </div>

  <div class='shell-panel flex flex-col justify-between px-5 py-5'>
    <div>
      <div class='inline-flex items-center gap-2 rounded-full border border-shell-border bg-shell-muted-panel px-3 py-1.5 text-xs text-muted-foreground'>
        <LockKeyhole class='size-3.5 text-brand' />
        {t('login_side_title')}
      </div>

      <p class='mt-4 text-sm leading-6 text-muted-foreground'>{t('login_side_desc')}</p>

      <form class='mt-8 space-y-4' onsubmit={(event) => {
        event.preventDefault()
        void submit()
      }}>
        <label class='shell-field'>
          <span>{t('account_label')}</span>
          <input
            class='shell-input'
            bind:value={account}
            placeholder={t('account_placeholder')}
          />
        </label>

        <label class='shell-field'>
          <span>{t('password_label')}</span>
          <input
            type='password'
            class='shell-input'
            bind:value={password}
            placeholder={t('password_placeholder')}
          />
        </label>

        <label class='flex items-center gap-2 text-sm text-muted-foreground'>
          <input class='size-4 rounded border-shell-border accent-brand' type='checkbox' bind:checked={rememberMe} />
          <span>{t('remember_me')}</span>
        </label>

        <button type='submit' class='shell-primary-button w-full justify-center'>
          {t('enter_workspace')}
        </button>
      </form>
    </div>

    <div class='mt-6 rounded-[8px] border border-shell-border bg-shell-muted-panel p-4'>
      <p class='text-sm font-semibold text-foreground'>{t('app_subtitle')}</p>
      <p class='mt-2 text-sm leading-6 text-muted-foreground'>{t('save_state_hint')}</p>
    </div>
  </div>
</section>
