<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ArrowUp } from 'lucide-vue-next'

const isVisible = ref(false)

const checkScroll = () => {
  isVisible.value = window.pageYOffset > 300
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', checkScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll)
})
</script>

<template>
  <Transition name="fade-up">
    <button 
      v-if="isVisible" 
      class="scroll-to-top" 
      @click="scrollToTop"
      aria-label="Scroll to top"
    >
      <ArrowUp :size="20" />
    </button>
  </Transition>
</template>

<style scoped>
.scroll-to-top {
  position: fixed;
  bottom: 85px; /* Stay above BottomNav */
  right: 20px;
  width: 44px;
  height: 44px;
  background: #000;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  cursor: pointer;
  z-index: 1500;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

@media (min-width: 769px) {
  .scroll-to-top {
    bottom: 30px;
    width: 50px;
    height: 50px;
    right: 30px;
  }
}

/* Transitions */
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
