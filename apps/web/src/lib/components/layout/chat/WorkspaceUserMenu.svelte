<script lang='ts'>
  import type { AdminPanel } from '$lib/stores/app-shell'
  import { goto } from '$app/navigation'
  import { Button } from '$lib/components/ui/button'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import { localeOptions, translate as t } from '$lib/i18n'
  import { appShell, buildWorkspacePath } from '$lib/stores/app-shell'
  import { Globe2, LogOut, MoonStar, Settings2, SunMedium, UserCircle2 } from '@lucide/svelte'

  const { taskId } = $props<{ taskId: string | null, panel: AdminPanel }>()

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
</script>

<DropdownMenu.Root bind:open>
  <DropdownMenu.Trigger
    class={`shell-avatar-trigger ${open ? 'bg-brand/12 text-foreground' : ''}`}
    title={$appShell.user.displayName}
    aria-label={$appShell.user.displayName}
  >
    <span class='flex size-6 items-center justify-center rounded-full bg-brand text-[10px] font-semibold text-brand-foreground'>
      {$appShell.user.displayName.slice(0, 2).toUpperCase()}
    </span>
  </DropdownMenu.Trigger>

  <DropdownMenu.Content align='end' sideOffset={8} class='w-72 p-3'>
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
      <DropdownMenu.Item class='px-2.5 py-2' onclick={() => openPanel('account')}>
        <UserCircle2 class='size-4' />
        <span>{t('profile')}</span>
      </DropdownMenu.Item>
      <DropdownMenu.Item class='px-2.5 py-2' onclick={() => openPanel('general')}>
        <Settings2 class='size-4' />
        <span>{t('preferences')}</span>
      </DropdownMenu.Item>
    </div>

    <DropdownMenu.Separator class='my-3 bg-shell-border' />

    <div class='rounded-[8px] border border-shell-border bg-shell-muted-panel p-3'>
      <p class='text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground'>{t('language')}</p>
      <div class='mt-2 flex gap-2'>
        {#each localeOptions as locale}
          <Button
            variant={$appShell.locale === locale.value ? 'default' : 'outline'}
            size='xs'
            onclick={() => appShell.setLocalePreference(locale.value)}
          >
            <Globe2 class='size-3.5' />
            <span>{t(locale.labelKey)}</span>
          </Button>
        {/each}
      </div>
    </div>

    <div class='mt-3 rounded-[8px] border border-shell-border bg-shell-muted-panel p-3'>
      <p class='text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground'>{t('theme')}</p>
      <div class='mt-2 flex gap-2'>
        <Button
          variant={$appShell.themePreference === 'light' ? 'default' : 'outline'}
          size='xs'
          onclick={() => appShell.setThemePreference('light')}
        >
          <SunMedium class='size-3.5' />
          <span>{t('theme_light')}</span>
        </Button>
        <Button
          variant={$appShell.themePreference === 'dark' ? 'default' : 'outline'}
          size='xs'
          onclick={() => appShell.setThemePreference('dark')}
        >
          <MoonStar class='size-3.5' />
          <span>{t('theme_dark')}</span>
        </Button>
      </div>
    </div>

    <DropdownMenu.Separator class='my-3 bg-shell-border' />

    <DropdownMenu.Item variant='destructive' class='justify-center px-3 py-2 text-sm font-medium' onclick={logout}>
      <LogOut class='size-4' />
      <span>{t('logout')}</span>
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
