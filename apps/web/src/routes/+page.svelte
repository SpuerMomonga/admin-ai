<script lang='ts'>
  import type { DashboardSummary, HealthResponse } from '@admin-ai/contracts'
  import { apiClient } from '$lib/api/client'
  import {
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Separator,
    Skeleton,
  } from '@admin-ai/ui'
  import { Activity, ArrowUpRight, RefreshCw, Server, ShieldCheck } from '@lucide/svelte'
  import { onMount } from 'svelte'

  let summary = $state<DashboardSummary | null>(null)
  let health = $state<HealthResponse | null>(null)
  let errorMessage = $state<string | null>(null)
  let loading = $state(true)

  async function loadDashboard() {
    loading = true
    errorMessage = null

    try {
      const [nextHealth, nextSummary] = await Promise.all([
        apiClient.health(),
        apiClient.dashboardSummary(),
      ])

      health = nextHealth
      summary = nextSummary
    }
    catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Unable to load dashboard data.'
    }
    finally {
      loading = false
    }
  }

  onMount(() => {
    void loadDashboard()
  })
</script>

<section class='space-y-6'>
  <Card class='overflow-hidden border-white/70 bg-white/85 shadow-[0_32px_80px_rgba(15,23,42,0.08)]'>
    <CardHeader class='space-y-5'>
      <div class='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
        <div class='space-y-4'>
          <Badge variant='outline' class='border-sky-200 bg-sky-50 text-sky-700'>
            <Activity />
            Static admin frontend with live API status
          </Badge>
          <div class='space-y-2'>
            <CardTitle class='text-3xl tracking-tight text-slate-950 sm:text-4xl'>
              Workspace bootstrap is ready for feature development.
            </CardTitle>
            <CardDescription class='max-w-2xl text-base leading-7 text-slate-600'>
              The dashboard below proves the monorepo wiring end to end: SvelteKit renders the shell,
              the browser fetches Fastify endpoints, and Zod-backed contracts validate the payloads.
            </CardDescription>
          </div>
        </div>

        <div class='flex flex-wrap items-center gap-3'>
          <Button variant='outline' onclick={loadDashboard}>
            <RefreshCw />
            Refresh data
          </Button>
          <Button href='/system'>
            <ShieldCheck />
            System view
          </Button>
        </div>
      </div>

      <div class='grid gap-3 md:grid-cols-3'>
        <div class='rounded-2xl bg-slate-950 px-4 py-4 text-white'>
          <p class='text-xs uppercase tracking-[0.28em] text-slate-400'>Frontend</p>
          <p class='mt-2 text-lg font-semibold'>SvelteKit adapter-static</p>
        </div>
        <div class='rounded-2xl bg-sky-600 px-4 py-4 text-white'>
          <p class='text-xs uppercase tracking-[0.28em] text-sky-100'>Backend</p>
          <p class='mt-2 text-lg font-semibold'>Fastify + TypeScript + Zod</p>
        </div>
        <div class='rounded-2xl bg-white px-4 py-4 text-slate-900 shadow-sm ring-1 ring-slate-200'>
          <p class='text-xs uppercase tracking-[0.28em] text-slate-500'>Contracts</p>
          <p class='mt-2 text-lg font-semibold'>@admin-ai/contracts</p>
        </div>
      </div>
    </CardHeader>
  </Card>

  {#if errorMessage}
    <Card class='border-rose-200 bg-rose-50'>
      <CardHeader>
        <CardTitle class='text-rose-700'>Unable to load API data</CardTitle>
        <CardDescription class='text-rose-600'>{errorMessage}</CardDescription>
      </CardHeader>
    </Card>
  {/if}

  <section class='grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]'>
    <div class='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
      {#if loading}
        {#each Array.from({ length: 3 }) as _, index (index)}
          <Card class='border-white/70 bg-white/85'>
            <CardHeader class='space-y-4'>
              <Skeleton class='h-4 w-24' />
              <Skeleton class='h-8 w-32' />
              <Skeleton class='h-4 w-full' />
            </CardHeader>
          </Card>
        {/each}
      {:else if summary}
        {#each summary.metrics as metric}
          <Card class='border-white/70 bg-white/85'>
            <CardHeader class='space-y-4'>
              <div class='flex items-start justify-between gap-3'>
                <div>
                  <CardDescription>{metric.label}</CardDescription>
                  <CardTitle class='mt-2 text-3xl'>{metric.value}</CardTitle>
                </div>
                <Badge variant={metric.tone === 'positive' ? 'secondary' : 'outline'}>
                  <ArrowUpRight />
                  {metric.delta}
                </Badge>
              </div>
              <p class='text-sm leading-6 text-slate-600'>{metric.description}</p>
            </CardHeader>
          </Card>
        {/each}
      {/if}
    </div>

    <Card class='border-white/70 bg-white/85'>
      <CardHeader class='space-y-4'>
        <div class='flex items-center justify-between gap-3'>
          <div>
            <CardDescription>Service health</CardDescription>
            <CardTitle class='mt-2 flex items-center gap-2 text-2xl'>
              <Server class='size-5 text-sky-600' />
              {health?.service ?? 'Waiting for API'}
            </CardTitle>
          </div>
          {#if health}
            <Badge variant={health.status === 'ok' ? 'secondary' : 'destructive'}>
              {health.status}
            </Badge>
          {/if}
        </div>
        <p class='text-sm leading-6 text-slate-600'>
          Requests are sent to <span class='font-medium text-slate-900'>{apiClient.baseUrl}</span>.
        </p>
      </CardHeader>
      <CardContent class='space-y-4'>
        {#if loading}
          <Skeleton class='h-4 w-full' />
          <Skeleton class='h-4 w-4/5' />
          <Skeleton class='h-4 w-3/5' />
        {:else if health}
          <div class='space-y-3 text-sm text-slate-600'>
            <div class='flex items-center justify-between gap-4 rounded-2xl bg-slate-100/80 px-4 py-3'>
              <span>Started at</span>
              <span class='font-medium text-slate-900'>{new Date(health.startedAt).toLocaleString()}</span>
            </div>
            <div class='flex items-center justify-between gap-4 rounded-2xl bg-slate-100/80 px-4 py-3'>
              <span>Last checked</span>
              <span class='font-medium text-slate-900'>{new Date(health.timestamp).toLocaleString()}</span>
            </div>
          </div>
        {/if}

        <Separator />

        <div class='space-y-3'>
          <p class='text-xs font-semibold uppercase tracking-[0.28em] text-slate-500'>Next steps</p>
          {#if summary}
            <ul class='space-y-2 text-sm leading-6 text-slate-600'>
              {#each summary.notices as notice}
                <li class='rounded-2xl bg-slate-100/80 px-4 py-3'>{notice}</li>
              {/each}
            </ul>
          {:else if loading}
            <Skeleton class='h-4 w-full' />
            <Skeleton class='h-4 w-full' />
          {/if}
        </div>
      </CardContent>
    </Card>
  </section>
</section>
