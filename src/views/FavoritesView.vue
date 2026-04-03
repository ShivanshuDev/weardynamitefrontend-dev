<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useProductStore } from '../stores/productStore'
import ProductCard from '../components/ProductCard.vue'

const productStore = useProductStore()

const favoriteProducts = computed(() => {
  return productStore.products.filter(p => productStore.favorites.includes(p.id))
})
</script>

<template>
  <div class="favorites-view container">
    <div class="favorites-header">
      <h1 class="page-title">Your Favorites</h1>
      <p class="subtitle" v-if="favoriteProducts.length > 0">
        You have {{ favoriteProducts.length }} saved {{ favoriteProducts.length === 1 ? 'item' : 'items' }}.
      </p>
    </div>

    <div v-if="favoriteProducts.length > 0" class="products-grid">
      <ProductCard 
        v-for="product in favoriteProducts" 
        :key="product.id" 
        :product="product" 
      />
    </div>

    <div v-else class="empty-favorites">
      <div class="icon-placeholder">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ddd" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
      </div>
      <h2>No favorites yet</h2>
      <p>Tap the heart icon on any product to save it for later.</p>
      <RouterLink to="/shop" class="btn primary-btn shop-btn">Discover Products</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.favorites-view {
  padding: 60px 20px;
  min-height: 60vh;
}

.favorites-header {
  text-align: center;
  margin-bottom: 50px;
}

.page-title {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
}

.empty-favorites {
  text-align: center;
  padding: 80px 20px;
  max-width: 500px;
  margin: 0 auto;
}

.icon-placeholder {
  margin-bottom: 20px;
}

.empty-favorites h2 {
  font-size: 2rem;
  margin-bottom: 15px;
}

.empty-favorites p {
  color: #666;
  margin-bottom: 30px;
  line-height: 1.5;
}

.shop-btn {
  background: #000;
  color: #fff;
  padding: 12px 30px;
}

@media (max-width: 576px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
}
</style>
