<script lang='ts'>
  import type { AdminNavigationMode, AppLocale, ThemePreference } from '$lib/types/app'
  import AppSelect from '$lib/components/ui/app-select.svelte'
  import { Card } from '$lib/components/ui/card'
  import { m } from '$lib/paraglide/messages.js'
  import { preferencesStore, updatePreference } from '$lib/stores/preferences'
  import { MoonStar, SunMedium } from '@lucide/svelte'

  type PreferenceOption<T> = {
    value: T
    label: string
  }

  const themeOptions = $derived.by<PreferenceOption<ThemePreference>[]>(() => [
    { value: 'system', label: m.theme_system() },
    { value: 'light', label: m.theme_light() },
    { value: 'dark', label: m.theme_dark() },
  ])

  const languageOptions = $derived.by<{ value: AppLocale, label: string }[]>(() => [
    { value: 'zh-CN', label: m.locale_zh_cn() },
    { value: 'en', label: m.locale_en() },
  ])

  const adminNavigationOptions = $derived.by<PreferenceOption<AdminNavigationMode>[]>(() => [
    { value: 'topbar', label: m.admin_nav_topbar() },
    { value: 'sidebar', label: m.admin_nav_sidebar() },
  ])

  const adminTabBarOptions = $derived.by<PreferenceOption<boolean>[]>(() => [
    { value: true, label: m.admin_tab_bar_show() },
    { value: false, label: m.admin_tab_bar_hide() },
  ])

  function getChoiceCardClass(selected: boolean) {
    return selected
      ? 'border-brand/35 bg-brand/8 shadow-[0_8px_18px_rgba(0,78,162,0.08)]'
      : 'border-shell-border bg-shell-muted-panel/80 hover:border-brand/18 hover:bg-shell-surface'
  }

  function getChoiceTitleClass(selected: boolean) {
    return selected ? 'text-brand' : 'text-foreground'
  }
</script>

<section class='grid gap-3'>
  <Card size='sm' class='px-4'>
    <p class='shell-card-label'>{m.panel_preferences()}</p>
    <h3 class='shell-card-title'>{m.preferences()}</h3>
    <p class='shell-card-copy'>{m.save_state_hint()}</p>
  </Card>

  <div class='grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(19rem,1fr))]'>
    <Card size='sm' class='px-4'>
      <p class='shell-card-label'>{m.preferences_interface_section()}</p>
      <h3 class='shell-card-title'>{m.theme_label()} / {m.locale_label()}</h3>

      <div class='mt-1 grid gap-4'>
        <fieldset class='grid gap-2.5'>
          <legend class='text-[12px] font-semibold tracking-[-0.01em] text-foreground'>{m.theme_label()}</legend>

          <div class='grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(8.5rem,1fr))]'>
            {#each themeOptions as option}
              {@const selected = $preferencesStore.themePreference === option.value}
              <label class='block h-full cursor-pointer'>
                <input
                  type='radio'
                  name='theme-preference'
                  class='peer sr-only'
                  checked={selected}
                  onchange={() => updatePreference('themePreference', option.value)}
                />
                <span
                  class={`flex min-h-24 flex-col gap-3 rounded-[9px] border px-3 py-3 text-sm transition peer-focus-visible:border-ring peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50 ${getChoiceCardClass(selected)}`}
                >
                  <span class='relative flex h-12 items-center justify-center overflow-hidden rounded-[8px] border border-shell-border/80 bg-background/90'>
                    {#if selected}
                      <span class='absolute inset-x-3 top-2 h-px rounded-full bg-brand/55'></span>
                    {/if}

                    {#if option.value === 'light'}
                      <span class='absolute inset-0 bg-linear-to-br from-amber-50 via-white to-sky-100'></span>
                      <SunMedium class='relative size-5 text-amber-500' />
                    {:else if option.value === 'dark'}
                      <span class='absolute inset-0 bg-linear-to-br from-slate-950 via-slate-900 to-slate-800'></span>
                      <MoonStar class='relative size-5 text-sky-200' />
                    {:else}
                      <span class='absolute inset-0 grid grid-cols-2'>
                        <span class='bg-amber-50'></span>
                        <span class='bg-slate-900'></span>
                      </span>
                      <span class='relative flex items-center gap-2'>
                        <SunMedium class='size-4 text-amber-500' />
                        <MoonStar class='size-4 text-sky-200' />
                      </span>
                    {/if}
                  </span>

                  <span class='grid gap-1.5 text-left'>
                    <span class={`text-[13px] leading-[1.15] font-semibold tracking-[-0.02em] ${getChoiceTitleClass(selected)}`}>
                      {option.label}
                    </span>
                  </span>
                </span>
              </label>
            {/each}
          </div>
        </fieldset>

        <div class='grid gap-2'>
          <p class='text-[12px] font-semibold tracking-[-0.01em] text-foreground'>{m.locale_label()}</p>
          <AppSelect
            value={$preferencesStore.locale}
            options={languageOptions}
            size='sm'
            triggerClass='border-shell-border bg-shell-muted-panel'
            onValueChange={value => updatePreference('locale', value as AppLocale)}
          />
        </div>
      </div>
    </Card>

    <Card size='sm' class='px-4'>
      <p class='shell-card-label'>{m.preferences_workspace_chrome_section()}</p>
      <h3 class='shell-card-title'>{m.admin_nav_mode_label()} / {m.admin_tab_bar_label()}</h3>

      <div class='mt-1 grid gap-4'>
        <fieldset class='grid gap-2.5'>
          <legend class='text-[12px] font-semibold tracking-[-0.01em] text-foreground'>{m.admin_nav_mode_label()}</legend>

          <div class='grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(9rem,1fr))]'>
            {#each adminNavigationOptions as option}
              {@const selected = $preferencesStore.adminNavigationMode === option.value}
              <label class='block h-full cursor-pointer'>
                <input
                  type='radio'
                  name='admin-navigation-preference'
                  class='peer sr-only'
                  checked={selected}
                  onchange={() => updatePreference('adminNavigationMode', option.value)}
                />
                <span
                  class={`flex min-h-24 flex-col gap-3 rounded-[9px] border px-3 py-3 text-sm transition peer-focus-visible:border-ring peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50 ${getChoiceCardClass(selected)}`}
                >
                  <span class='relative flex h-12 overflow-hidden rounded-[8px] border border-shell-border/80 bg-background/90 p-1.5'>
                    {#if selected}
                      <span class='absolute inset-x-3 top-2 h-px rounded-full bg-brand/55'></span>
                    {/if}

                    {#if option.value === 'topbar'}
                      <span class='grid h-full w-full grid-rows-[0.7rem_1fr] gap-1'>
                        <span class={`rounded-[4px] ${selected ? 'bg-brand/70' : 'bg-muted-foreground/30'}`}></span>
                        <span class='grid grid-cols-[1.1fr_0.9fr] gap-1'>
                          <span class='rounded-[4px] bg-muted'></span>
                          <span class='rounded-[4px] bg-muted/75'></span>
                        </span>
                      </span>
                    {:else}
                      <span class='grid h-full w-full grid-cols-[0.8rem_1fr] gap-1'>
                        <span class={`rounded-[4px] ${selected ? 'bg-brand/70' : 'bg-muted-foreground/30'}`}></span>
                        <span class='grid grid-rows-[0.7rem_1fr] gap-1'>
                          <span class='rounded-[4px] bg-muted/75'></span>
                          <span class='rounded-[4px] bg-muted'></span>
                        </span>
                      </span>
                    {/if}
                  </span>

                  <span class='grid gap-1.5 text-left'>
                    <span class={`text-[13px] leading-[1.15] font-semibold tracking-[-0.02em] ${getChoiceTitleClass(selected)}`}>
                      {option.label}
                    </span>
                  </span>
                </span>
              </label>
            {/each}
          </div>
        </fieldset>

        <fieldset class='grid gap-2.5'>
          <legend class='text-[12px] font-semibold tracking-[-0.01em] text-foreground'>{m.admin_tab_bar_label()}</legend>

          <div class='grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(9rem,1fr))]'>
            {#each adminTabBarOptions as option}
              {@const selected = $preferencesStore.adminTabBarVisible === option.value}
              <label class='block h-full cursor-pointer'>
                <input
                  type='radio'
                  name='admin-tab-bar-preference'
                  class='peer sr-only'
                  checked={selected}
                  onchange={() => updatePreference('adminTabBarVisible', option.value)}
                />
                <span
                  class={`flex min-h-24 flex-col gap-3 rounded-[9px] border px-3 py-3 text-sm transition peer-focus-visible:border-ring peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50 ${getChoiceCardClass(selected)}`}
                >
                  <span class='relative flex h-12 overflow-hidden rounded-[8px] border border-shell-border/80 bg-background/90 p-1.5'>
                    {#if selected}
                      <span class='absolute inset-x-3 top-2 h-px rounded-full bg-brand/55'></span>
                    {/if}

                    {#if option.value}
                      <span class='grid h-full w-full grid-rows-[0.9rem_1fr] gap-1'>
                        <span class='grid grid-cols-3 gap-1'>
                          <span class={`rounded-[4px] ${selected ? 'bg-brand/70' : 'bg-muted-foreground/35'}`}></span>
                          <span class={`rounded-[4px] ${selected ? 'bg-brand/55' : 'bg-muted-foreground/30'}`}></span>
                          <span class={`rounded-[4px] ${selected ? 'bg-brand/40' : 'bg-muted-foreground/25'}`}></span>
                        </span>
                        <span class='rounded-[4px] bg-muted'></span>
                      </span>
                    {:else}
                      <span class='grid h-full w-full grid-rows-[1fr] gap-1'>
                        <span class='rounded-[4px] bg-muted'></span>
                      </span>
                    {/if}
                  </span>

                  <span class='grid gap-1.5 text-left'>
                    <span class={`text-[13px] leading-[1.15] font-semibold tracking-[-0.02em] ${getChoiceTitleClass(selected)}`}>
                      {option.label}
                    </span>
                  </span>
                </span>
              </label>
            {/each}
          </div>
        </fieldset>
      </div>
    </Card>
  </div>
</section>
