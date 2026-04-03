<script setup>
import { Palette, Scissors, ShoppingBag, Shirt } from 'lucide-vue-next'
</script>

<template>
  <div class="customize-view">
    <!-- Hero Banner -->
    <div class="page-hero">
      <div class="hero-overlay"></div>
      <div class="hero-content container">
        <h1>What We Do</h1>
        <p>If you can imagine it, we can create it. Whatever our customers need, we precisely customize and provide.</p>
      </div>
    </div>

    <!-- Section 1: Apparel & Accessories (Print) -->
    <section class="custom-section alternate container">
      <div class="text-block">
        <div class="icon-wrapper"><Shirt :size="40" /></div>
        <h2>Print & Casual Customization</h2>
        <p>Whether you need a single graphic tee or bulk orders for your organization, we offer unlimited premium design customization.</p>
        <ul class="feature-list">
          <li><strong>T-Shirts & Hoodies:</strong> High-density screen prints and DTF with edge-to-edge designs.</li>
          <li><strong>Bags & Shoes:</strong> Custom graphics structurally printed to maintain durability.</li>
          <li><strong>Game Jerseys:</strong> Breathable, sublimated fabrics for peak athletic performance.</li>
          <li><strong>Corporate Gifts:</strong> Branded luxury apparel for your next big corporate event.</li>
        </ul>
        <div style="margin-top: 30px;">
          <RouterLink to="/customize/print" class="btn primary-btn btn-large">Start Print Design →</RouterLink>
        </div>
      </div>
      <div class="image-block">
        <img src="https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=1000&auto=format&fit=crop" alt="Custom T-Shirts" />
      </div>
    </section>

    <!-- Section 2: Premium Embroidery (Traditional & Formal) -->
    <section class="custom-section container">
      <div class="image-block">
        <img src="https://images.unsplash.com/photo-1551892862-2f3b97b0a373?q=80&w=1000&auto=format&fit=crop" alt="Premium Embroidery" />
      </div>
      <div class="text-block">
        <div class="icon-wrapper"><Scissors :size="40" /></div>
        <h2>Premium Embroidery & Traditional Wear</h2>
        <p>Elevate your formal and traditional wear with exquisite, custom-tailored embroidery. You hold complete control over every element of the garment.</p>
        <ul class="feature-list">
          <li><strong>Bridal & Ethnic:</strong> Lehengas, Saris, and Blouses crafted to exacting measurements.</li>
          <li><strong>Accessories:</strong> Dupattas and Stalls adorned with intricate, hand-placed stonework.</li>
          <li><strong>Sourced Perfection:</strong> Choose your exact silk quality, cloth weight, thread density, and embellishment colors.</li>
        </ul>
        <div style="margin-top: 30px;">
          <RouterLink to="/customize/embroidery" class="btn primary-btn btn-large">Start Embroidery Design →</RouterLink>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
.customize-view { min-height: 100vh; background: #fff; padding-bottom: 80px; }
.page-hero { position: relative; height: 450px; background-image: url('https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=2000&auto=format&fit=crop'); background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; text-align: center; color: #fff; margin-bottom: 100px; }
.hero-overlay { position: absolute; top:0; left:0; width:100%; height:100%; background: linear-gradient(0deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 100%); z-index:1; }
.hero-content { position: relative; z-index:2; max-width: 800px; padding: 0 20px; }
.hero-content h1 { font-family: var(--font-heading); font-size: 4.5rem; margin-bottom: 25px; text-shadow: 0 4px 10px rgba(0,0,0,0.5); }
.hero-content p { font-size: 1.35rem; line-height: 1.6; text-shadow: 0 2px 5px rgba(0,0,0,0.5); font-weight: 300; }

.custom-section { display: flex; align-items: center; gap: 80px; margin-bottom: 120px; }
.custom-section.alternate { flex-direction: row-reverse; }
.text-block { flex: 1; text-align: left; }
.image-block { flex: 1; overflow: hidden; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); position: relative; height: 600px; }
.image-block img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
.image-block:hover img { transform: scale(1.08); }

.icon-wrapper { width: 70px; height: 70px; background: #111; color: #fff; display: flex; align-items: center; justify-content: center; border-radius: 50%; margin-bottom: 25px; }
.text-block h2 { font-family: var(--font-heading); font-size: 3rem; margin-bottom: 25px; color: #111; line-height: 1.1; }
.text-block p { font-size: 1.2rem; color: #555; line-height: 1.7; margin-bottom: 30px; }
.feature-list { list-style: none; padding: 0; }
.feature-list li { padding: 15px 0; border-bottom: 1px solid #eee; font-size: 1.1rem; color: #444; line-height: 1.5; }
.feature-list li:last-child { border-bottom: none; }
.feature-list strong { color: #000; font-weight: 700; font-family: var(--font-heading); letter-spacing: 0.5px; }

.cta-section { text-align: center; background: #fafafa; padding: 100px 40px; border-radius: 12px; border: 1px solid #eaeaea; margin-bottom: 50px; }
.cta-section h2 { font-family: var(--font-heading); font-size: 3.5rem; margin-bottom: 30px; color: #111; }
.cta-button { font-size: 1.2rem; padding: 20px 50px; text-transform: uppercase; letter-spacing: 1px; }

@media (max-width: 992px) {
  .hero-content h1 { font-size: 3.5rem; }
  .custom-section, .custom-section.alternate { flex-direction: column; text-align: left; gap: 40px; }
  .icon-wrapper { margin-left: 0; }
  .image-block { height: 400px; width: 100%; }
}

@media (max-width: 576px) {
  .hero-content h1 { font-size: 2.8rem; }
  .text-block h2 { font-size: 2.5rem; }
  .cta-section { padding: 60px 20px; }
  .cta-section h2 { font-size: 2.5rem; }
  .cta-button { width: 100%; padding: 15px; font-size: 1.05rem; }
}
</style>
