<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Search, ShoppingCart, User, Menu, X, Heart } from 'lucide-vue-next'
import { useProductStore } from '../stores/productStore'
import { useAuthStore } from '../stores/authStore'

const productStore = useProductStore()
const authStore = useAuthStore()
const isMenuOpen = ref(false)
const toggleMenu = () => isMenuOpen.value = !isMenuOpen.value

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Shop', path: '/shop' },
  { name: 'Customize', path: '/customize' },
  { name: 'Blog', path: '/blog' },
  { name: 'Process', path: '/process' },
  { name: 'About Us', path: '/about' },
  { name: 'Contact Us', path: '/contact' }
]
</script>

<template>
  <header class="header">
    <div class="header-container container">
      <RouterLink to="/" class="logo">
        WEARDYNAMITE
      </RouterLink>

      <nav class="desktop-nav">
        <ul class="nav-links">
          <li v-for="link in navLinks" :key="link.name">
            <RouterLink :to="link.path" active-class="active">{{ link.name }}</RouterLink>
          </li>
        </ul>
      </nav>

      <div class="header-actions no-mobile">
        <button class="action-btn"><Search :size="20" /></button>
        <RouterLink :to="authStore.isLoggedIn ? '/profile' : '/login'" class="action-btn"><User :size="20" /></RouterLink>
        <RouterLink to="/favorites" class="action-btn cart-btn" title="Favorites">
          <Heart :size="20" />
          <span class="cart-count" v-if="productStore.favorites.length > 0">{{ productStore.favorites.length }}</span>
        </RouterLink>
        <RouterLink to="/cart" class="action-btn cart-btn" title="Cart">
          <ShoppingCart :size="20" />
          <span class="cart-count" v-if="productStore.cartCount > 0">{{ productStore.cartCount }}</span>
        </RouterLink>
      </div>

      <button class="mobile-menu-btn" @click="toggleMenu">
        <Menu v-if="!isMenuOpen" :size="24" />
        <X v-else :size="24" />
      </button>
    </div>

    <!-- Mobile Navigation Overlay -->
    <div class="mobile-nav" :class="{ 'open': isMenuOpen }">
      <ul class="mobile-nav-links">
        <li v-for="link in navLinks" :key="link.name">
          <RouterLink :to="link.path" @click="toggleMenu">{{ link.name }}</RouterLink>
        </li>
      </ul>
      <div class="mobile-actions">
        <button class="action-btn"><Search :size="20" /> Search</button>
        <RouterLink :to="authStore.isLoggedIn ? '/profile' : '/login'" class="action-btn" @click="toggleMenu"><User :size="20" /> Profile</RouterLink>
        <RouterLink to="/favorites" class="action-btn" @click="toggleMenu">
          <Heart :size="20" /> Favorites
          <span v-if="productStore.favorites.length > 0">({{ productStore.favorites.length }})</span>
        </RouterLink>
        <RouterLink to="/cart" class="action-btn" @click="toggleMenu">
          <ShoppingCart :size="20" /> Cart
          <span v-if="productStore.cartCount > 0">({{ productStore.cartCount }})</span>
        </RouterLink>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}

.header-container {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  align-items: center;
  height: 80px;
}

.logo {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 1px;
}

.desktop-nav {
  justify-self: center;
}

.nav-links {
  display: flex;
  gap: 30px;
  list-style: none;
}

.nav-links a {
  font-size: 0.95rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 10px 0;
  position: relative;
}

.nav-links a::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: 0;
  left: 0;
  background-color: #000;
  transition: width 0.3s ease;
}

.nav-links a:hover::after,
.nav-links a.active::after {
  width: 100%;
}

.header-actions {
  display: flex;
  justify-content: flex-end;
  gap: 20px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #000;
  display: flex;
  align-items: center;
  position: relative;
  transition: opacity 0.2s;
}

.action-btn:hover {
  opacity: 0.7;
}

.cart-btn .cart-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #000;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  justify-self: end;
}

.mobile-nav {
  display: none;
}

@media (max-width: 992px) {
  .header-container {
    grid-template-columns: 1fr auto;
  }

  .desktop-nav, .no-mobile {
    display: none;
  }

  .mobile-menu-btn {
    display: block;
  }

  .mobile-nav {
    display: block;
    position: fixed;
    top: 80px;
    left: 0;
    width: 100%;
    height: calc(100vh - 80px);
    background-color: #fff;
    padding: 30px 20px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    overflow-y: auto;
  }

  .mobile-nav.open {
    transform: translateX(0);
  }

  .mobile-nav-links {
    list-style: none;
    margin-bottom: 40px;
  }

  .mobile-nav-links li {
    margin-bottom: 20px;
  }

  .mobile-nav-links a {
    font-size: 1.5rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .mobile-actions {
    display: flex;
    flex-direction: column;
    gap: 20px;
    border-top: 1px solid #eee;
    padding-top: 30px;
  }

  .mobile-actions .action-btn {
    font-size: 1.2rem;
    gap: 15px;
  }
}
</style>
