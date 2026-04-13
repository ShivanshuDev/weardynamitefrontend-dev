import { defineStore } from 'pinia'
import api from '../utils/api'
import { auth, messaging } from '../utils/firebase'
import { getToken } from 'firebase/messaging'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, sendEmailVerification } from 'firebase/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    addresses: [],
    orders: [],
    inquiries: [],
    notifications: [],
    unreadCount: 0,
    notifPollingId: null,
    pendingAction: JSON.parse(sessionStorage.getItem('pendingAction')) || null
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    defaultAddress: (state) => state.addresses.find(a => a.isDefault) || state.addresses[0]
  },
  actions: {
    async syncProfile() {
      try {
        const response = await api.post('/auth/sync');
        this.user = response.data.profile;
        localStorage.setItem('user', JSON.stringify(this.user));
        return this.user;
      } catch (error) {
        console.error('Profile sync failed:', error);
        // If sync fails with 401/403, we might want to logout
        if (error.response?.status === 401 || error.response?.status === 403) {
          this.logout();
        }
        throw error;
      }
    },
    async login(email, password) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Refresh user status to get latest emailVerified property
        await userCredential.user.reload();
        
        if (!userCredential.user.emailVerified) {
          await signOut(auth);
          throw new Error('Please verify your email address before logging in. Check your inbox for the verification link.');
        }

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
          this.fetchInquiries(),
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
        
        // Send Verification Email
        await sendEmailVerification(userCredential.user);
        
        // Temporarily set token for the sync call
        const jwt = await userCredential.user.getIdToken(true);
        this.token = jwt;
        localStorage.setItem('token', jwt);

        // Sync with backend to seed initial profile
        await api.post('/auth/sync', { name });
        
        // Force sign-out until verified
        await signOut(auth);
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        return { verificationRequired: true };
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
          this.fetchInquiries(),
          this.fetchAddresses(),
          this.registerFcmToken()
        ]);
        return true;
      } catch (error) {
        console.error('Google login failed:', error);
        throw error;
      }
    },
    async resendVerification(email, password) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        await signOut(auth);
        return true;
      } catch (error) {
        console.error('Failed to resend verification:', error);
        throw error;
      }
    },
    async logout() {
      await signOut(auth);
      this.user = null;
      this.token = null;
      this.orders = [];
      this.inquiries = [];
      this.addresses = [];
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.stopNotifPolling();
    },
    startNotifPolling() {
      if (this.notifPollingId) return;
      this.fetchNotifications();
      this.notifPollingId = setInterval(() => {
        this.fetchNotifications();
      }, 30000); // 30s
    },
    stopNotifPolling() {
      if (this.notifPollingId) {
        clearInterval(this.notifPollingId);
        this.notifPollingId = null;
      }
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
    async fetchNotifications() {
      if (!this.isLoggedIn) return;
      try {
        const response = await api.get('/user/notifications');
        this.notifications = response.data;
        this.unreadCount = this.notifications.filter(n => !n.isRead).length;
        this.startNotifPolling();
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    },
    async markNotificationRead(id) {
      try {
        await api.patch(`/user/notifications/${id}/read`);
        const notif = this.notifications.find(n => n.id === id);
        if (notif) {
          notif.isRead = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        }
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    },
    async markAllRead() {
      try {
        await api.post('/user/notifications/read-all');
        this.notifications.forEach(n => n.isRead = true);
        this.unreadCount = 0;
      } catch (error) {
        console.error('Failed to mark all as read:', error);
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
    async fetchInquiries() {
      try {
        const response = await api.get('/my-inquiries');
        this.inquiries = response.data;
      } catch (error) {
        console.error('Failed to fetch inquiries:', error);
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
    },
    setPendingAction(type, data, redirect = null) {
      this.pendingAction = { type, data, redirect };
      sessionStorage.setItem('pendingAction', JSON.stringify(this.pendingAction));
    },
    clearPendingAction() {
      this.pendingAction = null;
      sessionStorage.removeItem('pendingAction');
    },
    async executePendingAction() {
      if (!this.pendingAction) return null;
      
      const { type, data, redirect } = this.pendingAction;
      const productStore = (await import('./productStore')).useProductStore();
      
      try {
        switch (type) {
          case 'TOGGLE_FAVORITE':
            if (data.productId) {
              await productStore.toggleFavorite(data.productId);
            }
            break;
          case 'ADD_TO_CART':
            if (data.product && data.configs) {
              await productStore.addToCart(data.configs, data.product);
            }
            break;
          case 'BUY_NOW':
            if (data.product && data.configs) {
              await productStore.initiateDirectCheckout(data.configs, data.product);
            }
            break;
          case 'CHECKOUT':
            productStore.initiateCartCheckout();
            break;
        }
        
        const res = { type, redirect };
        this.clearPendingAction();
        return res;
      } catch (error) {
        console.error('Failed to execute pending action:', error);
        this.clearPendingAction();
        return null;
      }
    }
  }
})
