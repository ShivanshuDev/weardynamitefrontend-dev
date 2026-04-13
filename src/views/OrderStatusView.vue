<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useProductStore } from '../stores/productStore'
import { Printer, ArrowLeft } from 'lucide-vue-next'

const route = useRoute()
const authStore = useAuthStore()
const productStore = useProductStore()

const orderId = route.query.id || route.params.id
const order = computed(() => authStore.orders.find(o => o.orderId === orderId || o.id === orderId))

onMounted(async () => {
  if (orderId) {
    try {
      await authStore.fetchOrderById(orderId);
    } catch (err) {
      console.error('Error fetching order:', err);
    }
  }
})

const printInvoice = () => {
  window.print()
}

// Invoice specific calculations (Assuming 18% GST built into the final total price)
const gstRate = 0.18

const getCalculations = (totalUSD) => {
  // If Total is inclusive of GST: TaxableValue = Total / 1.18
  const taxableValue = totalUSD / (1 + gstRate)
  const gstAmount = totalUSD - taxableValue
  const cgst = gstAmount / 2
  const sgst = gstAmount / 2

  return {
    taxableValue,
    gstAmount,
    cgst,
    sgst
  }
}

const orderCalcs = computed(() => {
  if (!order.value) return null
  const total = order.value.total_amount || order.value.total || order.value.totalUSD || 0
  return getCalculations(total)
})

const returnPolicyText = computed(() => {
  if (!order.value || !order.value.items || order.value.items.length === 0) return '7 days'
  const items = order.value.items
  const returnableItems = items.filter(item => item.isReturnable !== false)
  
  if (returnableItems.length === 0) return 'non-returnable'
  
  const minDays = Math.min(...returnableItems.map(item => item.returnDays || 7))
  return `${minDays} days`
})
</script>

<template>
  <div class="order-status-view">
    <div v-if="order" class="invoice-wrapper">
      
      <!-- User Actions (Hidden on Print) -->
      <div class="actions-header no-print container">
        <RouterLink to="/shop" class="btn secondary">
          <ArrowLeft :size="16" style="margin-right:8px;" /> Back to Shop
        </RouterLink>
        <div class="success-msg">
          🎉 <strong>Order Confirmed!</strong> Your invoice is ready below.
        </div>
        <button class="btn primary-btn print-btn" @click="printInvoice">
          <Printer :size="16" style="margin-right:8px;" /> Print Invoice
        </button>
      </div>

      <!-- Printable Invoice Document (A4 Styling) -->
      <div class="invoice-document paper">
        
        <div class="inv-header">
          <div class="company-details">
            <h1 class="company-name">WEAR DYNAMITE</h1>
            <p>Mahalia dhermer deoria,</p>
            <p>Uttar Pradesh 274505</p>
            <p><strong>Phone:</strong> +91 8543996159</p>
            <p><strong>GSTIN:</strong> 09ABCDE1234F1Z5</p>
          </div>
          <div class="invoice-meta">
            <h2 class="invoice-title">ORDER INVOICE</h2>
            <div class="meta-row">
              <span class="meta-label">Order ID:</span>
              <span class="meta-val">{{ order.order_id || order.id }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Invoice Date:</span>
              <span class="meta-val">
                {{ (() => {
                  const d = new Date(order.date || order.createdAt);
                  return isNaN(d.getTime()) ? '-' : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                })() }}
              </span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Payment Method:</span>
              <span class="meta-val" style="text-transform: uppercase;">
                {{ order.payment_method === 'COD' ? 'Cash on Delivery' : (order.payment_method || 'Online Payment') }}
              </span>
            </div>
          </div>
        </div>

        <div class="inv-addresses">
          <div class="address-box">
            <h3>Billing Address</h3>
            <p><strong>{{ order.address.fullName }}</strong></p>
            <p>{{ order.address.street }}</p>
            <p>{{ order.address.city }}, {{ order.address.state }} {{ order.address.zip }}</p>
            <p>{{ order.address.country }}</p>
            <p><strong>Phone:</strong> {{ order.address.phone }}</p>
          </div>
          <div class="address-box">
            <h3>Shipping Address</h3>
            <p><strong>{{ order.address.fullName }}</strong></p>
            <p>{{ order.address.street }}</p>
            <p>{{ order.address.city }}, {{ order.address.state }} {{ order.address.zip }}</p>
            <p>{{ order.address.country }}</p>
            <p><strong>Phone:</strong> {{ order.address.phone }}</p>
          </div>
        </div>

        <div class="inv-table-container">
          <table class="inv-table">
            <thead>
              <tr>
                <th width="5%">Sl.</th>
                <th width="35%">Product Description</th>
                <th width="10%" class="text-center">Qty</th>
                <th width="15%" class="text-right">Unit Price</th>
                <th width="15%" class="text-right">Taxable</th>
                <th width="15%" class="text-right">Total</th>
                <th v-if="order.status === 'Delivered'" width="15%" class="text-center no-print">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in order.items" :key="idx">
                <td>{{ idx + 1 }}</td>
                <td>
                  <strong>{{ item.name }}</strong>
                  <div class="item-meta-sm">Color: {{ item.color }}, Size: {{ item.size }}</div>
                  <div class="item-meta-sm">For: {{ item.forWhom }}</div>
                </td>
                <td class="text-center">{{ item.quantity }}</td>
                <td class="text-right">{{ productStore.formatPrice(item.price) }}</td>
                <!-- Assuming item price includes GST, reverse calculate taxable value for the item -->
                <td class="text-right">{{ productStore.formatPrice((item.price * item.quantity) / (1 + (order.tax_percent || 0) / 100)) }}</td>
                <td class="text-right">{{ productStore.formatPrice(item.price * item.quantity) }}</td>
                <td v-if="order.status === 'Delivered'" class="text-center no-print">
                   <RouterLink 
                     :to="{ path: '/add-review', query: { orderId: order.id, productId: item.product_id } }" 
                     class="btn-review-sm"
                   >
                     Rate Product
                   </RouterLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="inv-summary">
          <div class="totals-table">
            <div class="total-row">
               <span class="label">Subtotal (Gross):</span>
               <span class="val">{{ productStore.formatPrice(order.subtotal || 0) }}</span>
            </div>
            <div v-if="order.discount_total > 0" class="total-row" style="color: #e11d48; font-weight: bold;">
               <span class="label">Discount Applied:</span>
               <span class="val">(-) {{ productStore.formatPrice(order.discount_total) }}</span>
            </div>
            <div class="total-row taxable-line">
              <span class="label">Total Taxable Value:</span>
              <span class="val">{{ productStore.formatPrice((order.subtotal || 0) - (order.discount_total || 0) - (order.tax_total || 0)) }}</span>
            </div>
             <div class="total-row">
               <span class="label">CGST ({{ Number(order.tax_percent || 0) / 2 }}%):</span>
               <span class="val">{{ productStore.formatPrice(order.cgst || 0) }}</span>
             </div>
             <div class="total-row">
               <span class="label">SGST ({{ Number(order.tax_percent || 0) / 2 }}%):</span>
               <span class="val">{{ productStore.formatPrice(order.sgst || 0) }}</span>
             </div>
            <div class="total-row">
              <span class="label">Shipping:</span>
              <span class="val">{{ (order.shipping_total || 0) > 0 ? productStore.formatPrice(order.shipping_total) : 'FREE' }}</span>
            </div>
            <div class="total-row grand-total">
              <span class="label">Grand Total:</span>
              <span class="val">{{ productStore.formatPrice(order.total_amount || order.total || 0) }}</span>
            </div>
          </div>
        </div>

        <div class="inv-footer">
          <div class="declaration">
            <h4>Declaration</h4>
            <p>We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</p>
          </div>
          <div class="authorized">
            <div class="signature-line"></div>
            <p>Authorized Signatory</p>
            <p><strong>WEAR DYNAMITE</strong></p>
          </div>
        </div>

        <div class="inv-terms">
          <h4>Terms, Conditions & Return Policy</h4>
          <ol>
            <li>Goods once sold can only be returned within <strong>{{ returnPolicyText }}</strong> of delivery, provided they are unused, unwashed, and in original packaging with tags intact.</li>
            <li>In case of a defective item, please notify us within 48 hours to be eligible for a replacement or full refund.</li>
            <li>All disputes are subject to Uttar Pradesh jurisdiction only.</li>
            <li>For Cash on Delivery (COD) orders, payment must be handed strictly in cash to the delivery executive before the package is opened.</li>
          </ol>
          <p class="support-text">For support and queries, contact us at <strong>+91 8543996159</strong> or write to our support email.</p>
        </div>
      </div>
    </div>
    
    <div v-else class="container not-found no-print">
      <h2>Order not found or invalid session.</h2>
      <RouterLink to="/shop" class="btn">Return to Shop</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.order-status-view {
  background: #f4f6f8;
  min-height: 100vh;
  padding: 40px 20px;
}

/* Actions Header */
.actions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: #fff;
  padding: 15px 30px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  gap: 15px;
}

@media (max-width: 768px) {
  .actions-header {
    flex-direction: column;
    padding: 20px;
    text-align: center;
  }
}

.success-msg {
  color: #27ae60;
  font-size: 1.1rem;
}

.print-btn {
  display: flex;
  align-items: center;
}

/* Paper Document */
.paper {
  background: #fff;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  padding: 50px 60px;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  color: #333;
}

/* Header */
.inv-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 2px solid #222;
  padding-bottom: 30px;
  margin-bottom: 30px;
}

.company-name {
  font-family: var(--font-heading);
  font-size: 2rem;
  margin-bottom: 10px;
  color: #000;
  letter-spacing: 1px;
}

.company-details p {
  font-size: 0.9rem;
  line-height: 1.5;
  color: #555;
}

.invoice-meta {
  text-align: right;
}

.invoice-title {
  font-size: 1.8rem;
  color: #000;
  margin-bottom: 15px;
  letter-spacing: 2px;
}

.meta-row {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-bottom: 6px;
  font-size: 0.95rem;
}

.meta-label {
  color: #777;
  font-weight: 500;
}

.meta-val {
  font-weight: 600;
  color: #222;
}

/* Addresses */
.inv-addresses {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;
}

.address-box {
  background: #fafafa;
  border: 1px solid #eaeaea;
  padding: 20px;
  border-radius: 4px;
}

.address-box h3 {
  font-size: 1rem;
  text-transform: uppercase;
  color: #777;
  margin-bottom: 15px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 8px;
}

.address-box p {
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 4px;
}

/* Table */
.inv-table-container {
  margin-bottom: 30px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.inv-table {
  width: 100%;
  border-collapse: collapse;
}

.inv-table th {
  background: #f5f5f5;
  color: #333;
  padding: 8px 15px;
  text-transform: uppercase;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid #ddd;
  text-align: left;
}

.inv-table td {
  padding: 15px;
  border: 1px solid #ddd;
  font-size: 0.95rem;
  vertical-align: top;
}

.item-meta-sm {
  font-size: 0.85rem;
  color: #666;
  margin-top: 4px;
}

.text-center { text-align: center !important; }
.text-right { text-align: right !important; }

/* Totals */
.inv-summary {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 50px;
}

.totals-table {
  width: 350px;
  background: #fafafa;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 20px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 0.95rem;
}

.total-row .label {
  color: #555;
  font-weight: 500;
}

.total-row .val {
  font-weight: 600;
  color: #222;
}

.grand-total {
  border-top: 2px solid #ddd;
  padding-top: 15px;
  margin-top: 15px;
  font-size: 1.2rem;
}

.grand-total .label { color: #000; font-weight: 700; }
.grand-total .val { color: #000; font-weight: 800; }

/* Footer */
.inv-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 40px;
}

.declaration {
  max-width: 400px;
}

.declaration h4 {
  font-size: 1rem;
  margin-bottom: 8px;
  color: #000;
}

.declaration p {
  font-size: 0.85rem;
  color: #666;
  line-height: 1.4;
}

.authorized {
  text-align: center;
}

.signature-line {
  width: 150px;
  border-top: 1px solid #000;
  margin-bottom: 10px;
}

.authorized p {
  font-size: 0.9rem;
  color: #333;
  margin: 3px 0;
}

/* Terms */
.inv-terms {
  border-top: 1px dashed #ddd;
  padding-top: 30px;
}

.inv-terms h4 {
  font-size: 0.95rem;
  text-transform: uppercase;
  color: #555;
  margin-bottom: 15px;
}

.inv-terms ol {
  font-size: 0.8rem;
  color: #666;
  line-height: 1.6;
  padding-left: 15px;
  margin-bottom: 15px;
}

.support-text {
  font-size: 0.85rem;
  color: #333;
  font-weight: 500;
}

/* Print Overrides */
@media print {
  @page { margin: 10mm; }
  body { background: #fff; margin: 0; padding: 0; }
  .order-status-view { background: transparent; padding: 0 !important; }
  .no-print { display: none !important; }
  .paper { box-shadow: none; padding: 0; max-width: 100%; margin: 0; border: none; }
  .inv-header { display: flex !important; flex-direction: row !important; justify-content: space-between !important; padding-bottom: 10px; margin-bottom: 15px; border-bottom: 1px solid #000; }
  .company-name { font-size: 1.4rem; margin-bottom: 4px; }
  .invoice-title { font-size: 1.2rem; margin-bottom: 4px; }
  .invoice-meta { text-align: right !important; }
  .company-details p, .meta-row { font-size: 0.8rem; margin-bottom: 2px; line-height: 1.2; }
  .inv-addresses { display: flex !important; justify-content: space-between !important; gap: 15px !important; margin-bottom: 15px; }
  .address-box { flex: 1; padding: 10px; margin-bottom: 0; border: 1px solid #ddd; }
  .address-box h3 { font-size: 0.85rem; margin-bottom: 4px; padding-bottom: 3px; }
  .address-box p { font-size: 0.75rem; margin-bottom: 2px; line-height: 1.2; }
  .inv-table-container { margin-bottom: 15px; }
  .inv-table th, .inv-table td { padding: 6px 8px; font-size: 0.8rem; }
  .inv-summary { margin-bottom: 15px; }
  .totals-table { width: 280px; padding: 10px; border: none; }
  .total-row { font-size: 0.85rem; margin-bottom: 4px; }
  .grand-total { padding-top: 6px; margin-top: 6px; font-size: 1rem; border-top: 1px solid #000; }
  .inv-footer { margin-bottom: 10px; }
  .declaration h4, .inv-terms h4 { font-size: 0.85rem; margin-bottom: 4px; }
  .declaration p, .inv-terms ol, .support-text { font-size: 0.75rem; line-height: 1.3; margin-bottom: 2px; }
  .inv-terms { padding-top: 10px; border-top: 1px solid #ddd; }
  .inv-terms ol { padding-left: 12px; }
}

@media screen and (max-width: 768px) {
  .order-status-view { padding: 20px 10px; }
  .inv-header {
    flex-direction: column;
    gap: 30px;
  }
  .invoice-meta {
    text-align: left;
  }
  .meta-row {
    justify-content: flex-start;
  }
  .inv-addresses {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .inv-summary {
    justify-content: flex-start;
  }
  .totals-table {
    width: 100%;
  }
  .inv-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 40px;
  }
  .authorized {
    align-self: flex-end;
  }
  .paper {
    padding: 24px 20px;
  }
  .inv-table {
    min-width: 600px;
  }
}
</style>

<style>
/* Global Print Rules: ensure external App headers are invisible */
@media print {
  .header, header, nav, footer {
    display: none !important;
  }
}

.btn-review-sm {
  background: #000;
  color: #fff !important;
  padding: 6px 14px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  text-decoration: none;
  display: inline-block;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
}

.btn-review-sm:hover {
  background: #333;
  transform: translateY(-1px);
}
</style>
