<script lang="ts" setup>
/**
 * @credits Pergel <https://nuxtlabs.com/>
 */
import { computed } from 'vue'

const props = withDefaults(defineProps<{ title?: string, description?: string, headline?: string }>(), {
  title: 'title',
  description: 'description',
  headline: 'headline',
})

const { siteUrl, title: siteTitle, description: siteDescription } = useAppConfig()
const title = computed(() => props.title.slice(0, 60))
</script>

<template>
  <div class="w-full h-full flex flex-col justify-center bg-[#212121]">
    <svg class="absolute top-0 right-0" width="1200" height="675" viewBox="0 0 1200 675" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g style="mix-blend-mode:overlay" opacity="0.7" filter="url(#filter0_f_448_25)">
        <circle cx="901.5" cy="45.5" r="199.5" fill="#5BA3C0" />
        <circle cx="600.5" cy="216.5" r="199.5" fill="#337C95" />
        <circle cx="179.5" cy="317.5" r="199.5" fill="#4D8FA8" />
      </g>
      <defs>
        <filter id="filter0_f_448_25" x="-240" y="-374" width="1561" height="1111" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="110" result="effect1_foregroundBlur_448_25" />
        </filter>
      </defs>
    </svg>

    <div class="w-[600px] pl-[100px]">
      <p class="text-[16px] text-[#E4E4E7] mb-4 font-semibold">
        {{ siteUrl }}
      </p>
      <h1 class="w-[700px] m-0 text-[48px] font-semibold mb-4 text-white" style="display: block; line-clamp: 3; text-overflow: ellipsis;">
        {{ title }}
      </h1>
      <p class="text-[18px] text-[#E4E4E7] leading-tight">
        {{ siteTitle }} - {{ siteDescription }}
      </p>
    </div>

    <svg class="absolute top-[200px] right-[100px]" height="200" width="200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <defs>
        <linearGradient id="prefix__c" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#5ba3c0" />
          <stop offset="100%" stop-color="#337c95" />
        </linearGradient>
        <filter id="prefix__b" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
          <feOffset dx="1" dy="2" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope=".4" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="128" height="128" rx="28" ry="28" fill="url(#prefix__a)" />
      <path
        fill="none" stroke="#FFF" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"
        d="M38 92C22 82 22 50 48 40c24-10 44 5 50 25"
      />
      <g filter="url(#prefix__b)">
        <path d="M83 68l37.5-11-17.5 51-20-40z" fill="url(#prefix__c)" />
      </g>
    </svg>
  </div>
</template>
