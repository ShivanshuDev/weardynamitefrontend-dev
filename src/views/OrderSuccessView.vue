<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useProductStore } from '../stores/productStore'
import { 
  CheckCircle2, 
  Package, 
  Truck, 
  Home, 
  Calendar, 
  CreditCard, 
  MapPin, 
  ChevronRight,
  ExternalLink,
  ArrowLeft,
  ShoppingBag
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const productStore = useProductStore()

const orderId = route.query.id
const order = ref(null)
const loading = ref(true)

onMounted(async () => {
  if (orderId) {
    try {
      order.value = await authStore.fetchOrderById(orderId)
    } catch (err) {
      console.error('Error fetching order:', err)
    } finally {
      loading.value = false
    }
  } else {
    loading.value = false
  }
})

const statusSteps = [
  { id: 'Pending', label: 'Ordered', icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-100' },
  { id: 'Processing', label: 'Processing', icon: Package, color: 'text-amber-500', bg: 'bg-amber-100' },
  { id: 'Shipped', label: 'Shipped', icon: Truck, color: 'text-purple-500', bg: 'bg-purple-100' },
  { id: 'Delivered', label: 'Delivered', icon: Home, color: 'text-emerald-500', bg: 'bg-emerald-100' }
]

const currentStatusIndex = computed(() => {
  if (!order.value) return 0
  const status = order.value.status || 'Pending'
  const idx = statusSteps.findIndex(s => s.id === status)
  return idx === -1 ? 0 : idx
})

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const goToShop = () => router.push('/shop')
const viewInvoice = () => router.push(`/order-status?id=${orderId}`)

// Helper for image URLs
const getImageUrl = (path) => {
  if (!path) return 'https://via.placeholder.com/300'
  if (path.startsWith('http')) return path
  const bucketUrl = 'https://weardynamite-dev-assets.s3.ap-southeast-2.amazonaws.com/'
  return `${bucketUrl}${path}`
}
</script>

<template>
  <div class="order-success-container">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Fetching your order details...</p>
    </div>

    <div v-else-if="order" class="content-wrapper">
      <!-- Success Hero -->
      <div class="success-hero animate-in slide-in-from-bottom-4 duration-700">
        <div class="check-container">
          <CheckCircle2 class="text-emerald-500 animate-bounce-short" :size="64" />
        </div>
        <h1 class="text-3xl font-black text-slate-900 mt-6">Order Confirmed!</h1>
        <p class="text-slate-500 font-bold mt-2">
          Thank you for your purchase. Your order <span class="text-slate-900">#{{ order.order_number || order.id.slice(0,8) }}</span> has been placed successfully.
        </p>
      </div>

      <!-- Tracking Progress Bar -->
      <div class="card tracking-card mt-12 animate-in slide-in-from-bottom-6 duration-700 delay-150">
        <div class="flex items-center justify-between mb-8">
          <h3 class="text-xs font-black uppercase tracking-widest text-slate-400">Order Journey</h3>
          <span class="px-3 py-1 bg-slate-100 text-[10px] font-black rounded-full uppercase tracking-tighter text-slate-600">
            Current Status: {{ order.status }}
          </span>
        </div>

        <div class="status-timeline">
          <div v-for="(step, index) in statusSteps" :key="step.id" class="timeline-step" :class="{ completed: index <= currentStatusIndex, active: index === currentStatusIndex }">
            <div class="step-icon-wrapper">
              <component :is="step.icon" :size="20" />
            </div>
            <div class="step-label text-[10px] font-black uppercase mt-3 tracking-tighter" :class="index <= currentStatusIndex ? 'text-slate-900' : 'text-slate-300'">
              {{ step.label }}
            </div>
            
            <div v-if="index < statusSteps.length - 1" class="step-line" :class="{ completed: index < currentStatusIndex }"></div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
        <div class="lg:col-span-2 space-y-8">
          <div class="card animate-in slide-in-from-bottom-8 duration-700 delay-300">
            <div class="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
              <h3 class="text-xs font-black uppercase tracking-widest text-slate-400">Items ({{ order.items?.length }})</h3>
              <button @click="viewInvoice" class="text-blue-600 text-[10px] font-black uppercase tracking-tighter hover:underline flex items-center gap-1">
                View Tax Invoice <ExternalLink :size="10" />
              </button>
            </div>

            <div class="items-list space-y-4">
              <div v-for="item in order.items" :key="item.SK" class="order-item flex gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                <img :src="getImageUrl(item.image)" class="w-16 h-20 object-cover rounded-xl shadow-sm border border-slate-100" />
                <div class="flex-1">
                  <div class="flex justify-between items-start">
                    <h4 class="text-sm font-black text-slate-900">{{ item.product_name || item.name }}</h4>
                    <span class="text-sm font-black text-slate-900">₹{{ item.price }}</span>
                  </div>
                  <div class="flex gap-2 mt-2">
                    <span class="text-[9px] font-black uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Color: {{ item.color }}</span>
                    <span class="text-[9px] font-black uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Size: {{ item.size }}</span>
                  </div>
                  <div class="text-[10px] font-bold text-slate-500 mt-2">Qty: {{ item.quantity }}</div>
                </div>
              </div>
            </div>

            <div class="mt-8 pt-6 border-t border-slate-50 space-y-3">
              <div class="flex justify-between text-xs font-bold text-slate-500">
                <span>Subtotal</span>
                <span>₹{{ order.subtotal }}</span>
              </div>
              <div v-if="order.discount_total > 0" class="flex justify-between text-xs font-bold text-emerald-600">
                <span>Discounts</span>
                <span>-₹{{ order.discount_total }}</span>
              </div>
              <div class="flex justify-between text-xs font-bold text-slate-500">
                <span>Shipping</span>
                <span :class="order.shipping_total === 0 ? 'text-emerald-600' : ''">{{ order.shipping_total === 0 ? 'FREE' : '₹' + order.shipping_total }}</span>
              </div>
              <div class="flex justify-between text-sm font-black text-slate-900 pt-3 border-t border-slate-50">
                <span>Grand Total</span>
                <span class="text-xl">₹{{ order.total_amount || order.total }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-8 animate-in slide-in-from-right-8 duration-700 delay-500">
          <div class="card p-6 border-l-4 border-blue-500">
            <h3 class="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <MapPin :size="14" /> Delivery Address
            </h3>
            <div v-if="order.shipping_address" class="space-y-1">
              <p class="text-sm font-black text-slate-900">{{ order.shipping_address.fullName }}</p>
              <p class="text-[11px] font-bold text-slate-500 leading-relaxed">{{ order.shipping_address.street }}</p>
              <p class="text-[11px] font-bold text-slate-500">{{ order.shipping_address.city }}, {{ order.shipping_address.state }} {{ order.shipping_address.zip }}</p>
              <p class="text-[11px] font-bold text-slate-500">{{ order.shipping_address.country }}</p>
              <div class="pt-3 text-[10px] font-black text-slate-400">
                Phone: {{ order.shipping_address.phone }}
              </div>
            </div>
            <div v-else class="text-[11px] font-bold text-slate-400 italic">No address found</div>
          </div>

          <div class="card p-6 border-l-4 border-emerald-500">
            <h3 class="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <CreditCard :size="14" /> Payment Info
            </h3>
            <div class="space-y-1">
              <p class="text-sm font-black text-slate-900 uppercase">{{ order.payment_method }}</p>
              <p v-if="order.payment_method === 'COD'" class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-block mt-1">
                Pay ₹{{ order.total_amount }} at delivery
              </p>
              <p v-else class="text-[11px] font-bold text-slate-500 mt-1">Status: {{ order.payment_status || 'Paid' }}</p>
            </div>
          </div>

          <button @click="goToShop" class="w-full bg-slate-900 text-white p-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all transform hover:scale-[1.02] shadow-lg shadow-slate-200">
            Continue Shopping <ChevronRight :size="14" />
          </button>
        </div>
      </div>
    </div>

    <div v-else class="error-state animate-in fade-in duration-500">
      <div class="p-12 text-center bg-white rounded-3xl shadow-xl max-w-md mx-auto border border-red-50">
        <h2 class="text-xl font-black text-slate-900">Order Not Found</h2>
        <button @click="goToShop" class="mt-8 bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-xs uppercase">Go to Shop</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.order-success-container {
  min-height: 100vh;
  background: #f8fafc;
  padding: 80px 20px;
}
.content-wrapper { max-width: 1000px; margin: 0 auto; }
.success-hero { text-align: center; }
.check-container { display: inline-flex; padding: 20px; background: white; border-radius: 32px; box-shadow: 0 10px 40px rgba(16, 185, 129, 0.1); }
.card { background: white; padding: 32px; border-radius: 32px; box-shadow: 0 4px 60px rgba(0,0,0,0.03); border: 1px solid rgba(241, 245, 249, 0.7); }
.status-timeline { display: flex; justify-content: space-between; position: relative; }
.timeline-step { flex: 1; display: flex; flex-direction: column; align-items: center; position: relative; z-index: 1; }
.step-icon-wrapper { width: 44px; height: 44px; background: #f1f5f9; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #94a3b8; }
.timeline-step.completed .step-icon-wrapper { background: #0f172a; color: white; }
.timeline-step.active .step-icon-wrapper { background: #000; color: white; transform: scale(1.15); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
.step-line { position: absolute; top: 22px; left: calc(50% + 22px); width: calc(100% - 44px); height: 3px; background: #f1f5f9; z-index: -1; }
.step-line.completed { background: #0f172a; }
.animate-bounce-short { animation: bounce-short 2s infinite; }
@keyframes bounce-short { 0%, 100% { transform: translateY(-5%); } 50% { transform: translateY(0); } }
.spinner { width: 40px; height: 40px; border: 4px solid #f1f5f9; border-top: 4px solid #000; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-state { text-align: center; padding: 100px 0; font-weight: 800; color: #64748b; font-size: 10px; letter-spacing: 2px; }
@keyframes slideInFromBottom { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.animate-in { animation: slideInFromBottom 0.6s ease-out forwards; }
@media (max-width: 768px) {
  .status-timeline { flex-wrap: wrap; gap: 20px; }
  .timeline-step { flex: 0 0 calc(50% - 20px); }
  .step-line { display: none; }
}
</style>
