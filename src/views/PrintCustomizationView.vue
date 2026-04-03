<script setup>
import { ref, computed } from 'vue'
import { Upload, Trash2, Printer, Scissors, ChevronRight } from 'lucide-vue-next'

const form = ref({
  productType: 'Premium Cotton T-Shirt',
  baseColor: '#ffffff',
  manufacturing: 'soft_print'
})

const activeSide = ref('front')
const decals = ref([])

const mockups = {
  front: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop',
  back: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?q=80&w=1000&auto=format&fit=crop',
  sleeve: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop'
}

const colors = ['#ffffff', '#000000', '#f1c40f', '#e67e22', '#e74c3c', '#3498db', '#2ecc71', '#95a5a6']

const handleFileUpload = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    decals.value.push({
      id: Date.now(),
      src: ev.target.result,
      side: activeSide.value,
      top: 50,
      left: 50,
      scale: 1
    })
  }
  reader.readAsDataURL(file)
}

const filteredDecals = computed(() => decals.value.filter(d => d.side === activeSide.value))
</script>

<template>
  <div class="print-studio container">
    <div class="studio-header">
      <h1>Custom Print Studio</h1>
      <p>Design your premium apparel with industrial-grade precision. Upload logos, select placements, and choose your print finish.</p>
    </div>

    <div class="studio-layout">
      <!-- Controls (Left) -->
      <div class="controls-panel">
        <div class="section">
          <label class="section-label">1. Select Apparel & Color</label>
          <select v-model="form.productType" class="dark-select">
            <option>Premium Cotton T-Shirt</option>
            <option>Streetwear Oversized Tee</option>
            <option>Heavyweight Hoodie</option>
          </select>

          <div class="color-grid">
            <div 
              v-for="c in colors" 
              :key="c" 
              class="color-swatch"
              :class="{ active: form.baseColor === c }"
              :style="{ backgroundColor: c }"
              @click="form.baseColor = c"
            ></div>
          </div>
        </div>

        <div class="section">
          <label class="section-label">2. Upload Graphic for {{ activeSide.toUpperCase() }}</label>
          <div class="upload-box" @click="$refs.fileInput.click()">
            <Upload :size="30" />
            <span>Drop Logo Here</span>
            <input type="file" ref="fileInput" hidden @change="handleFileUpload" />
          </div>
        </div>

        <div class="section">
          <label class="section-label">3. Placement Controls</label>
          <div v-if="filteredDecals.length > 0" class="adjustment-tools">
            <div class="tool-group">
              <label>Vertical Position</label>
              <input type="range" v-model="filteredDecals[0].top" min="20" max="80" />
            </div>
            <div class="tool-group">
              <label>Horizontal Position</label>
              <input type="range" v-model="filteredDecals[0].left" min="20" max="80" />
            </div>
            <div class="tool-group">
              <label>Scale Logo</label>
              <input type="range" v-model="filteredDecals[0].scale" min="0.5" max="2" step="0.1" />
            </div>
            <button class="delete-btn" @click="decals = decals.filter(d => d.id !== filteredDecals[0].id)">
              <Trash2 :size="16" /> Remove Current Logo
            </button>
          </div>
          <p v-else class="empty-hint text-center">Upload a logo to start positioning</p>
        </div>

        <div class="section">
          <label class="section-label">4. Manufacturing Finish</label>
          <div class="mfg-options">
            <label class="radio-card" :class="{ active: form.manufacturing === 'soft_print' }">
              <input type="radio" v-model="form.manufacturing" value="soft_print" hidden />
              <Printer :size="18" />
              <span>Soft-Touch Print</span>
            </label>
            <label class="radio-card" :class="{ active: form.manufacturing === 'hard_print' }">
              <input type="radio" v-model="form.manufacturing" value="hard_print" hidden />
              <Printer :size="18" />
              <span>Hard Industrial Print</span>
            </label>
            <label class="radio-card" :class="{ active: form.manufacturing === 'embroidery' }">
              <input type="radio" v-model="form.manufacturing" value="embroidery" hidden />
              <Scissors :size="18" />
              <span>Thread Embroidery</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Preview (Right) -->
      <div class="preview-panel">
        <div class="canvas-wrapper">
          <div class="canvas-bg" :style="{ backgroundColor: form.baseColor }"></div>
          <img :src="mockups[activeSide]" class="shirt-image" />
          
          <div class="decal-layer">
            <div 
              v-for="d in filteredDecals" 
              :key="d.id"
              class="decal"
              :style="{ 
                top: d.top + '%', 
                left: d.left + '%', 
                transform: `translate(-50%, -50%) scale(${d.scale})`
              }"
            >
              <img :src="d.src" />
            </div>
          </div>
        </div>

        <div class="side-selector">
          <button v-for="(v, k) in mockups" :key="k" @click="activeSide = k" :class="{ active: activeSide === k }">
            {{ k.toUpperCase() }}
          </button>
        </div>

        <div class="checkout-summary">
          <div class="price">Total Price: <span>$29.99</span></div>
          <button class="btn primary-btn btn-large">Add to Cart & Checkout</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.print-studio { padding: 60px 20px; }
.studio-header { text-align: center; margin-bottom: 50px; }
.studio-header h1 { font-family: var(--font-heading); font-size: 3.5rem; margin-bottom: 10px; }
.studio-header p { color: #666; max-width: 700px; margin: 0 auto; }

.studio-layout { display: grid; grid-template-columns: 1fr 1.3fr; gap: 40px; }

.controls-panel { background: #111; color: #fff; padding: 40px; border-radius: 12px; }
.section { margin-bottom: 35px; }
.section-label { display: block; font-size: 0.85rem; color: #aaa; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 15px; }

.dark-select { width: 100%; padding: 15px; background: #222; border: 1px solid #333; color: #fff; border-radius: 8px; }

.color-grid { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px; }
.color-swatch { width: 35px; height: 35px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; transition: 0.2s; }
.color-swatch.active { border-color: #fff; transform: scale(1.1); }

.upload-box { border: 2px dashed #444; border-radius: 12px; height: 120px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: 0.2s; color: #888; }
.upload-box:hover { border-color: #fff; color: #fff; }

.adjustment-tools { background: #222; padding: 20px; border-radius: 8px; }
.tool-group { margin-bottom: 15px; }
.tool-group label { display: block; font-size: 0.8rem; margin-bottom: 5px; color: #aaa; }
.tool-group input[type="range"] { width: 100%; accent-color: #fff; }

.delete-btn { width: 100%; padding: 10px; color: #e74c3c; border: 1px solid #e74c3c; border-radius: 6px; margin-top: 10px; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; gap: 8px; }

.mfg-options { display: flex; flex-direction: column; gap: 10px; }
.radio-card { display: flex; align-items: center; gap: 12px; padding: 15px; background: #222; border: 1px solid #333; border-radius: 8px; cursor: pointer; transition: 0.2s; }
.radio-card:hover { border-color: #555; }
.radio-card.active { border-color: #fff; background: #333; }

.preview-panel { display: flex; flex-direction: column; align-items: center; }
.canvas-wrapper { position: relative; width: 100%; max-width: 600px; aspect-ratio: 1/1; background: #fff; border: 1px solid #eee; border-radius: 12px; overflow: hidden; display: flex; align-items: center; justify-content: center; }
.canvas-bg { position: absolute; top: 15%; left: 20%; right: 20%; bottom: 15%; border-radius: 20%; opacity: 0.3; blur: 40px; }
.shirt-image { width: 100%; height: 100%; object-fit: contain; mix-blend-mode: multiply; position: relative; z-index: 1; }

.decal-layer { position: absolute; inset: 0; z-index: 2; pointer-events: none; }
.decal { position: absolute; }
.decal img { max-width: 150px; height: auto; }

.side-selector { display: flex; gap: 10px; margin-top: 30px; }
.side-selector button { padding: 10px 20px; border: 1px solid #ddd; border-radius: 30px; font-size: 0.85rem; font-weight: 700; transition: 0.2s; }
.side-selector button.active { background: #111; color: #fff; border-color: #111; }

.checkout-summary { margin-top: 40px; width: 100%; text-align: center; border-top: 1px solid #eee; padding-top: 30px; }
.price { font-size: 1.2rem; margin-bottom: 15px; color: #666; }
.price span { font-weight: 900; color: #000; font-size: 2rem; }

@media (max-width: 992px) {
  .studio-layout { grid-template-columns: 1fr; }
}
</style>
