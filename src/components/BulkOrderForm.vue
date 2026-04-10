<script setup>
import { ref } from 'vue'
import api from '../utils/api'
import { 
  Send, 
  CheckCircle2, 
  Users, 
  Trophy, 
  School, 
  Briefcase, 
  ChevronRight,
  ArrowLeft
} from 'lucide-vue-next'

const emit = defineEmits(['close'])

const loading = ref(false)
const submitted = ref(false)

const form = ref({
  fullName: '',
  orgName: '',
  email: '',
  phone: '',
  orderType: '',
  estimatedQty: '',
  message: ''
})

const orderTypes = [
  { id: 'team', label: 'Cricket/Sports Team', icon: Trophy, desc: 'Professional jerseys and kit' },
  { id: 'corporate', label: 'Office/Corporate', icon: Briefcase, desc: 'Premium workwear & uniforms' },
  { id: 'school', label: 'School/College', icon: School, desc: 'Uniforms & event hoodies' },
  { id: 'other', label: 'Events/Others', icon: Users, desc: 'Custom merch for large groups' }
]

const handleSubmit = async () => {
  loading.value = true
  try {
    const payload = {
      ...form.value,
      type: 'bulk_order',
      subject: `Bulk Order Inquiry: ${form.value.orderType} - ${form.value.orgName}`
    }

    const response = await api.post('/inquiries', payload)

    if (response.status === 201 || response.status === 200) {
      submitted.value = true
    } else {
      alert('Something went wrong. Please try again.')
    }
  } catch (error) {
    console.error('Error submitting inquiry:', error)
    alert('Failed to connect to server. Please check your internet or try again later.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="bulk-order-container">
    <div v-if="!submitted" class="bulk-form-wrapper">
      <div class="form-header">
        <div class="header-content">
          <h2 class="form-title">Elevate Your Team</h2>
          <p class="form-subtitle">Customized high-performance apparel for organizations, teams, and institutions.</p>
        </div>
        <button @click="emit('close')" class="btn-back">
          <ArrowLeft :size="16" /> Back to Shop
        </button>
      </div>

      <div class="form-grid">
        <!-- Left Side: Selection -->
        <div class="types-selection">
          <h3 class="section-label">1. Select Your Category</h3>
          <div class="types-grid">
            <div 
              v-for="type in orderTypes" 
              :key="type.id"
              class="type-card"
              :class="{ active: form.orderType === type.id }"
              @click="form.orderType = type.id"
            >
              <div class="type-icon">
                <component :is="type.icon" :size="24" />
              </div>
              <div class="type-info">
                <h4>{{ type.label }}</h4>
                <p>{{ type.desc }}</p>
              </div>
              <div class="active-dot"></div>
            </div>
          </div>
        </div>

        <!-- Right Side: Details -->
        <div class="details-form">
          <h3 class="section-label">2. Your Information</h3>
          <form @submit.prevent="handleSubmit" class="main-form">
            <div class="input-row">
              <div class="input-group">
                <label>Full Name</label>
                <input v-model="form.fullName" type="text" placeholder="e.g. Rahul Sharma" required />
              </div>
              <div class="input-group">
                <label>Organization / Team Name</label>
                <input v-model="form.orgName" type="text" placeholder="e.g. Dynamite Cricket Club" required />
              </div>
            </div>

            <div class="input-row">
              <div class="input-group">
                <label>Email Address</label>
                <input v-model="form.email" type="email" placeholder="rahul@example.com" required />
              </div>
              <div class="input-group">
                <label>Phone / WhatsApp</label>
                <input v-model="form.phone" type="tel" placeholder="+91 XXXXX XXXXX" required />
              </div>
            </div>

            <div class="input-row">
              <div class="input-group">
                <label>Estimated Quantity</label>
                <input v-model="form.estimatedQty" type="number" placeholder="Min. 20 units recommended" required />
              </div>
            </div>

            <div class="input-group">
              <label>Specific Requirements</label>
              <textarea 
                v-model="form.message" 
                rows="4" 
                placeholder="Tell us about color themes, logo placements, or specific fabric requirements..."
                required
              ></textarea>
            </div>

            <button type="submit" class="submit-btn" :disabled="loading || !form.orderType">
              <span v-if="!loading">Send Bulk Inquiry <Send :size="18" /></span>
              <span v-else class="loader"></span>
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Success State -->
    <div v-else class="success-state">
      <div class="success-content">
        <div class="success-icon">
          <CheckCircle2 :size="64" />
        </div>
        <h2>Inquiry Received!</h2>
        <p>Thank you for choosing WearDynamite. Our bulk order specialists will analyze your requirements and contact you within 24 hours.</p>
        <button @click="emit('close')" class="btn-primary">
          Back to Shop <ChevronRight :size="18" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bulk-order-container {
  animation: fadeIn 0.4s ease-out;
  padding: 20px 0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40px;
}

.form-title {
  font-size: 32px;
  font-weight: 900;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.form-subtitle {
  color: #64748b;
  font-weight: 500;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f1f5f9;
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #e2e8f0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 50px;
}

.section-label {
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #94a3b8;
  margin-bottom: 24px;
}

/* Category Selection */
.types-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.type-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.type-card:hover {
  border-color: #000;
  transform: translateX(10px);
}

.type-card.active {
  border-color: #000;
  background: #000;
  color: #fff;
}

.type-icon {
  width: 50px;
  height: 50px;
  background: #f8fafc;
  color: #000;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.type-card.active .type-icon {
  background: rgba(255,255,255,0.1);
  color: #fff;
}

.type-info h4 {
  font-size: 16px;
  font-weight: 800;
  margin-bottom: 4px;
}

.type-info p {
  font-size: 13px;
  color: #64748b;
}

.type-card.active .type-info p {
  color: rgba(255,255,255,0.6);
}

.active-dot {
  position: absolute;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fff;
  opacity: 0;
  transition: all 0.3s;
}

.type-card.active .active-dot {
  opacity: 1;
}

/* Main Form */
.main-form {
  background: #fff;
  padding: 40px;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  box-shadow: 0 4px 30px rgba(0,0,0,0.03);
}

.input-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
}

.input-group label {
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #475569;
}

.input-group input, 
.input-group textarea {
  padding: 14px 18px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  font-size: 15px;
  font-family: inherit;
  transition: all 0.2s;
}

.input-group input:focus, 
.input-group textarea:focus {
  outline: none;
  border-color: #000;
  box-shadow: 0 0 0 4px rgba(0,0,0,0.05);
}

.submit-btn {
  width: 100%;
  background: #000;
  color: #fff;
  padding: 20px;
  border-radius: 16px;
  border: none;
  font-size: 14px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s;
  margin-top: 10px;
}

.submit-btn:hover:not(:disabled) {
  background: #1e293b;
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}

.submit-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  opacity: 0.7;
}

/* Success State */
.success-state {
  text-align: center;
  padding: 100px 20px;
  background: #fff;
  border-radius: 30px;
  border: 1px solid #e2e8f0;
}

.success-icon {
  width: 100px;
  height: 100px;
  background: #ecfdf5;
  color: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 30px;
}

.success-content h2 {
  font-size: 32px;
  font-weight: 900;
  margin-bottom: 16px;
}

.success-content p {
  color: #64748b;
  max-width: 500px;
  margin: 0 auto 40px;
  line-height: 1.6;
}

.btn-primary {
  background: #000;
  color: #fff;
  padding: 18px 36px;
  border-radius: 16px;
  border: none;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 auto;
}

@media (max-width: 1024px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}

@media (max-width: 640px) {
  .input-row {
    grid-template-columns: 1fr;
  }
  .form-header {
    flex-direction: column;
    gap: 20px;
  }
  .main-form {
    padding: 24px;
  }
}

.loader {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
