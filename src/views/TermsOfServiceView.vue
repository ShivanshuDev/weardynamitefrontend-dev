<script setup>
import { useProductStore } from '../stores/productStore'

const productStore = useProductStore()
</script>

<template>
  <div class="policy-view container">
    <div class="policy-card">
      <div class="policy-hero">
        <span class="effective-date" v-if="productStore.siteContent.policies.terms.lastUpdated">Effective Date: {{ productStore.siteContent.policies.terms.lastUpdated }}</span>
        <h1>{{ productStore.siteContent.policies.terms.pageTitle }}</h1>
        <p class="subtitle" v-if="productStore.siteContent.policies.terms.subtitle">{{ productStore.siteContent.policies.terms.subtitle }}</p>
      </div>

      <div class="policy-content">
        <section v-for="(item, idx) in productStore.siteContent.policies.terms.items" :key="idx" class="terms-section">
          <h2>{{ item.title }}</h2>
          <p>{{ item.content }}</p>
        </section>
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
  font-size: 3.5rem;
  margin: 10px 0 20px;
  font-family: var(--font-heading);
  letter-spacing: -2px;
}
.policy-hero {
  text-align: center;
  margin-bottom: 60px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 40px;
}
.effective-date {
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 3px;
  color: #6366f1;
}
.subtitle {
  font-size: 1.25rem;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto;
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
.main-content {
  font-weight: 600;
  color: #000;
}
.terms-section {
  margin-top: 40px;
}
</style>
