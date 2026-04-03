<script setup>
import { useProductStore } from '../stores/productStore'

const productStore = useProductStore()
</script>

<template>
  <div class="policy-view container">
    <div class="policy-card">
      <h1>Shipping & Returns</h1>
      <div class="policy-content">
        <h2>Our Shipping Process</h2>
        <p>{{ productStore.siteContent.policies.shipping }}</p>
        
        <h2>Return & Refund Policy</h2>
        <p>{{ productStore.siteContent.policies.returns }}</p>
        
        <p>For any queries, please contact our support team at {{ productStore.siteContent.contact.direct.email }}.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.policy-view {
  padding: 80px 20px;
  max-width: 900px !important;
}
.policy-card {
  background: #fff;
  padding: 60px;
  border-radius: 12px;
  box-shadow: 0 10px 50px rgba(0,0,0,0.05);
}
h1 {
  font-size: 3rem;
  margin-bottom: 40px;
  font-family: var(--font-heading);
}
h2 {
  font-size: 1.5rem;
  margin-top: 40px;
  margin-bottom: 20px;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}
p {
  color: #555;
  line-height: 1.8;
  font-size: 1.1rem;
  margin-bottom: 20px;
}
</style>
