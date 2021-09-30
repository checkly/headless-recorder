<template>
  <main class="bg-gray-lightest flex py-9 w-full h-screen overflow-auto dark:bg-black">
    <div class="flex flex-col w-1/4 pt-12 pr-6">
      <a href="https://www.checklyhq.com/docs/headless-recorder/" target="_blank">Docs</a>
      <a href="https://github.com/checkly/headless-recorder" target="_blank">GitHub</a>
      <a href="https://github.com/checkly/headless-recorder/blob/master/CHANGELOG.md"
        >Release notes</a
      >
      <a
        href="https://chrome.google.com/webstore/detail/headless-recorder/djeegiggegleadkkbgopoonhjimgehda"
        target="_blank"
        >Chrome Web Store</a
      >
    </div>
    <div class="flex flex-col w-1/2">
      <header class="flex flex-row justify-between items-center mb-3.5">
        <div class="flex items-baseline">
          <h1 class="text-blue text-2xl font-bold mr-1">
            Headless Recorder
          </h1>
          <span class="text-gray-dark dark:text-gray-light text-sm">v{{ version }}</span>
        </div>
        <span
          role="alert"
          class="text-gray-darkest dark:text-white text-base font-semibold"
          v-show="isSaving"
          >Saving…</span
        >
      </header>

      <section>
        <h2>Recorder</h2>
        <label for="custom-data-attribute">Custom data attribute</label>
        <div class="mb-6">
          <input
            id="custom-data-attribute"
            class="w-full placeholder-gray-darkish bg-gray-lighter h-7 rounded px-2 mb-2 text-sm"
            type="text"
            v-model.trim="options.code.dataAttribute"
            @change="save"
            placeholder="your custom data-* attribute"
          />
          <p>
            Define an attribute that we'll attempt to use when selecting the elements, i.e
            "data-custom". This is handy when React or Vue based apps generate random class names.
          </p>
          <p>
            <span role="img" aria-label="siren">🚨</span>
            <span class="ml-1 font-bold text-black-shady dark:text-white"
              >When <span class="italic">"custom data attribute"</span>&nbsp; is set, it will take
              precedence from over any other selector (even ID)
            </span>
          </p>
        </div>
        <div>
          <label>Set key code</label>
          <div class="mb-2">
            <Button @click="listenForKeyCodePress" class="font-semibold text-white text-sm">
              {{ isRecordingKeyCodePress ? 'Capturing…' : 'Record Key Stroke' }}
            </Button>
            <span class="text-gray-dark dark:text-gray-light text-sm ml-3">
              {{ options.code.keyCode }}
            </span>
          </div>
          <p>
            What key will be used for capturing input changes. The value here is the key code. This
            will not handle multiple keys.
          </p>
        </div>
      </section>

      <section>
        <h2>Generator</h2>
        <Toggle v-model="options.code.wrapAsync">
          Wrap code in async function
        </Toggle>
        <Toggle v-model="options.code.headless">
          Set <code>headless</code> in playwright/puppeteer launch options
        </Toggle>
        <Toggle v-model="options.code.waitForNavigation">
          Add <code>waitForNavigation</code> lines on navigation
        </Toggle>
        <Toggle v-model="options.code.waitForSelectorOnClick">
          Add <code>waitForSelector</code> lines before every
          <code>page.click()</code>
        </Toggle>
        <Toggle v-model="options.code.blankLinesBetweenBlocks">
          Add blank lines between code blocks
        </Toggle>
        <Toggle v-model="options.code.showPlaywrightFirst">
          Show Playwright tab first
        </Toggle>
      </section>

      <section>
        <h2 class="">Extension</h2>
        <Toggle v-model="options.extension.darkMode">
          Use Dark Mode {{ options.extension.darkMode }}
        </Toggle>
        <Toggle v-model="options.extension.telemetry">
          Allow recording of usage telemetry
        </Toggle>
        <p>
          We only record clicks for basic product development, no website content or input data.
          Data is never, ever shared with 3rd parties.
        </p>
      </section>
    </div>
  </main>
</template>

<script lang="ts">
import { version } from '../../package.json'

import storage from '@/services/storage'
import { isDarkMode } from '@/services/constants'
import { defaults as code } from '@/modules/code-generator/base-generator'
import merge from 'lodash.merge'

import Button from '@/components/Button.vue'
import Toggle from '@/components/Toggle.vue'
import { defineComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue'

function getDefaultOptions() {
  return {
    code,
    extension: {
      telemetry: true,
      darkMode: isDarkMode(),
    },
  }
}

export default defineComponent({
  name: 'OptionsApp',

  components: { Toggle, Button },

  setup() {
    const isLoading = ref(true)
    const isSaving = ref(false)
    const isRecordingKeyCodePress = ref(false)

    const options = ref(getDefaultOptions())

    let saveTimeoutHandle: number

    async function load() {
      const { options: storageOptions } = await storage.get('options')
      merge(options.value, storageOptions)
      isLoading.value = false
    }

    async function save() {
      window.clearTimeout(saveTimeoutHandle)
      isSaving.value = true
      await storage.set({ options: options.value })

      saveTimeoutHandle = window.setTimeout(() => (isSaving.value = false), 500)
    }

    function listenForKeyCodePress() {
      isRecordingKeyCodePress.value = true

      const keyDownFunction = (e: KeyboardEvent) => {
        isRecordingKeyCodePress.value = false
        updateKeyCodeWithNumber(e)
        window.removeEventListener('keydown', keyDownFunction, false)
        e.preventDefault()
      }

      window.addEventListener('keydown', keyDownFunction, false)
    }

    function updateKeyCodeWithNumber(event: KeyboardEvent) {
      // @ts-ignore
      options.value.code.keyCode = parseInt(event.keyCode, 10)
      save()
    }

    watch(
      options,
      val => {
        save()
        if (val.extension.darkMode) document.body.classList.add('dark')
        else document.body.classList.remove('dark')
      },
      { deep: true }
    )

    function storageChangeListener(changes: {
      [name: string]: chrome.storage.StorageChange
    }): void {
      const { options: storageOptions } = changes
      if (storageOptions?.newValue.extension.darkMode !== options.value.extension.darkMode) {
        options.value.extension.darkMode = storageOptions.newValue.extension.darkMode
      }
    }

    onMounted(() => {
      load()
      chrome.storage.onChanged.addListener(storageChangeListener)
    })

    onBeforeUnmount(() => {
      chrome.storage.onChanged.removeListener(storageChangeListener)
    })

    return {
      version,
      isLoading,
      isSaving,
      isRecordingKeyCodePress,
      options,
      listenForKeyCodePress,
      save,
    }
  },
})
</script>

<style scoped>
body {
  background: #f9fafc;
  height: 100vh;
}

body.dark {
  background: #161616;
}

code {
  @apply font-semibold;
}

a {
  @apply text-blue underline text-sm text-right;
}

h2 {
  @apply text-gray-darkish text-xl font-semibold mb-5 dark:text-gray-light;
}

label {
  color: #000;
  @apply font-semibold text-sm mb-2 block dark:text-gray-lightest;
}

section {
  @apply bg-white border-gray-light border border-solid rounded-md p-4 pb-10 mb-6 dark:bg-black-shady dark:border-gray-dark;
}

p {
  @apply text-gray-darkish text-xs mb-2 dark:text-white;
}
</style>
