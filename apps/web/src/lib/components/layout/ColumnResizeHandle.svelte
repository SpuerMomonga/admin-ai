<script lang='ts'>
  const { title, onpointerdown } = $props<{ title: string, onpointerdown: (event: PointerEvent) => void }>()
</script>

<button
  type='button'
  class='shell-resize-handle hidden lg:flex'
  {title}
  aria-label={title}
  onpointerdown={onpointerdown}
></button>
