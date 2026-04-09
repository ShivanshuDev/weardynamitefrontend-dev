<script setup>
import { useProductStore } from '../stores/productStore'
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-vue-next'
import { ref } from 'vue'

const productStore = useProductStore()
const openIdx = ref(0)
</script>

<template>
  <div class="faq-view container">
    <header class="section-header">
      <h1 class="page-title">{{ productStore.siteContent.policies.faq.pageTitle }}</h1>
      <p class="subtitle">Everything you need to know about customize, shipping, and returns.</p>
    </header>

    <div class="faq-list">
      <div 
        v-for="(item, idx) in productStore.siteContent.policies.faq.items" 
        :key="idx"
        class="faq-item"
        :class="{ active: openIdx === idx }"
        @click="openIdx = openIdx === idx ? -1 : idx"
      >
        <div class="faq-question">
          <h3>{{ item.q }}</h3>
          <ChevronDown v-if="openIdx !== idx" :size="20" />
          <ChevronUp v-else :size="20" />
        </div>
        <div v-show="openIdx === idx" class="faq-answer">
          <p>{{ item.a }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.faq-view {
  padding: 80px 20px;
  max-width: 800px !important;
}
.section-header {
  text-align: center;
  margin-bottom: 60px;
}
.page-title {
  font-size: 2.5rem;
  margin-bottom: 10px;
}
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.faq-item {
  background: #f9f9f9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #eee;
}
.faq-item.active {
  background: #fff;
  border-color: #000;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}
.faq-question {
  padding: 25px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.faq-question h3 {
  font-size: 1.1rem;
  margin: 0;
}
.faq-answer {
  padding: 0 30px 25px 30px;
  color: #666;
  line-height: 1.6;
}
</style>
