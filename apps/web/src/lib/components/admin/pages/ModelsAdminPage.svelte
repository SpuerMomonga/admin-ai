<script lang='ts'>
  import { translate as t } from '$lib/i18n'
  import { appShell } from '$lib/stores/app-shell'
</script>

<section class='grid gap-3'>
  <article class='shell-card'>
    <p class='shell-card-label'>{t('models_title')}</p>
    <h3 class='shell-card-title'>{$appShell.settings.models.primaryModel}</h3>
    <p class='shell-card-copy'>{t('models_description')}</p>
  </article>

  <article class='shell-card'>
    <div class='grid gap-3 lg:grid-cols-3'>
      <label class='shell-field'>
        <span>{t('models_primary_label')}</span>
        <input
          class='shell-input'
          value={$appShell.settings.models.primaryModel}
          oninput={(event) => appShell.updateSettingsSection('models', { primaryModel: event.currentTarget.value })}
        />
      </label>

      <label class='shell-field'>
        <span>{t('models_operation_label')}</span>
        <input
          class='shell-input'
          value={$appShell.settings.models.operationModel}
          oninput={(event) => appShell.updateSettingsSection('models', { operationModel: event.currentTarget.value })}
        />
      </label>

      <label class='shell-field'>
        <span>{t('models_routing_label')}</span>
        <input
          class='shell-input'
          value={$appShell.settings.models.routingPolicy}
          oninput={(event) => appShell.updateSettingsSection('models', { routingPolicy: event.currentTarget.value })}
        />
      </label>
    </div>
  </article>
</section>
