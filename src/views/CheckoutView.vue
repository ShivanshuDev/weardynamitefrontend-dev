<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useProductStore } from '../stores/productStore'
import api from '../utils/api'

const router = useRouter()
const authStore = useAuthStore()
const productStore = useProductStore()

// Navigation guards
if (!authStore.isLoggedIn) router.push('/login')
if (productStore.checkoutItems.length === 0) router.push('/cart')

const selectedAddressId = ref(authStore.defaultAddress?.id || null)
const paymentMethod = ref('card')
const acceptTerms = ref(false)
const isProcessing = ref(false)
const paymentError = ref('')
const couponCode = ref('')
const couponStatus = ref('')

const applyCoupon = () => {
  if (!couponCode.value) return
  productStore.appliedCoupon = couponCode.value
  couponStatus.value = 'Coupon applied successfully!'
}

const allItemsCodAvailable = computed(() => {
  return productStore.checkoutItems.every(item => item.codAvailable)
})

const placeOrder = async () => {
  if (!selectedAddressId.value) return alert('Please select a delivery address.')
  if (paymentMethod.value === 'cod' && !productStore.orderSummary.total > 0) return alert('Invalid order amount.')
  if (!acceptTerms.value) return alert('Please accept the terms and conditions.')

  const address = authStore.addresses.find(a => a.id === selectedAddressId.value)
  
  isProcessing.value = true
  
  try {
    if (paymentMethod.value === 'cod') {
      const order = {
        addressId: selectedAddressId.value,
        paymentMethod: 'COD',
        items: productStore.checkoutItems.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
          forWhom: item.forWhom
        })),
        couponCode: productStore.appliedCoupon
      }
      
      const result = await authStore.addOrder(order)
      
      if (!productStore.isDirectCheckout) {
        productStore.cart = []
      }
      productStore.checkoutItems = []
      productStore.appliedCoupon = null
      router.push(`/order-status?id=${result.orderId}`)
    } else {
      // PayU / Online Payment
      const response = await api.post('/payment/initiate', {
        amount: productStore.orderSummary.total,
        productInfo: productStore.checkoutItems.map(i => i.name).join(', '),
        firstname: authStore.user.name?.split(' ')[0] || 'Customer',
        email: authStore.user.email,
        phone: address.phone,
        addressId: address.id,
        items: productStore.checkoutItems.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
          forWhom: item.forWhom
        })),
        couponCode: productStore.appliedCoupon
      })

      const params = response.data;
      
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://test.payu.in/_payment'; 

      for (const key in params) {
        if (params.hasOwnProperty(key)) {
          const hiddenField = document.createElement('input');
          hiddenField.type = 'hidden';
          hiddenField.name = key;
          hiddenField.value = params[key];
          form.appendChild(hiddenField);
        }
      }

      document.body.appendChild(form);
      form.submit();
    }
  } catch (error) {
    console.error('Order placement failed:', error)
    paymentError.value = error.response?.data?.message || 'Something went wrong. Please try again.'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } finally {
    isProcessing.value = false
  }
}
</script>

<template>
  <div class="checkout-view container">
    <h1 class="page-title">Secure Checkout</h1>
    
    <div v-if="paymentError" class="payment-error-banner">
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <p>{{ paymentError }}</p>
      </div>
      <button @click="paymentError = ''" class="close-error">×</button>
    </div>

    <div class="checkout-layout">
      <!-- Left Column: Forms & Selection -->
      <div class="checkout-steps">
        
        <!-- Step 1: Address -->
        <section class="checkout-step">
          <h2>1. Shipping Address</h2>
          <div v-if="authStore.addresses.length > 0" class="address-options">
            <div 
              v-for="address in authStore.addresses" 
              :key="address.id"
              class="address-card"
              :class="{ selected: selectedAddressId === address.id }"
              @click="selectedAddressId = address.id"
            >
              <div class="radio-select">
                <input type="radio" :value="address.id" v-model="selectedAddressId" />
              </div>
              <div class="address-details">
                <strong>{{ address.name }} - {{ address.fullName }}</strong>
                <p>{{ address.street }}, {{ address.city }}</p>
                <p>{{ address.state }}, {{ address.zip }}, {{ address.country }}</p>
                <p>{{ address.phone }}</p>
              </div>
            </div>
            <div class="add-address-prompt">
              <p>Need to ship elsewhere? <RouterLink to="/profile">Add a new address in your profile</RouterLink>.</p>
            </div>
          </div>
          <div v-else class="no-address">
            <p>You don't have any saved addresses.</p>
            <RouterLink to="/profile" class="btn secondary">Add Address to Continue</RouterLink>
          </div>
        </section>

        <!-- Step 2: Payment Method -->
        <section class="checkout-step">
          <h2>2. Payment Method</h2>
          <div class="payment-options">
            
            <label class="payment-card" :class="{ selected: paymentMethod === 'card' }">
              <div class="radio-select">
                <input type="radio" value="card" v-model="paymentMethod" />
              </div>
              <div class="payment-details">
                <strong>Online Payment (PayU)</strong>
                <p>Pay securely using Cards, UPI, NetBanking, or Wallets via PayU.</p>
                
                <div v-if="paymentMethod === 'card'" class="online-payment-info">
                   <p class="secure-badge">🛡️ Secure 256-bit encrypted payment</p>
                </div>
              </div>
            </label>

            <label class="payment-card" :class="{ selected: paymentMethod === 'cod', disabled: !allItemsCodAvailable }">
              <div class="radio-select">
                <input type="radio" value="cod" v-model="paymentMethod" :disabled="!allItemsCodAvailable" />
              </div>
              <div class="payment-details">
                <strong>Cash on Delivery (COD)</strong>
                <p v-if="allItemsCodAvailable">Pay with cash when your order is delivered.</p>
                <p v-else class="text-danger">Not available. One or more items in your cart do not support COD.</p>
              </div>
            </label>

          </div>
        </section>
      </div>

      <!-- Right Column: Order Summary -->
      <div class="order-summary-sidebar">
        <h3>Order Summary</h3>
        
        <div class="summary-items">
          <div v-for="item in productStore.checkoutItems" :key="item.id" class="summary-item">
            <div class="item-meta">
              <span class="qty">{{ item.quantity }}x</span>
              <span class="name">{{ item.name }}</span>
            </div>
            <span class="price">{{ productStore.formatPrice(item.price * item.quantity) }}</span>
          </div>
        </div>

        <div class="coupon-section">
          <div class="coupon-input">
            <input type="text" v-model="couponCode" placeholder="Promo Code" @keyup.enter="applyCoupon" />
            <button @click="applyCoupon">Apply</button>
          </div>
          <p v-if="couponStatus" class="coupon-msg" :class="{ success: productStore.appliedCoupon }">{{ couponStatus }}</p>
          <div v-if="productStore.isFirstTimeUser" class="first-time-badge">
            ✨ First-time order discount (10%) applied!
          </div>
        </div>

        <div class="summary-totals">
          <div class="row">
            <span>Subtotal ({{ productStore.orderSummary.itemCount }} items)</span>
            <span>{{ productStore.formatPrice(productStore.orderSummary.subtotal) }}</span>
          </div>
          <div class="row promotions" v-if="productStore.orderSummary.discountTotal > 0">
            <span>Promotions & Discounts</span>
            <span class="discount-amt">-{{ productStore.formatPrice(productStore.orderSummary.discountTotal) }}</span>
          </div>
          <div class="row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div class="row">
            <span>Tax (Estimated)</span>
            <span>{{ productStore.formatPrice(productStore.orderSummary.taxTotal) }}</span>
          </div>
          <hr />
          <div class="row total">
            <span>Total to pay</span>
            <span>{{ productStore.formatPrice(productStore.orderSummary.total) }}</span>
          </div>
        </div>

        <div class="policies">
          <label class="terms-checkbox">
            <input type="checkbox" v-model="acceptTerms" />
            <span>I have read and agree to the <a href="#" @click.prevent>Terms & Conditions</a> and <a href="#" @click.prevent>Return Policy</a>.</span>
          </label>
        </div>

        <button 
          class="btn primary-btn place-order-btn" 
          @click="placeOrder"
          :disabled="!selectedAddressId || !acceptTerms || isProcessing"
        >
          <span v-if="isProcessing">Processing...</span>
          <span v-else>Place Order</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checkout-view {
  padding: 60px 20px;
  min-height: 80vh;
}

.page-title {
  font-family: var(--font-heading);
  font-size: 2.5rem;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.payment-error-banner {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: slideIn 0.3s ease-out;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.error-icon {
  font-size: 1.2rem;
}

.payment-error-banner p {
  color: #b91c1c;
  margin: 0;
  font-weight: 500;
  font-size: 0.95rem;
}

.close-error {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #b91c1c;
  cursor: pointer;
  padding: 0 5px;
  line-height: 1;
}

@keyframes slideIn {
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.checkout-layout {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 50px;
  align-items: flex-start;
}

.checkout-step {
  margin-bottom: 50px;
}

.checkout-step h2 {
  font-size: 1.5rem;
  margin-bottom: 25px;
  color: #000;
}

.address-options, .payment-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.address-card, .payment-card {
  display: flex;
  gap: 15px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  background: #fff;
  transition: all 0.2s;
}

.address-card:hover, .payment-card:hover:not(.disabled) {
  border-color: #999;
}

.payment-card.selected {
  border-color: #000;
  box-shadow: 0 0 0 1px #000;
  background: #fafafa;
}

.online-payment-info {
  margin-top: 15px;
  background: #f0fdf4;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #dcfce7;
}

.secure-badge {
  color: #166534 !important;
  font-weight: 600;
  font-size: 0.85rem !important;
  margin: 0 !important;
}

.payment-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #fdfdfd;
}

.radio-select input {
  width: 18px;
  height: 18px;
  accent-color: #000;
  cursor: pointer;
}

.address-details strong, .payment-details strong {
  display: block;
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.address-details p, .payment-details p {
  color: #666;
  margin-bottom: 4px;
  font-size: 0.95rem;
  line-height: 1.4;
}

.text-danger {
  color: #e74c3c !important;
  font-size: 0.85rem !important;
  font-weight: 500;
}

.add-address-prompt {
  margin-top: 15px;
  font-size: 0.95rem;
}

.add-address-prompt a {
  color: #000;
  text-decoration: underline;
  font-weight: 600;
}

/* Mock Card Form */
.mock-card-form {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mock-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  color: #333;
}

.mock-card-row {
  display: flex;
  gap: 10px;
}

/* Sidebar */
.order-summary-sidebar {
  background: #fafafa;
  padding: 30px;
  border: 1px solid #eee;
  border-radius: 8px;
  position: sticky;
  top: 100px;
}

.order-summary-sidebar h3 {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.summary-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
}

.item-meta {
  display: flex;
  gap: 10px;
}

.item-meta .qty {
  color: #888;
  font-weight: 600;
}

.item-meta .name {
  color: #333;
}

.summary-totals {
  border-top: 1px dashed #ddd;
  padding-top: 20px;
  margin-bottom: 30px;
}

.summary-totals .row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  color: #555;
}

.summary-totals hr {
  border: none;
  border-top: 1px solid #ddd;
  margin: 15px 0;
}

.summary-totals .total {
  font-size: 1.25rem;
  font-weight: 700;
  color: #000;
}

.policies {
  margin-bottom: 25px;
  font-size: 0.85rem;
  color: #666;
  background: #fff;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.terms-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
}

.terms-checkbox input {
  margin-top: 3px;
}

.terms-checkbox a {
  color: #000;
  text-decoration: underline;
}

.place-order-btn {
  width: 100%;
  padding: 16px;
  font-size: 1.1rem;
  background: #000;
  color: #fff;
  border: none;
}

.place-order-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.coupon-section {
  margin: 20px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.coupon-input {
  display: flex;
  gap: 10px;
}

.coupon-input input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.coupon-input button {
  padding: 8px 15px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.coupon-msg {
  font-size: 0.85rem;
  margin-top: 8px;
  color: #666;
}

.coupon-msg.success {
  color: #10b981;
}

.first-time-badge {
  margin-top: 10px;
  padding: 8px;
  background: #ecfdf5;
  color: #065f46;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
}

.promotions {
  color: #10b981;
  font-weight: 500;
}

.discount-amt {
  font-weight: 600;
}

@media (max-width: 992px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }
  .order-summary-sidebar {
    position: static;
  }
}
</style>
