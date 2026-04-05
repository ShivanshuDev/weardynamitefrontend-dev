import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProcessView from '../views/ProcessView.vue'
import CustomizeView from '../views/CustomizeView.vue'
import ShopView from '../views/ShopView.vue'
import AboutView from '../views/AboutView.vue'
import ContactView from '../views/ContactView.vue'
import BlogView from '../views/BlogView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/shop',
    name: 'shop',
    component: ShopView
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView
  },
  {
    path: '/contact',
    name: 'contact',
    component: ContactView
  },
  {
    path: '/product/:id',
    name: 'product-detail',
    component: () => import('../views/ProductDetailView.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('../views/CartView.vue')
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: () => import('../views/FavoritesView.vue')
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/ProfileView.vue')
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: () => import('../views/CheckoutView.vue')
  },
  {
    path: '/order-success',
    name: 'order-success',
    component: () => import('../views/OrderSuccessView.vue')
  },
  {
    path: '/order-status',
    name: 'order-status',
    component: () => import('../views/OrderStatusView.vue')
  },
  {
    path: '/process',
    name: 'process',
    component: ProcessView
  },
  {
    path: '/customize',
    name: 'customize',
    component: CustomizeView
  },
  {
    path: '/customize/print',
    name: 'customize-print',
    component: () => import('../views/PrintCustomizationView.vue')
  },
  {
    path: '/customize/embroidery',
    name: 'customize-embroidery',
    component: () => import('../views/EmbroideryCustomizationView.vue')
  },
  {
    path: '/blog',
    name: 'blog',
    component: BlogView
  },
  {
    path: '/blog/:id',
    name: 'blog-detail',
    component: () => import('../views/BlogDetailView.vue')
  },
  {
    path: '/faq',
    name: 'faq',
    component: () => import('../views/FaqView.vue')
  },
  {
    path: '/shipping-returns',
    name: 'shipping-returns',
    component: () => import('../views/ShippingReturnsView.vue')
  },
  {
    path: '/privacy-policy',
    name: 'privacy-policy',
    component: () => import('../views/PrivacyPolicyView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
