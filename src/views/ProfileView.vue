<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useProductStore } from '../stores/productStore'

const router = useRouter()
const authStore = useAuthStore()
const productStore = useProductStore()

onMounted(() => {
  if (authStore.isLoggedIn) {
     authStore.fetchOrders();
  }
})

if (!authStore.isLoggedIn) {
  router.push('/login')
}

const activeTab = ref('profile') // profile, addresses, orders, settings

// Address Form State
const showAddressForm = ref(false)
const newAddress = ref({ name: '', fullName: '', street: '', city: '', state: '', zip: '', country: '', phone: '', isDefault: false })

const saveAddress = () => {
  authStore.addAddress({ ...newAddress.value })
  showAddressForm.value = false
  newAddress.value = { name: '', fullName: '', street: '', city: '', state: '', zip: '', country: '', phone: '', isDefault: false }
}

const logout = () => {
  authStore.logout()
  router.push('/')
}
</script>

<template>
  <div class="profile-view container" v-if="authStore.isLoggedIn && authStore.user">
    <div class="profile-sidebar">
      <div class="user-info">
        <div class="avatar">{{ (authStore.user?.name || 'U').charAt(0).toUpperCase() }}</div>
        <h2>{{ authStore.user?.name || 'User' }}</h2>
        <p>{{ authStore.user?.email }}</p>
      </div>
      <nav class="profile-nav">
        <button :class="{ active: activeTab === 'profile' }" @click="activeTab = 'profile'">My Profile</button>
        <button :class="{ active: activeTab === 'settings' }" @click="activeTab = 'settings'">Preferences (Currency)</button>
        <button :class="{ active: activeTab === 'addresses' }" @click="activeTab = 'addresses'">Manage Addresses</button>
        <button :class="{ active: activeTab === 'orders' }" @click="activeTab = 'orders'">Order History</button>
        <button class="logout-btn" @click="logout">Log Out</button>
      </nav>
    </div>

    <div class="profile-content">
      <!-- Profile Details -->
      <div v-if="activeTab === 'profile'" class="tab-pane">
        <h2>Profile Information</h2>
        <div class="info-card">
          <div class="info-row">
            <span class="label">Full Name:</span>
            <span class="value">{{ authStore.user.name }}</span>
          </div>
          <div class="info-row">
            <span class="label">Email Address:</span>
            <span class="value">{{ authStore.user.email }}</span>
          </div>
          <div class="info-row">
            <span class="label">Member Since:</span>
            <span class="value">{{ new Date(authStore.user.joinedDate).toLocaleDateString() }}</span>
          </div>
        </div>
      </div>

      <!-- Currency Preferences -->
      <div v-if="activeTab === 'settings'" class="tab-pane">
        <h2>Global Preferences</h2>
        <div class="info-card">
          <h3>Display Currency</h3>
          <p class="hint">Select the currency you would like to see prices displayed in across the store.</p>
          
          <div class="currency-selector">
            <div 
              v-for="(data, code) in productStore.currencyRates" 
              :key="code"
              class="currency-card"
              :class="{ selected: productStore.currency === code }"
              @click="productStore.setCurrency(code)"
            >
              <div class="symbol">{{ data.symbol }}</div>
              <div class="code">{{ code }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Manage Addresses -->
      <div v-if="activeTab === 'addresses'" class="tab-pane">
        <div class="pane-header">
          <h2>Saved Addresses</h2>
          <button class="btn secondary" @click="showAddressForm = !showAddressForm">
            {{ showAddressForm ? 'Cancel' : '+ Add Address' }}
          </button>
        </div>

        <div v-if="showAddressForm" class="address-form info-card">
          <h3>Add New Address</h3>
          <form @submit.prevent="saveAddress">
            <div class="form-row">
              <div class="form-group"><label>Address Label (e.g., Office)</label><input v-model="newAddress.name" required /></div>
              <div class="form-group"><label>Recipient Name</label><input v-model="newAddress.fullName" required /></div>
            </div>
            <div class="form-group"><label>Street Address</label><input v-model="newAddress.street" required /></div>
            <div class="form-row">
              <div class="form-group"><label>City</label><input v-model="newAddress.city" required /></div>
              <div class="form-group"><label>State</label><input v-model="newAddress.state" required /></div>
              <div class="form-group"><label>ZIP Code</label><input v-model="newAddress.zip" required /></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label>Country</label><input v-model="newAddress.country" required /></div>
              <div class="form-group"><label>Phone Number</label><input v-model="newAddress.phone" required /></div>
            </div>
            <div class="form-group checkbox-group">
              <input type="checkbox" id="isDefault" v-model="newAddress.isDefault" />
              <label for="isDefault">Set as default address</label>
            </div>
            <button type="submit" class="btn primary-btn" style="padding: 10px 20px;">Save Address</button>
          </form>
        </div>

        <div class="address-grid">
          <div v-for="address in authStore.addresses" :key="address.id" class="address-card" :class="{ 'is-default': address.isDefault }">
            <div class="address-type">
              {{ address.name }} <span v-if="address.isDefault" class="badge">Default</span>
            </div>
            <div class="address-details">
              <strong>{{ address.fullName }}</strong><br/>
              {{ address.street }}<br/>
              {{ address.city }}, {{ address.state }} {{ address.zip }}<br/>
              {{ address.country }}<br/>
              Phone: {{ address.phone }}
            </div>
            <div class="address-actions">
              <button v-if="!address.isDefault" @click="authStore.setDefaultAddress(address.id)" class="text-link">Set Default</button>
              <button @click="authStore.removeAddress(address.id)" class="text-link text-danger">Remove</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Order History -->
      <div v-if="activeTab === 'orders'" class="tab-pane">
        <h2>Order History</h2>
        
        <div v-if="authStore.orders.length === 0" class="empty-state">
          <p>You haven't placed any orders yet.</p>
          <RouterLink to="/shop" class="btn primary-btn">Start Shopping</RouterLink>
        </div>

        <div class="orders-list" v-else>
          <div v-for="order in authStore.orders" :key="order.id" class="order-card hover:shadow-md transition-shadow">
            <div class="order-header">
              <div class="order-meta">
                <span class="order-id">Order #{{ order.id }}</span>
                <span class="order-date">{{ order.date }}</span>
              </div>
              <div class="order-status" :class="order.status.toLowerCase()">{{ order.status }}</div>
            </div>
            <div class="order-body flex items-center gap-6 p-5">
              <img v-if="order.thumbnail" :src="productStore.resolveImageUrl(order.thumbnail)" class="w-20 h-20 rounded-xl object-cover border border-slate-100 shadow-sm" />
              <div class="flex-1">
                 <p class="text-sm font-bold text-slate-800 line-clamp-2 uppercase italic tracking-tighter">{{ order.item_names || 'Processing items...' }}</p>
                 <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{{ order.item_count || 1 }} ITEMS INDEXED</p>
              </div>
            </div>
            <div class="order-footer">
              <span class="order-total">Total: {{ productStore.formatPrice(order.total) }}</span>
              <RouterLink :to="'/order-status?id=' + order.id" class="text-link" style="margin-left: 15px;">Manage Order</RouterLink>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.profile-view {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 40px;
  padding: 60px 20px;
  min-height: 70vh;
}

.profile-sidebar {
  border-right: 1px solid #eee;
  padding-right: 30px;
}

.user-info {
  text-align: center;
  margin-bottom: 40px;
}

.avatar {
  width: 80px;
  height: 80px;
  background: #000;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 auto 15px;
}

.user-info h2 {
  font-size: 1.2rem;
  margin-bottom: 5px;
}

.user-info p {
  color: #666;
  font-size: 0.9rem;
}

.profile-nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.profile-nav button {
  background: none;
  border: none;
  text-align: left;
  padding: 12px 15px;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 4px;
  color: #555;
  transition: all 0.2s;
}

.profile-nav button:hover, .profile-nav button.active {
  background: #f5f5f5;
  color: #000;
  font-weight: 600;
}

.logout-btn {
  margin-top: 20px;
  color: #e74c3c !important;
}

.tab-pane h2 {
  font-family: var(--font-heading);
  font-size: 2rem;
  margin-bottom: 30px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.info-card {
  background: #fff;
  border: 1px solid #eee;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.02);
  margin-bottom: 30px;
}

.info-row {
  display: flex;
  margin-bottom: 15px;
  font-size: 1.05rem;
}

.info-row .label {
  width: 150px;
  color: #666;
  font-weight: 600;
}

.currency-selector {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.currency-card {
  border: 2px solid #eee;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  width: 120px;
}

.currency-card:hover {
  border-color: #ccc;
}

.currency-card.selected {
  border-color: #000;
  background: #fafafa;
}

.currency-card .symbol {
  font-size: 2rem;
  margin-bottom: 10px;
}

.currency-card .code {
  font-weight: 600;
  color: #555;
}

/* Addresses */
.pane-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.pane-header h2 {
  border: none;
  margin: 0;
  padding: 0;
}

.address-form h3 {
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 20px;
}

.form-row .form-group {
  flex: 1;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 5px;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.checkbox-group input {
  width: auto;
}

.address-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.address-card {
  border: 1px solid #eee;
  padding: 25px;
  border-radius: 8px;
  position: relative;
}

.address-card.is-default {
  border-color: #000;
  background: #fafafa;
}

.address-type {
  font-weight: 700;
  font-size: 1.1rem;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.badge {
  background: #000;
  color: #fff;
  font-size: 0.7rem;
  padding: 3px 8px;
  border-radius: 10px;
  font-weight: normal;
  text-transform: uppercase;
}

.address-details {
  line-height: 1.6;
  color: #555;
  margin-bottom: 20px;
}

.address-actions {
  display: flex;
  gap: 15px;
}

.text-link {
  background: none;
  border: none;
  color: #666;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
  font-size: 0.9rem;
}

.text-danger {
  color: #e74c3c;
}

/* Orders */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state p {
  margin-bottom: 20px;
  color: #666;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
}

.order-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.order-header {
  background: #f9f9f9;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.order-meta {
  display: flex;
  gap: 20px;
}

.order-id {
  font-weight: 700;
}

.order-date {
  color: #666;
}

.order-status {
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.order-status.delivered { color: #2ecc71; }
.order-status.processing { color: #f39c12; }
.order-status.shipped { color: #3498db; }

.order-items {
  padding: 20px;
  color: #555;
  line-height: 1.6;
}

.order-footer {
  padding: 15px 20px;
  background: #fafafa;
  border-top: 1px solid #eee;
  text-align: right;
  font-weight: 700;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .profile-view {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  .profile-sidebar {
    border-right: none;
    border-bottom: 1px solid #eee;
    padding-right: 0;
    padding-bottom: 30px;
  }
}
</style>
