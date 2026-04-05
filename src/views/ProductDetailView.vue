<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useProductStore } from '../stores/productStore'
import { Star, Plus, Minus, Trash2, Heart, X } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const productStore = useProductStore()

const product = ref(null)
const loading = ref(true)

const fetchProduct = async () => {
  loading.value = true
  try {
    product.value = await productStore.fetchProductById(route.params.id)
    if (product.value) {
      if (configurations.value.length > 0) {
        configurations.value[0].size = product.value.variants?.[0]?.sizes?.[0]?.size || ''
        configurations.value[0].color = product.value.variants?.[0]?.color || ''
      }
      selectedImage.value = product.value.images?.[0] || ''
    }
  } catch (err) {
    console.error('Error fetching product:', err)
  } finally {
    loading.value = false
  }
}

const selectedImage = ref('')

// Computed properties for variants
const availableColors = computed(() => {
  if (!product.value?.variants) return []
  return product.value.variants.map(v => v.color)
})

const getAvailableSizesForColor = (color) => {
  if (!product.value?.variants) return []
  const variant = product.value.variants.find(v => v.color === color)
  return variant ? variant.sizes.map(s => s.size) : []
}

const getStock = (color, size) => {
  if (!product.value?.variants) return 0
  const variant = product.value.variants.find(v => v.color === color)
  if (!variant) return 0
  const sizeEntry = variant.sizes.find(s => s.size === size)
  return sizeEntry ? sizeEntry.stock : 0
}

const isLowStock = (color, size) => {
  const stock = getStock(color, size)
  return stock > 0 && stock <= 5
}

const isOutOfStock = (color, size) => {
  return getStock(color, size) === 0
}

// Notify Me State
const showNotifyModal = ref(false)
const notifyEmail = ref(authStore.user?.email || '')
const notifyConfig = ref(null)

watch(() => authStore.user, (newUser) => {
  if (newUser && !notifyEmail.value) {
    notifyEmail.value = newUser.email
  }
})

// ... existing review refs ...
const defaultRating = 4.5
const reviewCount = ref(12)
const reviews = ref([
  { id: 1, author: 'Alex M.', rating: 5, text: 'Amazing quality! The fabric feels premium.', date: '2026-02-15' },
  { id: 2, author: 'Sam K.', rating: 4, text: 'Great fit for the family, but shipping took a while.', date: '2026-03-01' }
])
const reviewForm = ref({ name: '', rating: 5, text: '' })

const submitReview = () => {
  if (reviewForm.value.name && reviewForm.value.text) {
    reviews.value.unshift({
      id: Date.now(),
      author: reviewForm.value.name,
      rating: reviewForm.value.rating,
      text: reviewForm.value.text,
      date: new Date().toISOString().split('T')[0]
    })
    reviewCount.value++
    reviewForm.value = { name: '', rating: 5, text: '' }
    alert('Review submitted successfully!')
  }
}

// Family Configuration System
const configurations = ref([
  { id: Date.now(), forWhom: 'Him', size: '', color: '', quantity: 1 }
])

const persons = ['Him', 'Her', 'Children']

const addConfiguration = () => {
  configurations.value.push({ 
    id: Date.now(), 
    forWhom: 'Him', 
    size: getAvailableSizesForColor(availableColors.value[0])?.[0] || '', 
    color: availableColors.value[0] || '', 
    quantity: 1 
  })
}

const removeConfiguration = (id) => {
  if (configurations.value.length > 1) {
    configurations.value = configurations.value.filter(c => c.id !== id)
  }
}

const updateQuantity = (config, delta) => {
  const stock = getStock(config.color, config.size)
  const newQuantity = config.quantity + delta
  
  if (newQuantity > stock) {
    alert(`Only ${stock} items left in stock for this variant.`)
    return
  }

  if (newQuantity >= 1 && newQuantity <= 3) {
    config.quantity = newQuantity
  } else if (newQuantity > 3) {
      alert("Maximum 3 items allowed per configuration.")
  }
}

const addToCart = () => {
  const isValid = configurations.value.every(c => c.size && c.color)
  if (!isValid) {
    alert("Please select a size and color for all configurations.")
    return
  }
  
  // Check stock for all
  for (const config of configurations.value) {
    if (isOutOfStock(config.color, config.size)) {
      alert(`The selection ${config.color} / ${config.size} is out of stock.`)
      return
    }
    if (config.quantity > getStock(config.color, config.size)) {
      alert(`Insufficient stock for ${config.color} / ${config.size}.`)
      return
    }
  }

  productStore.addToCart(configurations.value, product.value)
  const totalItems = configurations.value.reduce((acc, curr) => acc + curr.quantity, 0)
  alert(`Successfully added ${totalItems} items to your cart!`)
}

const orderNow = () => {
  const isValid = configurations.value.every(c => c.size && c.color)
  if (!isValid) return alert("Please select a size and color for all configurations.")

  // Check stock for all
  for (const config of configurations.value) {
    if (isOutOfStock(config.color, config.size)) {
      alert(`The selection ${config.color} / ${config.size} is out of stock.`)
      return
    }
  }

  if (authStore.isLoggedIn) {
    productStore.initiateDirectCheckout(configurations.value, product.value)
    router.push('/checkout')
  } else {
    alert("Please log in to proceed with direct checkout.")
    router.push('/login')
  }
}

const notifyMe = (config) => {
  notifyConfig.value = config
  showNotifyModal.value = true
}

const handleNotifyMe = async () => {
  if (!notifyEmail.value) {
    alert('Please enter your email address')
    return
  }
  
  try {
    const apiBase = 'http://localhost:3001/api'
    await axios.post(`${apiBase}/notifications`, {
      productId: product.value.id,
      productName: product.value.name,
      color: notifyConfig.value.color,
      size: notifyConfig.value.size,
      email: notifyEmail.value
    })
    
    alert(`Success! We'll notify ${notifyEmail.value} when ${notifyConfig.value.size} in ${notifyConfig.value.color} is back in stock.`)
    showNotifyModal.value = false
  } catch (error) {
    console.error('Notification request failed:', error)
    alert('Failed to save notification request. Please try again.')
  }
}

import axios from 'axios'

onMounted(() => {
  fetchProduct()
})
</script>

<template>
  <div class="product-detail-view container" v-if="product">
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Loading product details...</p>
    </div>
    <div v-else class="product-main">
      <!-- Image Gallery -->
      <div class="gallery-container">
        <div class="thumbnails">
            <div 
            v-for="(img, idx) in product.images" 
            :key="idx" 
            class="thumbnail"
            :class="{ active: selectedImage === img }"
            @click="selectedImage = img"
          >
            <img :src="productStore.resolveImageUrl(img)" :alt="product.name + ' thumbnail ' + idx">
          </div>
        </div>
        <div class="main-image">
          <img :src="productStore.resolveImageUrl(selectedImage)" :alt="product.name">
        </div>
      </div>

      <!-- Product Info & Config -->
      <div class="product-info">
        <div class="product-header">
          <span class="category">{{ product.category }} > {{ product.subCategory }}</span>
          <button class="favorite-btn" @click.prevent="productStore.toggleFavorite(product.id)" :title="productStore.isFavorite(product.id) ? 'Remove from Favorites' : 'Add to Favorites'">
            <Heart :class="{ 'filled': productStore.isFavorite(product.id) }" :size="24" />
          </button>
        </div>
        
        <h1 class="product-title">{{ product.name }}</h1>
        <div class="price-row">
          <div class="price-group">
            <div class="price">{{ productStore.formatPrice(product.price * (1 - (product.discountPercentage || 0) / 100)) }}</div>
            <div class="original-price" v-if="product.discountPercentage > 0">
              {{ productStore.formatPrice(product.price) }}
            </div>
          </div>
          <div class="promo-badges">
            <span v-if="product.promotionType === 'B1G1'" class="promo-badge b1g1">BUY 1 GET 1 FREE</span>
            <span v-if="product.promotionType === 'B2G1'" class="promo-badge b2g1">BUY 2 GET 1 FREE</span>
            <span v-if="product.discountPercentage > 0" class="promo-badge discount">{{ product.discountPercentage }}% OFF</span>
          </div>
        </div>
        
        <div class="tax-info">
          <p class="tax-label">Inclusive of all taxes</p>
          <div class="tax-details" v-if="product.isTaxable">
            <span>GST: {{ product.taxPercent || 12 }}%</span>
            <span v-if="product.discountCoupon" class="coupon-hint">Use code: <strong>{{ product.discountCoupon }}</strong></span>
          </div>
        </div>
        
        <div class="rating-summary">
          <div class="stars">
            <Star v-for="n in 5" :key="n" :size="16" :class="{ 'filled': n <= Math.floor(defaultRating) }" />
          </div>
          <span class="review-count">{{ defaultRating }} ({{ reviewCount }} customer reviews)</span>
        </div>

        <div class="description" v-html="product.description || `Premium ${product.fabric || 'Cotton'} material tailored for a ${product.fit?.toLowerCase() || 'perfect'} fit.`"></div>
        
        <div class="details-table">
          <div class="detail-row" v-if="product.fabric"><span class="label">Fabric:</span> <span class="value">{{ product.fabric }}</span></div>
          <div class="detail-row" v-if="product.fit"><span class="label">Fit:</span> <span class="value">{{ product.fit }}</span></div>
          <div class="detail-row" v-if="product.neckType"><span class="label">Neck Type:</span> <span class="value">{{ product.neckType }}</span></div>
          <div class="detail-row" v-if="product.occasion"><span class="label">Occasion:</span> <span class="value">{{ product.occasion }}</span></div>
        </div>

        <hr class="divider" />

        <!-- Family Configuration Section -->
        <div class="configurations-section">
          <h3>Family Order Configurations</h3>
          <p class="hint">Customize sizes and colors for him, her, or children. Max 3 items per person.</p>
          
          <div class="config-list">
            <div v-for="(config, index) in configurations" :key="config.id" class="config-card">
              <div class="config-header">
                <strong>Person #{{ index + 1 }}</strong>
                <button v-if="configurations.length > 1" @click="removeConfiguration(config.id)" class="remove-btn" title="Remove Configuration">
                  <Trash2 :size="16" />
                </button>
              </div>

              <div class="config-body">
                <div class="form-group-inline">
                  <label>For:</label>
                  <select v-model="config.forWhom">
                    <option v-for="person in persons" :key="person" :value="person">{{ person }}</option>
                  </select>
                </div>

                <div class="options-group">
                  <div class="option-type">
                    <label>Color:</label>
                    <div class="btn-group color-group">
                      <button 
                        v-for="color in availableColors" 
                        :key="color" 
                        class="color-btn" 
                        :class="{ 'active': config.color === color }"
                        :style="{ backgroundColor: color }"
                        @click="config.color = color; config.size = getAvailableSizesForColor(color)[0]"
                        :title="color"
                      ></button>
                    </div>
                  </div>

                  <div class="option-type">
                    <label>Size:</label>
                    <div class="btn-group">
                      <button 
                        v-for="s in getAvailableSizesForColor(config.color)" 
                        :key="s" 
                        class="size-btn" 
                        :class="{ 
                          'active': config.size === s,
                          'out-of-stock': isOutOfStock(config.color, s)
                        }"
                        @click="config.size = s"
                      >{{ s }}</button>
                    </div>
                  </div>
                </div>

                <div class="stock-status-row">
                  <div v-if="isOutOfStock(config.color, config.size)" class="stock-status out-of-stock">
                    ❌ Out of Stock
                  </div>
                  <div v-else-if="isLowStock(config.color, config.size)" class="stock-status low-stock">
                    ⚠️ Only {{ getStock(config.color, config.size) }} left in stock!
                  </div>
                  <div v-else class="stock-status in-stock">
                    ✅ {{ getStock(config.color, config.size) }} in stock
                  </div>
                </div>

                <div class="form-group-inline quantity-control" v-if="!isOutOfStock(config.color, config.size)">
                  <label>Quantity:</label>
                  <div class="stepper">
                    <button @click="updateQuantity(config, -1)" :disabled="config.quantity <= 1"><Minus :size="14" /></button>
                    <span>{{ config.quantity }}</span>
                    <button @click="updateQuantity(config, 1)" :disabled="config.quantity >= 3 || config.quantity >= getStock(config.color, config.size)"><Plus :size="14" /></button>
                  </div>
                </div>

                <div v-if="isOutOfStock(config.color, config.size)" class="notify-me-container">
                  <button class="btn secondary notify-me-btn" @click="notifyMe(config)">
                    🔔 Notify Me when available
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button class="btn secondary add-config-btn" @click="addConfiguration">
            <Plus :size="16" style="margin-right:8px;" /> Add Another Person
          </button>
        </div>

        <div class="action-buttons">
          <button 
            class="btn primary-btn add-to-cart-btn" 
            @click="addToCart"
            :disabled="configurations.some(c => isOutOfStock(c.color, c.size))"
          >
            Add to Cart
          </button>
          <button 
            class="btn checkout-btn" 
            @click="orderNow"
            :disabled="configurations.some(c => isOutOfStock(c.color, c.size))"
          >
            Order Now
          </button>
        </div>
      </div>
    </div>

    <!-- Reviews Section -->
    <div class="reviews-section">
      <div class="grid grid-2">
        <div class="reviews-list">
          <h2>Customer Reviews</h2>
          <div v-if="reviews.length === 0" class="no-reviews">No reviews yet. Be the first to review this product!</div>
          <div v-for="review in reviews" :key="review.id" class="review-card">
            <div class="review-header">
              <span class="author">{{ review.author }}</span>
              <span class="date">{{ review.date }}</span>
            </div>
            <div class="stars">
              <Star v-for="n in 5" :key="n" :size="14" :class="{ 'filled': n <= review.rating }" />
            </div>
            <p>{{ review.text }}</p>
          </div>
        </div>

        <div class="add-review">
          <h2>Write a Review</h2>
          <form class="review-form" @submit.prevent="submitReview">
            <div class="form-group">
              <label>Your Name</label>
              <input type="text" v-model="reviewForm.name" required />
            </div>
            <div class="form-group">
              <label>Rating (1-5)</label>
              <select v-model.number="reviewForm.rating">
                <option v-for="n in 5" :key="n" :value="n">{{ n }} Stars</option>
              </select>
            </div>
            <div class="form-group">
              <label>Your Review</label>
              <textarea v-model="reviewForm.text" rows="4" required></textarea>
            </div>
            <button type="submit" class="btn">Submit Review</button>
          </form>
        </div>
      </div>
    </div>
  </div>
  
  <div v-else class="container not-found">
    <RouterLink to="/shop" class="btn">Back to Shop</RouterLink>
  </div>

  <!-- Notify Me Modal -->
  <div v-if="showNotifyModal" class="modal-overlay" @click="showNotifyModal = false">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Notify Me</h3>
        <button class="close-btn" @click="showNotifyModal = false"><X :size="20" /></button>
      </div>
      <div class="modal-body">
        <p>We'll email you as soon as <strong>{{ product.name }}</strong> ({{ notifyConfig?.color }} / {{ notifyConfig?.size }}) is back in stock.</p>
        <div class="form-group">
          <label>Email Address</label>
          <input type="email" v-model="notifyEmail" placeholder="your@email.com" />
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn secondary" @click="showNotifyModal = false">Cancel</button>
        <button class="btn primary-btn" @click="handleNotifyMe">Notify Me</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-detail-view {
  padding: 60px 20px;
}

.product-main {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 60px;
  margin-bottom: 80px;
}

/* Gallery Styles */
.gallery-container {
  display: flex;
  gap: 20px;
  height: 600px;
  position: sticky;
  top: 100px;
}

.thumbnails {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 90px;
  overflow-y: auto;
  /* hide scrollbar */
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
.thumbnails::-webkit-scrollbar {
  display: none;
}

.thumbnail {
  width: 90px;
  height: 120px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
  background: #f5f5f5;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.6;
}

.thumbnail:hover img {
  opacity: 1;
}

.thumbnail.active {
  border-color: #000;
}

.thumbnail.active img {
  opacity: 1;
}

.main-image {
  flex: 1;
  background-color: #f5f5f5;
  height: 100%;
  overflow: hidden;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
}

/* Info Styles */
.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.favorite-btn {
  background: transparent;
  color: #ccc;
  transition: all 0.2s;
}

.favorite-btn:hover {
  transform: scale(1.1);
}

.favorite-btn .filled {
  fill: #ff4757;
  color: #ff4757;
}

.category {
  font-size: 0.85rem;
  text-transform: uppercase;
  color: #888;
  letter-spacing: 1px;
}

.product-title {
  font-family: var(--font-heading);
  font-size: 2.5rem;
  margin: 10px 0 15px;
  line-height: 1.2;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 20px;
  margin-bottom: 5px;
}

.price-group {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.price {
  font-size: 2rem;
  font-weight: 700;
  color: #000;
}

.original-price {
  font-size: 1.2rem;
  color: #999;
  text-decoration: line-through;
}

.promo-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.promo-badge {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.promo-badge.b1g1 { background: #fee2e2; color: #b91c1c; }
.promo-badge.b2g1 { background: #fef3c7; color: #92400e; }
.promo-badge.discount { background: #000; color: #fff; }

.tax-info {
  margin-bottom: 25px;
}

.tax-label {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 4px;
}

.tax-details {
  display: flex;
  gap: 15px;
  font-size: 0.85rem;
  color: #444;
}

.coupon-hint {
  color: #059669;
}

.coupon-hint strong {
  background: #ecfdf5;
  padding: 2px 6px;
  border-radius: 2px;
}

.status-badge {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.active { background: #e6fffa; color: #2c7a7b; }
.status-badge.out-of-stock { background: #fff5f5; color: #c53030; }
.status-badge.in-stock { background: #f0fff4; color: #2f855a; }

/* Stock Status UI */
.stock-status-row {
  margin-top: 5px;
}

.stock-status {
  font-size: 0.9rem;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 4px;
  display: inline-block;
}

.stock-status.in-stock {
  color: #2f855a;
  background: #f0fff4;
}

.stock-status.low-stock {
  color: #c05621;
  background: #fffaf0;
  border: 1px solid #feebc8;
}

.stock-status.out-of-stock {
  color: #c53030;
  background: #fff5f5;
  border: 1px solid #feb2b2;
}

.size-btn.out-of-stock {
  opacity: 0.5;
  text-decoration: line-through;
  background: #f5f5f5;
  border-color: #ddd;
}

.notify-me-container {
  margin-top: 10px;
}

.notify-me-btn {
  width: 100%;
  padding: 12px;
  background: #fdf2f2 !important;
  color: #c53030 !important;
  border: 1px dashed #feb2b2 !important;
  font-weight: 600;
}

.notify-me-btn:hover {
  background: #fff5f5 !important;
}

/* Loading State */
.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.divider {
  border: none;
  height: 1px;
  background: #eee;
  margin: 30px 0;
}

/* Configurations */
.configurations-section {
  background: #fff;
  padding: 25px;
  border-radius: 8px;
  border: 1px solid #ddd;
  margin-bottom: 30px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
}

.configurations-section h3 {
  margin-bottom: 5px;
  font-size: 1.3rem;
}

.hint {
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 25px;
}

.config-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 25px;
}

.config-card {
  background: #fdfdfd;
  border: 1px solid #e5e5e5;
  padding: 20px;
  border-radius: 6px;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px dashed #ddd;
}

.remove-btn {
  color: #d9534f;
  background: transparent;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: #ffeeee;
}

.config-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group-inline {
  display: flex;
  align-items: center;
  gap: 15px;
}

.form-group-inline label {
  font-weight: 600;
  font-size: 0.95rem;
  width: 80px;
}

.form-group-inline select {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: inherit;
  flex: 1;
  font-size: 0.95rem;
}

.options-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.option-type label {
  display: block;
  font-size: 0.85rem;
  color: #555;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.size-btn {
  padding: 10px 15px;
  border: 1px solid #bbb;
  background: #fff;
  font-size: 0.95rem;
  transition: all 0.2s;
  min-width: 48px;
  border-radius: 2px;
}

.size-btn.active, .size-btn:hover {
  border-color: #000;
  background: #000;
  color: #fff;
}

.color-group {
  align-items: center;
}

.color-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid transparent;
  box-shadow: 0 0 0 1px #ccc;
  transition: all 0.2s;
}

.color-btn.active {
  box-shadow: 0 0 0 2px #000;
  transform: scale(1.1);
}

.quantity-control {
  margin-top: 5px;
}

.stepper {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
  height: 40px;
}

.stepper button {
  padding: 0 15px;
  height: 100%;
  background: #f5f5f5;
  transition: background 0.2s;
}

.stepper button:hover:not(:disabled) {
  background: #e0e0e0;
}

.stepper button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.stepper span {
  padding: 0 20px;
  font-weight: 600;
  font-size: 1.05rem;
  border-left: 1px solid #eee;
  border-right: 1px solid #eee;
  flex: 1;
  text-align: center;
}

.add-config-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9f9f9;
  color: #333;
  border: 2px dashed #ccc;
  padding: 15px;
  font-weight: 600;
}

.add-config-btn:hover {
  border-color: #999;
  background: #f0f0f0;
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.primary-btn {
  background: transparent;
  color: #000;
  border: 2px solid #000;
  font-size: 1.05rem;
  padding: 15px;
}

.primary-btn:hover {
  background: #f5f5f5;
}

.checkout-btn {
  background: #000;
  color: #fff;
  font-size: 1.05rem;
  padding: 15px;
  transition: opacity 0.3s;
}

.checkout-btn:hover {
  opacity: 0.85;
}

/* Reviews Section */
.reviews-section {
  border-top: 1px solid #eaeaea;
  padding-top: 80px;
}

.reviews-list h2, .add-review h2 {
  margin-bottom: 30px;
  font-size: 1.8rem;
  font-family: var(--font-heading);
}

.review-card {
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid #eaeaea;
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  align-items: center;
}

.review-header .author {
  font-weight: 600;
  font-size: 1.1rem;
}

.review-header .date {
  color: #888;
  font-size: 0.9rem;
}

.review-card p {
  margin-top: 15px;
  color: #444;
  line-height: 1.6;
}

.review-form {
  background: #fafafa;
  padding: 40px;
  border-radius: 8px;
  border: 1px solid #eee;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 0.95rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #999;
}
.not-found {
  text-align: center;
  padding: 150px 20px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: #fff;
  width: 100%;
  max-width: 450px;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  overflow: hidden;
  animation: modalIn 0.3s ease-out;
}

@keyframes modalIn {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #000;
}

.modal-body {
  padding: 25px;
}

.modal-body p {
  margin-bottom: 20px;
  color: #666;
  line-height: 1.5;
}

.modal-footer {
  padding: 15px 25px;
  background: #f9f9f9;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.modal-footer .btn {
  padding: 10px 20px;
  font-size: 0.9rem;
}

@media (max-width: 992px) {
  .product-main { 
    grid-template-columns: 1fr; 
    gap: 40px;
  }
  .gallery-container {
    position: static;
    height: 500px;
  }
  .action-buttons { grid-template-columns: 1fr; }
  .reviews-section .grid-2 { grid-template-columns: 1fr; gap: 60px; }
}

@media (max-width: 576px) {
  .gallery-container {
    flex-direction: column-reverse;
    height: auto;
  }
  .thumbnails {
    flex-direction: row;
    width: 100%;
    overflow-x: auto;
  }
  .thumbnail {
    width: 80px;
    height: 80px;
    flex-shrink: 0;
  }
  .main-image {
    height: 400px;
  }
  .options-group { grid-template-columns: 1fr; }
  .product-title { font-size: 2rem; }
}
</style>
