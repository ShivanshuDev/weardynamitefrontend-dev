<script setup>
import { useProductStore } from '../stores/productStore'
import { Calendar, User, ArrowRight } from 'lucide-vue-next'

const productStore = useProductStore()
</script>

<template>
  <div class="blog-view container">
    <header class="blog-header">
      <h1 class="page-title">Dynamite Stories</h1>
      <p class="subtitle">Insights into fashion, craftsmanship, and the modern lifestyle.</p>
    </header>

    <div class="blog-grid">
      <article v-for="blog in productStore.blogs" :key="blog.id" class="blog-card">
        <div class="blog-image">
          <img :src="blog.image" :alt="blog.title" />
        </div>
        <div class="blog-content">
          <div class="blog-meta">
            <span><Calendar :size="14" /> {{ blog.date }}</span>
            <span><User :size="14" /> By {{ blog.author }}</span>
          </div>
          <h2 class="blog-title">{{ blog.title }}</h2>
          <p class="blog-excerpt">Discover the latest trends and how Wear Dynamite is leading the charge in customizable premium apparel...</p>
          <router-link :to="'/blog/' + blog.id" class="read-more">Read Article <ArrowRight :size="16" /></router-link>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.blog-view {
  padding: 80px 20px;
}
.blog-header {
  text-align: center;
  margin-bottom: 60px;
}
.page-title {
  font-size: 3rem;
  font-family: var(--font-heading);
  margin-bottom: 10px;
}
.subtitle {
  color: #666;
  font-size: 1.2rem;
}
.blog-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}
.blog-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  transition: transform 0.3s;
}
.blog-card:hover {
  transform: translateY(-5px);
}
.blog-image {
  height: 240px;
  overflow: hidden;
}
.blog-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.blog-content {
  padding: 30px;
}
.blog-meta {
  display: flex;
  gap: 20px;
  font-size: 0.85rem;
  color: #999;
  margin-bottom: 15px;
}
.blog-meta span {
  display: flex;
  align-items: center;
  gap: 5px;
}
.blog-title {
  font-size: 1.4rem;
  margin-bottom: 15px;
  line-height: 1.3;
}
.blog-excerpt {
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 20px;
  line-height: 1.6;
}
.read-more {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 700;
  color: #000;
  text-decoration: none;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.read-more:hover {
  text-decoration: underline;
}

@media (max-width: 992px) {
  .blog-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .blog-grid { grid-template-columns: 1fr; }
}
</style>
