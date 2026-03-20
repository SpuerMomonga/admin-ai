<script lang='ts'>
  import { Card } from '$lib/components/ui/card'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import { translate as t } from '$lib/stores/i18n'
  import { settingsStore, updateSettingsSection } from '$lib/stores/settings'
</script>

<section class='grid gap-3'>
  <Card size='sm' class='px-4'>
    <p class='shell-card-label'>{t('models_title')}</p>
    <h3 class='shell-card-title'>{$settingsStore.settings.models.primaryModel}</h3>
    <p class='shell-card-copy'>{t('models_description')}</p>
  </Card>

  <Card size='sm' class='px-4'>
    <div class='grid gap-3 lg:grid-cols-3'>
      <div class='grid gap-2'>
        <Label for='models-primary'>{t('models_primary_label')}</Label>
        <Input
          id='models-primary'
          value={$settingsStore.settings.models.primaryModel}
          oninput={event => updateSettingsSection('models', { primaryModel: event.currentTarget.value })}
        />
      </div>

      <div class='grid gap-2'>
        <Label for='models-operation'>{t('models_operation_label')}</Label>
        <Input
          id='models-operation'
          value={$settingsStore.settings.models.operationModel}
          oninput={event => updateSettingsSection('models', { operationModel: event.currentTarget.value })}
        />
      </div>

      <div class='grid gap-2'>
        <Label for='models-routing'>{t('models_routing_label')}</Label>
        <Input
          id='models-routing'
          value={$settingsStore.settings.models.routingPolicy}
          oninput={event => updateSettingsSection('models', { routingPolicy: event.currentTarget.value })}
        />
      </div>
    </div>
  </Card>
</section>
