<script lang='ts'>
  import type { AdminPanel } from '$lib/stores/app-shell'
  import type { Snippet } from 'svelte'
  import { goto } from '$app/navigation'
  import { Button } from '$lib/components/ui/button'
  import TooltipButton from '$lib/components/ui/tooltip-button.svelte'
  import { translate as t, translateAdminPanel } from '$lib/i18n'
  import { adminPanels, appShell, buildWorkspacePath } from '$lib/stores/app-shell'
  import { BookOpenText, Cog, Layers3, PanelRightClose, PanelRightOpen, ShieldCheck, UserRound } from '@lucide/svelte'

  const { taskId, panel, children } = $props<{ taskId: string | null, panel: AdminPanel, children?: Snippet }>()

  const panelIcons: Record<AdminPanel, typeof Cog> = {
    general: Cog,
    account: UserRound,
    models: Layers3,
    knowledge: BookOpenText,
    rules: ShieldCheck,
  }

  async function openPanel(nextPanel: AdminPanel) {
    appShell.openPanel(nextPanel)
    await goto(buildWorkspacePath(taskId, nextPanel))
  }

  async function closePanel(nextPanel: AdminPanel) {
    const fallbackPanel = appShell.closePanel(nextPanel)

    if (panel === nextPanel) {
      await goto(buildWorkspacePath(taskId, fallbackPanel))
    }
  }
</script>

<section class={`workspace-pane workspace-right-pane h-full min-h-0 ${$appShell.rightCollapsed ? 'flex w-full flex-col items-center gap-3 px-2 py-2.5 xl:w-[64px]' : 'flex min-w-0 flex-col overflow-hidden px-3 py-2.5'}`}>
  {#if $appShell.rightCollapsed}
    <TooltipButton
      content={t('expand_right')}
      class='shell-panel-toggle-button'
      aria-label={t('expand_right')}
      onclick={() => appShell.toggleRightCollapsed()}
    >
      <PanelRightOpen class='size-[18px]' />
    </TooltipButton>

    <div class='flex flex-col gap-2'>
      {#each adminPanels as panelKey}
        {@const Icon = panelIcons[panelKey]}
        <Button
          variant={panel === panelKey ? 'default' : 'outline'}
          size='icon-sm'
          class={`shell-icon-button ${panel === panelKey ? 'bg-brand text-brand-foreground shadow-[0_14px_28px_rgba(0,78,162,0.18)]' : ''}`}
          title={translateAdminPanel(panelKey)}
          onclick={() => openPanel(panelKey)}
        >
          <Icon class='size-4' />
        </Button>
      {/each}
    </div>
  {:else}
    <header class='border-b border-shell-border pb-2.5'>
      <div class='flex items-start justify-between gap-3'>
        <div>
          <nav class='flex items-center gap-2 text-xs text-muted-foreground'>
            <span>{t('workspace_label')}</span>
            <span>/</span>
            <span>{t('admin_label')}</span>
            <span>/</span>
            <span class='font-medium text-foreground'>{translateAdminPanel(panel)}</span>
          </nav>
          <h2 class='mt-2 text-lg font-semibold tracking-tight text-foreground'>{t('right_panel_title')}</h2>
        </div>

        <TooltipButton
          content={t('collapse_right')}
          class='shell-panel-toggle-button'
          aria-label={t('collapse_right')}
          onclick={() => appShell.toggleRightCollapsed()}
        >
          <PanelRightClose class='size-[18px]' />
        </TooltipButton>
      </div>

      <div class='mt-2.5 flex flex-wrap gap-2'>
        {#each adminPanels as panelKey}
          {@const Icon = panelIcons[panelKey]}
          <Button
            variant={panel === panelKey ? 'secondary' : 'outline'}
            size='sm'
            class={`shell-nav-button ${panel === panelKey ? 'border-brand/30 bg-brand/10 text-brand shadow-[0_12px_26px_rgba(0,78,162,0.14)]' : ''}`}
            onclick={() => openPanel(panelKey)}
          >
            <Icon class='size-4' />
            <span>{translateAdminPanel(panelKey)}</span>
          </Button>
        {/each}
      </div>

      <div class='mt-2.5 flex flex-wrap gap-2'>
        {#each $appShell.visitedPanels as visitedPanel}
          <div class={`inline-flex items-center gap-2 rounded-[8px] border px-3 py-2 text-xs font-medium transition ${panel === visitedPanel ? 'border-brand/35 bg-brand/10 text-brand' : 'border-shell-border bg-shell-muted-panel text-muted-foreground'}`}>
            <button type='button' class='transition hover:text-foreground' onclick={() => openPanel(visitedPanel)}>
              {translateAdminPanel(visitedPanel)}
            </button>
            {#if $appShell.visitedPanels.length > 1}
              <button type='button' class='text-muted-foreground transition hover:text-foreground' onclick={() => closePanel(visitedPanel)}>
                ×
              </button>
            {/if}
          </div>
        {/each}
      </div>
    </header>

    <div class='min-h-0 flex-1 overflow-y-auto pt-2.5 no-scrollbar'>
      {@render children?.()}
    </div>
  {/if}
</section>
