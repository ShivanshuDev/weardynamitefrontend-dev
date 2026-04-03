<script setup>
import { ShieldCheck, Truck, RotateCcw } from 'lucide-vue-next'
</script>

<template>
  <div class="about-view">
    <!-- Hero Section -->
    <section class="about-hero">
      <div class="container">
        <h1>Redefining Modern Fashion</h1>
        <p>At WEARDYNAMITE, we believe clothing is more than just fabric—it's an expression of your deepest ambitions and explosive potential.</p>
      </div>
      <div class="overlay"></div>
      <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e07?q=80&w=2070&auth=user&fit=crop" alt="Fashion background" class="bg-image" />
    </section>

    <!-- Mission Section -->
    <section class="mission-section container">
      <div class="grid grid-2 align-center">
        <div class="mission-text">
          <span class="subheading">Our Mission</span>
          <h2>Crafting Premium Quality Without the Premium Price Tag</h2>
          <p>Founded in 2026, our journey began with a simple question: Why should exceptional style and comfort cost a fortune? By bypassing traditional retail markups and manufacturing networks, we deliver unparalleled craftsmanship directly to your doorstep.</p>
          <p>We source only the finest fabrics—from breathable organic cottons to sleek, sustainable synthetics. Every stitch is a testament to our dedication to durability and timeless aesthetic.</p>
        </div>
        <div class="mission-image">
          <img src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=2070&auto=format&fit=crop" alt="Craftsmanship" />
        </div>
      </div>
    </section>

    <!-- Values / Trust Section -->
    <section class="values-section">
      <div class="container">
        <div class="text-center heading-container">
          <h2>Why Choose WEARDYNAMITE?</h2>
          <p>We stand by our products. Because your confidence is our priority.</p>
        </div>

        <div class="features-grid">
          <div class="feature-card">
            <div class="icon-wrapper"><ShieldCheck size="40" strokeWidth="1.5" /></div>
            <h3>Guarantee of Quality</h3>
            <p>Every garment passes through a 15-point inspection process before it ever reaches the packaging phase.</p>
          </div>
          <div class="feature-card">
            <div class="icon-wrapper"><Truck size="40" strokeWidth="1.5" /></div>
            <h3>Swift & Secure Logistics</h3>
            <p>Experience ultra-fast fulfillment. If you need it for the weekend, we ensure it's on your porch by Friday.</p>
          </div>
          <div class="feature-card">
            <div class="icon-wrapper"><RotateCcw size="40" strokeWidth="1.5" /></div>
            <h3>Hassle-Free Returns</h3>
            <p>If it doesn't fit flawlessly, send it back within 30 days. No questions asked, no friction added.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-view {
  min-height: 100vh;
}

/* Hero */
.about-hero {
  position: relative;
  height: 60vh;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #fff;
  overflow: hidden;
}

.about-hero .container {
  position: relative;
  z-index: 2;
  max-width: 800px;
}

.about-hero h1 {
  font-family: var(--font-heading);
  font-size: 4rem;
  margin-bottom: 20px;
  text-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.about-hero p {
  font-size: 1.25rem;
  line-height: 1.6;
  opacity: 0.9;
}

.bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

/* Mission */
.mission-section {
  padding: 100px 20px;
}

.align-center {
  align-items: center;
  gap: 80px;
}

.mission-text .subheading {
  display: block;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #666;
  margin-bottom: 10px;
}

.mission-text h2 {
  font-family: var(--font-heading);
  font-size: 2.8rem;
  line-height: 1.2;
  margin-bottom: 30px;
}

.mission-text p {
  font-size: 1.05rem;
  color: #555;
  line-height: 1.8;
  margin-bottom: 20px;
}

.mission-image img {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

/* Values */
.values-section {
  background: #fafafa;
  padding: 100px 20px;
  border-top: 1px solid #eee;
}

.heading-container {
  max-width: 600px;
  margin: 0 auto 60px;
}

.heading-container h2 {
  font-family: var(--font-heading);
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.heading-container p {
  color: #666;
  font-size: 1.1rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}

.feature-card {
  background: #fff;
  padding: 50px 30px;
  text-align: center;
  border-radius: 8px;
  border: 1px solid #eaeaea;
  box-shadow: 0 10px 30px rgba(0,0,0,0.02);
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-10px);
}

.icon-wrapper {
  width: 80px;
  height: 80px;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 25px;
  color: #000;
}

.feature-card h3 {
  font-family: var(--font-heading);
  font-size: 1.4rem;
  margin-bottom: 15px;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

@media (max-width: 992px) {
  .mission-section .align-center {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .features-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .about-hero h1 {
    font-size: 2.8rem;
  }
}
</style>
