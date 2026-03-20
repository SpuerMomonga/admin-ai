<script lang='ts'>
  import { Card } from '$lib/components/ui/card'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import { translate as t } from '$lib/i18n'
  import { appShell } from '$lib/stores/app-shell'
</script>

<section class='grid gap-3'>
  <Card size='sm' class='px-4'>
    <p class='shell-card-label'>{t('models_title')}</p>
    <h3 class='shell-card-title'>{$appShell.settings.models.primaryModel}</h3>
    <p class='shell-card-copy'>{t('models_description')}</p>
  </Card>

  <Card size='sm' class='px-4'>
    <div class='grid gap-3 lg:grid-cols-3'>
      <div class='grid gap-2'>
        <Label for='models-primary'>{t('models_primary_label')}</Label>
        <Input
          id='models-primary'
          value={$appShell.settings.models.primaryModel}
          oninput={event => appShell.updateSettingsSection('models', { primaryModel: event.currentTarget.value })}
        />
      </div>

      <div class='grid gap-2'>
        <Label for='models-operation'>{t('models_operation_label')}</Label>
        <Input
          id='models-operation'
          value={$appShell.settings.models.operationModel}
          oninput={event => appShell.updateSettingsSection('models', { operationModel: event.currentTarget.value })}
        />
      </div>

      <div class='grid gap-2'>
        <Label for='models-routing'>{t('models_routing_label')}</Label>
        <Input
          id='models-routing'
          value={$appShell.settings.models.routingPolicy}
          oninput={event => appShell.updateSettingsSection('models', { routingPolicy: event.currentTarget.value })}
        />
      </div>
    </div>
  </Card>
</section>
