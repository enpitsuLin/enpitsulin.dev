<script setup lang="ts">
import { client } from '~~/lib/auth-client'

defineOptions({
  name: 'DashboardPage',
})

function signUp() {
  client.signUp.email({
    email: 'test@test.com',
    password: 'testtesttest',
    name: 'Test',
  })
}
</script>

<template>
  <h1>Dashboard</h1>
  <button @click="signUp">
    Sign Up
  </button>
</template>
