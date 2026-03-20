<script lang='ts'>
  import { browser } from '$app/environment'
  import { goto } from '$app/navigation'
  import { onMount } from 'svelte'
  import { translate as t, localeOptions } from '$lib/i18n'
  import { appShell, buildWorkspacePath, type AdminPanel } from '$lib/stores/app-shell'
  import { Globe2, LogOut, MoonStar, Settings2, SunMedium, UserCircle2 } from '@lucide/svelte'

  let { taskId, panel } = $props<{ taskId: string | null, panel: AdminPanel }>()

  let menuElement = $state<HTMLDivElement | null>(null)
  let open = $state(false)

  async function openPanel(nextPanel: AdminPanel) {
    open = false
    await goto(buildWorkspacePath(taskId, nextPanel))
  }

  async function logout() {
    open = false
    appShell.logout()
    await goto('/login')
  }

  function toggleMenu() {
    open = !open
  }

  onMount(() => {
    if (!browser) {
      return
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!open || !menuElement) {
        return
      }

      const target = event.target

      if (target instanceof Node && !menuElement.contains(target)) {
        open = false
      }
    }

    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        open = false
      }
    }

    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeydown)

    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeydown)
    }
  })
</script>

<div bind:this={menuElement} class='relative'>
  <button
    type='button'
    class={`shell-avatar-trigger ${open ? 'bg-brand/12 text-foreground' : ''}`}
    title={$appShell.user.displayName}
    aria-label={$appShell.user.displayName}
    aria-haspopup='menu'
    aria-expanded={open}
    onclick={toggleMenu}
  >
    <span class='flex size-6 items-center justify-center rounded-full bg-brand text-[10px] font-semibold text-brand-foreground'>
      {$appShell.user.displayName.slice(0, 2).toUpperCase()}
    </span>
  </button>

  {#if open}
    <div class='absolute right-0 z-20 mt-2 w-72 rounded-[10px] border border-shell-border bg-shell-elevated p-3 shadow-[0_20px_40px_rgba(15,23,42,0.18)] backdrop-blur'>
      <div class='rounded-[8px] border border-shell-border bg-shell-muted-panel p-3'>
        <div class='flex items-center gap-3'>
          <span class='flex size-9 items-center justify-center rounded-full bg-brand text-sm font-semibold text-brand-foreground'>
            {$appShell.user.displayName.slice(0, 2).toUpperCase()}
          </span>
          <div class='min-w-0'>
            <p class='truncate text-sm font-semibold text-foreground'>{$appShell.user.displayName}</p>
            <p class='truncate text-xs text-muted-foreground'>{$appShell.settings.account.email}</p>
          </div>
        </div>
      </div>

      <div class='mt-3 grid gap-1.5'>
        <button type='button' class='shell-menu-button' onclick={() => openPanel('account')}>
          <UserCircle2 class='size-4' />
          <span>{t('profile')}</span>
        </button>
        <button type='button' class='shell-menu-button' onclick={() => openPanel('general')}>
          <Settings2 class='size-4' />
          <span>{t('preferences')}</span>
        </button>
      </div>

      <div class='mt-3 rounded-[8px] border border-shell-border bg-shell-muted-panel p-3'>
        <p class='text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground'>{t('language')}</p>
        <div class='mt-2 flex gap-2'>
          {#each localeOptions as locale}
            <button
              type='button'
              class={`shell-chip-button ${$appShell.locale === locale.value ? 'bg-brand text-brand-foreground shadow-[0_8px_18px_rgba(0,78,162,0.16)]' : ''}`}
              onclick={() => appShell.setLocalePreference(locale.value)}
            >
              <Globe2 class='size-3.5' />
              <span>{t(locale.labelKey)}</span>
            </button>
          {/each}
        </div>
      </div>

      <div class='mt-3 rounded-[8px] border border-shell-border bg-shell-muted-panel p-3'>
        <p class='text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground'>{t('theme')}</p>
        <div class='mt-2 flex gap-2'>
          <button
            type='button'
            class={`shell-chip-button ${$appShell.themePreference === 'light' ? 'bg-brand text-brand-foreground shadow-[0_8px_18px_rgba(0,78,162,0.16)]' : ''}`}
            onclick={() => appShell.setThemePreference('light')}
          >
            <SunMedium class='size-3.5' />
            <span>{t('theme_light')}</span>
          </button>
          <button
            type='button'
            class={`shell-chip-button ${$appShell.themePreference === 'dark' ? 'bg-brand text-brand-foreground shadow-[0_8px_18px_rgba(0,78,162,0.16)]' : ''}`}
            onclick={() => appShell.setThemePreference('dark')}
          >
            <MoonStar class='size-3.5' />
            <span>{t('theme_dark')}</span>
          </button>
        </div>
      </div>

      <button type='button' class='shell-danger-button mt-3 w-full justify-center border border-destructive/20 px-3 py-2 text-sm font-medium' onclick={logout}>
        <LogOut class='mr-2 inline size-4' />
        {t('logout')}
      </button>
    </div>
  {/if}
</div>
