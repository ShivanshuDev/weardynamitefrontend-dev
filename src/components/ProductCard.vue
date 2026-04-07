<template>
  <div class="product-card" :class="{ 'on-sale': hasDiscount }">
    <div class="product-image">
      <RouterLink :to="'/product/' + product.id" class="img-link">
        <img :src="product.images?.[0] || 'https://via.placeholder.com/300x400'" :alt="product.name" loading="lazy">
      </RouterLink>
      
      <!-- Premium Badges -->
      <div v-if="isOutOfStock" class="badge out-of-stock">Out of Stock</div>
      <div v-else-if="product.featured" class="badge featured">Best Seller</div>
      <div v-else-if="isNewArrival" class="badge new">New Arrival</div>
      <div v-if="hasDiscount && !isOutOfStock" class="badge discount">-{{ discountPercent }}%</div>

      <button class="favorite-btn" 
              @click.prevent="productStore.toggleFavorite(product.id)" 
              :class="{ 'is-active': productStore.isFavorite(product.id) }">
        <Heart :class="{ 'filled': productStore.isFavorite(product.id) }" :size="18" />
      </button>

      <div class="quick-view-overlay">
        <RouterLink :to="'/product/' + product.id" class="btn-quick-view">
          View Detail
        </RouterLink>
      </div>
    </div>

    <div class="product-content">
      <div class="product-meta">
        <span class="category">{{ product.category }}</span>
        <div class="swatches" v-if="product.variants?.length">
          <span 
            v-for="v in product.variants.slice(0, 4)" 
            :key="v.color" 
            :style="{ backgroundColor: v.color }"
            class="swatch"
            :title="v.color"
          ></span>
          <span v-if="product.variants.length > 4" class="more-colors">+{{ product.variants.length - 4 }}</span>
        </div>
      </div>

      <RouterLink :to="'/product/' + product.id" class="name-link">
        <h3 class="product-name">{{ product.name }}</h3>
      </RouterLink>

      <div class="price-container">
        <span class="current-price">{{ productStore.formatPrice(product.price) }}</span>
        <span v-if="hasDiscount" class="old-price">{{ productStore.formatPrice(product.mrp) }}</span>
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
  if (!props.product.variants || props.product.variants.length === 0) return props.product.stock === 0
  return !props.product.variants.some(v => v.sizes?.some(s => (s.stock || 0) > 0))
})

const isNewArrival = computed(() => {
  if (!props.product.dateAdded) return false
  const addedDate = new Date(props.product.dateAdded)
  const today = new Date()
  const diffTime = Math.abs(today - addedDate)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 14
})

const hasDiscount = computed(() => {
  return props.product.mrp > props.product.price
})

const discountPercent = computed(() => {
  if (!hasDiscount.value) return 0
  return Math.round(((props.product.mrp - props.product.price) / props.product.mrp) * 100)
})
</script>

<style scoped>
.product-card {
  position: relative;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  background: white;
  max-width: 250px;
}

.product-image {
  position: relative;
  aspect-ratio: 1/1; /* Modern Square Format */
  overflow: hidden;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 12px;
}

.img-link {
  display: block;
  height: 100%;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.product-card:hover .product-image img {
  transform: scale(1.08);
}

/* Badges */
.badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 8px;
  font-size: 9px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: 3px;
  z-index: 5;
}

.out-of-stock { background: #fee2e2; color: #991b1b; }
.featured { background: #dcfce7; color: #166534; }
.new { background: #fef9c3; color: #854d0e; }
.discount { 
  left: auto; 
  right: 8px; 
  background: #3b82f6; 
  color: #fff; 
}

/* Favorite Button */
.favorite-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s;
  box-shadow: 0 4px 10px rgba(0,0,0,0.06);
}

.favorite-btn:hover {
  transform: scale(1.1);
  background: #f8fafc;
}

.favorite-btn.is-active {
  color: #ef4444;
}

/* Hover Overlay */
.quick-view-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  backdrop-filter: blur(1px);
}

.product-card:hover .quick-view-overlay {
  opacity: 1;
}

.btn-quick-view {
  background: white;
  color: #000;
  padding: 10px 18px;
  border-radius: 20px;
  font-size: 9px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
  transform: translateY(8px);
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.product-card:hover .btn-quick-view {
  transform: translateY(0);
}

/* Content */
.product-content {
  padding: 0 2px;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.category {
  font-size: 9px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.swatches {
  display: flex;
  align-items: center;
  gap: 3px;
}

.swatch {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
}

.product-name {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 6px;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.price-container {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.current-price {
  font-size: 14px;
  font-weight: 800;
  color: #000;
}

.old-price {
  font-size: 11px;
  color: #94a3b8;
  text-decoration: line-through;
  font-weight: 500;
}
</style>
