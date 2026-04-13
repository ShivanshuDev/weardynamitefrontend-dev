<template>
  <Transition name="fade-screen">
    <div v-if="show" class="splash-screen">
      <!-- Floating Background Items -->
      <div class="background-floating">
        <component 
          v-for="(item, i) in floatingItems" 
          :is="item.icon" 
          :key="i"
          class="floating-icon"
          :style="{ 
            top: item.top, 
            width: item.size + 'px', 
            height: item.size + 'px',
            animationDuration: item.speed,
            animationDelay: item.delay
          }"
        />
      </div>

      <div class="splash-content">
        <div class="logo-wrapper">
          <h1 class="splash-logo italic">WEARDYNAMITE</h1>
          <div class="loading-bar-container">
            <div class="loading-bar"></div>
          </div>
          <div class="category-ticker">
            <div class="ticker-content">
              <span>SHIRTS</span>
              <span class="dot">•</span>
              <span>T-SHIRTS</span>
              <span class="dot">•</span>
              <span>BLAZERS</span>
              <span class="dot">•</span>
              <span>TROUSERS</span>
              <span class="dot">•</span>
              <!-- Repeat for seamless loop -->
              <span>SHIRTS</span>
              <span class="dot">•</span>
              <span>T-SHIRTS</span>
              <span class="dot">•</span>
              <span>BLAZERS</span>
              <span class="dot">•</span>
              <span>TROUSERS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { Shirt, ShoppingBag, Tag, Square } from 'lucide-vue-next'

defineProps({
  show: {
    type: Boolean,
    default: true
  }
})

// Generate random positions and speeds for the floating icons
const floatingItems = [
  { icon: Shirt, size: 40, top: '15%', speed: '12s', delay: '0s' },
  { icon: ShoppingBag, size: 30, top: '45%', speed: '18s', delay: '-5s' },
  { icon: Shirt, size: 50, top: '75%', speed: '15s', delay: '-2s' },
  { icon: Tag, size: 25, top: '25%', speed: '20s', delay: '-8s' },
  { icon: Shirt, size: 35, top: '60%', speed: '14s', delay: '-12s' },
  { icon: Square, size: 45, top: '10%', speed: '25s', delay: '-4s' },
  { icon: ShoppingBag, size: 30, top: '85%', speed: '16s', delay: '-9s' }
]
</script>

<style scoped>
.splash-screen {
  position: fixed;
  inset: 0;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  overflow: hidden;
}

.background-floating {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: -1;
}

.floating-icon {
  position: absolute;
  left: -100px;
  color: #f1f5f9;
  opacity: 0.4;
  animation: float-right linear infinite;
}

.splash-content {
  text-align: center;
}

.logo-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.splash-logo {
  font-family: 'Times New Roman', serif;
  font-size: 3rem;
  font-weight: 900;
  letter-spacing: -1px;
  color: #000;
  animation: logo-entrance 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.loading-bar-container {
  width: 120px;
  height: 2px;
  background: #f1f5f9;
  border-radius: 10px;
  overflow: hidden;
}

.loading-bar {
  width: 100%;
  height: 100%;
  background: #000;
  animation: bar-pulse 1.5s infinite ease-in-out;
  transform-origin: left;
}

/* Animations */
@keyframes float-right {
  0% { transform: translateX(0) rotate(0deg); left: -100px; }
  100% { transform: translateX(calc(100vw + 200px)) rotate(360deg); }
}

@keyframes logo-entrance {
  0% { opacity: 0; transform: translateY(20px) scale(0.95); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes bar-pulse {
  0% { transform: scaleX(0); }
  50% { transform: scaleX(1); }
  100% { transform: scaleX(0); transform-origin: right; }
}

/* Transition */
.fade-screen-leave-active {
  transition: all 0.6s cubic-bezier(0.65, 0, 0.35, 1);
}

.fade-screen-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .splash-logo {
    font-size: 2rem;
  }
}

.category-ticker {
  width: 200px;
  overflow: hidden;
  margin-top: 10px;
  mask-image: linear-gradient(to right, transparent, black 20%, black 80%, transparent);
}

.ticker-content {
  display: flex;
  gap: 15px;
  white-space: nowrap;
  animation: scroll-left-to-right 10s linear infinite;
}

.ticker-content span {
  font-size: 10px;
  font-weight: 800;
  color: #94a3b8;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.ticker-content .dot {
  color: #cbd5e1;
}

@keyframes scroll-left-to-right {
  0% { transform: translateX(-50%); }
  100% { transform: translateX(0); }
}
</style>
