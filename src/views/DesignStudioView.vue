<script setup>
import { ref, computed } from 'vue'
import ThreeVisualizer from '../components/ThreeVisualizer.vue'
import { 
  Upload, 
  Type, 
  Palette, 
  Maximize2, 
  Layers, 
  ShoppingBag, 
  ChevronRight,
  Monitor,
  Smartphone,
  RotateCcw
} from 'lucide-vue-next'

// State
const activeTab = ref('product') // product, artwork, text, layers
const selectedProduct = ref('tshirt')
const productColor = ref('#ffffff')
const designMode = ref('print') // print, embroidery

const products = [
  { id: 'tshirt', name: 'Premium Tee', color: '#ffffff', model: 'https://raw.githubusercontent.com/pmndrs/drei-assets/master/shirt_baked.glb' },
  { id: 'hoodie', name: 'Heavy Hoodie', color: '#111111', model: 'https://raw.githubusercontent.com/pmndrs/drei-assets/master/shirt_baked.glb' }, // Placeholder for now
  { id: 'cap', name: 'Baseball Cap', color: '#000000', model: 'https://raw.githubusercontent.com/pmndrs/drei-assets/master/shirt_baked.glb' }   // Placeholder for now
]

const currentProduct = computed(() => products.find(p => p.id === selectedProduct.value))

const colors = [
  '#ffffff', '#000000', '#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6', '#34495e', '#e67e22'
]

// Handlers
const selectProduct = (id) => {
  selectedProduct.value = id
  productColor.value = products.find(p => p.id === id).color
}

const addToCart = () => {
  alert('Custom design added to cart!')
}
</script>

<template>
  <div class="flex flex-col h-screen bg-white font-body overflow-hidden">
    <!-- Header -->
    <header class="flex items-center justify-between px-6 py-4 border-b border-gray-100 z-50 bg-white">
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-heading font-black tracking-tighter uppercase italic">Wear<span class="text-red-600">Dynamite</span> Studio</h1>
        <div class="h-6 w-[1px] bg-gray-200"></div>
        <p class="text-xs text-gray-400 font-medium uppercase tracking-widest hidden md:block">3D Professional Customizer v4.0</p>
      </div>
      
      <div class="flex items-center gap-6">
        <div class="hidden lg:flex items-center gap-2 bg-gray-50 p-1 rounded-full border border-gray-100">
          <button class="p-2 rounded-full bg-white shadow-sm"><Monitor :size="16"/></button>
          <button class="p-2 rounded-full text-gray-400 hover:text-gray-600"><Smartphone :size="16"/></button>
        </div>
        <button @click="addToCart" class="bg-black text-white px-8 py-3 rounded-full font-bold text-sm tracking-wide hover:bg-red-600 transition-all flex items-center gap-2 shadow-xl shadow-gray-200">
          <ShoppingBag :size="18"/>
          Add to Cart — $29.99
        </button>
      </div>
    </header>

    <main class="flex-1 flex overflow-hidden relative">
      <!-- 3D Viewport -->
      <div class="flex-1 bg-gray-50 relative group">
        <ThreeVisualizer 
          :productColor="productColor" 
          :modelUrl="currentProduct.model"
        />
        
        <!-- Viewport HUD -->
        <div class="absolute bottom-10 left-10 flex flex-col gap-4">
          <div class="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white shadow-2xl">
            <p class="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-2">Base Specification</p>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg shadow-inner border border-gray-200" :style="{ backgroundColor: productColor }"></div>
              <div>
                <p class="text-sm font-bold text-gray-800">{{ currentProduct.name }}</p>
                <p class="text-[10px] text-gray-400 uppercase font-bold">{{ designMode === 'print' ? 'HD Digital Print' : 'Exquisite Embroidery' }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="absolute top-10 right-10 flex flex-col gap-2">
          <button class="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:rotate-180 transition-transform duration-500">
            <RotateCcw :size="20"/>
          </button>
        </div>
      </div>

      <!-- Sidebar -->
      <aside class="w-[450px] border-l border-gray-100 bg-white flex flex-col z-40">
        <!-- Tabs -->
        <div class="flex border-b border-gray-50">
          <button 
            v-for="tab in ['product', 'artwork', 'text', 'layers']" 
            :key="tab"
            @click="activeTab = tab"
            class="flex-1 py-5 text-[10px] uppercase font-black tracking-[0.2em] transition-all relative overflow-hidden"
            :class="activeTab === tab ? 'text-black' : 'text-gray-300 hover:text-gray-500'"
          >
            {{ tab }}
            <div v-if="activeTab === tab" class="absolute bottom-0 left-0 w-full h-[3px] bg-red-600"></div>
          </button>
        </div>

        <!-- Scrollable Content -->
        <div class="flex-1 overflow-y-auto custom-scrollbar p-10">
          
          <!-- Product Selection Section -->
          <div v-if="activeTab === 'product'" class="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-6">1. Select Silhouette</label>
              <div class="grid grid-cols-2 gap-4">
                <button 
                  v-for="p in products" 
                  :key="p.id"
                  @click="selectProduct(p.id)"
                  class="group relative aspect-[4/5] rounded-3xl overflow-hidden border-2 transition-all p-4 flex flex-col items-center justify-center gap-4"
                  :class="selectedProduct === p.id ? 'border-black bg-black text-white shadow-2xl' : 'border-gray-50 bg-gray-50 hover:border-gray-200'"
                >
                  <img src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400&auto=format&fit=crop" class="w-full h-full object-contain mix-blend-multiply opacity-80 group-hover:scale-110 transition-transform duration-700" />
                  <span class="text-xs font-bold uppercase tracking-widest">{{ p.name }}</span>
                </button>
              </div>
            </div>

            <div>
              <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-6">2. Base Dye Color</label>
              <div class="flex flex-wrap gap-4">
                <button 
                  v-for="c in colors" 
                  :key="c"
                  @click="productColor = c"
                  class="w-12 h-12 rounded-2xl border-2 transition-all hover:scale-110"
                  :class="productColor === c ? 'border-black ring-4 ring-gray-100' : 'border-transparent'"
                  :style="{ backgroundColor: c }"
                ></button>
              </div>
            </div>

            <div>
              <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-6">3. Manufacturing Method</label>
              <div class="flex gap-4 p-1 bg-gray-50 rounded-2xl border border-gray-100">
                <button 
                  @click="designMode = 'print'"
                  class="flex-1 py-4 text-xs font-bold uppercase tracking-widest rounded-xl transition-all"
                  :class="designMode === 'print' ? 'bg-white shadow-md text-black' : 'text-gray-400 hover:text-gray-600'"
                >
                  Digital Print
                </button>
                <button 
                  @click="designMode = 'embroidery'"
                  class="flex-1 py-4 text-xs font-bold uppercase tracking-widest rounded-xl transition-all"
                  :class="designMode === 'embroidery' ? 'bg-white shadow-md text-black' : 'text-gray-400 hover:text-gray-600'"
                >
                  Embroidery
                </button>
              </div>
            </div>
          </div>

          <!-- Artwork Section -->
          <div v-if="activeTab === 'artwork'" class="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
             <div class="p-10 border-2 border-dashed border-gray-100 rounded-[32px] bg-gray-50/50 flex flex-col items-center justify-center text-center group hover:border-red-200 transition-colors cursor-pointer">
                <div class="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-red-50 transition-all duration-500">
                  <Upload class="text-gray-400 group-hover:text-red-600 transition-colors"/>
                </div>
                <h4 class="text-sm font-bold text-gray-800 mb-2">Upload Artwork</h4>
                <p class="text-[10px] text-gray-400 font-medium uppercase tracking-widest leading-relaxed">PNG, JPG or SVG<br/>Max size 50MB</p>
             </div>

             <div class="grid grid-cols-3 gap-3">
                <div v-for="i in 6" :key="i" class="aspect-square bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-300 transition-all cursor-pointer overflow-hidden p-2">
                   <div class="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 font-black italic">ART</div>
                </div>
             </div>
          </div>

          <!-- Text Section -->
          <div v-if="activeTab === 'text'" class="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
             <button class="w-full bg-black text-white py-5 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-red-600 transition-all flex items-center justify-center gap-3">
               <Type :size="16"/>
               Add New Text Layer
             </button>
             
             <div class="p-8 bg-gray-50 rounded-[32px] space-y-6 border border-gray-100">
                <label class="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Active Layer Editor</label>
                <div class="space-y-4">
                   <input type="text" value="DYNAMITE" class="w-full bg-white border border-gray-100 p-4 rounded-xl text-xs font-bold tracking-widest focus:ring-2 ring-red-500 outline-none" />
                   
                   <div class="grid grid-cols-4 gap-2">
                      <button class="aspect-square bg-white border border-gray-100 rounded-lg text-xs font-bold hover:bg-black hover:text-white transition-all">B</button>
                      <button class="aspect-square bg-white border border-gray-100 rounded-lg text-xs font-italic hover:bg-black hover:text-white transition-all italic">I</button>
                      <button class="aspect-square bg-white border border-gray-100 rounded-lg text-xs flex items-center justify-center hover:bg-black hover:text-white transition-all"><Maximize2 :size="14"/></button>
                      <button class="aspect-square bg-white border border-gray-100 rounded-lg text-xs flex items-center justify-center hover:bg-black hover:text-white transition-all"><Layers :size="14"/></button>
                   </div>
                </div>
             </div>
          </div>

          <!-- Layers Section -->
          <div v-if="activeTab === 'layers'" class="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
             <div v-for="i in 3" :key="i" class="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-gray-200 transition-all">
                <div class="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[10px] font-black">L{{i}}</div>
                <div class="flex-1">
                   <p class="text-xs font-bold">Element {{i}}</p>
                   <p class="text-[10px] text-gray-400 font-medium">Position: Front Chest</p>
                </div>
                <button class="text-gray-300 hover:text-red-500 transition-colors"><Trash2 :size="16"/></button>
             </div>
          </div>

        </div>

        <!-- Sticky Footer Info -->
        <div class="p-10 border-t border-gray-50 bg-white">
           <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold text-gray-400">Production Time</span>
              <span class="text-xs font-black">3-5 Business Days</span>
           </div>
           <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-gray-400">Quality Grade</span>
              <span class="text-xs font-black uppercase text-green-600">Enterprise Premium</span>
           </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #eee;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #ddd;
}

@keyframes slide-in-from-right-4 {
  from { transform: translateX(20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.animate-in {
  animation: slide-in-from-right-4 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
