<script lang='ts'>
  let {
    collapsed = false,
    showSubtitle = true,
  } = $props<{ collapsed?: boolean, showSubtitle?: boolean }>()
</script>

<div class='flex items-center gap-3'>
  <div class='relative flex size-8 items-center justify-center rounded-[7px] border border-brand/25 bg-brand text-[13px] font-semibold text-brand-foreground shadow-[0_8px_18px_rgba(0,78,162,0.14)]'>
    AI
    <span class='absolute -right-1 -top-1 size-2 rounded-full border border-background bg-emerald-500'></span>
  </div>

  {#if !collapsed}
    <div class='min-w-0'>
      <p class='truncate text-sm font-semibold tracking-tight text-foreground'>admin-ai</p>
      {#if showSubtitle}
        <p class='truncate text-[11px] text-muted-foreground'>compact operations workspace</p>
      {/if}
    </div>
  {/if}
</div>
