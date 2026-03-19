<script lang='ts'>
  import type { HealthResponse } from '@admin-ai/contracts'
  import { apiClient } from '$lib/api/client'
  import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from '@admin-ai/ui'
  import { Activity, RefreshCw, Server } from '@lucide/svelte'
  import { onMount } from 'svelte'

  let health = $state<HealthResponse | null>(null)
  let loading = $state(true)
  let errorMessage = $state<string | null>(null)

  async function refreshHealth() {
    loading = true
    errorMessage = null

    try {
      health = await apiClient.health()
    }
    catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Unable to reach the API.'
    }
    finally {
      loading = false
    }
  }

  onMount(() => {
    void refreshHealth()
  })
</script>

<section class='grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]'>
  <Card class='border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)]'>
    <CardHeader class='space-y-4'>
      <Badge variant='outline' class='border-sky-200 bg-sky-50 text-sky-700'>
        <Activity />
        Runtime endpoint details
      </Badge>
      <div class='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div class='space-y-2'>
          <CardTitle class='text-3xl tracking-tight text-slate-950'>System status</CardTitle>
          <CardDescription class='max-w-xl text-base leading-7 text-slate-600'>
            This view is intentionally small and operational: it confirms the static frontend can reach the
            Fastify service configured through <code>PUBLIC_API_BASE_URL</code>.
          </CardDescription>
        </div>
        <Button variant='outline' onclick={refreshHealth}>
          <RefreshCw />
          Refresh health
        </Button>
      </div>
    </CardHeader>
    <CardContent class='space-y-4'>
      <div class='rounded-3xl bg-slate-950 px-5 py-5 text-white'>
        <p class='text-xs uppercase tracking-[0.28em] text-slate-400'>Configured endpoint</p>
        <p class='mt-3 break-all text-lg font-semibold'>{apiClient.baseUrl}</p>
      </div>

      {#if loading}
        <Skeleton class='h-12 w-full' />
        <Skeleton class='h-12 w-full' />
      {:else if health}
        <div class='grid gap-3'>
          <div class='rounded-2xl bg-slate-100/80 px-4 py-4'>
            <p class='text-sm text-slate-500'>Service</p>
            <p class='mt-1 text-lg font-semibold text-slate-950'>{health.service}</p>
          </div>
          <div class='rounded-2xl bg-slate-100/80 px-4 py-4'>
            <p class='text-sm text-slate-500'>Started at</p>
            <p class='mt-1 text-lg font-semibold text-slate-950'>{new Date(health.startedAt).toLocaleString()}</p>
          </div>
        </div>
      {/if}

      {#if errorMessage}
        <p class='rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600'>{errorMessage}</p>
      {/if}
    </CardContent>
  </Card>

  <Card class='border-white/70 bg-white/85'>
    <CardHeader>
      <CardTitle class='flex items-center gap-2 text-xl'>
        <Server class='size-5 text-sky-600' />
        Health probe
      </CardTitle>
      <CardDescription>
        Shared contracts ensure the backend response shape remains aligned with the frontend runtime checks.
      </CardDescription>
    </CardHeader>
    <CardContent>
      {#if loading}
        <Skeleton class='h-20 w-full' />
      {:else if health}
        <div class='space-y-3'>
          <Badge variant={health.status === 'ok' ? 'secondary' : 'destructive'}>
            {health.status}
          </Badge>
          <p class='text-sm leading-6 text-slate-600'>
            Last successful probe: <span class='font-medium text-slate-900'>{new Date(health.timestamp).toLocaleString()}</span>
          </p>
        </div>
      {/if}
    </CardContent>
  </Card>
</section>
