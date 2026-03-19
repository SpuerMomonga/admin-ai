<script lang='ts'>
  import { translate as t } from '$lib/i18n'
  import { appShell } from '$lib/stores/app-shell'
</script>

<section class='grid gap-3'>
  <article class='shell-card'>
    <p class='shell-card-label'>{t('account_title')}</p>
    <h3 class='shell-card-title'>{$appShell.user.displayName}</h3>
    <p class='shell-card-copy'>{t('account_description')}</p>
  </article>

  <article class='shell-card'>
    <div class='grid gap-3 lg:grid-cols-3'>
      <label class='shell-field'>
        <span>{t('account_name_label')}</span>
        <input
          class='shell-input'
          value={$appShell.settings.account.displayName}
          oninput={(event) => appShell.updateSettingsSection('account', { displayName: event.currentTarget.value })}
        />
      </label>

      <label class='shell-field'>
        <span>{t('account_email_label')}</span>
        <input
          class='shell-input'
          value={$appShell.settings.account.email}
          oninput={(event) => appShell.updateSettingsSection('account', { email: event.currentTarget.value })}
        />
      </label>

      <label class='shell-field'>
        <span>{t('account_role_label')}</span>
        <input
          class='shell-input'
          value={$appShell.settings.account.role}
          oninput={(event) => appShell.updateSettingsSection('account', { role: event.currentTarget.value })}
        />
      </label>
    </div>
  </article>
</section>
