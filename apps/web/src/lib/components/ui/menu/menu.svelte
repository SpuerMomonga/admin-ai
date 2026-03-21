<script lang='ts'>
  import type {
    ItemType,
    MenuClickInfo,
    MenuIcon,
    MenuItemType,
    MenuMode,
    MenuRenderable,
    MenuSelectInfo,
    MenuTheme,
    MenuTooltipConfig,
    MenuTriggerSubMenuAction,
    SubMenuType,
  } from './types'
  import { buttonVariants } from '$lib/components/ui/button'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import TooltipButton from '$lib/components/ui/tooltip-button.svelte'
  import { cn } from '$lib/utils'
  import {
    ChevronDown,
    ChevronRight,
  } from '@lucide/svelte'
  import { onDestroy } from 'svelte'
  import {
    isMenuDividerType,
    isMenuItemGroupType,
    isSubMenuType,
  } from './types'

  interface MenuProps {
    items?: ItemType[]
    mode?: MenuMode
    theme?: MenuTheme
    inlineCollapsed?: boolean
    inlineIndent?: number
    selectable?: boolean
    multiple?: boolean
    selectedKeys?: string[] | undefined
    defaultSelectedKeys?: string[]
    openKeys?: string[] | undefined
    defaultOpenKeys?: string[]
    triggerSubMenuAction?: MenuTriggerSubMenuAction
    subMenuOpenDelay?: number
    subMenuCloseDelay?: number
    tooltip?: false | MenuTooltipConfig
    expandIcon?: MenuIcon
    class?: string
    style?: string
    onClick?: (info: MenuClickInfo) => void
    onSelect?: (info: MenuSelectInfo) => void
    onDeselect?: (info: MenuSelectInfo) => void
    onOpenChange?: (openKeys: string[]) => void
  }

  interface HoverPopupLayer {
    path: string[]
    items: ItemType[]
    x: number
    y: number
    minWidth: number
    theme?: MenuTheme
  }

  const {
    items = [],
    mode = 'vertical',
    theme = 'light',
    inlineCollapsed = false,
    inlineIndent = 24,
    selectable = true,
    multiple = false,
    selectedKeys = undefined,
    defaultSelectedKeys = [],
    openKeys = undefined,
    defaultOpenKeys = [],
    triggerSubMenuAction = 'hover',
    subMenuOpenDelay = 0,
    subMenuCloseDelay = 0.1,
    tooltip = {
      side: 'right',
      sideOffset: 10,
    },
    expandIcon = undefined,
    class: className,
    style = undefined,
    onClick,
    onSelect,
    onDeselect,
    onOpenChange,
  }: MenuProps = $props()

  let uncontrolledSelectedKeys = $state<string[]>([])
  let uncontrolledOpenKeys = $state<string[]>([])
  let rootPopupOpenByKey = $state<Record<string, boolean>>({})
  let hoverPopupLayers = $state<HoverPopupLayer[]>([])
  let defaultsSeeded = $state(false)

  const popupOpenTimers = new Map<string, ReturnType<typeof setTimeout>>()
  const popupCloseTimers = new Map<string, ReturnType<typeof setTimeout>>()

  const resolvedSelectedKeys = $derived(selectedKeys ?? uncontrolledSelectedKeys)
  const resolvedOpenKeys = $derived(openKeys ?? uncontrolledOpenKeys)
  const isInlineMode = $derived(mode === 'inline')
  const isCollapsedInlineMode = $derived(isInlineMode && inlineCollapsed)
  const ExpandIcon = $derived(expandIcon)
  const rootWrapperClass = $derived(
    isCollapsedInlineMode
      ? 'flex w-full flex-col items-center gap-0.75'
      : mode === 'horizontal'
      ? 'flex min-w-0 flex-wrap items-center gap-1.5'
      : 'grid gap-0.5',
  )

  $effect(() => {
    if (defaultsSeeded) {
      return
    }

    defaultsSeeded = true
    uncontrolledSelectedKeys = [...defaultSelectedKeys]
    uncontrolledOpenKeys = [...defaultOpenKeys]
  })

  function setSelectedKeyState(nextSelectedKeys: string[]) {
    if (selectedKeys === undefined) {
      uncontrolledSelectedKeys = nextSelectedKeys
    }
  }

  function setOpenKeyState(nextOpenKeys: string[]) {
    if (openKeys === undefined) {
      uncontrolledOpenKeys = nextOpenKeys
    }

    onOpenChange?.(nextOpenKeys)
  }

  function getRenderableText(renderable: MenuRenderable) {
    return typeof renderable === 'string' ? renderable : ''
  }

  function getItemTitle(item: MenuItemType | SubMenuType) {
    return item.title ?? getRenderableText(item.label) ?? item.key
  }

  function getCollapsedFallbackLabel(item: MenuItemType | SubMenuType) {
    const source = getItemTitle(item).trim()
    return source ? source.charAt(0).toLocaleUpperCase() : '?'
  }

  function isItemClickable(item: MenuItemType | SubMenuType) {
    return item.clickable ?? true
  }

  function isLeafItemSelected(itemKey: string) {
    return resolvedSelectedKeys.includes(itemKey)
  }

  function submenuContainsSelected(item: SubMenuType): boolean {
    return item.children.some((child) => {
      if (isMenuDividerType(child)) {
        return false
      }

      if (isMenuItemGroupType(child)) {
        return child.children.some((groupChild) => {
          if (isMenuDividerType(groupChild) || isMenuItemGroupType(groupChild)) {
            return false
          }

          return isSubMenuType(groupChild)
            ? submenuContainsSelected(groupChild)
            : isLeafItemSelected(groupChild.key)
        })
      }

      return isSubMenuType(child)
        ? submenuContainsSelected(child)
        : isLeafItemSelected(child.key)
    })
  }

  function isInlineSubMenuOpen(itemKey: string) {
    return resolvedOpenKeys.includes(itemKey)
  }

  function updateInlineSubMenu(item: SubMenuType, nextOpen: boolean) {
    const nextOpenKeys = nextOpen
      ? Array.from(new Set([...resolvedOpenKeys, item.key]))
      : resolvedOpenKeys.filter(key => key !== item.key)

    setOpenKeyState(nextOpenKeys)
  }

  function buildClickInfo(item: MenuItemType, keyPath: string[], domEvent: MouseEvent): MenuClickInfo {
    return {
      item,
      key: item.key,
      keyPath,
      domEvent,
    }
  }

  function handleLeafClick(item: MenuItemType, keyPath: string[], domEvent: MouseEvent) {
    if (item.disabled) {
      return
    }

    const clickInfo = buildClickInfo(item, keyPath, domEvent)
    onClick?.(clickInfo)

    if (!selectable) {
      return
    }

    if (multiple) {
      const alreadySelected = resolvedSelectedKeys.includes(item.key)
      const nextSelectedKeys = alreadySelected
        ? resolvedSelectedKeys.filter(key => key !== item.key)
        : [...resolvedSelectedKeys, item.key]

      setSelectedKeyState(nextSelectedKeys)

      const selectInfo: MenuSelectInfo = {
        ...clickInfo,
        selectedKeys: nextSelectedKeys,
      }

      if (alreadySelected) {
        onDeselect?.(selectInfo)
      }
      else {
        onSelect?.(selectInfo)
      }

      return
    }

    const nextSelectedKeys = [item.key]
    setSelectedKeyState(nextSelectedKeys)
    onSelect?.({
      ...clickInfo,
      selectedKeys: nextSelectedKeys,
    })
  }

  function setRootPopupOpen(key: string, open: boolean) {
    rootPopupOpenByKey = {
      ...rootPopupOpenByKey,
      [key]: open,
    }
  }

  function dismissRootPopup(key: string) {
    setRootPopupOpen(key, false)
    hoverPopupLayers = hoverPopupLayers.filter(layer => layer.path[0] !== key)
  }

  function closeRootPopup(key: string) {
    clearPopupOpenTimer(key)
    clearPopupCloseTimer(key)
    dismissRootPopup(key)
  }

  function clearPopupOpenTimer(key: string) {
    const timer = popupOpenTimers.get(key)

    if (!timer) {
      return
    }

    clearTimeout(timer)
    popupOpenTimers.delete(key)
  }

  function clearPopupCloseTimer(key: string) {
    const timer = popupCloseTimers.get(key)

    if (!timer) {
      return
    }

    clearTimeout(timer)
    popupCloseTimers.delete(key)
  }

  function schedulePopupOpen(key: string, callback: () => void) {
    clearPopupCloseTimer(key)
    clearPopupOpenTimer(key)

    const delayMs = Math.max(subMenuOpenDelay, 0) * 1000

    if (delayMs === 0) {
      callback()
      return
    }

    popupOpenTimers.set(key, setTimeout(() => {
      callback()
      popupOpenTimers.delete(key)
    }, delayMs))
  }

  function scheduleRootPopupClose(key: string) {
    clearPopupOpenTimer(key)

    if (popupCloseTimers.has(key)) {
      return
    }

    const delayMs = Math.max(subMenuCloseDelay, 0) * 1000

    popupCloseTimers.set(key, setTimeout(() => {
      dismissRootPopup(key)
      popupCloseTimers.delete(key)
    }, delayMs))
  }

  function getPopupSide() {
    return mode === 'horizontal' ? 'bottom' : 'right'
  }

  function getRootPopupSideOffset(item?: SubMenuType) {
    if (item?.popupOffset) {
      return item.popupOffset[1]
    }

    return triggerSubMenuAction === 'hover' ? 0 : mode === 'horizontal' ? 8 : 2
  }

  function getSubPopupSideOffset(item?: SubMenuType) {
    if (item?.popupOffset) {
      return item.popupOffset[1]
    }

    return triggerSubMenuAction === 'hover' ? 0 : 2
  }

  function getPopupAlignOffset(item?: SubMenuType) {
    return item?.popupOffset?.[0] ?? 0
  }

  function getPopupPanelClass(layerTheme?: MenuTheme) {
    return cn(
      'fixed z-70 min-w-44 overflow-visible rounded-[10px] border border-shell-border bg-shell-elevated p-1.5 shadow-[0_18px_32px_rgba(15,23,42,0.16)] outline-none backdrop-blur',
      layerTheme === 'dark' ? 'bg-slate-950 text-slate-100' : '',
    )
  }

  function positionPopup(x: number, y: number, minWidth = 176) {
    if (typeof window === 'undefined') {
      return { x, y, minWidth }
    }

    return {
      x: Math.max(8, Math.min(x, window.innerWidth - minWidth - 8)),
      y: Math.max(8, y),
      minWidth,
    }
  }

  function getHoverRootPopupPosition(triggerElement: HTMLElement) {
    const rect = triggerElement.getBoundingClientRect()

    return mode === 'horizontal'
      ? positionPopup(rect.left, rect.bottom + 4)
      : positionPopup(rect.right + 4, rect.top - 4)
  }

  function getHoverChildPopupPosition(triggerElement: HTMLElement) {
    const rect = triggerElement.getBoundingClientRect()
    return positionPopup(rect.right + 4, rect.top - 6)
  }

  function openHoverRootPopup(item: SubMenuType, triggerElement: HTMLElement) {
    schedulePopupOpen(item.key, () => {
      const position = getHoverRootPopupPosition(triggerElement)

      for (const key of Object.keys(rootPopupOpenByKey)) {
        if (key !== item.key) {
          clearPopupOpenTimer(key)
          clearPopupCloseTimer(key)
        }
      }

      rootPopupOpenByKey = { [item.key]: true }
      hoverPopupLayers = [{
        path: [item.key],
        items: item.children,
        x: position.x,
        y: position.y,
        minWidth: position.minWidth,
        theme: item.theme,
      }]
    })
  }

  function trimHoverPopupLayers(rootKey: string, depth: number) {
    hoverPopupLayers = hoverPopupLayers.filter(layer => layer.path[0] !== rootKey || layer.path.length <= depth)
  }

  function openHoverChildPopup(parentPath: string[], item: SubMenuType, triggerElement: HTMLElement) {
    const nextPath = [...parentPath, item.key]
    const rootKey = parentPath[0]

    schedulePopupOpen(getLayerKey(nextPath), () => {
      const position = getHoverChildPopupPosition(triggerElement)
      const nextLayer: HoverPopupLayer = {
        path: nextPath,
        items: item.children,
        x: position.x,
        y: position.y,
        minWidth: position.minWidth,
        theme: item.theme,
      }

      hoverPopupLayers = [
        ...hoverPopupLayers.filter(layer => layer.path[0] !== rootKey || layer.path.length < nextPath.length),
        nextLayer,
      ]
    })
  }

  function getLeafButtonClass(selected: boolean, collapsed = false, clickable = true) {
    if (collapsed) {
      return cn(
        'relative inline-flex size-7 shrink-0 appearance-none items-center justify-center rounded-[8px] border border-transparent bg-transparent p-0 shadow-none outline-none transition-colors select-none focus-visible:border-transparent focus-visible:ring-0',
        selected
          ? 'bg-brand/10 text-brand'
          : clickable
          ? 'text-muted-foreground hover:bg-brand/8 hover:text-foreground'
          : 'text-muted-foreground hover:bg-brand/6 hover:text-foreground',
        theme === 'dark' && !selected
          ? clickable
            ? 'text-slate-300 hover:bg-white/8 hover:text-white'
            : 'text-slate-300 hover:bg-white/8 hover:text-white'
          : '',
      )
    }

    return cn(
      buttonVariants({ variant: clickable && selected ? 'secondary' : 'ghost', size: 'sm' }),
      `h-8 rounded-[7px] text-[12px] font-medium ${mode === 'horizontal' ? 'justify-center px-2.5' : 'w-full justify-start px-2'} ${selected ? 'bg-brand/10 text-brand' : 'text-muted-foreground'}`,
      !clickable
        ? selected
          ? 'hover:bg-brand/10 hover:text-brand active:translate-y-0'
          : 'hover:bg-brand/6 hover:text-foreground active:translate-y-0'
        : '',
      theme === 'dark' && !selected
        ? clickable
          ? 'text-slate-300 hover:bg-white/8 hover:text-white'
          : 'text-slate-300 hover:bg-white/8 hover:text-white active:translate-y-0'
        : '',
    )
  }

  function getSubMenuTriggerClass(active: boolean, open: boolean, popup = false, collapsed = false, clickable = true) {
    if (collapsed) {
      return cn(
        'relative inline-flex size-7 shrink-0 appearance-none items-center justify-center rounded-[8px] border border-transparent bg-transparent p-0 shadow-none outline-none transition-colors select-none focus-visible:border-transparent focus-visible:ring-0',
        active
          ? 'bg-brand/10 text-brand'
          : clickable && open
          ? 'bg-brand/8 text-foreground'
          : clickable
          ? 'text-muted-foreground hover:bg-brand/8 hover:text-foreground'
          : 'text-muted-foreground hover:bg-brand/6 hover:text-foreground',
        theme === 'dark' && !active && !(clickable && open)
          ? clickable
            ? 'text-slate-300 hover:bg-white/8 hover:text-white'
            : 'text-slate-300 hover:bg-white/8 hover:text-white'
          : '',
      )
    }

    return cn(
      buttonVariants({ variant: clickable && (active || open) ? 'secondary' : 'ghost', size: 'sm' }),
      `h-8 rounded-[7px] text-[12px] font-medium ${mode === 'horizontal' && popup ? 'px-2.5' : 'w-full px-2'} justify-between ${clickable ? (active || open ? 'bg-brand/6 text-foreground' : 'text-muted-foreground') : (active ? 'bg-brand/10 text-brand' : 'text-muted-foreground')}`,
      mode === 'horizontal' && !collapsed ? 'justify-center' : '',
      !clickable
        ? active
          ? 'hover:bg-brand/10 hover:text-brand active:translate-y-0'
          : 'hover:bg-brand/6 hover:text-foreground active:translate-y-0'
        : '',
      theme === 'dark' && !(clickable ? (active || open) : active)
        ? clickable
          ? 'text-slate-300 hover:bg-white/8 hover:text-white'
          : 'text-slate-300 hover:bg-white/8 hover:text-white active:translate-y-0'
        : '',
    )
  }

  function getExpandIconClass(open: boolean, popup = false) {
    if (popup) {
      return mode === 'horizontal' ? 'size-3.5 rotate-90' : 'size-3.5'
    }

    return `size-3.5 transition ${open ? 'rotate-180' : ''}`
  }

  function getLoopKey(item: ItemType, index: number, fallback: string) {
    if ('key' in item && item.key) {
      return item.key
    }

    if (isMenuDividerType(item)) {
      return item.key ?? `${fallback}-divider-${index}`
    }

    if (isMenuItemGroupType(item)) {
      return item.key ?? `${fallback}-group-${index}`
    }

    return `${fallback}-${index}`
  }

  function getLayerKey(path: string[]) {
    return path.join('::')
  }

  onDestroy(() => {
    for (const key of popupOpenTimers.keys()) {
      clearPopupOpenTimer(key)
    }

    for (const key of popupCloseTimers.keys()) {
      clearPopupCloseTimer(key)
    }
  })
</script>

{#snippet renderRenderable(content: MenuRenderable)}
  {#if typeof content === 'string'}
    <span class='truncate'>{content}</span>
  {:else}
    {@render content()}
  {/if}
{/snippet}

{#snippet renderHoverPopupNodes(menuItems: ItemType[], panelPath: string[])}
  {@const rootKey = panelPath[0]}
  {#each menuItems as item, index (getLoopKey(item, index, `hover-${getLayerKey(panelPath)}`))}
    {#if isMenuDividerType(item)}
      <div class={item.dashed ? 'my-1 border-t border-dashed border-shell-border' : 'my-1 h-px bg-shell-border'}></div>
    {:else if isMenuItemGroupType(item)}
      <div class='grid gap-1'>
        <div class='px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground'>
          {@render renderRenderable(item.label)}
        </div>
        {@render renderHoverPopupNodes(item.children, panelPath)}
      </div>
    {:else if isSubMenuType(item)}
      <button
        type='button'
        class={cn(
          'flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2 text-left text-sm outline-none transition',
          item.disabled ? 'pointer-events-none opacity-50' : 'hover:bg-muted focus-visible:bg-muted',
          item.theme === 'dark' ? 'text-slate-100 hover:bg-white/8 focus-visible:bg-white/8' : '',
        )}
        onpointerenter={(event) => {
          clearPopupCloseTimer(rootKey)
          openHoverChildPopup(panelPath, item, event.currentTarget as HTMLElement)
        }}
      >
        {#if item.icon}
          <item.icon class='size-4 shrink-0' />
        {/if}
        <span class='truncate'>{@render renderRenderable(item.label)}</span>
        <ChevronRight class='ml-auto size-3.5 shrink-0' />
      </button>
    {:else}
      <button
        type='button'
        class={cn(
          'flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2 text-left text-sm outline-none transition',
          item.disabled ? 'pointer-events-none opacity-50' : 'hover:bg-muted focus-visible:bg-muted',
          item.danger ? 'text-destructive' : '',
          theme === 'dark' ? 'text-slate-100 hover:bg-white/8 focus-visible:bg-white/8' : '',
        )}
        onpointerenter={() => {
          clearPopupCloseTimer(rootKey)
          trimHoverPopupLayers(rootKey, panelPath.length)
        }}
        onclick={(event) => {
          handleLeafClick(item, [item.key, ...panelPath], event as MouseEvent)
          closeRootPopup(rootKey)
        }}
      >
        {#if item.icon}
          <item.icon class='size-4 shrink-0' />
        {/if}
        <span class='truncate'>{@render renderRenderable(item.label)}</span>
        {#if item.extra}
          <span class='ml-auto pl-3 text-xs text-muted-foreground'>{@render renderRenderable(item.extra)}</span>
        {/if}
      </button>
    {/if}
  {/each}
{/snippet}

{#snippet renderPopupNodes(menuItems: ItemType[], ancestorKeys: string[], rootPopupKey: string)}
  {#each menuItems as item, index (getLoopKey(item, index, 'popup-node'))}
    {#if isMenuDividerType(item)}
      <DropdownMenu.Separator class={item.dashed ? 'my-1 border-t border-dashed border-shell-border' : 'my-1 bg-shell-border'} />
    {:else if isMenuItemGroupType(item)}
      <DropdownMenu.Group>
        <DropdownMenu.GroupHeading class='px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground'>
          {@render renderRenderable(item.label)}
        </DropdownMenu.GroupHeading>
        {@render renderPopupNodes(item.children, ancestorKeys, rootPopupKey)}
      </DropdownMenu.Group>
    {:else if isSubMenuType(item)}
      <DropdownMenu.Sub>
        <DropdownMenu.SubTrigger class={cn('px-2.5 py-2 text-sm', theme === 'dark' ? 'text-slate-100' : '')} disabled={item.disabled}>
          <span class='inline-flex min-w-0 items-center gap-2'>
            {#if item.icon}
              <item.icon class='size-4 shrink-0' />
            {/if}
            <span class='truncate'>{@render renderRenderable(item.label)}</span>
          </span>
        </DropdownMenu.SubTrigger>
        <DropdownMenu.SubContent
          data-menu-root-popup={rootPopupKey}
          class={item.popupClassName}
          sideOffset={getSubPopupSideOffset(item)}
          alignOffset={getPopupAlignOffset(item)}
          trapFocus={triggerSubMenuAction === 'click'}
          onOpenAutoFocus={(event) => {
            if (triggerSubMenuAction === 'hover') {
              event.preventDefault()
            }
          }}
          onCloseAutoFocus={(event) => {
            if (triggerSubMenuAction === 'hover') {
              event.preventDefault()
            }
          }}
        >
          {@render renderPopupNodes(item.children, [item.key, ...ancestorKeys], rootPopupKey)}
        </DropdownMenu.SubContent>
      </DropdownMenu.Sub>
    {:else}
      <DropdownMenu.Item
        class={cn(
          'px-2.5 py-2 text-sm',
          item.danger ? 'text-destructive focus:text-destructive' : '',
          theme === 'dark' ? 'text-slate-100' : '',
        )}
        disabled={item.disabled}
        onclick={(event) => {
          handleLeafClick(item, [item.key, ...ancestorKeys], event as MouseEvent)
          closeRootPopup(rootPopupKey)
        }}
      >
        <span class='inline-flex min-w-0 items-center gap-2'>
          {#if item.icon}
            <item.icon class='size-4 shrink-0' />
          {/if}
          <span class='truncate'>{@render renderRenderable(item.label)}</span>
        </span>
        {#if item.extra}
          <span class='ml-auto pl-3 text-xs text-muted-foreground'>{@render renderRenderable(item.extra)}</span>
        {/if}
      </DropdownMenu.Item>
    {/if}
  {/each}
{/snippet}

{#snippet renderInlineNodes(menuItems: ItemType[], level: number, ancestorKeys: string[])}
  {#each menuItems as item, index (getLoopKey(item, index, 'inline-node'))}
    {#if isMenuDividerType(item)}
      <div class={cn('my-1 h-px bg-shell-border/80', item.dashed ? 'border-t border-dashed border-shell-border bg-transparent' : '')}></div>
    {:else if isMenuItemGroupType(item)}
      <section class='grid gap-0.5'>
        <div class='px-2 pt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground'>
          {@render renderRenderable(item.label)}
        </div>
        {@render renderInlineNodes(item.children, level + 1, ancestorKeys)}
      </section>
    {:else if isSubMenuType(item)}
      {@const open = isInlineSubMenuOpen(item.key)}
      {@const active = submenuContainsSelected(item)}
      {@const clickable = isItemClickable(item)}
      <div class='grid gap-1'>
        <button
          type='button'
          class={getSubMenuTriggerClass(active, open, false, false, clickable)}
          style={`padding-inline-start:${8 + level * inlineIndent}px;`}
          disabled={item.disabled}
          onclick={(event) => {
            item.onTitleClick?.({ key: item.key, domEvent: event as MouseEvent })
            updateInlineSubMenu(item, !open)
          }}
        >
          <span class='inline-flex min-w-0 items-center gap-2'>
            {#if item.icon}
              <item.icon class='size-4 shrink-0' />
            {/if}
            <span class='truncate'>{@render renderRenderable(item.label)}</span>
          </span>
          {#if ExpandIcon}
            <ExpandIcon class={getExpandIconClass(open)}></ExpandIcon>
          {:else}
            <ChevronDown class={getExpandIconClass(open)} />
          {/if}
        </button>

        {#if open}
          <div class={cn('grid gap-1', level === 0 ? 'ml-1.5 border-l border-shell-border/70 pl-1.5' : 'ml-1.5 border-l border-shell-border/50 pl-1.5')}>
            {@render renderInlineNodes(item.children, level + 1, [item.key, ...ancestorKeys])}
          </div>
        {/if}
      </div>
    {:else}
      {@const selected = isLeafItemSelected(item.key)}
      {@const clickable = isItemClickable(item)}
      <button
        type='button'
        class={getLeafButtonClass(selected, false, clickable)}
        style={`padding-inline-start:${8 + level * inlineIndent}px;`}
        disabled={item.disabled}
        onclick={event => handleLeafClick(item, [item.key, ...ancestorKeys], event as MouseEvent)}
      >
        <span class='inline-flex min-w-0 items-center gap-2'>
          {#if item.icon}
            <item.icon class='size-4 shrink-0' />
          {/if}
          <span class='truncate'>{@render renderRenderable(item.label)}</span>
        </span>
        {#if item.extra}
          <span class='ml-auto pl-3 text-xs text-muted-foreground'>{@render renderRenderable(item.extra)}</span>
        {/if}
      </button>
    {/if}
  {/each}
{/snippet}

{#snippet renderPopupRootNode(item: ItemType)}
  {#if isMenuDividerType(item)}
    <div class={mode === 'horizontal' ? 'mx-1 h-6 w-px bg-shell-border/80' : 'my-1 h-px bg-shell-border/80'}></div>
  {:else if isMenuItemGroupType(item)}
    <section class={mode === 'horizontal' ? 'flex items-center gap-1.5' : 'grid gap-0.5'}>
      <div class='px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground'>
        {@render renderRenderable(item.label)}
      </div>
      {#each item.children as child, index (getLoopKey(child, index, 'group-child'))}
        {@render renderPopupRootNode(child)}
      {/each}
    </section>
  {:else if isSubMenuType(item)}
    {@const active = submenuContainsSelected(item)}
    {@const rootPopupOpen = Boolean(rootPopupOpenByKey[item.key])}
    {@const collapsed = isCollapsedInlineMode}
    {@const clickable = isItemClickable(item)}
    {#if triggerSubMenuAction === 'hover'}
      <button
        type='button'
        class={getSubMenuTriggerClass(active, rootPopupOpen, true, collapsed, clickable)}
        data-menu-root-popup={item.key}
        aria-label={getItemTitle(item)}
        disabled={item.disabled}
        onpointerenter={(event) => {
          openHoverRootPopup(item, event.currentTarget as HTMLElement)
        }}
        onpointerleave={() => {
          scheduleRootPopupClose(item.key)
        }}
      >
        {#if collapsed}
          {#if item.icon}
            <item.icon class='size-3.5 shrink-0' />
          {:else}
            <span class='text-[11px] font-semibold leading-none'>{getCollapsedFallbackLabel(item)}</span>
          {/if}
        {:else}
          <span class='inline-flex min-w-0 items-center gap-2'>
            {#if item.icon}
              <item.icon class='size-4 shrink-0' />
            {/if}
            <span class='truncate'>{@render renderRenderable(item.label)}</span>
          </span>
          {#if ExpandIcon}
            <ExpandIcon class={getExpandIconClass(rootPopupOpen, true)}></ExpandIcon>
          {:else}
            <ChevronRight class={getExpandIconClass(rootPopupOpen, true)} />
          {/if}
        {/if}
      </button>
    {:else}
      <DropdownMenu.Root
        open={rootPopupOpen}
        onOpenChange={(nextOpen) => {
          setRootPopupOpen(item.key, nextOpen)
        }}
      >
        <DropdownMenu.Trigger
          class={getSubMenuTriggerClass(active, rootPopupOpen, true, collapsed, clickable)}
          data-menu-root-popup={item.key}
          aria-label={getItemTitle(item)}
          disabled={item.disabled}
          onclick={(event) => {
            item.onTitleClick?.({ key: item.key, domEvent: event as MouseEvent })
            setRootPopupOpen(item.key, !rootPopupOpen)
          }}
        >
          {#if collapsed}
            {#if item.icon}
              <item.icon class='size-3.5 shrink-0' />
            {:else}
              <span class='text-[11px] font-semibold leading-none'>{getCollapsedFallbackLabel(item)}</span>
            {/if}
          {:else}
            <span class='inline-flex min-w-0 items-center gap-2'>
              {#if item.icon}
                <item.icon class='size-4 shrink-0' />
              {/if}
              <span class='truncate'>{@render renderRenderable(item.label)}</span>
            </span>
            {#if ExpandIcon}
              <ExpandIcon class={getExpandIconClass(rootPopupOpen, true)}></ExpandIcon>
            {:else}
              <ChevronRight class={getExpandIconClass(rootPopupOpen, true)} />
            {/if}
          {/if}
        </DropdownMenu.Trigger>

        <DropdownMenu.Content
          side={getPopupSide()}
          align='start'
          sideOffset={getRootPopupSideOffset(item)}
          alignOffset={getPopupAlignOffset(item)}
          class={cn('min-w-44', item.popupClassName, item.theme === 'dark' ? 'bg-slate-950 text-slate-100' : '')}
          data-menu-root-popup={item.key}
          trapFocus={true}
        >
          {@render renderPopupNodes(item.children, [item.key], item.key)}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    {/if}
  {:else if isCollapsedInlineMode}
    {@const selected = isLeafItemSelected(item.key)}
    {@const clickable = isItemClickable(item)}
    {#if tooltip === false}
      <button
        type='button'
        class={getLeafButtonClass(selected, true, clickable)}
        aria-label={getItemTitle(item)}
        disabled={item.disabled}
        onclick={event => handleLeafClick(item, [item.key], event as MouseEvent)}
      >
        {#if item.icon}
          <item.icon class='size-3.5 shrink-0' />
        {:else}
          <span class='text-[11px] font-semibold leading-none'>{getCollapsedFallbackLabel(item)}</span>
        {/if}
      </button>
    {:else}
      <TooltipButton
        content={getItemTitle(item)}
        side={tooltip.side ?? 'right'}
        sideOffset={tooltip.sideOffset ?? 10}
        class={getLeafButtonClass(selected, true, clickable)}
        aria-label={getItemTitle(item)}
        onclick={event => handleLeafClick(item, [item.key], event as MouseEvent)}
      >
        {#if item.icon}
          <item.icon class='size-3.5 shrink-0' />
        {:else}
          <span class='text-[11px] font-semibold leading-none'>{getCollapsedFallbackLabel(item)}</span>
        {/if}
      </TooltipButton>
    {/if}
  {:else}
    {@const selected = isLeafItemSelected(item.key)}
    {@const clickable = isItemClickable(item)}
    <button
      type='button'
      class={getLeafButtonClass(selected, false, clickable)}
      disabled={item.disabled}
      onclick={event => handleLeafClick(item, [item.key], event as MouseEvent)}
    >
      <span class='inline-flex min-w-0 items-center gap-2'>
        {#if item.icon}
          <item.icon class='size-4 shrink-0' />
        {/if}
        <span class='truncate'>{@render renderRenderable(item.label)}</span>
      </span>
      {#if item.extra}
        <span class='ml-auto pl-3 text-xs text-muted-foreground'>{@render renderRenderable(item.extra)}</span>
      {/if}
    </button>
  {/if}
{/snippet}

<nav
  data-slot='menu'
  data-mode={mode}
  data-theme={theme}
  class={cn('min-w-0', theme === 'dark' ? 'text-slate-100' : '', className)}
  {style}
>
  {#if isInlineMode && !inlineCollapsed}
    <div class={rootWrapperClass}>
      {@render renderInlineNodes(items, 0, [])}
    </div>
  {:else}
    <div class={rootWrapperClass}>
      {#each items as item, index (getLoopKey(item, index, 'root-node'))}
        {@render renderPopupRootNode(item)}
      {/each}
    </div>
  {/if}
</nav>

{#if triggerSubMenuAction === 'hover'}
  {#each hoverPopupLayers as layer (getLayerKey(layer.path))}
    <div
      role='menu'
      tabindex='-1'
      data-menu-root-popup={layer.path[0]}
      class={getPopupPanelClass(layer.theme)}
      style={`left:${layer.x}px;top:${layer.y}px;min-width:${layer.minWidth}px;`}
      onpointerenter={() => {
        clearPopupCloseTimer(layer.path[0])
      }}
      onpointerleave={() => {
        scheduleRootPopupClose(layer.path[0])
      }}
    >
      {@render renderHoverPopupNodes(layer.items, layer.path)}
    </div>
  {/each}
{/if}
