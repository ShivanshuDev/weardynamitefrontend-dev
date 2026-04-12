<script setup>
import { onMounted } from 'vue'
import { ShieldCheck, Printer, Package, Truck, Info, Zap } from 'lucide-vue-next'
import { useProductStore } from '../stores/productStore'

const productStore = useProductStore()

// Mock mapping icons to steps (since we store text in CMS)
const stepIcons = [Zap, Printer, Package, Truck, ShieldCheck]

onMounted(() => {
  productStore.fetchCms()
})
</script>

<template>
  <div class="process-view">
    <!-- Hero Banner -->
    <div 
      class="process-hero" 
      :style="{ backgroundImage: `url(${productStore.resolveImageUrl(productStore.siteContent.process?.hero?.image)})` }"
    >
      <div class="hero-overlay"></div>
      <div class="hero-content container">
        <h1 
          class="hero-title"
          :style="{ 
            color: productStore.siteContent.process?.hero?.title?.color,
            fontWeight: productStore.siteContent.process?.hero?.title?.bold ? '900' : '400',
            fontStyle: productStore.siteContent.process?.hero?.title?.italic ? 'italic' : 'normal'
          }"
        >
          {{ productStore.siteContent.process?.hero?.title?.text || 'Our Process' }}
        </h1>
        <p 
          class="hero-subtitle"
          :style="{ 
            color: productStore.siteContent.process?.hero?.subtitle?.color
          }"
        >
          {{ productStore.siteContent.process?.hero?.subtitle?.text || 'The journey of craftsmanship.' }}
        </p>
      </div>
    </div>

    <!-- Process Timeline -->
    <div class="timeline-section container">
      
      <div 
        v-for="(step, idx) in (productStore.siteContent.process?.steps || [])" 
        :key="idx"
        class="timeline-step"
        :class="{ alt: idx % 2 !== 0 }"
      >
        <template v-if="idx % 2 === 0">
          <div class="step-icon">
            <div class="icon-circle shadow-xl">
              <component :is="stepIcons[idx % stepIcons.length]" :size="40" />
            </div>
          </div>
          <div class="step-content">
            <h3 
              class="step-title"
              :style="{ 
                color: step.title?.color, 
                fontWeight: step.title?.bold ? '900' : '400',
                fontStyle: step.title?.italic ? 'italic' : 'normal'
              }"
            >
              {{ step.title?.text || step.title }}
            </h3>
            <p :style="{ color: step.have?.color, fontSize: (step.have?.size || 14) + 'px' }">
              <strong>What we have:</strong> {{ step.have?.text || step.have }}
            </p>
            <p :style="{ color: step.do?.color, fontSize: (step.do?.size || 14) + 'px' }">
              <strong>What we do:</strong> {{ step.do?.text || step.do }}
            </p>
          </div>
        </template>
        
        <template v-else>
          <div class="step-content">
            <h3 
              class="step-title"
              :style="{ 
                color: step.title?.color, 
                fontWeight: step.title?.bold ? '900' : '400',
                fontStyle: step.title?.italic ? 'italic' : 'normal'
              }"
            >
              {{ step.title?.text || step.title }}
            </h3>
            <p :style="{ color: step.have?.color, fontSize: (step.have?.size || 14) + 'px' }">
              <strong>What we have:</strong> {{ step.have?.text || step.have }}
            </p>
            <p :style="{ color: step.do?.color, fontSize: (step.do?.size || 14) + 'px' }">
              <strong>What we do:</strong> {{ step.do?.text || step.do }}
            </p>
          </div>
          <div class="step-icon">
            <div class="icon-circle shadow-xl">
              <component :is="stepIcons[idx % stepIcons.length]" :size="40" />
            </div>
          </div>
        </template>
      </div>

    </div>

    <!-- Conclusion CTA -->
    <section class="process-cta container">
      <div class="cta-box">
        <Info :size="48" :color="productStore.siteContent.process?.cta?.title?.color || '#d97706'" />
        <h2 
          class="cta-title"
          :style="{ 
            color: productStore.siteContent.process?.cta?.title?.color,
            fontWeight: productStore.siteContent.process?.cta?.title?.bold ? '900' : '400'
          }"
        >
          {{ productStore.siteContent.process?.cta?.title?.text || 'Experience The Difference' }}
        </h2>
        <p 
          class="cta-subtitle"
          :style="{ 
            color: productStore.siteContent.process?.cta?.subtitle?.color
          }"
        >
          {{ productStore.siteContent.process?.cta?.subtitle?.text || "Now that you know how it's made, feel it for yourself." }}
        </p>
        <router-link to="/shop" class="btn primary-btn btn-large shadow-2xl">Shop The Collection</router-link>
      </div>
    </section>

  </div>
</template>

<style scoped>
.process-view {
  min-height: 100vh;
  background-color: #fdfdfd;
}

.process-hero {
  position: relative;
  height: 400px;
  background-image: url('https://images.unsplash.com/photo-1563823293806-03f140026e6d?q=80&w=2000&auto=format&fit=crop');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #fff;
}

.hero-overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.6);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
}

.hero-content h1 {
  font-family: var(--font-heading);
  font-size: 4rem;
  margin-bottom: 20px;
  text-shadow: 0 4px 15px rgba(0,0,0,0.5);
}

.hero-content p {
  font-size: 1.25rem;
  line-height: 1.6;
  font-weight: 300;
}

/* Timeline */
.timeline-section {
  padding: 100px 20px;
  max-width: 1000px;
}

.timeline-step {
  display: flex;
  align-items: flex-start;
  gap: 50px;
  margin-bottom: 80px;
}

.timeline-step.alt {
  text-align: right;
}

.step-icon {
  flex-shrink: 0;
}

.icon-circle {
  width: 100px;
  height: 100px;
  background: #111;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.step-content {
  flex: 1;
  padding-top: 10px;
}

.step-content h3 {
  font-family: var(--font-heading);
  font-size: 2.2rem;
  margin-bottom: 20px;
  color: #111;
}

.step-content p {
  font-size: 1.1rem;
  line-height: 1.7;
  color: #555;
  margin-bottom: 15px;
}

.step-content strong {
  color: #000;
  font-weight: 700;
}

/* CTA */
.process-cta {
  padding-bottom: 100px;
}

.cta-box {
  background: #f4f4f4;
  padding: 80px 40px;
  border-radius: 12px;
  text-align: center;
  border: 1px solid #eaeaea;
}

.cta-box h2 {
  font-family: var(--font-heading);
  font-size: 2.8rem;
  margin: 20px 0;
  color: #111;
}

.cta-box p {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 40px;
}

@media (max-width: 768px) {
  .process-hero { height: 300px; padding: 0 15px; }
  .hero-title { font-size: 2.5rem !important; }
  .hero-subtitle { font-size: 1.1rem !important; }
  
  .timeline-section { padding: 50px 15px; }
  .timeline-step, .timeline-step.alt {
    flex-direction: column;
    text-align: left;
    gap: 20px;
    margin-bottom: 50px;
  }
  
  .step-title { font-size: 1.75rem !important; }
  
  .icon-circle {
    width: 60px;
    height: 60px;
  }
  .icon-circle svg { width: 28px; height: 28px; }

  .cta-box { padding: 50px 20px; }
  .cta-title { font-size: 2rem !important; }
  .cta-subtitle { font-size: 1rem !important; }
}
</style>
