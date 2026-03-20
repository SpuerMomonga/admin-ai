<script lang='ts'>
  import { Card } from '$lib/components/ui/card'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import { translate as t } from '$lib/i18n'
  import { appShell } from '$lib/stores/app-shell'
</script>

<section class='grid gap-3'>
  <Card size='sm' class='px-4'>
    <p class='shell-card-label'>{t('account_title')}</p>
    <h3 class='shell-card-title'>{$appShell.user.displayName}</h3>
    <p class='shell-card-copy'>{t('account_description')}</p>
  </Card>

  <Card size='sm' class='px-4'>
    <div class='grid gap-3 lg:grid-cols-3'>
      <div class='grid gap-2'>
        <Label for='account-name'>{t('account_name_label')}</Label>
        <Input
          id='account-name'
          value={$appShell.settings.account.displayName}
          oninput={event => appShell.updateSettingsSection('account', { displayName: event.currentTarget.value })}
        />
      </div>

      <div class='grid gap-2'>
        <Label for='account-email'>{t('account_email_label')}</Label>
        <Input
          id='account-email'
          value={$appShell.settings.account.email}
          oninput={event => appShell.updateSettingsSection('account', { email: event.currentTarget.value })}
        />
      </div>

      <div class='grid gap-2'>
        <Label for='account-role'>{t('account_role_label')}</Label>
        <Input
          id='account-role'
          value={$appShell.settings.account.role}
          oninput={event => appShell.updateSettingsSection('account', { role: event.currentTarget.value })}
        />
      </div>
    </div>
  </Card>
</section>
