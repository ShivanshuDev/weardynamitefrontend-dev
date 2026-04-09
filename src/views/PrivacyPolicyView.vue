<script setup>
import { useProductStore } from '../stores/productStore'

const productStore = useProductStore()
</script>

<template>
  <div class="policy-view container">
    <div class="policy-card">
      <h1>{{ productStore.siteContent.policies.privacy.pageTitle }}</h1>
      <div class="policy-content">
        <p>{{ productStore.siteContent.policies.privacy.content }}</p>
        
        <p>At Wear Dynamite, we are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.</p>
        
        <h2>Information We Collect</h2>
        <p>When you visit our website, and more generally, use any of our services, we appreciate that you are trusting us with your personal information. We take your privacy very seriously. In this privacy notice, we seek to explain to you in the clearest way possible what information we collect, how we use it and what rights you have in relation to it.</p>
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
