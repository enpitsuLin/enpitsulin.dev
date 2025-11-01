<script setup lang="ts">
defineOptions({
  name: 'DashboardPage',
})

definePage({
  meta: {
    breadcrumb: '仪表盘',
  },
})

const { session } = useAuth()

const lastLogin = useDateFormat(() => session.value?.updatedAt, 'YYYY-MM-DD HH:mm:ss dddd')
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
          上次登录位置：{{ session?.ipAddress || "未知位置" }}
        </p>
        <p>
          上次登录时间：<time :datetime="session?.updatedAt?.toISOString()">{{ lastLogin }}</time>
        </p>
      </section>
    </div>
  </div>
</template>
