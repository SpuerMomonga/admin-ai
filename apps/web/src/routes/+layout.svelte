<script lang='ts'>
  import { page } from '$app/state'
  import favicon from '$lib/assets/favicon.svg'
  import { navigation } from '$lib/navigation'
  import { Separator } from '@admin-ai/ui'
  import '@admin-ai/ui/styles.css'
  import './layout.css'

  const { children } = $props()
  const pathname = $derived(page.url.pathname)
</script>

<svelte:head><link rel='icon' href={favicon} /></svelte:head>

<div class='min-h-screen'>
  <div class='mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-6'>
    <aside class='rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur'>
      <div class='space-y-2'>
        <p class='text-xs font-semibold uppercase tracking-[0.28em] text-sky-700'>Admin AI</p>
        <h1 class='text-2xl font-semibold tracking-tight text-slate-950'>Operations Console</h1>
        <p class='text-sm leading-6 text-slate-600'>
          Monorepo starter with static SvelteKit, Fastify API, shared contracts, and shadcn-svelte UI.
        </p>
      </div>

      <Separator class='my-6' />

      <nav class='space-y-2'>
        {#each navigation as item}
          <a
            class={`block rounded-2xl border px-4 py-3 transition ${
              pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                ? 'border-slate-950 bg-slate-950 text-white shadow-lg shadow-slate-950/10'
                : 'border-transparent bg-slate-100/80 text-slate-700 hover:border-slate-200 hover:bg-white'
            }`}
            href={item.href}
          >
            <p class='text-sm font-semibold'>{item.label}</p>
            <p class={`mt-1 text-xs ${pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)) ? 'text-slate-300' : 'text-slate-500'}`}>
              {item.description}
            </p>
          </a>
        {/each}
      </nav>
    </aside>

    <main class='min-w-0 py-2'>
      {@render children()}
    </main>
  </div>
</div>
