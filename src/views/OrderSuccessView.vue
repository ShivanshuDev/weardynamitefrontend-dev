<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useProductStore } from '../stores/productStore'
import { useUiStore } from '../stores/uiStore'
import { 
  CheckCircle2, 
  Package, 
  Truck, 
  Home, 
  CreditCard, 
  MapPin, 
  ChevronRight,
  ExternalLink,
  ShoppingBag
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const productStore = useProductStore()
const uiStore = useUiStore()

const orderId = route.query.id
const order = ref(null)
const loading = ref(true)

onMounted(async () => {
  if (orderId) {
    try {
      order.value = await authStore.fetchOrderById(orderId)
      // On successful order landing, ensure cart and checkout are cleared
      if (order.value && !productStore.isDirectCheckout) {
        productStore.clearCart()
      }
      productStore.clearCheckout()
    } catch (err) {
      console.error('Error fetching order:', err)
    } finally {
      loading.value = false
    }
  } else {
    loading.value = false
  }
})

const statusSteps = [
  { id: 'Pending', label: 'Ordered', icon: ShoppingBag },
  { id: 'Processing', label: 'Processing', icon: Package },
  { id: 'Shipped', label: 'Shipped', icon: Truck },
  { id: 'Delivered', label: 'Delivered', icon: Home }
]

const currentStatusIndex = computed(() => {
  if (!order.value) return 0
  const status = order.value.status || 'Pending'
  const idx = statusSteps.findIndex(s => s.id === status)
  return idx === -1 ? 0 : idx
})

const goToShop = () => router.push('/shop')
const viewInvoice = () => router.push(`/order-status?id=${orderId}`)

// Helper for image URLs
const getImageUrl = (path) => {
  if (!path) return 'https://via.placeholder.com/300'
  if (path.startsWith('http')) return path
  const bucketUrl = 'https://weardynamite-dev-assets.s3.ap-southeast-2.amazonaws.com/'
  return `${bucketUrl}${path}`
}

const formatPriceOnly = (price) => {
  const numProps = typeof price === 'number' ? price : parseFloat(price);
  if (isNaN(numProps)) return '0';
  return numProps.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

const handleReturn = (item) => {
  uiStore.showNotification('Request Received', `Return request initiated for ${item.product_name || item.name}. Our team will contact you shortly.`, 'success')
}

const handleCancel = (item) => {
  uiStore.showNotification('Cancellation Received', `Cancellation request received for ${item.product_name || item.name}.`, 'info')
}
</script>

<template>
  <div class="success-page-wrapper">
    <div v-if="loading" class="loader-overlay">
      <div class="spinner"></div>
      <p class="loader-text">Securing your order details...</p>
    </div>

    <div v-else-if="order" class="container">
      
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="icon-circle">
          <CheckCircle2 :size="48" stroke-width="2.5" />
        </div>
        <h1 class="hero-title">Order Confirmed!</h1>
        <p class="hero-subtitle">
          Thank you for choosing WearDynamite. Your order <span class="highlight">#{{ order.order_number || order.id.slice(0,8) }}</span> is confirmed.
        </p>
      </div>

      <!-- Tracking Progress -->
      <div class="card tracking-card">
        <div class="card-header">
          <h3>Order Journey</h3>
          <span class="status-badge">Current Status: {{ order.status }}</span>
        </div>

        <div class="timeline">
          <div 
            v-for="(step, index) in statusSteps" 
            :key="step.id" 
            class="timeline-step" 
            :class="{ 'completed': index <= currentStatusIndex, 'active': index === currentStatusIndex }"
          >
            <div class="step-icon">
              <component :is="step.icon" :size="20" />
            </div>
            <div class="step-label">{{ step.label }}</div>
            <div v-if="index < statusSteps.length - 1" class="step-connector" :class="{ 'completed': index < currentStatusIndex }"></div>
          </div>
        </div>
      </div>

      <!-- Split Layout -->
      <div class="layout-grid">
        
        <!-- Main: Items List -->
        <div class="items-section">
          <div class="card">
            <div class="card-header border-bottom">
              <h3>Items Ordered ({{ order.items?.length }})</h3>
              <button @click="viewInvoice" class="link-btn">
                Track / View Invoice <ExternalLink :size="12" class="lucide" />
              </button>
            </div>

            <div class="item-list">
              <div v-for="item in order.items" :key="item.SK" class="item-row">
                <div class="item-img-container">
                  <img :src="getImageUrl(item.image)" :alt="item.product_name" />
                </div>
                <div class="item-details">
                  <div class="item-header">
                    <h4>{{ item.product_name || item.name }}</h4>
                    <span class="item-price">₹{{ formatPriceOnly(item.price) }}</span>
                  </div>
                  <div class="item-meta">
                    <span class="meta-tag">Color: {{ item.color }}</span>
                    <span class="meta-tag">Size: {{ item.size }}</span>
                  </div>
                  <div class="item-footer">
                     <div class="item-qty">Qty: {{ item.quantity }}</div>
                     <button v-if="order.status === 'Delivered' || order.status === 'Shipped'" class="btn-return" @click="handleReturn(item)">Return / Exchange</button>
                     <button v-else class="btn-return" @click="handleReturn(item)">Return / Cancel</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Receipt Breakdown -->
            <div class="receipt-breakdown">
              <div class="receipt-row">
                <span>Subtotal</span>
                <span>₹{{ formatPriceOnly(order.subtotal) }}</span>
              </div>
              <div v-if="order.discount_total > 0" class="receipt-row discount">
                <span>Discounts</span>
                <span>-₹{{ formatPriceOnly(order.discount_total) }}</span>
              </div>
              <div class="receipt-row">
                <span>Shipping</span>
                <span :class="{ 'free': order.shipping_total === 0 }">
                  {{ order.shipping_total === 0 ? 'FREE' : '₹' + formatPriceOnly(order.shipping_total) }}
                </span>
              </div>
              <div class="receipt-row total">
                <span>Grand Total</span>
                <span>₹{{ formatPriceOnly(order.total_amount || order.total) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar: Info -->
        <div class="info-section">
          <div class="card info-card delivery">
            <div class="card-header">
              <h3 class="flex-align"><MapPin :size="16" /> Delivery Address</h3>
            </div>
            <div v-if="order.address" class="address-details">
              <p class="name">{{ order.address.fullName }}</p>
              <p>{{ order.address.street }}</p>
              <p>{{ order.address.city }}, {{ order.address.state }} {{ order.address.zip }}</p>
              <p>{{ order.address.country }}</p>
              <p class="phone">Phone: {{ order.address.phone }}</p>
            </div>
            <div v-else class="empty-text">No address details available</div>
          </div>

          <div class="card info-card payment">
            <div class="card-header">
              <h3 class="flex-align"><CreditCard :size="16" /> Payment Information</h3>
            </div>
            <div class="payment-details">
              <p class="method">{{ order.payment_method }}</p>
              <p v-if="order.payment_method === 'COD'" class="cod-notice">
                Pay ₹{{ formatPriceOnly(order.total_amount) }} at delivery
              </p>
              <p v-else class="status">Status: {{ order.payment_status || 'Paid' }}</p>
            </div>
          </div>

          <button @click="goToShop" class="btn-primary">
            Continue Shopping <ChevronRight :size="16" />
          </button>
        </div>

      </div>
    </div>

    <!-- Error State -->
    <div v-else class="container error-state">
      <div class="card error-card">
        <h2>Order Not Found</h2>
        <p>We couldn't locate your order details. Please check your tracking link.</p>
        <button @click="goToShop" class="btn-primary" style="margin-top: 30px;">Go to Shop</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Page Layout */
.success-page-wrapper {
  background-color: #f8fafc;
  min-height: 100vh;
  padding: 60px 20px 100px;
  color: #0f172a;
}
.container {
  max-width: 1100px;
  margin: 0 auto;
}

/* Loader */
.loader-overlay {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 60vh;
}
.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top-color: #0f172a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}
@keyframes spin { 100% { transform: rotate(360deg); } }
.loader-text {
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #64748b;
}

/* Hero Section */
.hero-section {
  text-align: center;
  margin-bottom: 50px;
  animation: fadeUp 0.6s ease-out;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.icon-circle {
  width: 90px;
  height: 90px;
  background: #ecfdf5;
  color: #10b981;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.2);
}
.hero-title {
  font-size: 36px;
  font-weight: 900;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}
.hero-subtitle {
  font-size: 16px;
  color: #64748b;
  font-weight: 500;
}
.hero-subtitle .highlight {
  color: #0f172a;
  font-weight: 900;
}

/* Shared Card Styles */
.card {
  background: #ffffff;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 4px 40px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(226, 232, 240, 0.6);
  margin-bottom: 30px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.card-header h3 {
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #64748b;
}
.card-header.border-bottom {
  padding-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
}
.flex-align {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Tracking Card */
.status-badge {
  background: #f1f5f9;
  color: #475569;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  padding: 6px 12px;
  border-radius: 100px;
  letter-spacing: 1px;
}
.timeline {
  display: flex;
  justify-content: space-between;
  position: relative;
  margin-top: 40px;
}
.timeline-step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
}
.step-icon {
  width: 50px;
  height: 50px;
  background: #f1f5f9;
  color: #94a3b8;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}
.step-label {
  margin-top: 16px;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 1px;
}
.step-connector {
  position: absolute;
  top: 25px;
  left: calc(50% + 25px);
  width: calc(100% - 50px);
  height: 4px;
  background: #f1f5f9;
  z-index: -1;
}
.timeline-step.completed .step-icon {
  background: #0f172a;
  color: #fff;
}
.step-connector.completed {
  background: #0f172a;
}
.timeline-step.active .step-icon {
  background: #000;
  color: #fff;
  transform: scale(1.15);
  box-shadow: 0 10px 20px rgba(0,0,0,0.15);
}
.timeline-step.completed .step-label,
.timeline-step.active .step-label {
  color: #0f172a;
}

/* Layout Grid */
.layout-grid {
  display: grid;
  gap: 30px;
}
@media(min-width: 992px) {
  .layout-grid {
    grid-template-columns: 2fr 1fr;
  }
}

/* Items Section */
.link-btn {
  background: none;
  border: none;
  color: #2563eb;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}
.link-btn:hover {
  text-decoration: underline;
}
.item-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.item-row {
  display: flex;
  gap: 20px;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  transition: border-color 0.2s;
}
.item-row:hover {
  border-color: #cbd5e1;
}
.item-img-container {
  width: 80px;
  height: 100px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #f1f5f9;
  background: #fff;
  flex-shrink: 0;
}
.item-img-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}
.item-header h4 {
  font-size: 14px;
  font-weight: 900;
  color: #0f172a;
}
.item-price {
  font-size: 14px;
  font-weight: 900;
}
.item-meta {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}
.meta-tag {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  color: #64748b;
  background: #f8fafc;
  padding: 4px 8px;
  border-radius: 6px;
  letter-spacing: 0.5px;
}
.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}
.item-qty {
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
}
.btn-return {
  background: #fff;
  border: 1px solid #e2e8f0;
  color: #0f172a;
  padding: 6px 12px;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-return:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

/* Receipt */
.receipt-breakdown {
  margin-top: 30px;
  padding-top: 24px;
  border-top: 1px dashed #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.receipt-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
}
.receipt-row.discount {
  color: #10b981;
}
.receipt-row .free {
  color: #10b981;
}
.receipt-row.total {
  margin-top: 12px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
  font-size: 18px;
  font-weight: 900;
  color: #0f172a;
}

/* Info Cards */
.info-card.delivery {
  border-top: 4px solid #3b82f6;
}
.info-card.payment {
  border-top: 4px solid #10b981;
}
.address-details {
  font-size: 13px;
  line-height: 1.6;
  color: #475569;
  font-weight: 500;
}
.address-details .name {
  font-weight: 900;
  color: #0f172a;
  font-size: 15px;
  margin-bottom: 8px;
}
.address-details .phone {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
  font-size: 11px;
  font-weight: 800;
  color: #94a3b8;
}

.payment-details .method {
  font-size: 14px;
  font-weight: 900;
  text-transform: uppercase;
  color: #0f172a;
  margin-bottom: 8px;
}
.payment-details .cod-notice {
  font-size: 12px;
  font-weight: 800;
  color: #10b981;
  background: #ecfdf5;
  padding: 6px 10px;
  border-radius: 6px;
  display: inline-block;
}
.payment-details .status {
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
}

.empty-text {
  font-size: 13px;
  font-style: italic;
  color: #94a3b8;
}

/* Primary Button */
.btn-primary {
  width: 100%;
  background: #000;
  color: #fff;
  padding: 20px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 2px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}
.btn-primary:hover {
  background: #1e293b;
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(0,0,0,0.25);
}
.btn-primary:active {
  transform: translateY(0);
}

.error-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
}
.error-card {
  text-align: center;
  max-width: 400px;
}
.error-card h2 {
  font-size: 24px;
  font-weight: 900;
  margin-bottom: 12px;
}
.error-card p {
  color: #64748b;
}

@media(max-width: 768px) {
  .timeline {
    flex-wrap: wrap;
    gap: 30px;
  }
  .timeline-step {
    flex: 0 0 calc(50% - 15px);
  }
  .step-connector {
    display: none;
  }
  .hero-title {
    font-size: 28px;
  }
  .card {
    padding: 24px;
  }
}
</style>
