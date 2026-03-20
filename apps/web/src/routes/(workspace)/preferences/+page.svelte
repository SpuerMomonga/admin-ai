<script lang='ts'>
  import AppSelect from '$lib/components/ui/app-select.svelte'
  import { Button } from '$lib/components/ui/button'
  import { Card } from '$lib/components/ui/card'
  import { Label } from '$lib/components/ui/label'
  import { translate as t, translateLocaleName, translateThemePreference } from '$lib/stores/i18n'
  import { setSystemPreference, systemPreferencesStore } from '$lib/stores/preferences'

  const themeOptions = $derived.by(() => [
    { value: 'system', label: t('theme_system') },
    { value: 'light', label: t('theme_light') },
    { value: 'dark', label: t('theme_dark') },
  ])

  const languageOptions = $derived.by(() => [
    { value: 'zh-CN', label: t('locale_zh_cn') },
    { value: 'en', label: t('locale_en') },
  ])

</script>

<section class='grid gap-3'>
  <Card size='sm' class='px-4'>
    <p class='shell-card-label'>{t('panel_preferences')}</p>
    <h3 class='shell-card-title'>{t('preferences')}</h3>
    <p class='shell-card-copy'>{t('admin_nav_mode_description')}</p>
  </Card>

  <div class='grid gap-3 xl:grid-cols-3'>
    <Card size='sm' class='px-4'>
      <p class='shell-card-label'>{t('theme_label')}</p>
      <h3 class='shell-card-title'>{translateThemePreference($systemPreferencesStore.themePreference)}</h3>
      <p class='shell-card-copy'>{t('general_theme_card')}</p>
    </Card>

    <Card size='sm' class='px-4'>
      <p class='shell-card-label'>{t('locale_label')}</p>
      <h3 class='shell-card-title'>{translateLocaleName($systemPreferencesStore.locale)}</h3>
      <p class='shell-card-copy'>{t('general_locale_card')}</p>
    </Card>

    <Card size='sm' class='px-4'>
      <p class='shell-card-label'>{t('admin_nav_mode_label')}</p>
      <h3 class='shell-card-title'>{$systemPreferencesStore.adminNavigationMode === 'sidebar' ? t('admin_nav_sidebar') : t('admin_nav_topbar')}</h3>
      <p class='shell-card-copy'>{t('admin_nav_mode_description')}</p>
    </Card>
  </div>

  <Card size='sm' class='px-4'>
    <div class='grid gap-3 lg:grid-cols-3'>
      <div class='grid gap-2'>
        <Label>{t('theme_label')}</Label>
        <AppSelect
          value={$systemPreferencesStore.themePreference}
          options={themeOptions}
          onValueChange={value => setSystemPreference('themePreference', value)}
        />
      </div>

      <div class='grid gap-2'>
        <Label>{t('locale_label')}</Label>
        <AppSelect
          value={$systemPreferencesStore.locale}
          options={languageOptions}
          onValueChange={value => setSystemPreference('locale', value)}
        />
      </div>

      <div class='grid gap-2'>
        <Label>{t('admin_nav_mode_label')}</Label>
        <div class='flex gap-2'>
          <Button
            variant={$systemPreferencesStore.adminNavigationMode === 'topbar' ? 'default' : 'outline'}
            size='sm'
            onclick={() => setSystemPreference('adminNavigationMode', 'topbar')}
          >
            {t('admin_nav_topbar')}
          </Button>
          <Button
            variant={$systemPreferencesStore.adminNavigationMode === 'sidebar' ? 'default' : 'outline'}
            size='sm'
            onclick={() => setSystemPreference('adminNavigationMode', 'sidebar')}
          >
            {t('admin_nav_sidebar')}
          </Button>
        </div>
      </div>
    </div>
  </Card>
</section>
