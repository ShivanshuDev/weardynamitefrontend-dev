<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useProductStore } from '../stores/productStore'
import { Star, Upload, X, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-vue-next'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const productStore = useProductStore()

const orderId = route.query.orderId
const productId = route.query.productId

const product = ref(null)
const order = ref(null)
const loading = ref(true)
const submitting = ref(false)

const rating = ref(5)
const hoverRating = ref(0)
const comment = ref('')
const images = ref([]) // { file, preview, url, uploading }

onMounted(async () => {
  if (!authStore.isLoggedIn) {
     router.push('/login')
     return
  }

  if (!orderId || !productId) {
    alert('Invalid review request')
    router.push('/profile')
    return
  }

  try {
    // Fetch order to verify status and product
    await authStore.fetchOrderById(orderId)
    order.value = authStore.orders.find(o => o.orderId === orderId || o.id === orderId)
    
    if (!order.value || order.value.status !== 'Delivered') {
       alert('You can only review items after they have been Delivered.')
       router.push('/profile')
       return
    }

    // Fetch product details
    product.value = await productStore.fetchProductById(productId)
    if (!product.value) throw new Error('Product not found')

  } catch (err) {
    console.error('Initialization error:', err)
    alert('Failed to load review details. Please try again.')
    router.push('/profile')
  } finally {
    loading.value = false
  }
})

const handleImageUpload = async (e) => {
  const files = Array.from(e.target.files)
  if (images.value.length + files.length > 3) {
    alert('Maximum 3 images allowed per review.')
    return
  }

  for (const file of files) {
    const preview = URL.createObjectURL(file)
    const imgRef = ref({ file, preview, url: '', uploading: true })
    images.value.push(imgRef.value)

    try {
      const apiBase = 'http://localhost:3001/api'
      const { data } = await axios.post(`${apiBase}/upload/presigned-url`, {
        fileName: file.name,
        fileType: file.type,
        folder: 'reviews'
      })

      await axios.put(data.uploadUrl, file, {
        headers: { 'Content-Type': file.type }
      })

      imgRef.value.url = data.fileUrl
    } catch (err) {
      console.error('Upload failed:', err)
      images.value = images.value.filter(img => img.preview !== preview)
      alert(`Failed to upload ${file.name}`)
    } finally {
      imgRef.value.uploading = false
    }
  }
}

const removeImage = (idx) => {
  images.value.splice(idx, 1)
}

const submitReview = async () => {
  if (!comment.value.trim()) return alert('Please write a short comment.')
  if (images.value.some(img => img.uploading)) return alert('Please wait for uploads.')

  submitting.value = true
  try {
    const apiBase = 'http://localhost:3001/api'
    await axios.post(`${apiBase}/reviews/${productId}`, {
      orderId,
      rating: rating.value,
      comment: comment.value,
      name: authStore.user.name,
      imageUrls: images.value.map(img => img.url).filter(url => url)
    }, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })

    alert('Review submitted! It will appear on the product page after brief moderation.')
    router.push('/profile')
  } catch (err) {
    console.error('Submission failed:', err)
    alert(err.response?.data?.message || 'Failed to submit review.')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="add-review-view container">
    <div v-if="loading" class="loading-state">
      <Loader2 class="spinner" :size="48" />
      <p>Verifying purchase details...</p>
    </div>

    <div v-else-if="product" class="review-container">
      <header class="review-header">
         <button class="back-link" @click="router.back()">
            <ArrowLeft :size="16" /> Back
         </button>
         <div class="product-summary">
            <img :src="productStore.resolveImageUrl(product.images?.[0])" class="product-thumb" />
            <div class="product-meta">
               <span class="badge">Verified Purchase</span>
               <h2>{{ product.name }}</h2>
               <p class="order-ref">Order #{{ orderId }} • Delivered</p>
            </div>
         </div>
      </header>

      <div class="review-form-card">
         <div class="form-section">
            <label>Overall Rating</label>
            <div class="star-selector">
               <Star 
                 v-for="n in 5" :key="n" :size="36" 
                 class="star-icon"
                 :class="{ 'filled': n <= (hoverRating || rating) }"
                 @mouseenter="hoverRating = n" @mouseleave="hoverRating = 0"
                 @click="rating = n"
               />
               <span class="rating-text">{{ rating }} Stars</span>
            </div>
         </div>

         <div class="form-section">
            <label>Your Review</label>
            <textarea v-model="comment" placeholder="What did you like or dislike?" rows="5"></textarea>
         </div>

         <div class="form-section">
            <label>Add Photos (Optional)</label>
            <p class="hint">Max 3 photos.</p>
            
            <div class="photo-uploader">
               <div class="images-preview" v-if="images.length > 0">
                  <div v-for="(img, idx) in images" :key="idx" class="img-box">
                     <img :src="img.preview" />
                     <button @click="removeImage(idx)" class="remove-img"><X :size="14" /></button>
                     <div v-if="img.uploading" class="upload-overlay"><Loader2 class="spinner" :size="16" /></div>
                  </div>
               </div>
               <label class="upload-trigger" v-if="images.length < 3">
                  <input type="file" @change="handleImageUpload" accept="image/*" multiple hidden />
                  <Upload :size="24" />
                  <span>{{ images.length === 0 ? 'Upload Photos' : 'Add More' }}</span>
               </label>
            </div>
         </div>

         <div class="form-actions">
            <button class="btn secondary" @click="router.back()">Cancel</button>
            <button class="btn primary-btn submit-btn" @click="submitReview" :disabled="submitting || images.some(img => img.uploading)">
              <Loader2 v-if="submitting" class="spinner" :size="18" />
              {{ submitting ? 'Submitting...' : 'Submit Review' }}
            </button>
         </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.add-review-view { padding: 60px 20px; min-height: 80vh; }
.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; margin-top: 100px; }
.review-container { max-width: 700px; margin: 0 auto; }
.review-header { margin-bottom: 30px; }
.back-link { display: flex; align-items: center; gap: 8px; background: none; border: none; cursor: pointer; color: #64748b; font-weight: 600; margin-bottom: 20px; }
.product-summary { display: flex; gap: 20px; align-items: center; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
.product-thumb { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; }
.product-meta h2 { font-size: 1.25rem; margin: 5px 0; }
.badge { font-size: 0.75rem; background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 20px; font-weight: 700; text-transform: uppercase; }
.order-ref { font-size: 0.85rem; color: #64748b; }
.review-form-card { background: white; border: 1px solid #e2e8f0; padding: 40px; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.03); }
.form-section { margin-bottom: 30px; }
.form-section label { display: block; font-weight: 700; margin-bottom: 15px; color: #1e293b; font-size: 1.1rem; }
.star-selector { display: flex; align-items: center; gap: 12px; }
.star-icon { cursor: pointer; color: #e2e8f0; transition: all 0.2s; }
.star-icon.filled { color: #f59e0b; fill: #f59e0b; }
.rating-text { margin-left: 10px; font-weight: 700; color: #64748b; }
textarea { width: 100%; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; font-family: inherit; font-size: 1rem; resize: none; }
.hint { font-size: 0.85rem; color: #64748b; margin-bottom: 15px; }
.photo-uploader { display: flex; flex-wrap: wrap; gap: 15px; }
.images-preview { display: flex; gap: 15px; }
.img-box { width: 100px; height: 100px; position: relative; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
.img-box img { width: 100%; height: 100%; object-fit: cover; }
.remove-img { position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.6); color: #fff; border: none; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.upload-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.7); display: flex; align-items: center; justify-content: center; }
.upload-trigger { width: 100px; height: 100px; border: 2px dashed #e2e8f0; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; color: #94a3b8; transition: all 0.2s; }
.upload-trigger:hover { border-color: #000; color: #000; background: #f8fafc; }
.upload-trigger span { font-size: 0.75rem; margin-top: 5px; font-weight: 600; }
.form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e2e8f0; }
.submit-btn { padding: 12px 30px; display: flex; align-items: center; gap: 10px; }
.spinner { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
