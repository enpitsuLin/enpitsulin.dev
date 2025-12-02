<script setup lang="ts">
defineOptions({
  name: 'DashboardPage',
})

definePageMeta({
  layout: 'dashboard',
  title: '仪表盘',
  breadcrumb: '仪表盘',
})
</script>

<template>
  <div class="px-4 lg:px-6">
    <div
      flex="~ col gap-6"
      border="~ border rounded-xl"
      class="p-6 shadow @container/card"
    >
      <section>
        <p>
          上次登录位置：{{ "未知位置" }}
        </p>
        <p>
          <!-- 上次登录时间：<NuxtTime
            v-if="session?.updatedAt"
            :datetime="session.updatedAt"
            time-zone="Asia/Shanghai"
            weekday="long"
            year="numeric"
            month="long"
            day="2-digit"
          /> -->
        </p>
      </section>
    </div>
  </div>
</template>
