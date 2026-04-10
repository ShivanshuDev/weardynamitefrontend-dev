import { defineStore } from 'pinia'
import api from '../utils/api'
import { auth, messaging } from '../utils/firebase'
import { getToken } from 'firebase/messaging'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    addresses: [],
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
        
        await Promise.all([
          this.fetchOrders(),
          this.fetchAddresses(),
          this.registerFcmToken()
        ]);
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
        
        await Promise.all([
          this.fetchOrders(),
          this.fetchAddresses(),
          this.registerFcmToken()
        ]);
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
          name: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL
        });
        
        this.user = response.data.profile;
        localStorage.setItem('user', JSON.stringify(this.user));
        
        await Promise.all([
          this.fetchOrders(),
          this.fetchAddresses(),
          this.registerFcmToken()
        ]);
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
      this.addresses = [];
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    async registerFcmToken() {
      try {
        // Check if supported and token exists
        if (!messaging) return;

        // Request permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        // Get token from Firebase
        const token = await getToken(messaging, { 
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY 
        });

        if (token) {
          await api.post('/user/fcm-token', { token });
          console.log('[FCM] Device token registered successfully.');
        }
      } catch (error) {
        console.error('[FCM] Error registering token:', error);
      }
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
    async fetchAddresses() {
      try {
        const response = await api.get('/user/addresses');
        this.addresses = response.data.map(a => ({
          ...a,
          id: a.addressId || a.id
        }));
      } catch (error) {
        console.error('Failed to fetch addresses:', error);
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
    async addAddress(address) {
      try {
        const response = await api.post('/user/addresses', address);
        // Refresh full list from backend to get correct IDs and default flags
        await this.fetchAddresses();
        return response.data;
      } catch (error) {
        console.error('Failed to add address:', error);
        throw error;
      }
    },
    async removeAddress(id) {
      try {
        await api.delete(`/user/addresses/${id}`);
        await this.fetchAddresses();
      } catch (error) {
        console.error('Failed to remove address:', error);
        throw error;
      }
    },
    async setDefaultAddress(id) {
      try {
        await api.patch(`/user/addresses/${id}/default`);
        await this.fetchAddresses();
      } catch (error) {
        console.error('Failed to set default address:', error);
        throw error;
      }
    },
    async updateProfile(profileData) {
      try {
        const response = await api.put('/user/profile', profileData);
        // The backend might return the updated profile directly
        this.user = { 
          ...this.user, 
          ...(response.data.profile || response.data)
        };
        localStorage.setItem('user', JSON.stringify(this.user));
        return this.user;
      } catch (error) {
        console.error('Failed to update profile:', error);
        throw error;
      }
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
