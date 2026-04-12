<script setup>
import { 
  Home, 
  LayoutGrid, 
  MapPin, 
  ShoppingBag, 
  User 
} from 'lucide-vue-next';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const navItems = [
  { name: 'Home', icon: Home, path: '/' },
  { name: 'Categories', icon: LayoutGrid, path: '/shop' },
  { name: 'Explore', icon: MapPin, path: '/process' },
  { name: 'Account', icon: User, path: '/profile' }
];

const isActive = (path) => {
  if (path === '/') return route.path === '/';
  return route.path.startsWith(path.split('#')[0]);
};

const navigate = (path) => {
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (path.includes('#')) {
    const [baseUrl, hash] = path.split('#');
    router.push(baseUrl).then(() => {
      window.location.hash = hash;
    });
  } else {
    router.push(path);
  }
};
</script>

<template>
  <nav class="bottom-nav mobile-only">
    <div class="nav-container">
      <button 
        v-for="item in navItems" 
        :key="item.name"
        @click="navigate(item.path)"
        :class="['nav-item', { active: isActive(item.path) }]"
      >
        <component :is="item.icon" :size="20" />
        <span class="nav-label">{{ item.name }}</span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #eee;
  padding: 0.5rem 0;
  z-index: 1000;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.nav-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  max-width: 600px;
  margin: 0 auto;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: none;
  border: none;
  color: #666;
  gap: 4px;
  padding: 4px 0;
  flex: 1;
  transition: all 0.2s ease;
  cursor: pointer;
}

.nav-item.active {
  color: var(--meesho-pink);
}

.nav-label {
  font-size: 10px;
  font-weight: 500;
}

@media (min-width: 769px) {
  .mobile-only {
    display: none;
  }
}
</style>
