<script lang="ts">
import type { LIGHT_DARK_MODE } from '@/types/config.ts'
import { AUTO_MODE, DARK_MODE, LIGHT_MODE } from '@constants/constants.ts'
import I18nKey from '@i18n/i18nKey'
import { i18n } from '@i18n/translation'
import Icon from '@iconify/svelte'
import {
  applyThemeToDocument,
  getStoredTheme,
  setTheme,
} from '@utils/setting-utils.ts'
import { onMount } from 'svelte'

const seq: LIGHT_DARK_MODE[] = [LIGHT_MODE, DARK_MODE, AUTO_MODE]
let mode: LIGHT_DARK_MODE = AUTO_MODE

onMount(() => {
  mode = getStoredTheme()
  const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)')
  const changeThemeWhenSchemeChanged: Parameters<
    typeof darkModePreference.addEventListener<'change'>
  >[1] = e => {
    applyThemeToDocument(mode)
  }
  darkModePreference.addEventListener('change', changeThemeWhenSchemeChanged)
  return () => {
    darkModePreference.removeEventListener(
      'change',
      changeThemeWhenSchemeChanged,
    )
  }
})

function switchScheme(newMode: LIGHT_DARK_MODE) {
  mode = newMode
  setTheme(newMode)
}

function toggleScheme() {
  let i = 0
  for (; i < seq.length; i++) {
    if (seq[i] === mode) {
      break
    }
  }
  switchScheme(seq[(i + 1) % seq.length])
}

function showPanel() {
  const panel = document.querySelector('#light-dark-panel')
  panel.classList.remove('float-panel-closed')
}

function hidePanel() {
  const panel = document.querySelector('#light-dark-panel')
  panel.classList.add('float-panel-closed')
}
</script>

<!-- z-50 make the panel higher than other float panels -->
<div class="relative z-50" role="menu" tabindex="-1" on:mouseleave={hidePanel}>
    <button aria-label="Light/Dark Mode" role="menuitem" class="relative btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90" id="scheme-switch" on:click={toggleScheme} on:mouseenter={showPanel}>
        <div class="absolute" class:opacity-0={mode !== LIGHT_MODE}>
            <Icon icon="material-symbols:wb-sunny-outline-rounded" class="text-[1.25rem]"></Icon>
        </div>
        <div class="absolute" class:opacity-0={mode !== DARK_MODE}>
            <Icon icon="material-symbols:dark-mode-outline-rounded" class="text-[1.25rem]"></Icon>
        </div>
        <div class="absolute" class:opacity-0={mode !== AUTO_MODE}>
            <Icon icon="material-symbols:radio-button-partial-outline" class="text-[1.25rem]"></Icon>
        </div>
    </button>

    <div id="light-dark-panel" class="hidden lg:block absolute transition float-panel-closed top-11 -right-2 pt-5" >
        <div class="card-base float-panel p-2">
            <button class="flex transition whitespace-nowrap items-center justify-start w-full btn-plain scale-animation rounded-lg h-9 px-3 font-medium active:scale-95 mb-0.5"
                    class:current-theme-btn={mode === LIGHT_MODE}
                    on:click={() => switchScheme(LIGHT_MODE)}
            >
                <Icon icon="material-symbols:wb-sunny-outline-rounded" class="text-[1.25rem] mr-3"></Icon>
                {i18n(I18nKey.lightMode)}
            </button>
            <button class="flex transition whitespace-nowrap items-center justify-start w-full btn-plain scale-animation rounded-lg h-9 px-3 font-medium active:scale-95 mb-0.5"
                    class:current-theme-btn={mode === DARK_MODE}
                    on:click={() => switchScheme(DARK_MODE)}
            >
                <Icon icon="material-symbols:dark-mode-outline-rounded" class="text-[1.25rem] mr-3"></Icon>
                {i18n(I18nKey.darkMode)}
            </button>
            <button class="flex transition whitespace-nowrap items-center justify-start w-full btn-plain scale-animation rounded-lg h-9 px-3 font-medium active:scale-95"
                    class:current-theme-btn={mode === AUTO_MODE}
                    on:click={() => switchScheme(AUTO_MODE)}
            >
                <Icon icon="material-symbols:radio-button-partial-outline" class="text-[1.25rem] mr-3"></Icon>
                {i18n(I18nKey.systemMode)}
            </button>
        </div>
    </div>
</div>

<style lang="css">
.current-setting {
    background: var(--btn-plain-bg-hover);
    color: var(--primary);
}
</style>