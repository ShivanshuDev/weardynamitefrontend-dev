<template>
  <div class="product-card">
    <div class="product-image">
      <RouterLink :to="'/product/' + product.id" class="img-link">
        <img :src="product.images?.[0] || 'https://via.placeholder.com/300x400'" :alt="product.name">
      </RouterLink>
      <button class="favorite-btn" @click.prevent="productStore.toggleFavorite(product.id)" :title="productStore.isFavorite(product.id) ? 'Remove from Favorites' : 'Add to Favorites'">
        <Heart :class="{ 'filled': productStore.isFavorite(product.id) }" :size="18" />
      </button>
      <div class="product-overlay">
        <!-- Quick Add redirects to detail page to configure Him/Her/Child -->
        <RouterLink :to="'/product/' + product.id" class="add-to-cart">Quick Add</RouterLink>
      </div>

      <div v-if="isOutOfStock" class="out-of-stock-badge">
        Out of Stock
      </div>
    </div>
    <div class="product-info">
      <span class="category">{{ product.category }}</span>
      <RouterLink :to="'/product/' + product.id">
        <h3>{{ product.name }}</h3>
      </RouterLink>
      <div class="price">{{ productStore.formatPrice(product.price) }}</div>
      <div class="swatches" v-if="product.variants">
        <span 
          v-for="v in product.variants" 
          :key="v.color" 
          :style="{ backgroundColor: v.color }"
          class="swatch"
          :title="v.color"
        ></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Heart } from 'lucide-vue-next'
import { useProductStore } from '../stores/productStore'

const productStore = useProductStore()

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const isOutOfStock = computed(() => {
  if (!props.product.variants) return props.product.stock === 0
  const totalStock = props.product.variants.reduce((total, v) => {
    const variantStock = v.sizes?.reduce((sTotal, s) => sTotal + (s.stock || 0), 0) || 0
    return total + variantStock
  }, 0)
  return totalStock === 0
})
</script>

<style scoped>
.product-card {
  transition: transform 0.3s ease;
  position: relative;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  position: relative;
  background-color: #f5f5f5;
  aspect-ratio: 3/4;
  overflow: hidden;
  margin-bottom: 15px;
  border-radius: 4px;
}

.img-link {
  display: block;
  width: 100%;
  height: 100%;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: scale 0.5s ease;
}

.product-card:hover .product-image img {
  scale: 1.05;
}

.favorite-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transition: all 0.2s;
  z-index: 2;
}

.favorite-btn:hover {
  transform: scale(1.1);
}

.favorite-btn .filled {
  fill: #ff4757;
  color: #ff4757;
}

.out-of-stock-badge {
  position: absolute;
  top: 15px;
  left: 15px;
  background: #c53030;
  color: #fff;
  padding: 5px 10px;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 4px;
  z-index: 2;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.product-overlay {
  position: absolute;
  bottom: -50px;
  left: 0;
  width: 100%;
  padding: 15px;
  transition: bottom 0.3s ease;
  display: flex;
  justify-content: center;
}

.product-card:hover .product-overlay {
  bottom: 0;
}

.add-to-cart {
  background-color: #fff;
  color: #000;
  border: 1px solid #000;
  padding: 10px 20px;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  transition: all 0.3s;
  width: 100%;
  text-align: center;
}

.add-to-cart:hover {
  background-color: #000;
  color: #fff;
}

.category {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #888;
  letter-spacing: 1px;
  display: block;
  margin-bottom: 5px;
}

h3 {
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.price {
  font-weight: 700;
  color: #000;
}

.swatches {
  display: flex;
  gap: 5px;
  margin-top: 10px;
}

.swatch {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid #ddd;
}
</style>
