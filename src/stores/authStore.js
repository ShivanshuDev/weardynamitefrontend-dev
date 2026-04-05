import { defineStore } from 'pinia'
import api from '../utils/api'
import { auth } from '../utils/firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    addresses: [
      {
        id: 1,
        name: 'Home',
        fullName: 'Shivanshu Kumar',
        street: '123 Main Street, Apt 4B',
        city: 'Mumbai',
        state: 'Maharashtra',
        zip: '400001',
        country: 'India',
        phone: '+91 8543996159',
        isDefault: true
      }
    ],
    orders: []
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    defaultAddress: (state) => state.addresses.find(a => a.isDefault) || state.addresses[0]
  },
  actions: {
    async login(email, password) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const jwt = await userCredential.user.getIdToken(true);
        console.log('[AUTH DEBUG] Extraction of fresh ID token successful.');
        
        // Temporarily set token so API interceptor uses it for the sync call
        this.token = jwt;
        localStorage.setItem('token', jwt);
        
        // Synchronize with backend to get the full profile mapping
        const response = await api.post('/auth/sync');
        
        this.user = response.data.profile;
        localStorage.setItem('user', JSON.stringify(this.user));
        
        await this.fetchOrders();
        return true;
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },
    async register(name, email, password) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const jwt = await userCredential.user.getIdToken(true);
        
        this.token = jwt;
        localStorage.setItem('token', jwt);

        // Sync with backend to inject Name and seed initial DB profile mapping
        const response = await api.post('/auth/sync', { name });
        
        this.user = response.data.profile;
        localStorage.setItem('user', JSON.stringify(this.user));
        
        await this.fetchOrders();
        return true;
      } catch (error) {
        console.error('Registration failed:', error);
        throw error;
      }
    },
    async loginWithGoogle() {
      try {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        const jwt = await userCredential.user.getIdToken(true);
        
        this.token = jwt;
        localStorage.setItem('token', jwt);

        const response = await api.post('/auth/sync', { 
          name: userCredential.user.displayName 
        });
        
        this.user = response.data.profile;
        localStorage.setItem('user', JSON.stringify(this.user));
        
        await this.fetchOrders();
        return true;
      } catch (error) {
        console.error('Google login failed:', error);
        throw error;
      }
    },
    async logout() {
      await signOut(auth);
      this.user = null;
      this.token = null;
      this.orders = [];
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    async fetchOrders() {
      try {
        const response = await api.get('/user/orders');
        this.orders = response.data.map(o => ({
          ...o,
          id: o.order_id || o.id,
          date: o.created_at || o.date,
          total: o.total_amount || o.totalUSD || o.total
        }));
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      }
    },
    async fetchOrderById(id) {
      try {
        const response = await api.get(`/user/orders/${id}`);
        const order = {
          ...response.data,
          id: response.data.order_id || response.data.id,
          date: response.data.created_at || response.data.date,
          total: response.data.total_amount || response.data.totalUSD || response.data.total
        };
        
        const idx = this.orders.findIndex(o => o.id === order.id);
        if (idx > -1) {
          this.orders[idx] = order;
        } else {
          this.orders.unshift(order);
        }
        return order;
      } catch (error) {
        console.error('Failed to fetch order:', error);
        throw error;
      }
    },
    addAddress(address) {
      if (address.isDefault) {
        this.addresses.forEach(a => a.isDefault = false)
      }
      this.addresses.push({
        ...address,
        id: Date.now()
      })
    },
    removeAddress(id) {
      this.addresses = this.addresses.filter(a => a.id !== id)
      if (this.addresses.length > 0 && !this.addresses.some(a => a.isDefault)) {
        this.addresses[0].isDefault = true
      }
    },
    setDefaultAddress(id) {
      this.addresses.forEach(a => {
        a.id === id ? a.isDefault = true : a.isDefault = false
      })
    },
    async addOrder(orderData) {
      try {
        const response = await api.post('/orders', orderData);
        const order = {
          ...response.data,
          id: response.data.order_id || response.data.id,
          date: response.data.created_at || Date.now(),
          total: response.data.total_amount || response.data.total
        };
        this.orders.unshift(order);
        return order;
      } catch (error) {
        console.error('Failed to place order:', error);
        throw error;
      }
    }
  }
})
