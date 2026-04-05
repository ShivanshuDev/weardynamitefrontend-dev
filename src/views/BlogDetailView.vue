<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '../stores/productStore'
import { Calendar, User, ArrowLeft, Clock } from 'lucide-vue-next'
import '../assets/blog-style.css'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const blog = ref(null)
const isLoading = ref(true)

onMounted(async () => {
  try {
    // If we don't have blogs, fetch them
    if (productStore.blogs.length === 0) {
      await productStore.fetchBlogs()
    }
    
    const found = productStore.blogs.find(b => String(b.id) === String(route.params.id))
    if (found) {
      blog.value = found
    }
  } catch (err) {
    console.error('Failed to load blog:', err)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="blog-design-root">
    <div class="container py-20">
      <button @click="router.back()" class="back-link mb-8">
        <ArrowLeft :size="16" /> Back to Stories
      </button>

      <div v-if="isLoading" class="loading-state">
         <div class="spinner"><Clock size="40"/></div>
         <p>Unfolding the narrative...</p>
      </div>

      <article v-else-if="blog" class="article-detail">
        <header class="blog-hero">
           <div class="card-meta mb-4">
              <span><Calendar :size="14" /> {{ blog.date }}</span>
              <span><User :size="14" /> BY {{ blog.author }}</span>
           </div>
           <h1>{{ blog.title }}</h1>
           <div class="accent-line"></div>
        </header>

        <div class="card-image mb-12">
           <img :src="blog.image" :alt="blog.title" />
        </div>

        <div class="article-content" v-html="blog.content"></div>
        
        <footer class="mt-20 pt-10 border-t border-slate-100">
           <div class="tag-cloud" v-if="blog.tags?.length">
              <span v-for="tag in blog.tags" :key="tag" class="tag-btn">{{ tag }}</span>
           </div>
        </footer>
      </article>

      <div v-else class="empty-state">
         <p>This story has not been published yet.</p>
         <router-link to="/blog" class="btn mt-4">Return to Archive</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.py-20 { padding-top: 5rem; padding-bottom: 5rem; }
.back-link {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #64748b;
  transition: color 0.3s;
}
.back-link:hover { color: #000; }

.loading-state, .empty-state {
  padding: 10rem 0;
  text-align: center;
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
.spinner {
  animation: spin 2s linear infinite;
  margin-bottom: 1rem;
}
@keyframes spin { from {transform: rotate(0deg);} to {transform: rotate(360deg);} }

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.tag-btn {
  padding: 6px 12px;
  font-size: 8px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  background: #f8fafc;
  color: #64748b;
  border-radius: 2px;
}
</style>
