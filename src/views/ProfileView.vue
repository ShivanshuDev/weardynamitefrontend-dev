<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useProductStore } from '../stores/productStore'
import { useUiStore } from '../stores/uiStore'
import { 
  Package, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight,
  TrendingUp,
  Building2,
  Mail,
  Phone,
  User,
  MapPin,
  LogOut,
  ChevronRight,
  ArrowLeft
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const productStore = useProductStore()
const uiStore = useUiStore()

const activeTab = ref('profile') // profile, addresses, orders, settings
const showMobileMenu = ref(true)

const isMobile = ref(window.innerWidth <= 1024)
const handleResize = () => {
  isMobile.value = window.innerWidth <= 1024
}
onMounted(() => {
  window.addEventListener('resize', handleResize)
})

const syncActiveTab = () => {
  if (route.query.tab) {
    activeTab.value = route.query.tab
    showMobileMenu.value = false
  } else if (route.path.includes('/orders')) {
    activeTab.value = 'orders'
    showMobileMenu.value = false
  }
}

onMounted(async () => {
  syncActiveTab()
  if (authStore.isLoggedIn) {
     await Promise.all([
       authStore.fetchOrders(),
       authStore.fetchInquiries()
     ]);
  }
})

// Watch for route changes to switch tabs without refresh
watch(() => route.query.tab, (newTab) => {
  if (newTab) activeTab.value = newTab
})
watch(() => route.path, (newPath) => {
  if (newPath.includes('/orders')) activeTab.value = 'orders'
})

const combinedHistory = computed(() => {
  const orders = (authStore.orders || []).map(o => ({ 
    ...o, 
    type: 'ORDER', 
    timestamp: o.date ? new Date(o.date).getTime() : 0 
  }))
  
  const inquiries = (authStore.inquiries || []).map(i => ({ 
    ...i, 
    type: 'INQUIRY', 
    timestamp: i.createdAt || (i.date ? new Date(i.date).getTime() : 0)
  }))

  return [...orders, ...inquiries].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
})

if (!authStore.isLoggedIn) {
  router.push('/login')
}

// Address Form State
const showAddressForm = ref(false)
const newAddress = ref({ name: '', fullName: '', street: '', city: '', state: '', zip: '', country: '', phone: '', isDefault: false })

const regex10 = /^\d{10}$/
const saveAddress = () => {
  if (newAddress.value.phone && !regex10.test(newAddress.value.phone.replace(/\s+/g, '').replace(/^\+91/, ''))) {
    return uiStore.showNotification('Validation Error', 'Phone number must be exactly 10 digits.', 'warning')
  }
  authStore.addAddress({ ...newAddress.value })
  showAddressForm.value = false
  newAddress.value = { name: '', fullName: '', street: '', city: '', state: '', zip: '', country: '', phone: '', isDefault: false }
}

const logout = () => {
  authStore.logout()
  router.push('/')
}

// Personal Info Edit State
const isEditingPersonal = ref(false)
const personalForm = ref({
  name: authStore.user?.name || '',
  phone: authStore.user?.phone || '',
  phoneSecondary: authStore.user?.phoneSecondary || '',
  dob: authStore.user?.dob || '',
  interests: authStore.user?.interests || '',
  gender: authStore.user?.gender || ''
})

const startEditingPersonal = () => {
  personalForm.value = {
    name: authStore.user?.name || '',
    phone: authStore.user?.phone || '',
    phoneSecondary: authStore.user?.phoneSecondary || '',
    dob: authStore.user?.dob || '',
    interests: authStore.user?.interests || '',
    gender: authStore.user?.gender || ''
  }
  isEditingPersonal.value = true
}

const selectMobileTab = (tab) => {
  activeTab.value = tab
  showMobileMenu.value = false
}

const goBackToMenu = () => {
  showMobileMenu.value = true
}

const savePersonal = async () => {
  const regex10 = /^\d{10}$/
  if (personalForm.value.phone && !regex10.test(personalForm.value.phone.replace(/\s+/g, '').replace(/^\+91/, ''))) {
    return uiStore.showNotification('Validation Error', 'Primary phone number must be exactly 10 digits.', 'warning')
  }
  if (personalForm.value.phoneSecondary && !regex10.test(personalForm.value.phoneSecondary.replace(/\s+/g, '').replace(/^\+91/, ''))) {
    return uiStore.showNotification('Validation Error', 'Secondary phone number must be exactly 10 digits.', 'warning')
  }
  try {
    await authStore.updateProfile(personalForm.value)
    isEditingPersonal.value = false
    uiStore.showNotification('Success', 'Profile updated successfully.', 'success')
  } catch (error) {
    uiStore.showNotification('Error', 'Failed to update profile. Please try again.', 'error')
  }
}
</script>

<template>
  <div class="profile-view container" v-if="authStore.isLoggedIn && authStore.user">
    <!-- Desktop Sidebar -->
    <div class="profile-sidebar desktop-only">
      <div class="user-info">
        <div class="avatar-container">
          <img v-if="authStore.user?.photoURL" :src="authStore.user.photoURL" class="avatar-img" />
          <div v-else class="avatar-fallback">{{ (authStore.user?.name || 'U').charAt(0).toUpperCase() }}</div>
        </div>
        <h2>{{ authStore.user?.name || 'User' }}</h2>
        <p>{{ authStore.user?.email }}</p>
      </div>
      <nav class="profile-nav">
        <button :class="{ active: activeTab === 'profile' }" @click="activeTab = 'profile'">My Profile</button>
        <button :class="{ active: activeTab === 'addresses' }" @click="activeTab = 'addresses'">Manage Addresses</button>
        <button :class="{ active: activeTab === 'addresses' }" @click="activeTab = 'addresses'">Manage Addresses</button>
        <button :class="{ active: activeTab === 'orders' }" @click="activeTab = 'orders'">Order History</button>
        <button class="logout-btn" @click="logout">Log Out</button>
      </nav>
    </div>

    <!-- Mobile Header & Hub -->
    <div v-if="showMobileMenu" class="mobile-hub-container mobile-only">
      <div class="mobile-profile-header">
         <div class="avatar-small">
           <img v-if="authStore.user?.photoURL" :src="authStore.user.photoURL" />
           <span v-else>{{ (authStore.user?.name || 'U').charAt(0).toUpperCase() }}</span>
         </div>
         <div class="header-text">
            <h2>{{ authStore.user?.name }}</h2>
            <p>{{ authStore.user?.email }}</p>
         </div>
      </div>
      
      <div class="mobile-menu-list">
        <div class="mobile-menu-item" @click="selectMobileTab('orders')">
           <div class="mmi-content">
             <div class="mmi-icon"><Package :size="20" /></div>
             <span>My Orders & Inquiries</span>
           </div>
           <ChevronRight class="mmi-chevron" :size="18" />
        </div>
        <div class="mobile-menu-item" @click="selectMobileTab('profile')">
           <div class="mmi-content">
             <div class="mmi-icon"><User :size="20" /></div>
             <span>Profile Information</span>
           </div>
           <ChevronRight class="mmi-chevron" :size="18" />
        </div>
        <div class="mobile-menu-item" @click="selectMobileTab('addresses')">
           <div class="mmi-content">
             <div class="mmi-icon"><MapPin :size="20" /></div>
             <span>Saved Addresses</span>
           </div>
           <ChevronRight class="mmi-chevron" :size="18" />
        </div>
        <div class="mobile-menu-item logout" @click="logout">
           <div class="mmi-content">
             <div class="mmi-icon"><LogOut :size="20" /></div>
             <span style="color: #ef4444">Log Out</span>
           </div>
           <ChevronRight class="mmi-chevron" :size="18" />
        </div>
      </div>
    </div>

    <!-- Main Content Flow (Switching between tabs) -->
    <div v-if="!showMobileMenu || !isMobile" class="profile-content">
      <!-- Mobile Section Header -->
      <div class="mobile-section-header mobile-only" v-if="!showMobileMenu">
        <button @click="goBackToMenu" class="back-btn-pill">
           <ArrowLeft :size="18" />
        </button>
        <h2>{{ 
          activeTab === 'profile' ? 'My Profile' :
          activeTab === 'orders' ? 'Order History' : 'Addresses'
        }}</h2>
      </div>
      <!-- Profile Details -->
      <div v-if="activeTab === 'profile'" class="tab-pane">
        <div class="pane-header">
          <h2>Profile Information</h2>
          <button v-if="!isEditingPersonal" class="btn secondary" @click="startEditingPersonal">Edit Profile</button>
          <button v-else class="btn secondary" @click="isEditingPersonal = false">Cancel</button>
        </div>

        <div v-if="!isEditingPersonal" class="info-card">
          <div class="info-row">
            <span class="label">Full Name:</span>
            <span class="value">{{ authStore.user?.name }}</span>
          </div>
          <div class="info-row">
            <span class="label">Email Address:</span>
            <span class="value">{{ authStore.user?.email }}</span>
          </div>
          <div class="info-row">
            <span class="label">Primary Phone:</span>
            <span class="value">{{ authStore.user?.phone || 'Not provided' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Secondary Phone:</span>
            <span class="value">{{ authStore.user?.phoneSecondary || 'Not provided' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Date of Birth:</span>
            <span class="value">{{ authStore.user?.dob ? new Date(authStore.user.dob).toLocaleDateString() : 'Not provided' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Interests:</span>
            <span class="value">{{ authStore.user?.interests || 'Not provided' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Gender:</span>
            <span class="value">{{ authStore.user?.gender || 'Not provided' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Member Since:</span>
            <span class="value">{{ authStore.user?.joinedDate ? new Date(authStore.user.joinedDate).toLocaleDateString() : 'N/A' }}</span>
          </div>
        </div>

        <div v-else class="info-card">
          <form @submit.prevent="savePersonal">
            <div class="form-group">
              <label>Full Name</label>
              <input v-model="personalForm.name" required />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Primary Phone</label>
                <input v-model="personalForm.phone" placeholder="+91 XXXXX XXXXX" />
              </div>
              <div class="form-group">
                <label>Secondary Phone (Optional)</label>
                <input v-model="personalForm.phoneSecondary" placeholder="Alternate contact" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Date of Birth</label>
                <input v-model="personalForm.dob" type="date" />
              </div>
              <div class="form-group">
                <label>Gender</label>
                <select v-model="personalForm.gender" class="form-select">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Interests / Preferences</label>
              <input v-model="personalForm.interests" placeholder="e.g. Streetwear, Oversized, Cotton" />
            </div>
            <div class="form-actions mt-4">
              <button type="submit" class="btn primary-btn">Update Profile Details</button>
            </div>
          </form>
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

      <!-- History (Orders & Inquiries) -->
      <div v-if="activeTab === 'orders'" class="tab-pane">
        <div class="pane-header">
           <h2>Your History</h2>
           <p class="history-subtitle">Track your orders and bulk inquiries in one place.</p>
        </div>
        
        <div v-if="combinedHistory.length === 0" class="empty-state">
          <p>You haven't placed any orders or inquiries yet.</p>
          <RouterLink to="/shop" class="btn primary-btn">Start Shopping</RouterLink>
        </div>

        <div class="history-list" v-else>
          <div v-for="item in combinedHistory" :key="item.id || item.inquiryId" class="record-card" :class="item.type.toLowerCase()">
            <!-- Common Header -->
            <div class="record-header">
              <div class="record-badge" :class="item.type.toLowerCase()">
                 <Package v-if="item.type === 'ORDER'" size="14" />
                 <MessageSquare v-else size="14" />
                 <span>{{ item.type }}</span>
              </div>
              <span class="record-date">{{ new Date(item.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }}</span>
              <div class="record-status" :class="(item.status || 'pending').toLowerCase()">{{ item.status || 'Pending' }}</div>
            </div>

            <!-- Order Content -->
            <div v-if="item.type === 'ORDER'" class="record-body order-flavor">
               <div class="record-main">
                  <div class="record-img">
                     <img v-if="item.thumbnail" :src="productStore.resolveImageUrl(item.thumbnail)" alt="Thumbnail" />
                  </div>
                  <div class="record-details">
                     <h4 class="record-id">Order #{{ item.id }}</h4>
                     <p class="record-subtext">{{ item.item_names || 'Processing items...' }}</p>
                  </div>
               </div>
               <div class="record-meta-box">
                  <div class="meta-item">
                     <span class="meta-label">Total</span>
                     <span class="meta-value">{{ productStore.formatPrice(item.totalUSD || item.total) }}</span>
                  </div>
                  <RouterLink :to="'/order-success?id=' + item.id" class="record-action-btn">
                     Manage <ArrowUpRight size="14" />
                  </RouterLink>
               </div>
            </div>

            <!-- Inquiry Content -->
            <div v-else class="record-body inquiry-flavor">
               <div class="record-main">
                  <div class="record-icon-box">
                     <TrendingUp v-if="item.orderType === 'team'" size="20" />
                     <Building2 v-else size="20" />
                  </div>
                  <div class="record-details">
                     <h4 class="record-id">{{ item.orgName }}</h4>
                     <p class="record-subtext line-clamp-1">{{ item.orderType }} Inquiry &bull; {{ item.estimatedQty }} Units</p>
                     
                     <!-- Detailed Lead Info (Admin Style) -->
                     <div class="inquiry-details-grid mt-4">
                        <div class="detail-item">
                           <Building2 size="12" />
                           <span>{{ item.fullName }}</span>
                        </div>
                        <div class="detail-item">
                           <Phone size="12" />
                           <span>{{ item.phone }}</span>
                        </div>
                     </div>
                     <p class="record-message mt-3">"{{ item.message }}"</p>
                  </div>
               </div>
               <div class="record-meta-box">
                  <div class="meta-item">
                     <span class="meta-label">Inquiry ID</span>
                     <span class="meta-value">#{{ (item.inquiryId || '').slice(0, 8) }}</span>
                  </div>
                  <div class="record-action-btn disabled">
                     Lead Analysis <Clock size="14" />
                  </div>
               </div>
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
  grid-template-columns: 280px 1fr;
  gap: 40px;
  padding: 60px 20px;
  min-height: 70vh;
}

@media (max-width: 992px) {
  .profile-view {
    grid-template-columns: 1fr;
    gap: 30px;
    padding: 30px 15px;
  }
}

.profile-sidebar {
  padding-right: 0;
}

@media (min-width: 993px) {
  .profile-sidebar {
    border-right: 1px solid #eee;
    padding-right: 30px;
  }
}

.user-info {
  text-align: center;
  margin-bottom: 40px;
}

.avatar-container {
  width: 80px;
  height: 80px;
  background: #000;
  color: #fff;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 auto 15px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border: 2px solid #fff;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
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

@media (max-width: 992px) {
  .profile-nav {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 15px;
    -webkit-overflow-scrolling: touch;
  }
  .profile-nav::-webkit-scrollbar { display: none; }
  .profile-nav button {
    white-space: nowrap;
    border: 1px solid #eee;
  }
  .logout-btn { margin-top: 0 !important; }
}

.profile-nav button:hover, .profile-nav button.active {
  background: #f5f5f5;
  color: #000;
  font-weight: 600;
}

/* Mobile Hub Styling */
.mobile-hub-container {
  padding: 10px 5px;
}

.mobile-profile-header {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 20px;
  margin-bottom: 25px;
}

.avatar-small {
  width: 50px;
  height: 50px;
  background: #000;
  color: #fff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.2rem;
  overflow: hidden;
}

.avatar-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-text h2 {
  font-size: 1.1rem;
  font-weight: 800;
  margin: 0;
  border: none;
  padding: 0;
}

.header-text p {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
}

.mobile-menu-list {
  display: flex;
  flex-direction: column;
}

.mobile-menu-item.logout {
  margin-top: 20px;
  border-top: 1px solid #f1f5f9;
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

@media (max-width: 768px) {
  .tab-pane h2 {
    font-size: 1.4rem;
    margin-bottom: 20px;
  }
}

.info-card {
  background: #fff;
  border: 1px solid #eee;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.02);
  margin-bottom: 30px;
}

@media (max-width: 768px) {
  .info-card {
    padding: 20px;
  }
}

.info-row {
  display: flex;
  margin-bottom: 20px;
  font-size: 1.05rem;
  border-bottom: 1px solid #f8fafc;
  padding-bottom: 12px;
}

@media (max-width: 768px) {
  .info-row {
    flex-direction: column;
    gap: 4px;
    margin-bottom: 15px;
  }
}

.info-row .label {
  width: 150px;
  color: #64748b;
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

@media (max-width: 768px) {
  .info-row .label {
    width: 100%;
    font-size: 0.75rem;
  }
  .info-row .value {
    font-weight: 600;
    color: #1e293b;
    font-size: 0.95rem;
  }
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
  gap: 15px;
}

@media (max-width: 768px) {
  .pane-header .btn {
    padding: 8px 12px;
    font-size: 0.8rem;
    white-space: nowrap;
  }
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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

@media (max-width: 768px) {
  .address-grid {
    gap: 15px;
  }
  .address-card {
    padding: 20px;
  }
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

/* History & Records */
.history-subtitle {
  font-size: 0.9rem;
  color: #666;
  margin-top: -20px;
  margin-bottom: 20px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 25px;
  margin-bottom: 60px;
}

.record-card {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.record-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  border-color: #e5e7eb;
}

.record-header {
  padding: 12px 20px;
  background: #fafafb;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@media (max-width: 768px) {
  .record-header {
    padding: 10px 15px;
  }
}

.record-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 100px;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.record-badge.order {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.record-badge.inquiry {
  background: #fff7ed;
  color: #c2410c;
  border: 1px solid #ffedd5;
}

.record-date {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
}

.record-status {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.record-status.new, .record-status.processing { color: #3b82f6; }
.record-status.shipped, .record-status.in\ progress { color: #f59e0b; }
.record-status.delivered, .record-status.completed { color: #10b981; }

.record-body {
  padding: 25px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
}

.record-main {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
}

.record-img {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  overflow: hidden;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
}

.record-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.record-icon-box {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: #000;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.record-details .record-id {
  font-size: 16px;
  font-weight: 800;
  margin: 0 0 4px 0;
  color: #1e293b;
  text-transform: uppercase;
  letter-spacing: -0.02em;
}

.record-subtext {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  margin: 0;
}

.record-meta-box {
  display: flex;
  align-items: center;
  gap: 40px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.meta-label {
  font-size: 9px;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 4px;
}

.meta-value {
  font-size: 14px;
  font-weight: 800;
  color: #1e293b;
}

.record-action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #000;
  color: #fff;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s;
}

.record-message {
  font-size: 13px;
  line-height: 1.6;
  color: #475569;
  background: #f8fafc;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  font-style: italic;
}

.inquiry-details-grid {
  display: flex;
  gap: 20px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.record-action-btn:hover {
  background: #334155;
  transform: translateX(4px);
}

.record-action-btn.disabled {
  background: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
  pointer-events: none;
  border: 1px solid #e2e8f0;
}

@media (max-width: 768px) {
  .record-body {
    flex-direction: column;
    align-items: flex-start;
    padding: 15px;
    gap: 15px;
  }
  .record-meta-box {
    width: 100%;
    justify-content: space-between;
    padding-top: 15px;
    border-top: 1px solid #f1f5f9;
    gap: 10px;
  }
  .record-main {
    gap: 15px;
  }
  .record-img {
    width: 50px;
    height: 50px;
  }
  .record-details .record-id {
    font-size: 14px;
  }
  .meta-value {
    font-size: 13px;
  }
  .record-action-btn {
    padding: 8px 15px;
    font-size: 11px;
  }
}
</style>
