<script setup>
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useProductStore } from '../stores/productStore'
import { useAuthStore } from '../stores/authStore'
import { Plus, Minus, Trash2 } from 'lucide-vue-next'

const router = useRouter()
const productStore = useProductStore()

const cartTotal = computed(() => {
  return productStore.cart.reduce((total, item) => total + (item.price * item.quantity), 0)
})

const checkout = () => {
  if (productStore.cart.length > 0) {
    if (useAuthStore().isLoggedIn) {
      productStore.initiateCartCheckout()
      router.push('/checkout')
    } else {
      router.push('/login')
    }
  }
}
</script>

<template>
  <div class="cart-view container">
    <h1 class="page-title">Shopping Cart</h1>
    
    <div class="cart-layout" v-if="productStore.cart.length > 0">
      
      <div class="cart-items">
        <div class="cart-header">
          <span class="col-product">Product</span>
          <span class="col-price">Price</span>
          <span class="col-quantity">Quantity</span>
          <span class="col-total">Total</span>
        </div>

        <div v-for="item in productStore.cart" :key="item.id" class="cart-item">
          <div class="col-product item-details">
            <RouterLink :to="'/product/' + item.productId" class="item-img-link">
              <img :src="item.image" :alt="item.name">
            </RouterLink>
            <div class="item-info">
              <RouterLink :to="'/product/' + item.productId" class="item-name">{{ item.name }}</RouterLink>
              <div class="item-specs">
                <span><strong>For:</strong> {{ item.forWhom }}</span>
                <span><strong>Size:</strong> {{ item.size }}</span>
                <span class="color-spec">
                  <strong>Color:</strong> 
                  <div class="mini-swatch" :style="{ backgroundColor: item.color }" :title="item.color"></div>
                </span>
              </div>
              <button class="remove-btn" @click="productStore.removeFromCart(item.id)">
                <Trash2 :size="14" /> Remove
              </button>
            </div>
          </div>
          
          <div class="col-price item-price">
            {{ productStore.formatPrice(item.price) }}
          </div>
          
          <div class="col-quantity item-quantity">
            <div class="stepper">
              <button @click="productStore.updateCartQuantity(item.id, -1)" :disabled="item.quantity <= 1"><Minus :size="14" /></button>
              <span>{{ item.quantity }}</span>
              <button @click="productStore.updateCartQuantity(item.id, 1)" :disabled="item.quantity >= 3"><Plus :size="14" /></button>
            </div>
          </div>
          
          <div class="col-total item-total">
            {{ productStore.formatPrice(item.price * item.quantity) }}
          </div>
        </div>
      </div>

      <div class="cart-summary-box">
        <h3>Order Summary</h3>
        <div class="summary-row">
          <span>Subtotal ({{ productStore.cartCount }} items)</span>
          <span>{{ productStore.formatPrice(cartTotal) }}</span>
        </div>
        <div class="summary-row">
          <span>Shipping</span>
          <span>Free</span>
        </div>
        <div class="summary-row">
          <span>Tax</span>
          <span>Calculated at checkout</span>
        </div>
        
        <hr class="divider" />
        
        <div class="summary-row total-row">
          <span>Estimated Total</span>
          <span>{{ productStore.formatPrice(cartTotal) }}</span>
        </div>

        <button class="btn checkout-btn" @click="checkout">Proceed to Checkout</button>

        
        <RouterLink to="/shop" class="continue-shopping">Continue Shopping</RouterLink>
      </div>
      
    </div>
    
    <div v-else class="empty-cart">
      <h2>Your cart is currently empty.</h2>
      <p>Browse our collections and find something you love.</p>
      <RouterLink to="/shop" class="btn primary-btn shop-btn">Start Shopping</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.cart-view {
  padding: 60px 20px;
  min-height: 60vh;
}

.page-title {
  font-size: clamp(1.8rem, 5vw, 2.5rem);
  margin-bottom: 40px;
  padding-bottom: 10px;
  border-bottom: 2px solid #000;
}

.cart-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
  align-items: flex-start;
}

.cart-items {
  display: flex;
  flex-direction: column;
}

.cart-header {
  display: flex;
  padding-bottom: 15px;
  border-bottom: 2px solid #eee;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.85rem;
  color: #666;
  letter-spacing: 1px;
}

.cart-item {
  display: flex;
  padding: 30px 0;
  border-bottom: 1px solid #eee;
  align-items: center;
}

.col-product { flex: 2; }
.col-price { flex: 0.8; text-align: center; }
.col-quantity { flex: 1; display: flex; justify-content: center; }
.col-total { flex: 0.8; text-align: right; font-weight: 700; }

.item-details {
  display: flex;
  gap: 20px;
}

.item-img-link {
  width: 100px;
  height: 120px;
  flex-shrink: 0;
  background: #f9f9f9;
  border-radius: 4px;
  overflow: hidden;
}

.item-img-link img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  display: flex;
  flex-direction: column;
}

.item-name {
  font-family: var(--font-heading);
  font-size: 1.1rem;
  font-weight: 600;
  color: #000;
  margin-bottom: 8px;
  text-decoration: none;
}

.item-name:hover {
  text-decoration: underline;
}

.item-specs {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 10px;
}

.item-specs span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.mini-swatch {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid #ccc;
  display: inline-block;
}

.remove-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #e74c3c;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0;
  width: fit-content;
  margin-top: auto;
}

.remove-btn:hover {
  text-decoration: underline;
}

.stepper {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  height: 36px;
}

.stepper button {
  padding: 0 12px;
  height: 100%;
  background: #f9f9f9;
}

.stepper button:hover:not(:disabled) {
  background: #eee;
}

.stepper button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.stepper span {
  padding: 0 15px;
  font-weight: 600;
  font-size: 0.95rem;
}

/* Summary Box */
.cart-summary-box {
  background: #fafafa;
  padding: 30px;
  border-radius: 8px;
  border: 1px solid #eee;
  position: sticky;
  top: 100px;
}

.cart-summary-box h3 {
  font-family: var(--font-heading);
  font-size: 1.3rem;
  margin-bottom: 25px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 0.95rem;
  color: #555;
}

.divider {
  border: none;
  height: 1px;
  background: #ddd;
  margin: 20px 0;
}

.total-row {
  font-size: 1.2rem;
  font-weight: 700;
  color: #000;
  margin-bottom: 30px;
}

.checkout-btn {
  width: 100%;
  padding: 15px;
  background: #000;
  color: #fff;
  font-size: 1.05rem;
  font-weight: 600;
  margin-bottom: 15px;
  transition: opacity 0.2s;
}

.checkout-btn:hover {
  opacity: 0.85;
}

.continue-shopping {
  display: block;
  text-align: center;
  color: #666;
  font-size: 0.95rem;
  text-decoration: underline;
}

.continue-shopping:hover {
  color: #000;
}

.empty-cart {
  text-align: center;
  padding: 80px 20px;
}

.empty-cart h2 {
  font-size: 2rem;
  margin-bottom: 15px;
}

.empty-cart p {
  color: #666;
  margin-bottom: 30px;
}

.shop-btn {
  background: #000;
  color: #fff;
  padding: 12px 30px;
}

@media (max-width: 992px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }
  .cart-summary-box {
    position: static;
  }
}

@media (max-width: 768px) {
  .cart-view { padding: 30px 15px; }

  .cart-header {
    display: none;
  }
  
  .cart-item {
    display: grid;
    grid-template-columns: 1fr;
    gap: 15px;
    padding: 24px 0;
    border-bottom: 1px solid #eee;
  }
  
  .item-details {
    display: flex;
    gap: 15px;
  }

  .item-img-link {
    width: 80px;
    height: 100px;
    border-radius: 8px;
  }

  .item-name { font-size: 1rem; }

  .col-price, .col-quantity, .col-total {
    text-align: left;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.9rem;
    padding-top: 5px;
  }
  
  .col-price::before { content: "Item Price"; color: #64748b; font-weight: 600; font-size: 0.8rem; text-transform: uppercase; }
  .col-quantity::before { content: "Quantity"; color: #64748b; font-weight: 600; font-size: 0.8rem; text-transform: uppercase; }
  .col-total::before { content: "Line Total"; color: #64748b; font-weight: 600; font-size: 0.8rem; text-transform: uppercase; }
  
  .item-total { font-size: 1rem; }

  .remove-btn {
    position: absolute;
    top: 24px;
    right: 0;
  }
  
  .cart-summary-box {
    padding: 24px 20px;
    border-radius: 12px;
  }
}

@media (max-width: 480px) {
  .item-img-link { width: 70px; height: 90px; }
  .item-specs { font-size: 0.8rem; }
}
</style>
