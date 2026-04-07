<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Search, ShoppingCart, User, Menu, X, Heart } from 'lucide-vue-next'
import { useProductStore } from '../stores/productStore'
import { useAuthStore } from '../stores/authStore'

import { PRODUCT_TAXONOMY, GENDERS } from '../data/categories'

const productStore = useProductStore()
const authStore = useAuthStore()
const isMenuOpen = ref(false)
const isMegaMenuOpen = ref(false)

const toggleMenu = () => isMenuOpen.value = !isMenuOpen.value

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Shop', path: '/shop', hasMega: true },
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
          <li v-for="link in navLinks" :key="link.name" 
              class="nav-item-wrapper"
              @mouseenter="link.hasMega ? isMegaMenuOpen = true : null"
              @mouseleave="link.hasMega ? isMegaMenuOpen = false : null">
            <RouterLink :to="link.path" active-class="active">{{ link.name }}</RouterLink>
            
            <!-- Institutional Mega Menu -->
            <div v-if="link.hasMega" class="mega-menu" :class="{ 'show': isMegaMenuOpen }">
              <div class="mega-menu-container container">
                <div v-for="gender in GENDERS" :key="gender" class="mega-column">
                  <RouterLink :to="`/shop?gender=${gender}`" class="column-title" @click="isMegaMenuOpen = false">{{ gender }}</RouterLink>
                  <ul class="mega-sub-links">
                    <li v-for="cat in Object.keys(PRODUCT_TAXONOMY[gender])" :key="cat">
                      <RouterLink :to="`/shop?gender=${gender}&category=${cat}`" @click="isMegaMenuOpen = false">{{ cat }}</RouterLink>
                    </li>
                  </ul>
                </div>
                <!-- Featured Side Column -->
                <div class="mega-column featured-col">
                  <div class="featured-card">
                    <img src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800" alt="Featured" />
                    <div class="featured-content">
                      <span class="tag">New Arrival</span>
                      <h4>The Edit 2026</h4>
                      <RouterLink to="/shop?latest=true" class="link-btn" @click="isMegaMenuOpen = false">Discover</RouterLink>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </nav>

      <div class="header-actions no-mobile">
        <button class="action-btn"><Search :size="20" /></button>
        <RouterLink :to="authStore.isLoggedIn ? '/profile' : '/login'" class="action-btn">
          <div v-if="authStore.isLoggedIn && authStore.user?.photoURL" class="header-avatar-container">
            <img :src="authStore.user.photoURL" class="header-avatar" />
          </div>
          <User v-else :size="20" />
        </RouterLink>
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
          <!-- Simplified mobile accordion can be added here if needed, keeping it flat for now for speed -->
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
  font-weight: 900;
  letter-spacing: -0.5px;
  color: #000;
}

.desktop-nav {
  justify-self: center;
}

.nav-links {
  display: flex;
  gap: 30px;
  list-style: none;
}

.nav-item-wrapper {
  position: static; /* Required for mega menu width */
}

.nav-links a {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  padding: 30px 0;
  display: block;
  transition: color 0.3s;
}

.nav-links a:hover,
.nav-links a.active {
  color: #3b82f6;
}

/* Institutional Mega Menu Styles */
.mega-menu {
  position: fixed;
  top: 80px;
  left: 0;
  width: 100%;
  background: #fff;
  border-bottom: 1px solid #f1f5f9;
  box-shadow: 0 20px 40px -20px rgba(0,0,0,0.1);
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 90;
  padding: 40px 0;
}

.mega-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.mega-menu-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr) 300px;
  gap: 40px;
}

.mega-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.column-title {
  font-size: 0.75rem !important;
  font-weight: 900 !important;
  color: #000 !important;
  padding: 0 !important;
  letter-spacing: 2px !important;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px !important;
  margin-bottom: 5px;
}

.mega-sub-links {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mega-sub-links a {
  font-size: 0.85rem !important;
  font-weight: 500 !important;
  color: #64748b !important;
  text-transform: capitalize !important;
  letter-spacing: 0 !important;
  padding: 0 !important;
  transition: transform 0.2s, color 0.2s !important;
}

.mega-sub-links a:hover {
  color: #000 !important;
  transform: translateX(5px);
}

.featured-col {
  grid-column: 5;
}

.featured-card {
  width: 100%;
  height: 250px;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
}

.featured-card img {
  width: 100%;
  height: 100%;
  object-cover: cover;
  transition: transform 1s;
}

.featured-card:hover img {
  transform: scale(1.05);
}

.featured-content {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 20px;
}

.featured-content .tag {
  font-size: 10px;
  font-weight: 900;
  color: #3b82f6;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.featured-content h4 {
  color: #fff;
  font-size: 1.25rem;
  font-weight: 800;
  margin: 5px 0 15px;
}

.featured-content .link-btn {
  color: #fff !important;
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  text-decoration: underline !important;
  padding: 0 !important;
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
  background-color: #3b82f6;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 900;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-avatar-container {
  width: 28px;
  height: 28px;
  border-radius: 5px;
  overflow: hidden;
  border: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
    z-index: 1000;
  }

  .mobile-nav.open {
    transform: translateX(0);
  }

  .mobile-nav-links {
    list-style: none;
    margin-bottom: 40px;
  }

  .mobile-nav-links li {
    margin-bottom: 25px;
  }

  .mobile-nav-links a {
    font-size: 1.75rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: -1px;
    color: #000;
  }

  .mobile-actions {
    display: flex;
    flex-direction: column;
    gap: 20px;
    border-top: 1px solid #f1f5f9;
    padding-top: 30px;
  }

  .mobile-actions .action-btn {
    font-size: 1rem;
    font-weight: 700;
    gap: 15px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
}
</style>
