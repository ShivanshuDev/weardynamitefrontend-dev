<script setup>
import { Instagram, Facebook, Twitter, Mail } from 'lucide-vue-next'
</script>

<template>
  <footer class="footer">
    <div class="container footer-content grid grid-4">
      <div class="footer-col">
        <h3 class="footer-logo">WEARDYNAMITE</h3>
        <p>Premium apparel for the modern individual. T-shirts, shoes, jerseys, and more.</p>
        <div class="social-links">
          <a href="#"><Instagram :size="20" /></a>
          <a href="#"><Facebook :size="20" /></a>
          <a href="#"><Twitter :size="20" /></a>
        </div>
      </div>

      <div class="footer-col">
        <h4>Menu</h4>
        <ul>
          <li><RouterLink to="/">Home</RouterLink></li>
          <li><RouterLink to="/shop">Shop</RouterLink></li>
          <li><RouterLink to="/about">About Us</RouterLink></li>
          <li><RouterLink to="/contact">Contact Us</RouterLink></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Categories</h4>
        <ul>
          <li><a href="#">T-Shirts</a></li>
          <li><a href="#">Shoes</a></li>
          <li><a href="#">Jerseys</a></li>
          <li><a href="#">Embroidery</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Support</h4>
        <ul>
          <li><RouterLink to="/blog">Blog & Stories</RouterLink></li>
          <li><RouterLink to="/faq">FAQ</RouterLink></li>
          <li><RouterLink to="/shipping-returns">Shipping & Returns</RouterLink></li>
          <li><RouterLink to="/privacy-policy">Privacy Policy</RouterLink></li>
        </ul>
      </div>
    </div>
    <div class="container footer-bottom">
      <p>&copy; 2026 WEARDYNAMITE. All rights reserved.</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: var(--primary-color);
  color: var(--secondary-color);
  padding: 60px 0 20px;
  margin-top: auto;
}

.footer-content {
  margin-bottom: 40px;
}

.footer-logo {
  font-size: 1.2rem;
  margin-bottom: 15px;
  color: #fff;
}

.footer-col h4 {
  color: #fff;
  margin-bottom: 20px;
  text-transform: uppercase;
  font-size: 0.9rem;
  letter-spacing: 1px;
}

.footer-col p {
  font-size: 0.9rem;
  opacity: 0.7;
  margin-bottom: 20px;
}

.footer-col ul li {
  margin-bottom: 10px;
  font-size: 0.9rem;
  opacity: 0.7;
}

.footer-col ul li:hover {
  opacity: 1;
}

.social-links {
  display: flex;
  gap: 15px;
}

.social-links a {
  opacity: 0.7;
}

.social-links a:hover {
  opacity: 1;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 20px;
  text-align: center;
  font-size: 0.8rem;
  opacity: 0.5;
}
</style>
