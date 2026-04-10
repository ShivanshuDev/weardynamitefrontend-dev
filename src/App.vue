<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import { useAuthStore } from './stores/authStore'

const authStore = useAuthStore()

onMounted(async () => {
  if (authStore.isLoggedIn) {
    await Promise.all([
      authStore.fetchOrders(),
      authStore.fetchAddresses(),
      authStore.fetchNotifications(),
      authStore.registerFcmToken()
    ]);
  }
})
</script>

<template>
  <div class="app-container">
    <Header />
    <main>
      <RouterView />
    </main>
    <Footer />
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
}
</style>
