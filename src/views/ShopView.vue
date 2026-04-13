<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProductStore } from '../stores/productStore'
import ProductCard from '../components/ProductCard.vue'
import BulkOrderForm from '../components/BulkOrderForm.vue'
import { Filter, X, ChevronDown, ChevronRight, PackageCheck } from 'lucide-vue-next'
import { PRODUCT_TAXONOMY, GENDERS } from '../data/categories'

const route = useRoute()
const productStore = useProductStore()

// Bulk Order Toggle
const showBulkOrder = ref(route.query.view === 'bulk')
const toggleBulkOrder = () => {
  showBulkOrder.value = !showBulkOrder.value
}

onMounted(() => {
  productStore.fetchProducts()
  // Sync initial filters from URL
  if (Object.keys(route.query).length > 0) {
    productStore.syncFiltersFromURL(route.query)
  }
})

// Watch for route changes (from Mega Menu or Bulk link)
watch(() => route.query, (newQuery) => {
  productStore.syncFiltersFromURL(newQuery)
  showBulkOrder.value = newQuery.view === 'bulk'
}, { deep: true })

const isSidebarOpen = ref(false)

// Dynamic Categorization Helpers
const availableCategories = computed(() => {
  const selectedGenders = productStore.filters.gender
  if (selectedGenders.length === 0) {
    // Show all categories from all genders if none selected
    const all = new Set()
    GENDERS.forEach(g => Object.keys(PRODUCT_TAXONOMY[g]).forEach(c => all.add(c)))
    return Array.from(all)
  }
  const filtered = new Set()
  selectedGenders.forEach(g => {
    if (PRODUCT_TAXONOMY[g]) {
      Object.keys(PRODUCT_TAXONOMY[g]).forEach(c => filtered.add(c))
    }
  })
  return Array.from(filtered)
})

const availableSubCategories = computed(() => {
  const selectedGenders = productStore.filters.gender
  const selectedCats = productStore.filters.category
  
  if (selectedCats.length === 0) {
    // Show all subs for selected genders
    const all = new Set()
    const gendersToSearch = selectedGenders.length > 0 ? selectedGenders : GENDERS
    gendersToSearch.forEach(g => {
      Object.values(PRODUCT_TAXONOMY[g] || {}).forEach(subs => subs.forEach(s => all.add(s)))
    })
    return Array.from(all)
  }

  const filtered = new Set()
  const gendersToSearch = selectedGenders.length > 0 ? selectedGenders : GENDERS
  gendersToSearch.forEach(g => {
    selectedCats.forEach(c => {
      if (PRODUCT_TAXONOMY[g] && PRODUCT_TAXONOMY[g][c]) {
        PRODUCT_TAXONOMY[g][c].forEach(s => filtered.add(s))
      }
    })
  })
  return Array.from(filtered)
})

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const clearAll = () => {
  productStore.clearFilters()
}
</script>

<template>
  <div class="shop-view container">
    <div class="shop-header">
      <div class="title-with-badge">
        <h1 class="page-title">{{ showBulkOrder ? 'Bulk Order' : 'Shop' }}</h1>
        <button 
          class="bulk-badge-btn" 
          :class="{ active: showBulkOrder }"
          @click="toggleBulkOrder"
        >
          <PackageCheck :size="14" /> {{ showBulkOrder ? 'Back to Shop' : 'Bulk Order' }}
        </button>
      </div>
      
      <div v-if="!showBulkOrder" class="shop-controls">
        <button class="mobile-filter-btn btn" @click="toggleSidebar">
          <Filter :size="16" style="margin-right: 8px;" /> Filters
        </button>
        <div class="shop-meta">
          <span class="results-count">Showing {{ productStore.filteredProducts.length }} results</span>
          <select class="sort-select" v-model="productStore.sortBy">
            <option value="default">Default sorting</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="latest">Sort by Latest</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Bulk Order View -->
    <BulkOrderForm v-if="showBulkOrder" @close="showBulkOrder = false" />

    <!-- Standard Shop Layout -->
    <div v-else class="shop-layout">
      <!-- Fast Filter Sidebar -->
      <aside class="sidebar" :class="{ 'sidebar-open': isSidebarOpen }">
        <div class="sidebar-header mobile-only">
          <h3>Filters</h3>
          <button class="close-btn" @click="toggleSidebar"><X /></button>
        </div>

        <div class="filter-controls-actions">
           <button class="btn secondary clear-btn" @click="clearAll">Clear All</button>
        </div>

        <!-- Special Offers Toggle -->
        <div class="filter-group promo-filter-group">
          <label class="filter-label promo-toggle">
            <input 
              type="checkbox" 
              v-model="productStore.filters.showPromosOnly"
            >
            <span class="checkmark"></span>
            <strong>🔥 Special Offers Only</strong>
          </label>
        </div>

        <!-- Price Filter -->
        <div class="filter-group">
          <h4 class="filter-title">Price Range</h4>
          <div class="price-inputs">
            <div class="input-wrapper">
              <span class="currency-prefix">₹</span>
              <input type="number" v-model="productStore.filters.priceMin" placeholder="Min" class="price-input" />
            </div>
            <span>-</span>
            <div class="input-wrapper">
              <span class="currency-prefix">₹</span>
              <input type="number" v-model="productStore.filters.priceMax" placeholder="Max" class="price-input" />
            </div>
          </div>
        </div>

        <!-- Gender / Segment Filter -->
        <div class="filter-group">
          <h4 class="filter-title">Gender / Segment</h4>
          <div class="filter-options style-scroll">
            <label class="filter-label" v-for="gender in GENDERS" :key="gender">
              <input 
                type="checkbox" 
                :value="gender" 
                :checked="productStore.filters.gender.includes(gender)"
                @change="productStore.toggleFilter('gender', gender)"
              >
              <span class="checkmark"></span>
              {{ gender }}
            </label>
          </div>
        </div>

        <!-- Dynamic Category Filter -->
        <div class="filter-group">
          <h4 class="filter-title">Category</h4>
          <div class="filter-options style-scroll">
            <label class="filter-label" v-for="cat in availableCategories" :key="cat">
              <input 
                type="checkbox" 
                :value="cat" 
                :checked="productStore.filters.category.includes(cat)"
                @change="productStore.toggleFilter('category', cat)"
              >
              <span class="checkmark"></span>
              {{ cat }}
            </label>
          </div>
        </div>

        <!-- Dynamic Sub-Category Filter -->
        <div class="filter-group">
          <h4 class="filter-title">Sub Category</h4>
          <div class="filter-options style-scroll">
            <label class="filter-label" v-for="sub in availableSubCategories" :key="sub">
              <input 
                type="checkbox" 
                :value="sub" 
                :checked="productStore.filters.subCategory.includes(sub)"
                @change="productStore.toggleFilter('subCategory', sub)"
              >
              <span class="checkmark"></span>
              {{ sub }}
            </label>
          </div>
        </div>

        <!-- Other Standard Filters -->
        <div class="filter-group" v-for="(options, key) in productStore.filterOptions" :key="key">
          <template v-if="key !== 'category' && key !== 'subCategory'">
            <h4 class="filter-title">{{ key === 'neckType' ? 'Neck Type' : key.charAt(0).toUpperCase() + key.slice(1) }}</h4>
            <div class="filter-options style-scroll">
              <label class="filter-label" v-for="option in options" :key="option">
                <input 
                  type="checkbox" 
                  :value="option" 
                  :checked="productStore.filters[key]?.includes(option)"
                  @change="productStore.toggleFilter(key, option)"
                >
                <span class="checkmark"></span>
                {{ option }}
              </label>
            </div>
          </template>
        </div>

      </aside>

      <!-- Main Product Grid -->
      <main class="product-area">
        <div v-if="productStore.isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Fetching our premium collection...</p>
        </div>
        <div v-else-if="productStore.error" class="error-container">
          <p>{{ productStore.error }}</p>
          <button class="btn" @click="productStore.fetchProducts">Retry</button>
        </div>
        <div v-else-if="productStore.filteredProducts.length === 0" class="no-results">
          <h2>No products found</h2>
          <p>Try adjusting your filters.</p>
          <button class="btn" @click="clearAll">Clear Filters</button>
        </div>
        <div class="grid grid-5 shop-grid" v-else>
          <ProductCard 
            v-for="product in productStore.filteredProducts" 
            :key="product.id" 
            :product="product"
          />
        </div>
      </main>
      
      <!-- Mobile Overlay -->
      <div v-if="isSidebarOpen" class="sidebar-overlay" @click="toggleSidebar"></div>
    </div>
  </div>
</template>

<style scoped>
.shop-view {
  padding: 60px 20px;
}

.shop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: clamp(1.5rem, 5vw, 2.5rem);
}

.title-with-badge {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.bulk-badge-btn {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.bulk-badge-btn:hover {
  background: #e2e8f0;
  color: #000;
  transform: translateY(-1px);
}

.bulk-badge-btn.active {
  background: #000;
  color: #fff;
  border-color: #000;
}

.shop-controls {
  display: flex;
  align-items: center;
  gap: 20px;
}

.shop-meta {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 0.9rem;
  color: #666;
}

.sort-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: #fff;
  font-family: inherit;
  outline: none;
  cursor: pointer;
}

.shop-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 40px;
  position: relative;
}

/* Sidebar Styles */
.sidebar {
  background: #fff;
}

.filter-group {
  margin-bottom: 30px;
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;
}

.filter-title {
  font-size: 1.1rem;
  margin-bottom: 15px;
  font-weight: 600;
  text-transform: capitalize;
}

.filter-options {
  max-height: 200px;
  overflow-y: auto;
  padding-right: 10px;
}

/* Custom Scrollbar */
.style-scroll::-webkit-scrollbar { width: 4px; }
.style-scroll::-webkit-scrollbar-track { background: #f1f1f1; }
.style-scroll::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
.style-scroll::-webkit-scrollbar-thumb:hover { background: #999; }

.filter-label {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #555;
}

.filter-label:hover {
  color: #000;
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.input-wrapper {
  position: relative;
  flex: 1;
}

.currency-prefix {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
  font-weight: bold;
  font-size: 0.8rem;
}

.price-input {
  width: 100%;
  padding: 8px 8px 8px 20px;
  border: 1px solid #ddd;
  font-family: inherit;
  font-size: 0.85rem;
}

.clear-btn {
  width: 100%;
  margin-bottom: 20px;
  padding: 8px;
  font-size: 0.85rem;
  border: 1px solid #000;
  background: transparent;
  color: #000;
}

.clear-btn:hover {
  background: #000;
  color: #fff;
}

.no-results {
  text-align: center;
  padding: 60px 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.no-results h2 { margin-bottom: 10px; }
.no-results p { color: #666; margin-bottom: 20px; }

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  text-align: center;
  background: #f9f9f9;
  border-radius: 8px;
  min-height: 400px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0,0,0,0.1);
  border-top-color: #000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.mobile-filter-btn { display: none; }
.mobile-only { display: none; }
.sidebar-overlay { display: none; }

/* Responsive grid for products - overriding default index.css for inner layout */
@media (min-width: 1400px) {
  .grid-5 { grid-template-columns: repeat(5, 1fr); }
}

@media (max-width: 1400px) {
  .shop-layout {
    grid-template-columns: 200px 1fr;
    gap: 20px;
  }
  .grid-5 { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 1024px) {
  .grid-5 { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .shop-view { padding: 15px 15px; }
  
  .shop-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

  .shop-layout {
    display: block; /* Stack main and sidebar */
  }

  .shop-controls {
    display: flex;
    width: 100%;
    gap: 12px;
    align-items: stretch;
  }

  .mobile-filter-btn {
    display: flex;
    flex: 1;
    height: 44px;
    justify-content: center;
    align-items: center;
    margin-bottom: 0;
    white-space: nowrap;
    font-size: 13px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    background: #000;
    color: #fff;
    border-radius: 8px;
  }

  .shop-meta {
    flex: 1;
    gap: 0;
  }

  .sort-select {
    width: 100%;
    height: 44px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: #fff;
    padding: 0 12px;
    font-size: 13px;
    font-weight: 600;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: -320px;
    width: 300px;
    height: 100vh;
    background: #fff;
    z-index: 2000;
    padding: 30px 20px;
    overflow-y: auto;
    transition: left 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 10px 0 30px rgba(0,0,0,0.1);
  }

  .sidebar.sidebar-open { 
    left: 0; 
  }

  .sidebar-header.mobile-only {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    border-bottom: 1px solid #eee;
    padding-bottom: 15px;
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(2px);
    z-index: 1500;
  }

  .grid-5 { 
    grid-template-columns: repeat(2, 1fr) !important; 
    gap: 12px !important; 
    padding: 0;
  }
}

@media (max-width: 480px) {
  .results-count { display: none; }
  .shop-meta { justify-content: flex-end; }
  .grid-5 { 
    grid-template-columns: repeat(2, 1fr) !important; 
    gap: 10px !important;
  }
}
</style>
