<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import BottomNav from './components/BottomNav.vue'
import NotificationModal from './components/NotificationModal.vue'
import ScrollToTop from './components/ScrollToTop.vue'
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
    <main class="main-content">
      <RouterView />
    </main>
    <Footer />
    <BottomNav />
    <NotificationModal />
    <ScrollToTop />
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
}

@media (max-width: 768px) {
  .main-content {
    padding-bottom: 60px; /* Space for BottomNav */
  }
}
</style>
