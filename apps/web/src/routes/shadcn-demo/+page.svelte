<script lang='ts'>
  import Button from '$lib/components/ui/button/button.svelte'
</script>

<div class='p-10 space-y-4'>
  <h1 class='text-2xl font-bold'>Shadcn Svelte Demo</h1>
  <div class='flex flex-wrap gap-4'>
    <Button>Default</Button>
    <Button variant='secondary'>Secondary</Button>
    <Button variant='destructive'>Destructive</Button>
    <Button variant='outline'>Outline</Button>
    <Button variant='ghost'>Ghost</Button>
    <Button variant='link'>Link</Button>
    <Button size='sm'>Small</Button>
    <Button size='lg'>Large</Button>
    <Button size='icon'>icon</Button>
  </div>
</div>
