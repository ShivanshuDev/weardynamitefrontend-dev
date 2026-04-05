<script setup>
import { ref, onMounted, computed } from 'vue'
import { useProductStore } from '../stores/productStore'
import { Calendar, Search, ChevronDown, ChevronRight, Hash, Clock, ArrowRight } from 'lucide-vue-next'
import '../assets/blog-style.css'

const productStore = useProductStore()
const searchQuery = ref('')
const expandedYears = ref({})
const selectedYear = ref(null)
const selectedMonth = ref(null)
const selectedTag = ref(null)

onMounted(() => {
  productStore.fetchBlogs()
})

const toggleYear = (year) => {
  expandedYears.value[year] = !expandedYears.value[year]
}

// Grouping Logic for the Sidebar
const archiveData = computed(() => {
  const groups = {}
  productStore.blogs.forEach(blog => {
    const date = new Date(blog.date)
    const year = date.getFullYear()
    const month = date.toLocaleString('default', { month: 'long' })
    
    if (!groups[year]) groups[year] = {}
    if (!groups[year][month]) groups[year][month] = 0
    groups[year][month]++
  })
  return groups
})

const tags = computed(() => {
  const allTags = productStore.blogs.flatMap(b => b.tags || [])
  return [...new Set(allTags)]
})

const filteredBlogs = computed(() => {
  let result = productStore.blogs
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(b => b.title.toLowerCase().includes(q) || b.content?.toLowerCase().includes(q))
  }
  
  if (selectedYear.value) {
    result = result.filter(b => new Date(b.date).getFullYear() === selectedYear.value)
  }
  
  if (selectedMonth.value) {
    result = result.filter(b => new Date(b.date).toLocaleString('default', { month: 'long' }) === selectedMonth.value)
  }

  if (selectedTag.value) {
    result = result.filter(b => b.tags?.includes(selectedTag.value))
  }
  
  return result
})

const clearFilters = () => {
  selectedYear.value = null
  selectedMonth.value = null
  selectedTag.value = null
}
</script>

<template>
  <div class="blog-design-root">
    <div class="container py-20">
      <!-- Hero Section -->
      <header class="blog-hero">
         <h1>Dynamite Stories</h1>
         <div class="accent-line"></div>
         <p class="subtitle">Insights into high-performance fashion, artisan craftsmanship, and the modern individualist lifestyle.</p>
      </header>

      <div class="blog-layout">
        <!-- Main Content (80%) -->
        <main class="blog-main">
          <div v-if="productStore.blogLoading" class="loading-state">
             <div class="spinner"><Clock size="40"/></div>
             <p>Syncing with brand archives...</p>
          </div>

          <div v-else-if="filteredBlogs.length === 0" class="empty-state">
             <p>No narratives found in this timeline</p>
             <button @click="clearFilters" class="btn mt-4">Reset Archive</button>
          </div>

          <div v-else class="grid grid-3">
            <article v-for="blog in filteredBlogs" :key="blog.id" class="blog-card">
              <div class="card-image">
                 <img :src="blog.image" :alt="blog.title" />
                 <div class="author-badge">{{ blog.author }}</div>
              </div>
              
              <div class="card-meta">
                 <span><Calendar :size="14" /> {{ blog.date }}</span>
                 <span v-if="blog.tags?.length"><Hash :size="14" /> {{ blog.tags[0] }}</span>
              </div>

              <h2>{{ blog.title?.length > 25 ? blog.title.substring(0, 25) + '...' : blog.title }}</h2>
              
              <p class="excerpt">
                {{ blog.content?.replace(/<[^>]*>/g, '').substring(0, 60) }}...
              </p>

              <router-link :to="'/blog/' + blog.id" class="read-link">
                 Dive Deep <ArrowRight :size="16" />
              </router-link>
            </article>
          </div>
        </main>

        <!-- Sidebar (20%) -->
        <aside class="blog-sidebar">
          <!-- Search -->
          <div class="sidebar-widget">
            <h3 class="sidebar-heading">Intelligence Search</h3>
            <div class="search-field">
               <Search class="search-icon" :size="18" />
               <input v-model="searchQuery" type="text" placeholder="Explore archive..." />
            </div>
          </div>

          <!-- Archive Tree -->
          <div class="sidebar-widget">
            <h3 class="sidebar-heading">Historical Archive</h3>
            <div class="archive-tree">
               <div v-for="(months, year) in archiveData" :key="year" class="year-node">
                  <button @click="toggleYear(year)">
                     {{ year }}
                     <ChevronRight v-if="!expandedYears[year]" :size="14" />
                     <ChevronDown v-else :size="14" />
                  </button>
                  
                  <div v-if="expandedYears[year]" class="month-list">
                     <button 
                       v-for="(count, month) in months" 
                       :key="month"
                       @click="selectedMonth = selectedMonth === month ? null : month; selectedYear = selectedMonth ? year : null"
                       :class="{ active: selectedMonth === month }"
                       class="month-item"
                     >
                        {{ month }} <span>({{ count }})</span>
                     </button>
                  </div>
               </div>
            </div>
          </div>

          <!-- Tags Cloud -->
          <div v-if="tags.length" class="sidebar-widget">
            <h3 class="sidebar-heading">Narrative Tags</h3>
            <div class="tag-cloud">
               <button 
                 v-for="tag in tags" 
                 :key="tag"
                 @click="selectedTag = selectedTag === tag ? null : tag"
                 :class="{ active: selectedTag === tag }"
                 class="tag-btn"
               >
                  {{ tag }}
               </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.py-20 { padding-top: 5rem; padding-bottom: 5rem; }
.loading-state, .empty-state {
  padding: 5rem 0;
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
  transition: all 0.3s;
}
.tag-btn.active {
  background: #000;
  color: #fff;
}
.tag-btn:hover:not(.active) {
  background: #f1f5f9;
}
</style>
