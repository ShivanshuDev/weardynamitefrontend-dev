<script setup>
import { ref, onMounted } from 'vue'
import { useProductStore } from '../stores/productStore'
import ProductCard from '../components/ProductCard.vue'
import { Filter, X } from 'lucide-vue-next'

const productStore = useProductStore()

onMounted(() => {
  productStore.fetchProducts()
})

const isSidebarOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const applyPriceFilter = (e) => {
  // Price filter is v-modeled, so it updates state automatically.
  // We can trigger a manual clear if needed.
}

const clearAll = () => {
  productStore.clearFilters()
}
</script>

<template>
  <div class="shop-view container">
    <div class="shop-header">
      <h1 class="page-title">Shop</h1>
      <div class="shop-controls">
        <button class="mobile-filter-btn btn" @click="toggleSidebar">
          <Filter :size="16" style="margin-right: 8px;" /> Filters
        </button>
        <div class="shop-meta">
          <span>Showing {{ productStore.filteredProducts.length }} results</span>
          <select class="sort-select" v-model="productStore.sortBy">
            <option value="default">Default sorting</option>
            <option value="price-asc">Sort by price: low to high</option>
            <option value="price-desc">Sort by price: high to low</option>
            <option value="latest">Sort by latest</option>
          </select>
        </div>
      </div>
    </div>

    <div class="shop-layout">
      <!-- Fast Filter Sidebar -->
      <aside class="sidebar" :class="{ 'sidebar-open': isSidebarOpen }">
        <div class="sidebar-header mobile-only">
          <h3>Filters</h3>
          <button class="close-btn" @click="toggleSidebar"><X /></button>
        </div>

        <div class="filter-controls-actions">
           <button class="btn secondary clear-btn" @click="clearAll">Clear All</button>
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

        <!-- Render checkboxes for array filters -->
        <div class="filter-group" v-for="(options, key) in productStore.filterOptions" :key="key">
          <h4 class="filter-title">{{ key === 'subCategory' ? 'Sub Category' : key === 'neckType' ? 'Neck Type' : key.charAt(0).toUpperCase() + key.slice(1) }}</h4>
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
        <div class="grid grid-3 shop-grid" v-else>
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
  font-size: 2.5rem;
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
@media (min-width: 1024px) {
  .grid-3 { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 1024px) {
  .shop-layout {
    grid-template-columns: 200px 1fr;
    gap: 20px;
  }
  .grid-3 { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .shop-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
  
  .shop-controls {
    width: 100%;
    justify-content: space-between;
  }
  
  .mobile-filter-btn {
    display: flex;
    align-items: center;
    padding: 8px 16px;
  }
  
  .shop-layout {
    grid-template-columns: 1fr;
    display: block; /* Disable grid */
  }
  
  .sidebar {
    position: fixed;
    top: 0;
    left: -300px;
    width: 280px;
    height: 100vh;
    background: #fff;
    z-index: 2000;
    padding: 20px;
    overflow-y: auto;
    transition: left 0.3s ease;
    box-shadow: 2px 0 10px rgba(0,0,0,0.1);
  }
  
  .sidebar.sidebar-open {
    left: 0;
  }
  
  .mobile-only {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
  }
  
  .close-btn {
    padding: 5px;
  }
  
  .sidebar-overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    z-index: 1500;
  }
  
  .grid-3 { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 480px) {
  .grid-3 { grid-template-columns: 1fr; }
  .shop-meta { flex-direction: column; align-items: flex-start; gap: 10px; }
}
</style>
