<script setup>
import { ref } from 'vue'
import { Instagram, Facebook, Twitter, Mail, Send, CheckCircle, Info, User, Phone } from 'lucide-vue-next'
import api from '../utils/api'

const form = ref({
  name: '',
  email: '',
  phone: ''
})
const status = ref('idle') // idle | loading | success | exists | error
const message = ref('')

const handleSubscribe = async () => {
  if (!form.value.email) return
  
  status.value = 'loading'
  try {
    const response = await api.post('/subscriptions/subscribe', form.value)
    status.value = 'success'
    message.value = response.data.message
  } catch (error) {
    if (error.response && error.response.status === 409) {
      status.value = 'exists'
      message.value = error.response.data.message
    } else {
      status.value = 'error'
      message.value = 'System reachability issue. Please try later.'
    }
  }
}
</script>

<template>
  <footer class="footer">
    <div class="container footer-content grid grid-4">
      <div class="footer-col">
        <h3 class="footer-logo">WEARDYNAMITE</h3>
        <p>Premium apparel for the modern individual. T-shirts, shoes, jerseys, and more.</p>
        <div class="social-links">
          <a href="#"><Instagram :size="20" /></a>
          <a href="#"><Facebook :size="20" /></a>
          <a href="#"><Twitter :size="20" /></a>
        </div>
      </div>

      <div class="footer-col">
        <h4>Support</h4>
        <ul>
          <li><RouterLink to="/blog">Blog & Stories</RouterLink></li>
          <li><RouterLink to="/faq">FAQ</RouterLink></li>
          <li><RouterLink to="/shipping-returns">Shipping & Returns</RouterLink></li>
          <li><RouterLink to="/privacy-policy">Privacy Policy</RouterLink></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Legal</h4>
        <ul>
          <li><RouterLink to="/about">About Us</RouterLink></li>
          <li><RouterLink to="/contact">Contact Us</RouterLink></li>
          <li><RouterLink to="/terms">Terms of Service</RouterLink></li>
        </ul>
      </div>

      <div class="footer-col subscribe-col">
        <h4>Join The Dynamite Club</h4>
        <p class="subscribe-text">Enjoy early access to drops and exclusive VIP offers.</p>
        
        <div v-if="status === 'idle' || status === 'loading' || status === 'error'" class="subscribe-form-wrapper">
          <form @submit.prevent="handleSubscribe" class="subscribe-form-v2">
            <div class="input-group">
                <User :size="14" class="input-icon" />
                <input v-model="form.name" type="text" placeholder="Full Name (Optional)" class="v2-input" />
            </div>
            <div class="input-group">
                <Phone :size="14" class="input-icon" />
                <input v-model="form.phone" type="tel" placeholder="Mobile (Optional)" class="v2-input" />
            </div>
            <div class="input-group mandatory">
                <Mail :size="14" class="input-icon" />
                <input v-model="form.email" type="email" placeholder="your@email.com" required class="v2-input" />
            </div>
            
            <button type="submit" :disabled="status === 'loading'" class="subscribe-submit-btn">
              <span v-if="status === 'loading'">Processing...</span>
              <span v-else>Subscribe Now</span>
              <Send v-if="status !== 'loading'" :size="16" />
            </button>
          </form>
          <p v-if="status === 'error'" class="status-msg error">{{ message }}</p>
        </div>

        <div v-else-if="status === 'success'" class="subscribe-status success">
          <CheckCircle :size="24" class="status-icon" />
          <div>
            <h5>Welcome to the Club</h5>
            <p>{{ message }}</p>
          </div>
        </div>

        <div v-else-if="status === 'exists'" class="subscribe-status exists">
          <Info :size="24" class="status-icon" />
          <div>
            <h5>Identity Match</h5>
            <p>{{ message }}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="container footer-bottom">
      <p>&copy; 2026 WEARDYNAMITE. All rights reserved.</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: var(--primary-color);
  color: var(--secondary-color);
  padding: 80px 0 20px;
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.footer-content {
  margin-bottom: 60px;
  gap: 40px;
}

.footer-logo {
  font-size: 1.4rem;
  font-weight: 900;
  font-style: italic;
  letter-spacing: -0.05em;
  margin-bottom: 20px;
  color: #fff;
}

.footer-col h4 {
  color: #fff;
  margin-bottom: 24px;
  text-transform: uppercase;
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.2em;
}

.footer-col p {
  font-size: 0.85rem;
  opacity: 0.6;
  line-height: 1.6;
  margin-bottom: 24px;
}

.footer-col ul li {
  margin-bottom: 12px;
  font-size: 0.85rem;
  opacity: 0.6;
  transition: all 0.3s;
}

.footer-col ul li:hover {
  opacity: 1;
  transform: translateX(5px);
}

.social-links {
  display: flex;
  gap: 20px;
}

.social-links a {
  opacity: 0.6;
  transition: all 0.3s;
}

.social-links a:hover {
  opacity: 1;
  transform: translateY(-3px);
  color: #3b82f6;
}

/* Subscribe Section V2 */
.subscribe-col {
  min-width: 320px;
}

.subscribe-text {
  font-size: 0.8rem !important;
  margin-bottom: 24px !important;
}

.subscribe-form-v2 {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  transition: all 0.3s;
}

.input-group:focus-within {
  background: rgba(255, 255, 255, 0.06);
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.1);
}

.input-group.mandatory {
  border-left: 2px solid #3b82f6;
}

.input-icon {
  margin-left: 14px;
  opacity: 0.3;
  color: #fff;
}

.input-group:focus-within .input-icon {
  opacity: 1;
  color: #3b82f6;
}

.v2-input {
  width: 100%;
  background: transparent;
  border: none;
  color: #fff;
  padding: 12px 14px;
  font-size: 0.85rem;
  outline: none;
}

.v2-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.subscribe-submit-btn {
  background: #3b82f6;
  color: #fff;
  border-radius: 6px;
  padding: 14px;
  font-size: 0.85rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 8px;
  transition: all 0.3s;
}

.subscribe-submit-btn:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.subscribe-submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.status-msg {
  font-size: 0.75rem;
  margin-top: 10px;
  font-weight: 600;
}

.status-msg.error { color: #f87171; }

.subscribe-status {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 24px;
  background: rgba(59, 130, 246, 0.04);
  border: 1px dashed rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  animation: fadeIn 0.5s ease;
}

.subscribe-status.exists {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.1);
}

.status-icon {
  color: #3b82f6;
  flex-shrink: 0;
}

.subscribe-status.exists .status-icon {
  color: #94a3b8;
}

.subscribe-status h5 {
  font-size: 0.9rem;
  font-weight: 900;
  text-transform: uppercase;
  margin-bottom: 4px;
  color: #fff;
}

.subscribe-status p {
  font-size: 0.75rem;
  margin-bottom: 0 !important;
  opacity: 0.7;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 30px;
  text-align: center;
  font-size: 0.75rem;
  opacity: 0.4;
  font-weight: 500;
}

@media (max-width: 1024px) {
  .footer-content {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .social-links { justify-content: center; }
  .subscribe-form { max-width: 400px; margin: 0 auto; }
}
</style>
