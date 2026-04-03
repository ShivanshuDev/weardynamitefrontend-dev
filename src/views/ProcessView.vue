<script setup>
import { ShieldCheck, Printer, Package, Truck, Info } from 'lucide-vue-next'
import { useProductStore } from '../stores/productStore'

const productStore = useProductStore()

// Mock mapping icons to steps (since we store text in CMS)
const stepIcons = [ShieldCheck, Printer, Package, Truck]
</script>

<template>
  <div class="process-view">
    <!-- Hero Banner -->
    <div class="process-hero" :style="{ backgroundImage: `url(${productStore.siteContent.process.hero.image})` }">
      <div class="hero-overlay"></div>
      <div class="hero-content container">
        <h1>{{ productStore.siteContent.process.hero.title }}</h1>
        <p>{{ productStore.siteContent.process.hero.subtitle }}</p>
      </div>
    </div>

    <!-- Process Timeline -->
    <div class="timeline-section container">
      
      <div 
        v-for="(step, idx) in productStore.siteContent.process.steps" 
        :key="idx"
        class="timeline-step"
        :class="{ alt: idx % 2 !== 0 }"
      >
        <template v-if="idx % 2 === 0">
          <div class="step-icon">
            <div class="icon-circle">
              <component :is="stepIcons[idx % stepIcons.length]" :size="40" />
            </div>
          </div>
          <div class="step-content">
            <h3>{{ step.title }}</h3>
            <p><strong>What we have:</strong> {{ step.have }}</p>
            <p><strong>What we do:</strong> {{ step.do }}</p>
          </div>
        </template>
        
        <template v-else>
          <div class="step-content">
            <h3>{{ step.title }}</h3>
            <p><strong>What we have:</strong> {{ step.have }}</p>
            <p><strong>What we do:</strong> {{ step.do }}</p>
          </div>
          <div class="step-icon">
            <div class="icon-circle">
              <component :is="stepIcons[idx % stepIcons.length]" :size="40" />
            </div>
          </div>
        </template>
      </div>

    </div>

    <!-- Conclusion CTA -->
    <section class="process-cta container">
      <div class="cta-box">
        <Info :size="48" color="#000" />
        <h2>Experience The Difference</h2>
        <p>Now that you know how it's made, feel it for yourself.</p>
        <router-link to="/shop" class="btn primary-btn btn-large">Shop The Collection</router-link>
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
  .hero-content h1 { font-size: 3rem; }
  
  .timeline-step, .timeline-step.alt {
    flex-direction: column;
    text-align: left;
    gap: 30px;
  }
  
  .icon-circle {
    width: 70px;
    height: 70px;
  }
}
</style>
