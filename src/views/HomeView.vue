<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useProductStore } from '../stores/productStore'
import ProductCard from '../components/ProductCard.vue'
import { Play, Truck, RotateCcw, ShieldCheck, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-vue-next'

const productStore = useProductStore()

// Grab 4 newest/featured products to simulate "New Arrivals"
const newArrivals = computed(() => {
  return productStore.newArrivals && productStore.newArrivals.length > 0
    ? productStore.newArrivals.slice(0, 4)
    : productStore.products.slice(0, 4)
})

const bestSellers = computed(() => {
  return productStore.bestSellers && productStore.bestSellers.length > 0
    ? productStore.bestSellers.slice(0, 4)
    : productStore.products.slice(4, 8)
})

// Dynamic Admin-Managed Carousel Slides
const slides = computed(() => productStore.siteContent.home.carousel)

const currentSlide = ref(0)
let slideInterval = null

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.value.length
}
const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.value.length) % slides.value.length
}

onMounted(() => {
  productStore.fetchProducts()
  productStore.fetchNewArrivals()
  productStore.fetchBestSellers()
  slideInterval = setInterval(nextSlide, 6000)
})
onUnmounted(() => {
  if (slideInterval) clearInterval(slideInterval)
})

// Craftsmanship Carousel Logic
const currentCraftSlide = ref(0)
const nextCraftSlide = () => { currentCraftSlide.value = (currentCraftSlide.value + 1) % productStore.siteContent.home.standard.features.length }
const prevCraftSlide = () => { currentCraftSlide.value = (currentCraftSlide.value - 1 + productStore.siteContent.home.standard.features.length) % productStore.siteContent.home.standard.features.length }

</script>

<template>
  <div class="home-view">
    
    <!-- Dynamic Hero Carousel Section (Admin MOCK Array) -->
    <section class="hero-carousel">
      <div 
        class="slide" 
        v-for="(slide, index) in slides" 
        :key="index"
        :class="{ active: index === currentSlide }"
      >
        <div class="slide-bg" :style="{ backgroundImage: `url(${productStore.resolveImageUrl(slide.image)})` }"></div>
        <div class="slide-overlay"></div>
        <div class="slide-content container">
          <h1>{{ slide.title }}</h1>
          <p>{{ slide.subtitle }}</p>
          <div class="hero-actions">
            <RouterLink v-if="slide.button1?.link" :to="slide.button1.link" class="btn primary-btn btn-large transparent">{{ slide.button1.text }}</RouterLink>
            <RouterLink v-if="slide.button2?.link" :to="slide.button2.link" class="btn secondary-btn btn-large transparent">{{ slide.button2.text }}</RouterLink>
          </div>
        </div>
      </div>
      
      <!-- Carousel Controls -->
      <button class="slider-btn prev" @click="prevSlide"><ChevronLeft :size="36" color="#fff" /></button>
      <button class="slider-btn next" @click="nextSlide"><ChevronRight :size="36" color="#fff" /></button>
      
      <!-- Carousel Dots -->
      <div class="slider-dots">
        <span 
          v-for="(s, i) in slides" 
          :key="i" class="dot" 
          :class="{ active: i === currentSlide }" 
          @click="currentSlide = i"
        ></span>
      </div>
    </section>

    <!-- Trust Features Bar (Original Restored) -->
    <section class="trust-features container">
      <div class="trust-grid">
        <div class="trust-item">
          <Truck :size="36" color="#000" />
          <div class="trust-text">
            <h4>Free Shipping</h4>
            <p>On all orders above $100</p>
          </div>
        </div>
        <div class="trust-item">
          <RotateCcw :size="36" color="#000" />
          <div class="trust-text">
            <h4>30 Days Return</h4>
            <p>No questions asked policy</p>
          </div>
        </div>
        <div class="trust-item">
          <ShieldCheck :size="36" color="#000" />
          <div class="trust-text">
            <h4>Secure Payments</h4>
            <p>100% secure encrypted checkout</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Mega Promotional Banners (Alternating Full Width) -->
    <section class="mega-promos container">
      
      <div 
        v-for="(promo, idx) in productStore.siteContent.home.megaPromos" 
        :key="idx"
        class="mega-banner" 
        :class="idx % 2 === 0 ? 'align-right' : 'align-left'"
      >
        <img :src="productStore.resolveImageUrl(promo.image)" :alt="promo.title" />
        <div class="mega-overlay"></div>
        <div class="mega-content container">
          <div class="mega-text-box">
            <h3>{{ promo.subtitle }}</h3>
            <h2>{{ promo.title }}</h2>
            <RouterLink :to="promo.link" class="btn primary-btn btn-white">Shop Now</RouterLink>
          </div>
        </div>
      </div>

    </section>

    <!-- Best Sellers / Most Popular (Original Restored) -->
    <section class="best-sellers container">
      <div class="section-header">
        <div>
          <h2 class="section-title">Most Popular</h2>
          <p class="section-subtitle">Our top selling favorites this season.</p>
        </div>
        <RouterLink to="/shop" class="view-all">View All →</RouterLink>
      </div>
      <div class="product-grid">
        <ProductCard v-for="product in bestSellers" :key="product.id" :product="product" />
      </div>
    </section>

    <!-- Our Craftsmanship / Quality Features (Full Width Slider) -->
    <section class="craftsmanship-section">
      <div class="section-header container">
        <div>
          <h2 class="section-title">{{ productStore.siteContent.home.standard.title }}</h2>
          <p class="section-subtitle">{{ productStore.siteContent.home.standard.subtitle }}</p>
        </div>
      </div>
      
      <div class="craft-slider-container">
        <div class="craft-slider-track" :style="{ transform: `translateX(-${currentCraftSlide * 100}%)` }">
          
          <div 
            v-for="(feature, idx) in productStore.siteContent.home.standard.features" 
            :key="idx"
            class="craft-slide"
          >
            <img :src="productStore.resolveImageUrl(feature.image)" :alt="feature.title" />
            <div class="craft-overlay"></div>
            <div class="craft-content container">
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
            </div>
          </div>

        </div>

        <!-- Craft Slider Controls -->
        <button class="slider-btn prev" @click="prevCraftSlide"><ChevronLeft :size="36" color="#fff" /></button>
        <button class="slider-btn next" @click="nextCraftSlide"><ChevronRight :size="36" color="#fff" /></button>
        <div class="slider-dots">
          <span 
            v-for="i in productStore.siteContent.home.standard.features.length" :key="i" class="dot" 
            :class="{ active: (i-1) === currentCraftSlide }" 
            @click="currentCraftSlide = i-1"
          ></span>
        </div>
      </div>
    </section>

    <!-- Brand Video Statement (Enhanced) -->
    <section class="brand-video-section">
      <div class="container branding-layout">
        <div class="brand-text">
           <h2>Move With Explosive Confidence.</h2>
           <p>We source only the finest fabrics worldwide to create garments that move with you, not against you. Engineered to withstand the rigors of modern life while looking effortlessly chic.</p>
           <ul class="perk-list">
             <li>✓ Breathable Organic Cottons</li>
             <li>✓ 30-Day Limitless Returns</li>
             <li>✓ Lightning Fast Delivery</li>
           </ul>
        </div>
        <div class="video-container">
           <div class="play-btn-wrapper"><Play :size="48" color="#fff" fill="#fff"/></div>
           <video autoplay muted loop playsinline>
             <source src="https://assets.mixkit.co/videos/preview/mixkit-fashion-model-posing-in-a-studio-setting-34444-large.mp4" type="video/mp4" />
           </video>
        </div>
      </div>
    </section>

    <!-- New Arrivals Section (Enhanced) -->
    <section class="new-arrivals container">
      <div class="section-header">
        <div>
          <h2 class="section-title">Fresh Arrivals</h2>
          <p class="section-subtitle">The latest threads dropped this week.</p>
        </div>
        <RouterLink to="/shop" class="view-all">View All →</RouterLink>
      </div>
      <div class="product-grid">
        <ProductCard v-for="product in newArrivals" :key="product.id" :product="product" />
      </div>
    </section>

    <!-- Advertisement Banner (Enhanced) -->
    <section class="ad-banner container">
      <div class="ad-content">
        <h2>Unlock The VIP Experience</h2>
        <p>Join the <strong>Dynamite Club</strong> today and get exclusive early access to our limited drops, free premium shipping on all orders, and 15% off your very first purchase.</p>
        <RouterLink to="/login" class="btn primary-btn btn-large">Become a Member</RouterLink>
      </div>
    </section>

    <!-- What We Do / Customization Hook -->
    <section class="what-we-do-hook container">
      <div class="hook-content">
        <h2>What We Do</h2>
        <p>If you can imagine it, we can create it. From custom printed game jerseys and corporate apparel to premium hand-embroidered lehengas and saris with select silks and stones.</p>
        <RouterLink to="/customize" class="btn primary-btn btn-large">Customize Your Own Design</RouterLink>
      </div>
      <div class="hook-image">
        <img :src="productStore.resolveImageUrl('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1000&auto=format&fit=crop')" alt="Custom Tailoring">
      </div>
    </section>

    <!-- Gender Collections (New Request) -->
    <section class="gender-collections container">
      <div class="gender-grid">
        <!-- Men -->
        <div class="gender-banner men-bg">
          <div class="gender-overlay"></div>
          <div class="gender-content">
            <h2>Men's Collection</h2>
            <RouterLink to="/shop?gender=Men" class="btn primary-btn btn-white">Shop Men</RouterLink>
          </div>
        </div>
        <!-- Women -->
        <div class="gender-banner women-bg">
          <div class="gender-overlay"></div>
          <div class="gender-content">
            <h2>Women's Collection</h2>
            <RouterLink to="/shop?gender=Women" class="btn primary-btn btn-white">Shop Women</RouterLink>
          </div>
        </div>
        <!-- Kids -->
        <div class="gender-banner kids-bg">
          <div class="gender-overlay"></div>
          <div class="gender-content">
            <h2>Kids' Collection</h2>
            <RouterLink to="/shop?gender=Kids" class="btn primary-btn btn-white">Shop Kids</RouterLink>
          </div>
        </div>
      </div>
    </section>


  </div>
</template>

<style scoped>
/* Base Setup */
.home-view {
  min-height: 100vh;
  padding-bottom: 0px;
}

/* Dynamic Hero Carousel */
.hero-carousel {
  position: relative;
  height: 85vh;
  min-height: 600px;
  overflow: hidden;
  background: #111;
}

.slide {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  opacity: 0;
  transition: opacity 1s ease-in-out;
  display: flex;
  align-items: center;
}

.slide.active {
  opacity: 1;
  z-index: 2;
}

.slide-bg {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background-size: cover;
  background-position: center;
  z-index: 1;
  transform: scale(1.05);
  transition: transform 10s linear;
}

.slide.active .slide-bg {
  transform: scale(1);
}

.slide-overlay {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 100%);
  z-index: 2;
}

.slide-content {
  position: relative;
  z-index: 3;
  color: #fff;
  max-width: 700px;
  transform: translateY(20px);
  opacity: 0;
  transition: all 0.8s ease;
  transition-delay: 0.3s;
}

.slide.active .slide-content {
  transform: translateY(0);
  opacity: 1;
}

.slide-content h1 {
  font-family: var(--font-heading);
  font-size: 4.5rem;
  line-height: 1.1;
  margin-bottom: 25px;
  text-shadow: 0 4px 20px rgba(0,0,0,0.5);
  white-space: pre-line;
  color: #fff !important;
}

.slide-content p {
  font-size: 1.25rem;
  margin-bottom: 40px;
  line-height: 1.6;
  opacity: 0.95;
  font-weight: 300;
  text-shadow: 0 2px 10px rgba(0,0,0,0.5);
  color: #fff !important;
}

/* Slider Controls */
.slider-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background: rgba(0,0,0,0.3);
  border: none;
  cursor: pointer;
  padding: 10px;
  border-radius: 50%;
  transition: background 0.3s;
}
.slider-btn:hover {
  background: rgba(0,0,0,0.7);
}
.slider-btn.prev { left: 30px; }
.slider-btn.next { right: 30px; }

.slider-dots {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  gap: 12px;
}
.dot {
  width: 12px; height: 12px;
  border-radius: 50%;
  background: rgba(255,255,255,0.4);
  cursor: pointer;
  transition: background 0.3s;
}
.dot.active {
  background: rgba(255,255,255,1);
}

.hero-actions { display: flex; gap: 20px; }
.btn-large { padding: 16px 35px; font-size: 1.1rem; }
.transparent { background: transparent; color: #fff; border: 2px solid #fff; }
.transparent:hover { background: #fff; color: #000; border-color: #fff; }

/* Trust Bar (Restored) */
.trust-features { padding: 60px 20px; border-bottom: 1px solid #eee; }
.trust-grid { display: flex; justify-content: space-between; gap: 30px; }
.trust-item { display: flex; align-items: center; gap: 20px; flex: 1; padding: 20px; background: #fafafa; border-radius: 8px; }
.trust-text h4 { font-size: 1.1rem; margin-bottom: 5px; color: #000; }
.trust-text p { font-size: 0.95rem; color: #666; margin: 0; }

/* Mega Promotional Banners (Full Width) */
.mega-promos { display: flex; flex-direction: column; margin-top: 100px; margin-bottom: 80px; }
.mega-banner { position: relative; min-height: 120px; padding: 40px 0; display: flex; align-items: center; justify-content: center; overflow: hidden; margin-bottom: 30px; border-radius: 12px; }
.mega-banner img { position: absolute; top:0; left:0; width:100%; height:100%; object-fit: cover; z-index:1; }
.mega-overlay { position: absolute; top:0; left:0; width:100%; height:100%; background: linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%); z-index:2; }
.align-right .mega-overlay { background: linear-gradient(to left, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%); }
.mega-content { position: relative; z-index:3; width: 100%; display: flex; }
.align-left .mega-content { justify-content: flex-start; padding-left: 20px; }
.align-right .mega-content { justify-content: flex-end; padding-right: 20px; }
.mega-text-box { background: transparent; backdrop-filter: none; border: none; padding: 0; max-width: 400px; color: #fff; text-align: left; }
.mega-text-box h3 { font-size: 1rem; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; color: #e0e0e0 !important; }
.mega-text-box h2 { font-family: var(--font-heading); font-size: 2.2rem; margin-bottom: 15px; line-height: 1.1; color: #fff !important; }
.btn-white { background: #fff; color: #000; padding: 10px 24px; font-size: 0.95rem; border: none; text-decoration: none; display: inline-block; font-weight: 600; transition: background 0.3s; border-radius: 4px; }
.btn-white:hover { background: #f0f0f0; }

/* Grids (New Arrivals / Best Sellers) */
.best-sellers, .new-arrivals { margin-bottom: 100px; }
.section-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 50px; border-bottom: 2px solid #000; padding-bottom: 15px; }
.section-title { font-family: var(--font-heading); font-size: 2.5rem; margin-bottom: 5px; }
.section-subtitle { color: #666; font-size: 1.1rem; }
.view-all { font-weight: 600; color: #000; text-decoration: none; font-size: 1.05rem; padding-bottom: 5px; transition: opacity 0.2s; }
.view-all:hover { opacity: 0.6; }
.product-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 30px; }

/* Craftsmanship Banners */
.craftsmanship-section { margin-bottom: 100px; }
.craft-slider-container { position: relative; width: 100%; height: 500px; overflow: hidden; }
.craft-slider-track { display: flex; height: 100%; width: 100%; transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
.craft-slide { flex: 0 0 100%; position: relative; display: flex; align-items: center; justify-content: center; }
.craft-slide img { position: absolute; top:0; left:0; width:100%; height:100%; object-fit: cover; z-index:1; }
.craft-overlay { position: absolute; top:0; left:0; width:100%; height:100%; background: linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 100%); z-index:2; }
.craft-content { position: relative; z-index:3; color: #fff; width: 100%; text-align: left; }
.craft-content h3 { font-family: var(--font-heading); font-size: 3.5rem; margin-bottom: 15px; color: #fff !important; text-shadow: 0 4px 10px rgba(0,0,0,0.5); }
.craft-content p { font-size: 1.3rem; line-height: 1.6; color: #eee !important; max-width: 600px; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }

/* Brand Video Statement */
.brand-video-section { background: #050505; color: #fff; padding: 120px 0; margin-bottom: 100px; }
.branding-layout { display: grid; grid-template-columns: 1.2fr 1.5fr; gap: 80px; align-items: center; }
.brand-text h2 { font-family: var(--font-heading); font-size: 3.5rem; margin-bottom: 25px; line-height: 1.1; }
.brand-text p { font-size: 1.15rem; line-height: 1.8; color: #aaa; margin-bottom: 30px; }
.perk-list { list-style: none; font-size: 1.1rem; color: #ddd; display: flex; flex-direction: column; gap: 15px; }
.video-container { position: relative; border-radius: 4px; overflow: hidden; box-shadow: 0 30px 60px rgba(0,0,0,0.5); cursor: pointer; }
.video-container video { width: 100%; display: block; opacity: 0.8; transition: opacity 0.3s; }
.video-container:hover video { opacity: 1; }
.play-btn-wrapper { position: absolute; top:50%; left:50%; transform: translate(-50%, -50%); z-index:2; width:80px; height:80px; background: rgba(0,0,0,0.5); border-radius: 50%; display: flex; align-items: center; justify-content: center; pointer-events: none; border: 2px solid rgba(255,255,255,0.2); }

/* VIP Banner */
.ad-banner { background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%); text-align: center; padding: 80px 20px; border-radius: 12px; margin-bottom: 100px; position: relative; overflow: hidden; }
.ad-banner::before { content: ''; position: absolute; top:-50%; right:-20%; width:600px; height:600px; background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%); border-radius: 50%; z-index:1; }
.ad-content { position: relative; z-index:2; max-width: 650px; margin: 0 auto; }
.ad-content h2 { font-family: var(--font-heading); font-size: 2.8rem; margin-bottom: 20px; color: #111; }
.ad-content p { color: #444; font-size: 1.2rem; margin-bottom: 40px; line-height: 1.6; }

/* What We Do Hook */
.what-we-do-hook { display: flex; align-items: center; gap: 60px; margin-bottom: 100px; padding: 60px; background: #fafafa; border-radius: 12px; }
.hook-content { flex: 1; text-align: left; }
.hook-content h2 { font-family: var(--font-heading); font-size: 3.5rem; margin-bottom: 20px; color: #111; line-height: 1.1; }
.hook-content p { font-size: 1.15rem; color: #555; line-height: 1.7; margin-bottom: 30px; max-width: 500px; }
.hook-image { flex: 1; border-radius: 8px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
.hook-image img { width: 100%; display: block; }

/* Gender Collections */
.gender-collections { margin-bottom: 100px; }
.gender-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
.gender-banner { position: relative; height: 500px; border-radius: 8px; overflow: hidden; background-size: cover; background-position: center; display: flex; align-items: flex-end; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
.men-bg { background-image: url('https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop'); }
.women-bg { background-image: url('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop'); }
.kids-bg { background-image: url('https://images.unsplash.com/photo-1514090225131-7b0df0c8f180?q=80&w=800&auto=format&fit=crop'); }
.gender-overlay { position: absolute; top:0; left:0; width:100%; height:100%; background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%); z-index:1; transition: opacity 0.3s; opacity: 0.8; }
.gender-banner:hover .gender-overlay { opacity: 0.9; }
.gender-banner:hover .gender-content h2 { transform: translateY(-5px); }
.gender-content { position: relative; z-index:2; width: 100%; }
.gender-content h2 { font-family: var(--font-heading); font-size: 2.2rem; color: #fff; margin-bottom: 20px; text-shadow: 0 2px 10px rgba(0,0,0,0.5); transition: transform 0.3s; }



@media (max-width: 992px) {
  .slide-content h1 { font-size: 3.5rem; }
  .trust-grid { flex-direction: column; }
  .mega-text-box { padding: 40px; max-width: 400px; }
  .mega-text-box h2 { font-size: 2.8rem; }
  .product-grid { grid-template-columns: repeat(2, 1fr); }
  .craft-content h3 { font-size: 2.5rem; }
  .branding-layout { grid-template-columns: 1fr; text-align: center; gap: 50px; }
  .perk-list { align-items: center; }
  .gender-grid { grid-template-columns: 1fr; }
  .gender-banner { height: 350px; }
}

@media (max-width: 576px) {
  .slide-content h1 { font-size: 2.8rem; }
  .hero-actions { flex-direction: column; }
  .section-header { flex-direction: column; align-items: flex-start; gap: 15px; }
  .what-we-do-hook { flex-direction: column; padding: 40px 20px; text-align: center; }
  .hook-content p { max-width: 100%; }
  .mega-banner { padding: 30px 0; }
  .mega-content { justify-content: center !important; padding: 0 !important; }
  .mega-text-box { padding: 20px; text-align: center; background: rgba(0,0,0,0.6); border-radius: 8px; }
  .mega-text-box h2 { font-size: 1.8rem; }
  .product-grid { grid-template-columns: 1fr; }
}
</style>
