<script setup>
import { ref } from 'vue'

const form = ref({
  apparelType: 'Lehenga',
  fabric: 'Pure Mulberry Silk',
  baseColor: '#8e44ad',
  threadType: 'Zari (Metallic Thread)',
  stoneWork: 'Heavy Kundan & Crystal',
  measurements: '',
  additionalRequests: ''
})

const colors = ['#8e44ad', '#c0392b', '#27ae60', '#f39c12', '#2c3e50', '#ffffff', '#e67e22', '#ff9ff3']

const submitEmbroidery = () => {
  alert('Your bespoke embroidery request has been filed for review by our master artisans!')
}
</script>

<template>
  <div class="customization-portal container">
    <div class="portal-header">
      <h1>Premium Embroidery Studio</h1>
      <p>Bespoke ethnic and formal wear crafted entirely to your imagination. Select your base silhouettes, fabrics, and opulent embellishments.</p>
    </div>

    <div class="portal-layout">
      
      <!-- Specifications (Left) -->
      <div class="portal-panel specifications">
        <h2>Apparel Configuration</h2>
        
        <div class="form-group">
          <label>Apparel Silhouette</label>
          <select v-model="form.apparelType" size="6" class="listbox">
            <option value="Lehenga">Lehenga (Bridal & Festive)</option>
            <option value="Sari">Sari</option>
            <option value="Suite">Punjabi Suit / Salwar</option>
            <option value="Kurti">Kurti</option>
            <option value="Blouse">Custom Blouse</option>
            <option value="Stall">Stall / Dupatta Only</option>
          </select>
        </div>

        <div class="form-group grid-2">
          <div>
            <label>Base Fabric (Cloth)</label>
            <select v-model="form.fabric">
              <optgroup label="Silks">
                <option>Pure Mulberry Silk</option>
                <option>Banarasi Chanderi</option>
                <option>Raw Silk</option>
              </optgroup>
              <optgroup label="Lightweights">
                <option>Georgette</option>
                <option>Chiffon</option>
                <option>Organza</option>
                <option>Premium Net</option>
              </optgroup>
              <optgroup label="Rich Textures">
                <option>Velvet</option>
                <option>Brocade</option>
                <option>Satin</option>
              </optgroup>
            </select>
          </div>
          <div>
            <label>Thread Selection</label>
            <select v-model="form.threadType">
              <option>Zari (Metallic Thread)</option>
              <option>Resham (Silk Thread)</option>
              <option>Cotton Blend Thread</option>
              <option>Multi-Colored Mixed</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Base Fabric Color</label>
          <div class="color-picker">
            <div 
              v-for="c in colors" 
              :key="c" 
              class="color-swatch flex-center"
              :class="{ active: form.baseColor === c }"
              :style="{ background: c }"
              @click="form.baseColor = c"
            ></div>
          </div>
        </div>

        <div class="form-group">
          <label>Stonework & Embellishments (Density)</label>
          <select v-model="form.stoneWork">
            <option>Heavy Kundan & Crystal (Bridal)</option>
            <option>Zardosi & Mirror Work</option>
            <option>Sequence & Pearl Detailing</option>
            <option>Light Minimalist Border Only</option>
            <option>Pure Threadwork (No Stones)</option>
          </select>
        </div>
      </div>

      <!-- Details (Right) -->
      <div class="portal-panel details-panel">
        <h3>Measurements & Bespoke Details</h3>
        
        <div class="form-section">
          <label class="dark-label">Enter Exact Measurements (Optional)</label>
          <textarea v-model="form.measurements" placeholder="E.g., Waist 30, Chest 36, Length 42... or leave blank and we will send a physical measurement guide." rows="5"></textarea>
        </div>

        <div class="form-section">
          <label class="dark-label">Artisan Instructions</label>
          <textarea v-model="form.additionalRequests" placeholder="Describe the motif, pattern style (e.g., Floral, Geometric, Traditional Rajasthani)..." rows="8"></textarea>
        </div>

        <div class="summary-box">
          <h4>Studio Commitment</h4>
          <p>Upon submission, a master artisan will review your selections and contact you via email to finalize the blueprint and provide a timeline. <strong>Crafting bespoke embroidery typically takes 14-25 days.</strong></p>
        </div>

        <button class="btn primary-btn btn-large submit-btn" @click="submitEmbroidery">Request Consultation</button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.customization-portal {
  padding: 60px 20px 100px;
}
.portal-header {
  text-align: center;
  margin-bottom: 50px;
}
.portal-header h1 {
  font-family: var(--font-heading);
  font-size: 3.5rem;
  margin-bottom: 15px;
}
.portal-header p {
  font-size: 1.2rem;
  color: #666;
  max-width: 650px;
  margin: 0 auto;
}

.portal-layout {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 40px;
}

.portal-panel {
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

.specifications {
  background: #111;
  color: #fff;
}
.specifications h2 {
  font-family: var(--font-heading);
  font-size: 2.2rem;
  margin-bottom: 30px;
  border-bottom: 1px solid #333;
  padding-bottom: 15px;
}

.details-panel {
  background: #fdfdfd;
  border: 1px solid #eaeaea;
}
.details-panel h3 {
  font-family: var(--font-heading);
  font-size: 2rem;
  margin-bottom: 30px;
}

.form-group { margin-bottom: 25px; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.form-group label { display: block; font-size: 0.9rem; color: #aaa; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }

.dark-label { display: block; font-weight: 600; font-size: 0.95rem; color: #111; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }

select { width: 100%; padding: 14px; background: #222; border: 1px solid #444; color: #fff; border-radius: 6px; font-size: 1.05rem; }
select:focus { outline: none; border-color: #fff; }

select.listbox { padding: 10px; height: auto; }
select.listbox option { padding: 10px; margin-bottom: 2px; border-radius: 4px; cursor: pointer; transition: 0.2s; }
select.listbox option:checked { background: #fff; color: #000; font-weight: bold; }

textarea { width: 100%; padding: 15px; border: 1px solid #ccc; border-radius: 6px; font-size: 1rem; resize: vertical; background: #fff; }
textarea:focus { outline: none; border-color: #111; }
.form-section { margin-bottom: 30px; }

.color-picker { display: flex; flex-wrap: wrap; gap: 15px; }
.color-swatch { width: 45px; height: 45px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; box-shadow: 0 2px 5px rgba(0,0,0,0.5); transition: transform 0.2s; }
.color-swatch:hover { transform: scale(1.1); }
.color-swatch.active { border-color: #fff; transform: scale(1.1); box-shadow: 0 0 0 2px #111, 0 0 0 4px #fff; }

.summary-box { background: #f4f4f4; padding: 25px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #111; }
.summary-box h4 { margin-bottom: 10px; font-size: 1.1rem; }
.summary-box p { font-size: 0.95rem; color: #555; line-height: 1.6; }

.submit-btn { width: 100%; padding: 20px; font-size: 1.2rem; }

@media (max-width: 992px) {
  .portal-layout { grid-template-columns: 1fr; }
}
</style>
