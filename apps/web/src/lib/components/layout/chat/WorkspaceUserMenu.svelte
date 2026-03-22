<script lang='ts'>
  import type { AdminPanel } from '$lib/stores/tabs'
  import { goto } from '$app/navigation'
  import { Button } from '$lib/components/ui/button'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import { availableLocales } from '$lib/i18n'
  import { m } from '$lib/paraglide/messages.js'
  import { authStore, logout as logoutSession } from '$lib/stores/auth'
  import { preferencesStore, updatePreference } from '$lib/stores/preferences'
  import { buildWorkspacePath } from '$lib/stores/tabs'
  import { Globe2, LogOut, MoonStar, Settings2, SunMedium, UserCircle2 } from '@lucide/svelte'

  const { taskId } = $props<{ taskId: string | null, adminPath: string }>()

  let open = $state(false)

  async function openPanel(nextPanel: AdminPanel) {
    open = false
    await goto(buildWorkspacePath(taskId, nextPanel))
  }

  async function logout() {
    open = false
    logoutSession()
    await goto('/login')
  }
</script>

<DropdownMenu.Root bind:open>
  <DropdownMenu.Trigger
    class={`shell-avatar-trigger ${open ? 'bg-brand/12 text-foreground' : ''}`}
    title={$authStore.user.displayName}
    aria-label={$authStore.user.displayName}
  >
    <span class='flex size-6 items-center justify-center rounded-full bg-brand text-[10px] font-semibold text-brand-foreground'>
      {$authStore.user.displayName.slice(0, 2).toUpperCase()}
    </span>
  </DropdownMenu.Trigger>

  <DropdownMenu.Content align='end' sideOffset={8} class='w-72 p-3'>
    <div class='rounded-[8px] border border-shell-border bg-shell-muted-panel p-3'>
      <div class='flex items-center gap-3'>
        <span class='flex size-9 items-center justify-center rounded-full bg-brand text-sm font-semibold text-brand-foreground'>
          {$authStore.user.displayName.slice(0, 2).toUpperCase()}
        </span>
        <div class='min-w-0'>
          <p class='truncate text-sm font-semibold text-foreground'>{$authStore.user.displayName}</p>
          <p class='truncate text-xs text-muted-foreground'>{$authStore.user.email}</p>
        </div>
      </div>
    </div>

    <div class='mt-3 grid gap-1.5'>
      <DropdownMenu.Item class='px-2.5 py-2' onclick={() => openPanel('account')}>
        <UserCircle2 class='size-4' />
        <span>{m.profile()}</span>
      </DropdownMenu.Item>
      <DropdownMenu.Item class='px-2.5 py-2' onclick={() => openPanel('preferences')}>
        <Settings2 class='size-4' />
        <span>{m.preferences()}</span>
      </DropdownMenu.Item>
    </div>

    <DropdownMenu.Separator class='my-3 bg-shell-border' />

    <div class='rounded-[8px] border border-shell-border bg-shell-muted-panel p-3'>
      <p class='text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground'>{m.language()}</p>
      <div class='mt-2 flex gap-2'>
        {#each availableLocales as locale}
          <Button
            variant={$preferencesStore.locale === locale ? 'default' : 'outline'}
            size='xs'
            onclick={() => updatePreference('locale', locale)}
          >
            <Globe2 class='size-3.5' />
            <span>{locale === 'zh-CN' ? m.locale_zh_cn() : m.locale_en()}</span>
          </Button>
        {/each}
      </div>
    </div>

    <div class='mt-3 rounded-[8px] border border-shell-border bg-shell-muted-panel p-3'>
      <p class='text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground'>{m.theme()}</p>
      <div class='mt-2 flex gap-2'>
        <Button
          variant={$preferencesStore.themePreference === 'light' ? 'default' : 'outline'}
          size='xs'
          onclick={() => updatePreference('themePreference', 'light')}
        >
          <SunMedium class='size-3.5' />
          <span>{m.theme_light()}</span>
        </Button>
        <Button
          variant={$preferencesStore.themePreference === 'dark' ? 'default' : 'outline'}
          size='xs'
          onclick={() => updatePreference('themePreference', 'dark')}
        >
          <MoonStar class='size-3.5' />
          <span>{m.theme_dark()}</span>
        </Button>
      </div>
    </div>

    <DropdownMenu.Separator class='my-3 bg-shell-border' />

    <DropdownMenu.Item variant='destructive' class='justify-center px-3 py-2 text-sm font-medium' onclick={logout}>
      <LogOut class='size-4' />
      <span>{m.logout()}</span>
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
