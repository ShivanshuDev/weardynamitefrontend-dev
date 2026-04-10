<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useProductStore } from '../stores/productStore'
import { Star, Heart, X, MapPin, Truck, Award, RefreshCw, ShieldCheck, Lock, ChevronRight } from 'lucide-vue-next'
import api from '../utils/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const productStore = useProductStore()

const product = ref(null)
const loading = ref(true)

const selectedImage = ref('')
const selectedColor = ref('')
const selectedSize = ref('')
const quantity = ref(1)

const fetchProduct = async () => {
  loading.value = true
  try {
    product.value = await productStore.fetchProductById(route.params.id)
    if (product.value) {
      if (availableColors.value.length > 0) {
        selectedColor.value = availableColors.value[0]
      }
      if (selectedColor.value) {
        const sizes = getAvailableSizesForColor(selectedColor.value)
        if (sizes.length > 0) selectedSize.value = sizes[0]
      }
      selectedImage.value = product.value.images?.[0] || ''
    }
  } catch (err) {
    console.error('Error fetching product:', err)
  } finally {
    loading.value = false
  }
}

watch(selectedColor, (newColor) => {
  const sizes = getAvailableSizesForColor(newColor)
  if (!sizes.includes(selectedSize.value) && sizes.length > 0) {
    selectedSize.value = sizes[0]
  }
  if (product.value?.images?.length > 0) {
    selectedImage.value = product.value.images[0]
  }
})

const availableColors = computed(() => {
  if (!product.value?.variants) return []
  return [...new Set(product.value.variants.map(v => v.color))]
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

const currentStock = computed(() => getStock(selectedColor.value, selectedSize.value))
const isOutOfStock = computed(() => currentStock.value <= 0)

const finalPrice = computed(() => {
  if (!product.value) return 0
  return product.value.salePrice * (1 - (product.value.discountPercentage || 0) / 100)
})

const formatPriceOnly = (price) => {
  const numProps = typeof price === 'number' ? price : parseFloat(price);
  if (isNaN(numProps)) return '0';
  return numProps.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

// Notify Me State
const showNotifyModal = ref(false)
const notifyEmail = ref(authStore.user?.email || '')

watch(() => authStore.user, (newUser) => {
  if (newUser && !notifyEmail.value) {
    notifyEmail.value = newUser.email
  }
})

const reviews = ref([])
const fetchReviews = async () => {
  try {
    const res = await api.get(`/reviews/${route.params.id}`)
    reviews.value = res.data || []
  } catch (err) {
    console.error('Error fetching reviews:', err)
  }
}

const averageRating = computed(() => {
  if (reviews.value.length === 0) return 0
  const total = reviews.value.reduce((acc, r) => acc + r.rating, 0)
  return (total / reviews.value.length).toFixed(1)
})

const addToCart = () => {
  if (!selectedColor.value || !selectedSize.value) {
    alert("Please select a size and color.")
    return
  }
  
  if (isOutOfStock.value) {
    alert(`The selected option is out of stock.`)
    return
  }

  const config = [{
    id: Date.now(),
    forWhom: 'Regular',
    size: selectedSize.value,
    color: selectedColor.value,
    quantity: quantity.value
  }]

  productStore.addToCart(config, product.value)
  router.push('/cart')
}

const orderNow = () => {
  if (!selectedColor.value || !selectedSize.value) return alert("Please select a size and color.")
  if (isOutOfStock.value) return alert(`The selected option is out of stock.`)

  const config = [{
    id: Date.now(),
    forWhom: 'Regular',
    size: selectedSize.value,
    color: selectedColor.value,
    quantity: quantity.value
  }]

  productStore.initiateDirectCheckout(config, product.value)
  if (authStore.isLoggedIn) {
    router.push('/checkout')
  } else {
    router.push({ path: '/login', query: { redirect: '/checkout' } })
  }
}

const handleNotifyMe = async () => {
  if (!notifyEmail.value) {
    alert('Please enter your email address')
    return
  }
  try {
    await api.post(`/notifications`, {
      productId: product.value.id,
      productName: product.value.name,
      color: selectedColor.value,
      size: selectedSize.value,
      email: notifyEmail.value
    })
    alert(`Success! We'll notify ${notifyEmail.value} when available.`)
    showNotifyModal.value = false
  } catch (error) {
    console.error('Notification failed:', error)
    alert('Failed to save notification.')
  }
}

onMounted(() => {
  fetchProduct()
  fetchReviews()
})
</script>

<template>
  <div class="product-wrapper">
    
    <!-- Loader -->
    <div v-if="loading" class="loader-overlay">
      <div class="spinner"></div>
      <p class="loader-text">Loading Product</p>
    </div>
    
    <div v-else-if="product" class="container product-container">
      
      <!-- Breadcrumbs -->
      <nav class="breadcrumbs">
        <router-link to="/">Home</router-link>
        <ChevronRight :size="14" class="icon" />
        <router-link to="/shop">Shop</router-link>
        <ChevronRight :size="14" class="icon" />
        <span>{{ product.category || 'Product' }}</span>
      </nav>
      
      <div class="main-grid">
        
        <!-- Left: Gallery -->
        <div class="gallery-col">
          <div class="thumbnails-container">
            <button 
              v-for="(img, idx) in product.images" 
              :key="idx" 
              @click="selectedImage = img"
              class="thumb-btn"
              :class="{ 'active': selectedImage === img }"
            >
              <img :src="productStore.resolveImageUrl(img)" alt="Thumbnail">
            </button>
          </div>
          
          <div class="main-image-container">
            <button 
              @click.prevent="productStore.toggleFavorite(product.id)" 
              class="wishlist-btn"
              title="Add to Wishlist"
            >
              <Heart :class="{'filled': productStore.isFavorite(product.id)}" :size="20" stroke-width="2" />
            </button>
            <img 
              :src="productStore.resolveImageUrl(selectedImage)" 
              :alt="product.name"
              class="main-item-img"
            >
          </div>
        </div>

        <!-- Middle: Product Info -->
        <div class="info-col">
          
          <router-link to="/brand" class="brand-link">
            Visit The {{ product.brand || 'Wear Dynamite' }} Store
          </router-link>
          
          <h1 class="product-title">{{ product.name }}</h1>
          
          <div class="rating-row">
            <div class="stars">
               <Star v-for="n in 5" :key="n" :size="16" :class="{'active-star': n <= Math.floor(averageRating), 'inactive-star': n > Math.floor(averageRating)}" />
            </div>
            <a href="#reviews" class="review-link">{{ reviews.length }} Reviews</a>
          </div>

          <div class="divider"></div>

          <div class="price-section">
            <div v-if="product.discountPercentage > 0" class="deal-badge">Limited Time Deal</div>
            
            <div class="price-major">
              <span v-if="product.discountPercentage > 0" class="discount-rate">-{{ product.discountPercentage }}%</span>
              <div class="price-amount">
                <span class="currency">₹</span>{{ formatPriceOnly(finalPrice) }}
              </div>
            </div>
            
            <div class="mrp-row">
              <span class="mrp-label">M.R.P.:</span>
              <span class="mrp-value">₹{{ formatPriceOnly(product.mrp) }}</span>
            </div>
            <p class="tax-info">Inclusive of all taxes</p>
          </div>
          
          <!-- Offers Box Premium -->
          <div class="offers-box">
             <div class="offers-header">
                <span class="percent-icon">%</span>
                <h3>Active Offers</h3>
             </div>
             <div class="offers-scroll">
                <div class="offer-card">
                   <h4>Cashback</h4>
                   <p>Upto ₹34 cashback as Amazon Pay Balance.</p>
                   <a>3 offers &gt;</a>
                </div>
                <div class="offer-card">
                   <h4>Bank Offer</h4>
                   <p>Instant discount up to ₹2,500 on select cards.</p>
                   <a>15 offers &gt;</a>
                </div>
             </div>
          </div>

          <!-- Trust Icons -->
          <div class="trust-icons">
             <div class="trust-item">
                <div class="icon-circle">
                  <RefreshCw :size="20" stroke-width="2"/>
                </div>
                <span>{{ product.isReturnable ? product.returnDays + ' days Return' : 'Non-Returnable' }}</span>
             </div>
             <div class="trust-item">
                <div class="icon-circle">
                  <ShieldCheck :size="20" stroke-width="2"/>
                </div>
                <span>Secure Transaction</span>
             </div>
             <div class="trust-item" v-if="product.codAvailable">
                <div class="icon-circle">
                  <Truck :size="20" stroke-width="2"/>
                </div>
                <span>Pay on Delivery</span>
             </div>
             <div class="trust-item">
                <div class="icon-circle">
                  <Award :size="20" stroke-width="2"/>
                </div>
                <span>Top Brand</span>
             </div>
          </div>

          <!-- Selectors -->
          <div class="selectors-wrapper">
             
             <!-- Color -->
             <div class="selector-group">
                <p class="selector-title">Color: <strong>{{ selectedColor }}</strong></p>
                <div class="swatch-list">
                   <button 
                     v-for="color in availableColors" 
                     :key="color" 
                     @click="selectedColor = color"
                     class="color-btn"
                     :class="{'active': selectedColor === color}"
                   >
                      <span class="color-fill" :style="{ backgroundColor: color.toLowerCase() }"></span>
                   </button>
                </div>
             </div>

             <!-- Size -->
             <div class="selector-group">
                <div class="size-header">
                  <p class="selector-title">Size: <strong>{{ selectedSize }}</strong></p>
                  <a href="#" class="size-chart-link">Size Chart</a>
                </div>
                <div class="swatch-list">
                   <button 
                     v-for="size in getAvailableSizesForColor(selectedColor)" 
                     :key="size" 
                     @click="selectedSize = size"
                     class="size-btn"
                     :class="{'active': selectedSize === size}"
                   >
                      {{ size }}
                   </button>
                </div>
             </div>
          </div>

          <div class="product-data-sections">
            
            <!-- Highlights -->
            <div class="data-block" v-if="product.specs && product.specs.length > 0">
               <h3>Top Highlights</h3>
               <div class="specs-grid">
                  <div class="spec-row" v-for="spec in product.specs" :key="spec.key">
                     <span class="spec-key">{{ spec.key }}</span>
                     <span class="spec-val">{{ spec.value }}</span>
                  </div>
               </div>
            </div>

            <!-- About Item -->
            <div class="data-block" v-if="product.aboutThisItem && product.aboutThisItem.length > 0">
               <h3>About this item</h3>
               <ul class="about-list">
                  <li v-for="(item, idx) in product.aboutThisItem" :key="idx">
                     {{ item }}
                  </li>
               </ul>
            </div>
            
            <!-- Description -->
            <div class="data-block" v-if="product.description">
               <h3>Product Description</h3>
               <div class="html-desc" v-html="product.description"></div>
            </div>

          </div>

        </div>

        <!-- Right: Buy Box -->
        <div class="buy-col">
           <div class="buy-box">
              
              <div class="buy-price">
                 <span class="curr">₹</span>{{ formatPriceOnly(finalPrice) }}
              </div>
              
              <div class="prime-tag">
                 <span class="prime-logo">prime</span>
                 <span class="prime-speed">Overnight</span>
              </div>
              
              <p class="delivery-p">
                 <span class="free">FREE Delivery</span>
                 <span class="highlight">Tomorrow by 10 AM</span>
                 <span class="timer">Order within 4 hrs 30 mins.</span>
              </p>
              
              <div class="location-btn">
                 <MapPin :size="14" />
                 Deliver to your location
              </div>

              <div class="stock-txt" :class="isOutOfStock ? 'out-stock' : 'in-stock'">
                 {{ isOutOfStock ? 'Currently Unavailable' : 'In Stock' }}
              </div>

              <div class="qty-wrap" v-if="!isOutOfStock">
                 <span class="qty-lbl">Quantity</span>
                 <div class="qty-select-wrapper">
                    <select v-model="quantity" class="qty-select">
                       <option v-for="n in Math.min(10, currentStock)" :key="n" :value="n">{{ n }}</option>
                    </select>
                    <ChevronRight :size="14" class="arrow" />
                 </div>
              </div>

              <div class="actions">
                 <button v-if="!isOutOfStock" @click="addToCart" class="amz-btn btn-cart">Add to Cart</button>
                 <button v-if="!isOutOfStock" @click="orderNow" class="amz-btn btn-buy">Buy Now</button>
                 <button v-if="isOutOfStock" @click="showNotifyModal = true" class="amz-btn btn-notify">Notify Me When Available</button>
              </div>

              <div class="secure-txn">
                 <Lock :size="14" />
                 Secure transaction verified
              </div>

              <div class="merchant-info">
                 <div class="row">
                    <span>Ships from</span>
                    <strong>WearDynamite Retail</strong>
                 </div>
                 <div class="row">
                    <span>Sold by</span>
                    <a href="#">{{ product.brand || 'Dynamite Club' }}</a>
                 </div>
                 <div class="row return-row">
                    <span>Returns</span>
                    <strong v-if="product.isReturnable">Eligible within {{ product.returnDays }} days</strong>
                    <strong v-else>Non-returnable</strong>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="not-found">
       <h2>Product Not Found</h2>
       <p>The product you are looking for does not exist or has been removed.</p>
       <router-link to="/shop" class="btn-back">Back to Shop</router-link>
    </div>

    <!-- Notify Modal -->
    <div v-if="showNotifyModal" class="modal-overlay" @click="showNotifyModal = false">
      <div class="modal" @click.stop>
        <div class="modal-hdr">
          <h3>Stock Alert</h3>
          <button @click="showNotifyModal = false"><X :size="24" /></button>
        </div>
        <p class="modal-p">
          Don't miss out! Drop your email below and we'll send you an exclusive alert the moment this item drops back in stock.
        </p>
        <div class="modal-forms">
          <input type="email" v-model="notifyEmail" placeholder="Enter your email address" />
          <button class="btn-notify-submit" @click="handleNotifyMe">Notify Me</button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.product-wrapper {
  background-color: #f8fafc;
  min-height: 100vh;
  padding-bottom: 80px;
  color: #0f172a;
}
.loader-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(2px);
  z-index: 50;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top-color: #000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}
@keyframes spin { 100% { transform: rotate(360deg); } }
.loader-text { font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; }

.product-container { max-width: 1400px; margin: 0 auto; padding: 40px 20px; }

.breadcrumbs { display: flex; align-items: center; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; margin-bottom: 40px; }
.breadcrumbs a { color: #94a3b8; text-decoration: none; transition: color 0.2s; }
.breadcrumbs a:hover { color: #000; }
.breadcrumbs .icon { margin: 0 10px; }
.breadcrumbs span { color: #000; }

.main-grid { display: grid; gap: 40px; }
@media(min-width: 1024px) {
  .main-grid { grid-template-columns: 5fr 4fr 3fr; gap: 60px; }
}

/* Left: Gallery */
.gallery-col { display: flex; gap: 20px; flex-direction: column-reverse; align-items: flex-start; }
@media(min-width: 1024px) {
  .gallery-col { flex-direction: row; position: sticky; top: 40px; height: max-content; }
}

.thumbnails-container { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 10px; margin-top: 10px;}
@media(min-width: 1024px) {
  .thumbnails-container { flex-direction: column; overflow: visible; padding: 0; margin: 0;}
}

.thumb-btn { width: 64px; height: 80px; border-radius: 12px; overflow: hidden; border: 2px solid transparent; cursor: pointer; transition: all 0.2s; flex-shrink: 0; }
.thumb-btn img { width: 100%; height: 100%; object-fit: cover; background: #f1f5f9; }
.thumb-btn:hover { border-color: #cbd5e1; }
.thumb-btn.active { border-color: #000; box-shadow: 0 0 0 4px rgba(0,0,0,0.05); }

.main-image-container { flex: 1; border-radius: 24px; background: #fff; border: 1px solid #e2e8f0; overflow: hidden; position: relative; aspect-ratio: 4/5; width: 100%; }
.main-item-img { width: 100%; height: 100%; object-fit: contain; }
.wishlist-btn { position: absolute; top: 16px; right: 16px; width: 44px; height: 44px; background: rgba(255,255,255,0.9); backdrop-filter: blur(4px); border-radius: 50%; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.1); transition: transform 0.2s; }
.wishlist-btn:hover { transform: scale(1.1); }
.wishlist-btn .filled { fill: #ef4444; color: #ef4444; }

/* Middle: Info */
.info-col { display: flex; flex-direction: column; }
.brand-link { font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #2563eb; text-decoration: none; margin-bottom: 12px; }
.brand-link:hover { color: #1d4ed8; }
.product-title { font-size: 36px; font-weight: 900; line-height: 1.2; margin-bottom: 16px; letter-spacing: -0.5px; }

.rating-row { display: flex; align-items: center; gap: 12px; font-size: 14px; }
.stars { display: flex; }
.active-star { fill: #fbbf24; color: #fbbf24; }
.inactive-star { fill: #f1f5f9; color: #e2e8f0; }
.review-link { font-weight: 700; color: #2563eb; text-decoration: none; }
.review-link:hover { text-decoration: underline; }

.divider { height: 1px; background: #e2e8f0; margin: 30px 0; }

/* Price section */
.deal-badge { display: inline-block; padding: 6px 12px; background: #dc2626; color: #fff; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; border-radius: 8px; margin-bottom: 16px; }
.price-major { display: flex; align-items: baseline; gap: 16px; margin-bottom: 4px; }
.discount-rate { font-size: 32px; font-weight: 300; color: #dc2626; }
.price-amount { font-size: 42px; font-weight: 900; line-height: 1; }
.price-amount .currency { font-size: 24px; vertical-align: top; margin-top: 4px; display: inline-block; margin-right: 2px;}
.mrp-row { display: flex; align-items: center; gap: 8px; font-size: 14px; }
.mrp-label { color: #64748b; font-weight: 700; }
.mrp-value { color: #94a3b8; text-decoration: line-through; font-weight: 500; }
.tax-info { font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-top: 8px; }

/* Offers Box */
.offers-box { background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 24px; margin: 30px 0; box-shadow: 0 4px 10px rgba(0,0,0,0.02); }
.offers-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
.percent-icon { display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; background: #000; color: #fff; border-radius: 50%; font-size: 12px; font-weight: 900; }
.offers-header h3 { font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; }
.offers-scroll { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 10px; }
.offer-card { background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 20px; min-width: 200px; flex: 1; transition: border 0.2s; }
.offer-card:hover { border-color: #cbd5e1; }
.offer-card h4 { font-size: 14px; font-weight: 900; margin-bottom: 8px; }
.offer-card p { font-size: 12px; color: #475569; line-height: 1.6; margin-bottom: 12px; }
.offer-card a { font-size: 12px; font-weight: 700; color: #2563eb; cursor: pointer; text-decoration: none; }
.offer-card a:hover { color: #1d4ed8; }

/* Trust Icons */
.trust-icons { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 30px 0; margin-bottom: 30px; }
.trust-item { display: flex; flex-direction: column; items: center; text-align: center; cursor: pointer; align-items: center;}
.icon-circle { width: 52px; height: 52px; border-radius: 50%; background: #f1f5f9; display: flex; align-items: center; justify-content: center; color: #475569; margin-bottom: 12px; transition: all 0.2s; }
.trust-item:hover .icon-circle { background: #eff6ff; color: #2563eb; transform: translateY(-3px); }
.trust-item span { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; }

/* Selectors */
.selectors-wrapper { display: flex; flex-direction: column; gap: 24px; margin-bottom: 40px; }
.selector-title { font-size: 14px; color: #64748b; margin-bottom: 12px; }
.selector-title strong { color: #0f172a; font-weight: 900; margin-left: 4px; }
.size-header { display: flex; justify-content: space-between; align-items: center; }
.size-chart-link { font-size: 12px; font-weight: 700; color: #2563eb; text-decoration: underline; }

.swatch-list { display: flex; flex-wrap: wrap; gap: 12px; }
.color-btn { width: 48px; height: 48px; border-radius: 50%; border: 2px solid transparent; padding: 4px; cursor: pointer; transition: all 0.2s; outline: none; }
.color-btn.active { border-color: #000; transform: scale(1.1); box-shadow: 0 0 0 4px #f1f5f9; }
.color-btn:not(.active):hover { border-color: #cbd5e1; }
.color-fill { display: block; width: 100%; height: 100%; border-radius: 50%; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); border: 1px solid rgba(0,0,0,0.05); }

.size-btn { height: 48px; min-width: 52px; padding: 0 16px; border-radius: 12px; border: 2px solid #e2e8f0; background: #fff; color: #475569; font-size: 14px; font-weight: 900; text-transform: uppercase; cursor: pointer; transition: all 0.2s; }
.size-btn:hover { border-color: #94a3b8; }
.size-btn.active { border-color: #000; background: #000; color: #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }

/* Data sections */
.product-data-sections { display: flex; flex-direction: column; gap: 40px; }
.data-block h3 { font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #1e293b; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0; }
.specs-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
@media (min-width: 640px) { .specs-grid { grid-template-columns: 1fr 1fr; gap: 16px 32px; } }
.spec-row { display: flex; font-size: 14px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 8px; }
.spec-key { width: 50%; font-weight: 700; color: #1e293b; }
.spec-val { width: 50%; color: #475569; }

.about-list { list-style-type: none; padding: 0; }
.about-list li { display: flex; align-items: flex-start; font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 12px; font-weight: 500; }
.about-list li::before { content: ""; display: block; width: 6px; height: 6px; background: #94a3b8; border-radius: 50%; margin-top: 8px; margin-right: 14px; flex-shrink: 0; }

.html-desc { font-size: 14px; color: #475569; line-height: 1.8; }

/* Right: Buy Box */
.buy-col { position: relative; }
.buy-box { background: #fff; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 20px 40px rgba(0,0,0,0.05); padding: 32px; position: sticky; top: 40px; }
.buy-price { font-size: 32px; font-weight: 900; margin-bottom: 12px; }
.buy-price .curr { font-size: 20px; font-weight: 700; margin-right: 4px; }
.prime-tag { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
.prime-logo { font-size: 20px; font-weight: 900; font-style: italic; color: #3b82f6; letter-spacing: -1px; }
.prime-speed { background: #eff6ff; color: #3b82f6; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }

.delivery-p { font-size: 14px; font-weight: 500; color: #475569; line-height: 1.6; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 20px; }
.delivery-p .free { font-weight: 800; }
.delivery-p .highlight { display: block; font-weight: 900; font-size: 16px; color: #000; margin-top: 4px; }
.delivery-p .timer { display: block; font-size: 12px; color: #94a3b8; margin-top: 4px; }

.location-btn { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; color: #2563eb; cursor: pointer; margin-bottom: 24px; transition: color 0.2s; }
.location-btn:hover { color: #1d4ed8; }

.stock-txt { font-size: 20px; font-weight: 900; margin-bottom: 24px; }
.in-stock { color: #10b981; }
.out-stock { color: #ef4444; }

.qty-wrap { display: flex; items: center; justify-content: space-between; background: #f8fafc; padding: 12px 20px; border-radius: 12px; border: 1px solid #f1f5f9; margin-bottom: 24px; }
.qty-lbl { font-size: 14px; font-weight: 700; color: #475569; margin-top: 4px; }
.qty-select-wrapper { position: relative; }
.qty-select { appearance: none; background: transparent; border: none; font-size: 16px; font-weight: 900; outline: none; padding-right: 24px; cursor: pointer; }
.qty-select-wrapper .arrow { position: absolute; right: 0; top: 50%; transform: translateY(-50%) rotate(90deg); color: #94a3b8; pointer-events: none; }

.actions { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
.amz-btn { width: 100%; padding: 16px; font-size: 14px; font-weight: 900; border-radius: 100px; cursor: pointer; transition: all 0.2s; }
.amz-btn:active { transform: scale(0.98); }
.btn-cart { background: #FFD814; border: 1px solid #FCD200; box-shadow: 0 4px 10px rgba(255,216,20,0.2); }
.btn-cart:hover { background: #F7CA00; }
.btn-buy { background: #FFA41C; border: 1px solid #FF8F00; box-shadow: 0 4px 10px rgba(255,164,28,0.2); }
.btn-buy:hover { background: #FA8900; }
.btn-notify { background: #000; border: 2px solid #000; color: #fff; text-transform: uppercase; letter-spacing: 1px; }

.secure-txn { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 12px; font-weight: 700; color: #94a3b8; border-bottom: 1px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 24px; }
.merchant-info { display: flex; flex-direction: column; gap: 10px; font-size: 12px; font-weight: 500; color: #64748b; }
.merchant-info .row { display: flex; justify-content: space-between; }
.merchant-info strong { color: #0f172a; font-weight: 700; }
.merchant-info a { color: #2563eb; text-decoration: none; font-weight: 700; transition: text-decoration 0.2s; }
.merchant-info a:hover { text-decoration: underline; }
.return-row { margin-top: 10px; padding-top: 10px; border-top: 1px solid #f1f5f9; }

/* Not Found */
.not-found { padding: 120px 20px; text-align: center; }
.not-found h2 { font-size: 32px; font-weight: 900; margin-bottom: 16px; }
.not-found p { color: #64748b; margin-bottom: 32px; }
.btn-back { display: inline-block; padding: 14px 32px; background: #000; color: #fff; border-radius: 100px; font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; text-decoration: none; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.4); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 100; padding: 20px; }
.modal { background: #fff; width: 100%; max-width: 480px; border-radius: 24px; padding: 32px; box-shadow: 0 25px 50px rgba(0,0,0,0.1); }
.modal-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.modal-hdr h3 { font-size: 24px; font-weight: 900; margin: 0; }
.modal-hdr button { color: #94a3b8; }
.modal-hdr button:hover { color: #000; }
.modal-p { font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 24px; font-weight: 500; }
.modal-forms { display: flex; flex-direction: column; gap: 16px; }
.modal-forms input { padding: 16px 20px; border: 2px solid #e2e8f0; border-radius: 16px; background: #f8fafc; font-size: 14px; font-weight: 500; outline: none; transition: border 0.2s; }
.modal-forms input:focus { border-color: #000; }
.btn-notify-submit { background: #000; color: #fff; padding: 16px; border-radius: 16px; font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; }
</style>
