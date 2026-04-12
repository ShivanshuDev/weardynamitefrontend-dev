import { defineStore } from 'pinia'
import { mockProducts, filterOptions } from '../data/mockProducts'
import api from '../utils/api'
import { useAuthStore } from './authStore'

export const useProductStore = defineStore('products', {
  state: () => ({
    products: [], // Loaded from backend
    filterOptions: filterOptions,
    filters: {
      gender: [],
      category: [],
      subCategory: [],
      fabric: [],
      color: [],
      size: [],
      type: [],
      occasional: [],
      fit: [],
      neckType: [],
      occasion: [],
      priceMin: null,
      priceMax: null,
      searchQuery: ''
    },
    sortBy: 'default', // default, price-asc, price-desc, latest
    cart: JSON.parse(localStorage.getItem('cart')) || [],
    checkoutItems: JSON.parse(localStorage.getItem('checkoutItems')) || [],
    isDirectCheckout: JSON.parse(localStorage.getItem('isDirectCheckout')) || false,
    favorites: JSON.parse(localStorage.getItem('favorites')) || [],
    currency: 'INR',
    currencyRates: {
      'INR': { symbol: '₹', rate: 1 }
    },
    // Admin Managed Content (CMS) - Populated from fetchCms
    siteContent: {
      home: { 
        carousel: [], 
        megaPromos: [], 
        productSections: { newArrivals: {}, bestSellers: {} },
        standard: { 
          title: 'Premium Quality',
          subtitle: 'The Dynamite Promise of Excellence',
          features: [] 
        }
      },
      process: { hero: {}, steps: [] },
      contact: { 
        title: 'Contact Us',
        subtitle: "We'd love to hear from you.",
        direct: { phone: [], email: '' },
        mapUrl: ''
      },
      policies: {
        shippingAndReturns: { 
          pageTitle: 'Shipping & Returns', 
          shippingProcess: { title: 'Shipping Process', content: '' },
          refundPolicy: { title: 'Refund Policy', content: '' }
        },
        faq: { pageTitle: 'Frequently Asked Questions', items: [] },
        privacy: { pageTitle: 'Privacy Policy', content: '' }
      }
    },
    inquiries: [],
    subscribers: [],
    blogs: [],
    blogLoading: false,
    orders: [],
    users: [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' }
    ],
    s3BucketUrl: import.meta.env.VITE_S3_BUCKET_URL || 'https://weardynamite-dev-assets.s3.ap-southeast-2.amazonaws.com/',
    newArrivals: [],
    bestSellers: [],
    isLoading: false,
    error: null,
    appliedCoupon: null
  }),
  getters: {
    formatPrice: (state) => (price) => {
      const numPrice = typeof price === 'number' ? price : parseFloat(price)
      if (isNaN(numPrice)) return `₹0.00`
      return `₹${numPrice.toFixed(2)}`
    },
    
    isFirstTimeUser: () => {
      const authStore = useAuthStore()
      return authStore.isLoggedIn && authStore.orders.length === 0
    },

    orderSummary: (state) => {
      const items = state.checkoutItems.length > 0 ? state.checkoutItems : state.cart
      let subtotal = 0
      let discountTotal = 0
      let taxTotal = 0
      
      // 1. Group items by product for Buy X Get Y logic
      const groupedItems = items.reduce((acc, item) => {
        if (!acc[item.productId]) acc[item.productId] = []
        acc[item.productId].push(item)
        return acc
      }, {})

      const processedItems = []

      // 2. Process each group for promotions
      Object.keys(groupedItems).forEach(productId => {
        const productItems = groupedItems[productId]
        const product = state.products.find(p => p.id === productId) || productItems[0]
        
        let totalQty = productItems.reduce((s, i) => s + i.quantity, 0)
        let productSubtotal = 0
        let productDiscount = 0
        
        // Base price calculation with individual product discount
        const basePrice = product.price || 0
        const percentageDiscount = product.discountPercentage || 0
        const discountedPrice = basePrice * (1 - percentageDiscount / 100)
        
        productItems.forEach(item => {
          const itemTotal = item.price * item.quantity
          productSubtotal += itemTotal
          
          // Add basic percentage discount to total discount
          productDiscount += (item.price - discountedPrice) * item.quantity
        })

        // Apply Buy X Get Y Free logic
        if (product.promotionType === 'B1G1') {
          const freeUnits = Math.floor(totalQty / 2)
          productDiscount += freeUnits * discountedPrice
        } else if (product.promotionType === 'B2G1') {
          const freeUnits = Math.floor(totalQty / 3)
          productDiscount += freeUnits * discountedPrice
        }

        // Apply product-specific coupon if it matches
        if (state.appliedCoupon && product.discountCoupon === state.appliedCoupon) {
          // Extra 5% for matched coupon (example logic)
          productDiscount += productSubtotal * 0.05 
        }

        subtotal += productSubtotal
        discountTotal += productDiscount

        // Calculate Tax if applicable
        if (product.isTaxable !== false) {
          const taxableAmount = productSubtotal - productDiscount
          const tax = taxableAmount * ((product.taxPercent || 12) / 100)
          taxTotal += tax
        }
      })

      // 3. Overall Discounts (e.g. First Time User 10%)
      const authStore = useAuthStore()
      const isFirstTime = authStore.isLoggedIn && authStore.orders.length === 0
      if (isFirstTime) {
        const firstTimeDiscount = (subtotal - discountTotal) * 0.10
        discountTotal += firstTimeDiscount
      }

      const total = subtotal - discountTotal + taxTotal

      return {
        subtotal,
        discountTotal,
        taxTotal,
        total,
        itemCount: items.reduce((s, i) => s + i.quantity, 0)
      }
    },

    cartCount: (state) => state.cart.reduce((total, item) => total + item.quantity, 0),

    isFavorite: (state) => (productId) => state.favorites.includes(productId),
    featuredProducts: (state) => state.products.filter(p => p.featured).slice(0, 4),

    filteredProducts: (state) => {
      let result = [...state.products]

      // Apply Search
      if (state.filters.searchQuery) {
        const query = state.filters.searchQuery.toLowerCase()
        result = result.filter(p => p.name.toLowerCase().includes(query))
      }

      // Apply Array Filters (Gender, Category, SubCategory, etc.)
      const arrayFilters = ['gender', 'category', 'subCategory', 'fabric', 'type', 'occasion', 'fit', 'neckType']
      arrayFilters.forEach(filterKey => {
        if (state.filters[filterKey] && state.filters[filterKey].length > 0) {
          result = result.filter(p => state.filters[filterKey].includes(p[filterKey]))
        }
      })

      // Special handling for colors and sizes
      if (state.filters.color.length > 0) {
        result = result.filter(p => {
          const colors = p.variants?.map(v => v.color) || []
          return colors.some(c => state.filters.color.includes(c))
        })
      }
      
      if (state.filters.size.length > 0) {
        result = result.filter(p => {
          const sizes = p.variants?.flatMap(v => v.sizes.map(s => s.size)) || []
          return sizes.some(s => state.filters.size.includes(s))
        })
      }

      // Apply Price Filter
      if (state.filters.priceMin !== null && state.filters.priceMin !== '') {
        result = result.filter(p => p.price >= parseFloat(state.filters.priceMin))
      }
      if (state.filters.priceMax !== null && state.filters.priceMax !== '') {
        result = result.filter(p => p.price <= parseFloat(state.filters.priceMax))
      }

      // Apply Sorting
      if (state.sortBy === 'price-asc') {
        result.sort((a, b) => a.price - b.price)
      } else if (state.sortBy === 'price-desc') {
        result.sort((a, b) => b.price - a.price)
      } else if (state.sortBy === 'latest') {
        result.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
      }

      return result
    }
  },
  actions: {
    resolveImageUrl(path) {
      if (!path) return '';
      if (typeof path !== 'string') return '';
      if (path.startsWith('http') || path.startsWith('data:image')) return path;
      const baseUrl = this.s3BucketUrl.endsWith('/') ? this.s3BucketUrl : `${this.s3BucketUrl}/`;
      return `${baseUrl}${path}`;
    },
    async fetchProducts() {
      this.isLoading = true
      this.error = null
      try {
        const response = await api.get('/products')
        // The backend returns { items, total, page, limit, totalPages }
        const products = response.data.items || response.data
        
        this.products = products.map(p => {
          // Robust mapping from Backend -> Frontend
          const mapped = {
            ...p,
            id: p.product_id || p.id,
            name: p.product_name || p.name,
            // Price Logic: salePrice is the effective price. fall back to mrp.
            price: p.salePrice || p.mrp || 0,
            mrp: p.mrp || p.salePrice || 0,
            salePrice: p.salePrice || p.mrp || 0,
            images: (Array.isArray(p.images) ? p.images : (p.image ? [p.image] : [])).map(img => this.resolveImageUrl(img)),
            variants: p.variants || [],
            category: p.category || 'Apparel'
          }
          return mapped
        })
      } catch (err) {
        console.error('Failed to fetch products:', err)
        this.error = 'Failed to load products. Please try again.'
      } finally {
        this.isLoading = false
      }
    },
    async fetchProductById(id) {
       try {
         const response = await api.get(`/products/${id}`)
         const p = response.data
         const product = { 
           ...p, 
           id: p.product_id || p.id,
           name: p.product_name || p.name,
           price: p.salePrice || p.mrp || 0,
           mrp: p.mrp || p.salePrice || 0,
           salePrice: p.salePrice || p.mrp || 0,
           images: Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []),
           variants: p.variants || []
         }
         
         const idx = this.products.findIndex(existing => existing.id === product.id)
         if (idx > -1) {
           this.products[idx] = product
         } else {
           this.products.push(product)
         }
         return product
       } catch (err) {
         console.error(`Failed to fetch product ${id}:`, err)
         throw err
       }
    },
    async fetchNewArrivals() {
      try {
        const response = await api.get('/products/new-arrivals')
        this.newArrivals = (response.data.items || response.data).map(p => ({
          ...p,
          id: p.product_id || p.id,
          name: p.product_name || p.name,
          price: p.salePrice || p.mrp || 0,
          images: (Array.isArray(p.images) ? p.images : (p.image ? [p.image] : [])).map(img => this.resolveImageUrl(img)),
          variants: p.variants || []
        }))
      } catch (err) {
        console.error('Failed to fetch new arrivals:', err)
      }
    },
    async fetchBestSellers() {
      try {
        const response = await api.get('/products/best-sellers')
        this.bestSellers = (response.data.items || response.data).map(p => ({
          ...p,
          id: p.product_id || p.id,
          name: p.product_name || p.name,
          price: p.salePrice || p.mrp || 0,
          images: (Array.isArray(p.images) ? p.images : (p.image ? [p.image] : [])).map(img => this.resolveImageUrl(img)),
          variants: p.variants || []
        }))
      } catch (err) {
        console.error('Failed to fetch best sellers:', err)
      }
    },
    addToCart(configurations, productInfo) {
      configurations.forEach(config => {
        // Find if identical config already exists in cart to simply update quantity
        const existingItem = this.cart.find(item => 
          item.productId === productInfo.id && 
          item.forWhom === config.forWhom &&
          item.size === config.size && 
          item.color === config.color
        )
        
        if (existingItem) {
          existingItem.quantity += config.quantity
        } else {
          this.cart.push({
            id: Date.now() + Math.random(), // Unique cart item ID
            productId: productInfo.id,
            name: productInfo.name,
            price: productInfo.price,
            image: productInfo.images[0],
            codAvailable: productInfo.codAvailable,
            forWhom: config.forWhom,
            size: config.size,
            color: config.color,
            quantity: config.quantity
          })
        }
      })
      localStorage.setItem('cart', JSON.stringify(this.cart))
    },
    removeFromCart(cartItemId) {
      this.cart = this.cart.filter(item => item.id !== cartItemId)
      localStorage.setItem('cart', JSON.stringify(this.cart))
    },
    updateCartQuantity(cartItemId, delta) {
      const item = this.cart.find(i => i.id === cartItemId)
      if (item) {
        const newQ = item.quantity + delta
        if (newQ > 0) {
          item.quantity = newQ
          localStorage.setItem('cart', JSON.stringify(this.cart))
        }
      }
    },
    initiateDirectCheckout(configs, productInfo) {
      this.checkoutItems = configs.map(config => ({
        id: Date.now() + Math.random(),
        productId: productInfo.id,
        name: productInfo.name,
        price: productInfo.price,
        image: productInfo.images[0],
        codAvailable: productInfo.codAvailable,
        forWhom: config.forWhom,
        size: config.size,
        color: config.color,
        quantity: config.quantity
      }))
      this.isDirectCheckout = true
      localStorage.setItem('checkoutItems', JSON.stringify(this.checkoutItems))
      localStorage.setItem('isDirectCheckout', JSON.stringify(this.isDirectCheckout))
    },
    initiateCartCheckout() {
      this.checkoutItems = [...this.cart]
      this.isDirectCheckout = false
      localStorage.setItem('checkoutItems', JSON.stringify(this.checkoutItems))
      localStorage.setItem('isDirectCheckout', JSON.stringify(this.isDirectCheckout))
    },
    toggleFavorite(productId) {

      const idx = this.favorites.indexOf(productId)
      if (idx > -1) {
        this.favorites.splice(idx, 1)
      } else {
        this.favorites.push(productId)
      }
      localStorage.setItem('favorites', JSON.stringify(this.favorites))
    },
    toggleFilter(group, value) {

      const index = this.filters[group].indexOf(value)
      if (index === -1) {
        this.filters[group].push(value)
      } else {
        this.filters[group].splice(index, 1)
      }
    },
    clearFilters() {
      this.filters = {
        gender: [],
        category: [],
        subCategory: [],
        fabric: [],
        color: [],
        size: [],
        type: [],
        occasion: [],
        fit: [],
        neckType: [],
        priceMin: null,
        priceMax: null,
        searchQuery: ''
      }
      this.sortBy = 'default'
    },
    syncFiltersFromURL(query) {
      if (!query) return;
      this.clearFilters();
      if (query.gender) this.filters.gender = Array.isArray(query.gender) ? query.gender : [query.gender];
      if (query.category) this.filters.category = Array.isArray(query.category) ? query.category : [query.category];
      if (query.subCategory) this.filters.subCategory = Array.isArray(query.subCategory) ? query.subCategory : [query.subCategory];
    },

    // --- Admin Actions ---
    addProduct(product) {
      this.products.unshift({
        ...product,
        id: Date.now(),
        dateAdded: new Date().toISOString()
      })
    },
    updateProduct(id, updates) {
      const index = this.products.findIndex(p => p.id === id)
      if (index !== -1) {
        this.products[index] = { ...this.products[index], ...updates }
      }
    },
    deleteProduct(id) {
      this.products = this.products.filter(p => p.id !== id)
    },
    updateStock(productId, newStock) {
      const product = this.products.find(p => p.id === productId)
      if (product) {
        product.stock = newStock
      }
    },
    updateSiteContent(section, data) {
      this.siteContent[section] = { ...this.siteContent[section], ...data }
    },
    async fetchCms() {
      try {
        const response = await api.get('/admin/cms/public');
        const data = response.data || {};
        
        if (data) {
          // Normalization Layer for Policies (Self-Healing from old strings)
          const normalizedPolicies = {
            ...this.siteContent.policies,
            ...(data.policies || {})
          };

          // Fix FAQ: If old array, move it to .items
          if (Array.isArray(data.policies?.faq)) {
            normalizedPolicies.faq = {
              pageTitle: 'Frequently Asked Questions',
              items: data.policies.faq
            };
          } else if (data.policies?.faq?.items) {
             normalizedPolicies.faq = data.policies.faq;
          }

          // Fix Privacy: If old string, move it to .content
          if (typeof data.policies?.privacy === 'string') {
            normalizedPolicies.privacy = {
              pageTitle: 'Privacy Policy',
              content: data.policies.privacy
            };
          }

          // Fix Terms: If old string, move it to .items
          if (data.policies?.terms?.items) {
             normalizedPolicies.terms = {
               ...data.policies.terms,
               subtitle: data.policies.terms.subtitle || '',
               lastUpdated: data.policies.terms.lastUpdated || ''
             };
          } else if (typeof data.policies?.terms === 'string') {
            normalizedPolicies.terms = {
              pageTitle: 'Terms of Service',
              subtitle: '',
              lastUpdated: '',
              items: [{ title: 'Main Terms', content: data.policies.terms }]
            };
          } else if (typeof data.policies?.terms?.content === 'string') {
            normalizedPolicies.terms = {
              pageTitle: data.policies.terms.pageTitle || 'Terms of Service',
              subtitle: data.policies.terms.subtitle || '',
              lastUpdated: data.policies.terms.lastUpdated || '',
              items: [{ title: 'Main Terms', content: data.policies.terms.content }]
            };
          }

          // Fix Shipping: Map old 'shipping' and 'returns' fields
          if (typeof data.policies?.shipping === 'string' || typeof data.policies?.returns === 'string') {
            normalizedPolicies.shippingAndReturns = {
              pageTitle: 'Shipping & Returns',
              shippingProcess: { 
                title: 'Shipping Process', 
                content: data.policies.shippingAndReturns?.shippingProcess?.content || data.policies.shipping || '' 
              },
              refundPolicy: { 
                title: 'Refund Policy', 
                content: data.policies.shippingAndReturns?.refundPolicy?.content || data.policies.returns || '' 
              }
            }
          }

          this.siteContent = {
            ...this.siteContent,
            ...data,
            home: {
              ...this.siteContent.home,
              ...(data.home || {}),
              carousel: data.home?.carousel || [],
              megaPromos: data.home?.megaPromos || [],
              standard: {
                ...this.siteContent.home.standard,
                ...(data.home?.standard || {})
              }
            },
            contact: {
              ...this.siteContent.contact,
              ...(data.contact || {}),
              direct: {
                ...this.siteContent.contact.direct,
                ...(data.contact?.direct || {})
              }
            },
            policies: normalizedPolicies
          };
        }
      } catch (err) {
        console.error('Failed to fetch CMS content:', err);
      }
    },
    async fetchBlogs() {
      this.blogLoading = true
      try {
        const response = await api.get('/blogs')
        this.blogs = (response.data.items || response.data).map(b => ({
          ...b,
          id: b.blogId || b.id,
          image: this.resolveImageUrl(b.image || b.images?.[0]),
          date: b.createdAt ? new Date(b.createdAt).toISOString().split('T')[0] : '2026-04-05'
        }))
      } catch (err) {
        console.error('Failed to fetch blogs:', err)
      } finally {
        this.blogLoading = false
      }
    },
    async submitInquiry(formData) {
       this.isLoading = true
       try {
         const response = await api.post('/inquiries', {
            ...formData,
            type: 'contact_form', 
            status: 'New'
         });
         return response.data;
       } catch (err) {
         console.error('Inquiry Submission Failed:', err);
         throw err;
       } finally {
         this.isLoading = false
       }
    },
    clearCart() {
      this.cart = []
      localStorage.setItem('cart', JSON.stringify([]))
    },
    clearCheckout() {
      this.checkoutItems = []
      this.isDirectCheckout = false
      localStorage.removeItem('checkoutItems')
      localStorage.removeItem('isDirectCheckout')
    }
  }
})
