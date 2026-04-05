import { defineStore } from 'pinia'
import { mockProducts, filterOptions } from '../data/mockProducts'
import api from '../utils/api'
import { useAuthStore } from './authStore'

export const useProductStore = defineStore('products', {
  state: () => ({
    products: [], // Loaded from backend
    filterOptions: filterOptions,
    filters: {
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
    cart: [],
    checkoutItems: [],
    isDirectCheckout: false,
    favorites: [],
    currency: 'INR',
    currencyRates: {
      'INR': { symbol: '₹', rate: 1 },
      'USD': { symbol: '$', rate: 0.012 }, // 1/83.5
      'EUR': { symbol: '€', rate: 0.011 }
    },
    // Admin Managed Content (CMS)
    siteContent: {
      home: {
        carousel: [
          {
            image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e07?q=80&w=2070',
            title: 'Unleash Your\nDynamite Style',
            subtitle: 'Premium apparel engineered for the modern individual.',
            button1: { text: 'Shop The Collection', link: '/shop' },
            button2: { text: 'Our Story', link: '/about' }
          },
          {
            image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070',
            title: 'Spring Collection 2026',
            subtitle: 'Fresh aesthetics for the vibrant season ahead.',
            button1: { text: 'Shop New Arrivals', link: '/shop?category=Men' },
            button2: { text: '', link: '' }
          }
        ],
        megaPromos: [
          { title: 'Summer Flash Sale', subtitle: 'Up to 50% Off', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2000', link: '/shop' },
          { title: 'New Basics', subtitle: 'Buy 2 Get 1 Free', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=2000', link: '/shop' },
          { title: 'Premium Quality', subtitle: 'Essential T-Shirts', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2000', link: '/shop' },
          { title: 'Make It Yours', subtitle: 'Custom Embroidery', image: 'https://images.unsplash.com/photo-1605333556536-eebdb8aecebf?q=80&w=2000', link: '/customize' }
        ],
        standard: {
          title: 'The Wear Dynamite Standard',
          subtitle: 'Uncompromising quality from thread to finish.',
          features: [
            { title: '100% Organic Fabric', description: 'Sourced from sustainable farms, our super-combed cotton ensures breathability.', image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633' },
            { title: 'Heavyweight 240+ GSM', description: 'Built to last. The dense construction ensures garment retains its shape.', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7' },
            { title: 'HD Screen Printing', description: 'Eco-friendly plastisol inks provide vibrant, crack-resistant graphics.', image: 'https://images.unsplash.com/photo-1622470953794-aa01db4b2568' },
            { title: 'Precision Embroidery', description: 'High-tensile polyester threads guarantee logos never fray.', image: 'https://images.unsplash.com/photo-1605333556536-eebdb8aecebf' }
          ]
        }
      },
      process: {
        hero: {
          title: 'Our Process & Craftsmanship',
          subtitle: 'Take a look behind the curtain. Discover what we have and how we deliver luxury-grade apparel.',
          image: 'https://images.unsplash.com/photo-1563823293806-03f140026e6d'
        },
        steps: [
          { title: '1. Sourcing & Raw Materials', have: 'Ethical relationships with sustainable cotton farms.', do: 'Before cutting, fabrics undergo tension and washing tests.' },
          { title: '2. Printing & Embroidery', have: 'Automated HD screen printing presses.', do: 'We apply high-density, crack-resistant inks.' },
          { title: '3. Quality Control', have: 'Dedicated specialists inspecting every millimeter.', do: 'Garments are ironed, folded, and moisture-protected.' },
          { title: '4. Rapid Dispatch', have: 'Strategic contracts with top-tier logistics couriers.', do: 'Orders dispatched within 24 hours of placement.' }
        ]
      },
      contact: {
        title: 'Contact Us',
        subtitle: "We'd love to hear from you. Please fill out the form or reach out directly.",
        direct: {
          phone: ['+91 8543996159', '+91 8382833516'],
          email: 'skshivanshu1234@gmail.com'
        },
        mapUrl: 'https://www.google.com/maps/embed?pb=...'
      },
      policies: {
        faq: [
          { q: 'How long does shipping take?', a: 'Standard delivery takes 3-5 business days across India.' },
          { q: 'Do you offer international shipping?', a: 'Yes, we ship to over 50 countries globally.' }
        ],
        shipping: 'Products are dispatched from our facility within 24 hours...',
        privacy: 'Your privacy is our top priority...',
        returns: '30 Days No-Questions-Asked Return Policy.'
      }
    },
    inquiries: [],
    subscribers: [],
    blogs: [
      { id: 1, title: 'The Rise of Oversized Aesthetics', author: 'Shivanshu', status: 'Published', date: '2023-10-20', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800' }
    ],
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
      const { symbol, rate } = state.currencyRates[state.currency]
      const numPrice = typeof price === 'number' ? price : parseFloat(price)
      if (isNaN(numPrice)) return `${symbol}0.00`
      return `${symbol}${(numPrice * rate).toFixed(2)}`
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

      // Apply Array Filters (Category, SubCategory, etc.)
      const arrayFilters = ['category', 'subCategory', 'fabric', 'type', 'occasion', 'fit', 'neckType']
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
    },
    removeFromCart(cartItemId) {
      this.cart = this.cart.filter(item => item.id !== cartItemId)
    },
    updateCartQuantity(cartItemId, delta) {
      const item = this.cart.find(i => i.id === cartItemId)
      if (item) {
        const newQ = item.quantity + delta
        if (newQ > 0) item.quantity = newQ
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
    },
    initiateCartCheckout() {
      this.checkoutItems = [...this.cart]
      this.isDirectCheckout = false
    },
    setCurrency(code) {
      if (this.currencyRates[code]) {
        this.currency = code
      }
    },
    toggleFavorite(productId) {

      const idx = this.favorites.indexOf(productId)
      if (idx > -1) {
        this.favorites.splice(idx, 1)
      } else {
        this.favorites.push(productId)
      }
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
    }
  }
})
