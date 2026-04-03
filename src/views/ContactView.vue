<script setup>
import { Mail, Phone, MapPin, CheckCircle } from 'lucide-vue-next'
import { useProductStore } from '../stores/productStore'
import { ref } from 'vue'

const productStore = useProductStore()
const content = productStore.siteContent.contact

const form = ref({ name: '', mobile: '', email: '', message: '' })
const submitted = ref(false)

const handleSubmit = () => {
  productStore.inquiries.push({
    ...form.value,
    id: Date.now(),
    status: 'New',
    date: new Date().toLocaleString()
  })
  submitted.value = true
  form.value = { name: '', mobile: '', email: '', message: '' }
  setTimeout(() => submitted.value = false, 5000)
}
</script>

<template>
  <div class="contact-view container">
    <div class="contact-header">
      <h1 class="page-title">{{ content.title }}</h1>
      <p class="subtitle">{{ content.subtitle }}</p>
    </div>

    <div class="contact-content grid grid-2">
      <div class="contact-info-form">
        <div class="contact-details">
          <div class="detail-item">
            <Phone class="icon" />
            <div>
              <h3>Director Contacts</h3>
              <p v-for="phone in content.direct.phone" :key="phone">{{ phone }}</p>
            </div>
          </div>
          <div class="detail-item">
            <Mail class="icon" />
            <div>
              <h3>Email Address</h3>
              <p>{{ content.direct.email }}</p>
            </div>
          </div>
        </div>

        <form v-if="!submitted" class="contact-form" @submit.prevent="handleSubmit">
          <h3>Send us a message</h3>
          <div class="form-group">
            <label for="name">Name</label>
            <input v-model="form.name" type="text" id="name" required placeholder="Your Name" />
          </div>
          <div class="form-group">
            <label for="mobile">Mobile Number</label>
            <input v-model="form.mobile" type="tel" id="mobile" required placeholder="Your Mobile Number" />
          </div>
          <div class="form-group">
            <label for="email">Email Address</label>
            <input v-model="form.email" type="email" id="email" required placeholder="Your Email Address" />
          </div>
          <div class="form-group">
            <label for="message">Message</label>
            <textarea v-model="form.message" id="message" rows="5" required placeholder="How can we help you?"></textarea>
          </div>
          <button type="submit" class="btn submit-btn">Send Message</button>
        </form>
        <div v-else class="contact-success">
          <CheckCircle :size="48" color="var(--primary-color)" />
          <h3>Message Sent!</h3>
          <p>We'll get back to you shortly.</p>
        </div>
      </div>

      <div class="contact-map">
        <iframe 
          :src="content.mapUrl" 
          width="100%" 
          height="100%" 
          style="border:0; min-height: 450px;" 
          allowfullscreen="" 
          loading="lazy" 
          referrerpolicy="no-referrer-when-downgrade">
        </iframe>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contact-view {
  padding: 60px 20px;
}

.contact-header {
  text-align: center;
  margin-bottom: 50px;
}

.page-title {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
}

.contact-content {
  gap: 60px;
  align-items: flex-start;
}

.contact-details {
  display: flex;
  flex-direction: column;
  gap: 30px;
  margin-bottom: 40px;
}

.detail-item {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.icon {
  color: var(--primary-color);
  margin-top: 5px;
}

.detail-item h3 {
  font-size: 1.1rem;
  margin-bottom: 5px;
}

.detail-item p {
  color: #555;
}

.contact-form {
  background: #f9f9f9;
  padding: 40px;
  border-radius: 8px;
}

.contact-form h3 {
  margin-bottom: 25px;
  font-size: 1.5rem;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 0.9rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.95rem;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #000;
}

.submit-btn {
  width: 100%;
  margin-top: 10px;
}

.contact-map {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

@media (max-width: 992px) {
  .contact-content {
    grid-template-columns: 1fr;
  }
  
  .contact-map iframe {
    min-height: 400px;
  }
}
</style>
