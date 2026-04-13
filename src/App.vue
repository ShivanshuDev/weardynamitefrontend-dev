<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import BottomNav from './components/BottomNav.vue'
import NotificationModal from './components/NotificationModal.vue'
import ScrollToTop from './components/ScrollToTop.vue'
import SplashScreen from './components/SplashScreen.vue'
import { useAuthStore } from './stores/authStore'
import { ref } from 'vue'

const authStore = useAuthStore()
const isAppLoading = ref(true)

onMounted(async () => {
  const start = Date.now()
  
  try {
    if (authStore.isLoggedIn) {
      if (!authStore.user) {
        await authStore.syncProfile().catch(() => {});
      }
      
      await Promise.all([
        authStore.fetchOrders(),
        authStore.fetchAddresses(),
        authStore.fetchNotifications(),
        authStore.registerFcmToken()
      ]);
    }
  } finally {
    // Ensure splash screen shows for at least 1.8 seconds for premium feel
    const elapsed = Date.now() - start
    const delay = Math.max(0, 1800 - elapsed)
    setTimeout(() => {
      isAppLoading.value = false
    }, delay)
  }
})
</script>

<template>
  <div class="app-container">
    <SplashScreen :show="isAppLoading" />
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
