<script lang='ts'>
  import type { AdminPanel } from '$lib/stores/tabs'
  import type { ThemePreference } from '$lib/types/app'
  import { goto } from '$app/navigation'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import { m } from '$lib/paraglide/messages'
  import { authStore, logout as logoutSession } from '$lib/stores/auth'
  import { preferencesStore, updatePreference } from '$lib/stores/preferences'
  import { buildWorkspacePath } from '$lib/stores/tabs'
  import { BookOpen, LogOut, MessageSquare, Monitor, MoonStar, Settings2, SunMedium, UserCircle2 } from '@lucide/svelte'

  const { taskId } = $props<{ taskId: string | null, adminPath: string }>()
  const HELP_DOCS_URL = 'https://github.com/SpuerMomonga/admin-ai#readme'
  const FEEDBACK_ISSUE_URL = 'https://github.com/SpuerMomonga/admin-ai/issues/new'

  let open = $state(false)

  async function openPanel(nextPanel: AdminPanel) {
    open = false
    await goto(buildWorkspacePath(taskId, nextPanel))
  }

  function getThemeLabel(themePreference: ThemePreference) {
    if (themePreference === 'light') {
      return m.theme_light()
    }

    if (themePreference === 'dark') {
      return m.theme_dark()
    }

    return m.theme_system()
  }

  function setTheme(themePreference: ThemePreference) {
    updatePreference('themePreference', themePreference)
    open = false
  }

  function openExternal(url: string) {
    open = false
    window.open(url, '_blank', 'noopener,noreferrer')
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

  <DropdownMenu.Content align='end' sideOffset={8} class='w-64 p-3'>
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
      <DropdownMenu.Separator class='my-1 bg-shell-border' />
      <DropdownMenu.Sub>
        <DropdownMenu.SubTrigger class='px-2.5 py-2'>
          <Monitor class='size-4' />
          <span>{m.theme()}</span>
          <DropdownMenu.Shortcut class='normal-case tracking-normal'>
            {getThemeLabel($preferencesStore.themePreference)}
          </DropdownMenu.Shortcut>
        </DropdownMenu.SubTrigger>
        <DropdownMenu.SubContent class='w-44 p-1.5'>
          <DropdownMenu.RadioGroup value={$preferencesStore.themePreference}>
            <DropdownMenu.RadioItem value='system' class='px-2.5 py-2' onclick={() => setTheme('system')}>
              <Monitor class='size-4' />
              <span>{m.theme_system()}</span>
            </DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value='light' class='px-2.5 py-2' onclick={() => setTheme('light')}>
              <SunMedium class='size-4' />
              <span>{m.theme_light()}</span>
            </DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value='dark' class='px-2.5 py-2' onclick={() => setTheme('dark')}>
              <MoonStar class='size-4' />
              <span>{m.theme_dark()}</span>
            </DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.SubContent>
      </DropdownMenu.Sub>
      <DropdownMenu.Item class='px-2.5 py-2' onclick={() => openExternal(HELP_DOCS_URL)}>
        <BookOpen class='size-4' />
        <span>{m.help_docs()}</span>
      </DropdownMenu.Item>
      <DropdownMenu.Item class='px-2.5 py-2' onclick={() => openExternal(FEEDBACK_ISSUE_URL)}>
        <MessageSquare class='size-4' />
        <span>{m.feedback_issue()}</span>
      </DropdownMenu.Item>
    </div>

    <DropdownMenu.Separator class='my-3 bg-shell-border' />

    <DropdownMenu.Item
      variant='destructive'
      class='justify-center border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm font-medium'
      onclick={logout}
    >
      <LogOut class='size-4' />
      <span>{m.logout()}</span>
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
