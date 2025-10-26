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

function signIn() {
  client.signIn.email({
    email: 'test@test.com',
    password: 'testtesttest',
  })
}

function githubSignIn() {
  client.signIn.social({
    provider: 'github',
  })
}
</script>

<template>
  <h1>Dashboard</h1>
  <div flex="~ col gap-2">
    <button @click="signUp">
      Sign Up
    </button>
    <button @click="signIn">
      Sign In
    </button>

    <button @click="githubSignIn">
      github sign in
    </button>
  </div>
</template>
