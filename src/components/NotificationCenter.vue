<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Bell, X, Inbox, Clock, Check, ChevronRight } from 'lucide-vue-next'
import { useAuthStore } from '../stores/authStore'

const formatDistanceToNow = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

const authStore = useAuthStore()
const isOpen = ref(false)
const dropdownRef = ref(null)

const toggleDropdown = () => {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
        authStore.fetchNotifications()
    }
}

const closeDropdown = (e) => {
    if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
        isOpen.value = false
    }
}

const handleMarkAsRead = async (id) => {
    await authStore.markNotificationRead(id)
}

const handleMarkAllRead = async () => {
    await authStore.markAllRead()
}

onMounted(() => {
    document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
    document.removeEventListener('click', closeDropdown)
})

const getIconForType = (type) => {
    switch (type) {
        case 'ORDER_CONFIRMED':
        case 'ORDER_UPDATE':
            return '📦'
        case 'BROADCAST':
            return '📢'
        default:
            return '🔔'
    }
}
</script>

<template>
  <div class="notification-center" ref="dropdownRef">
    <button class="icon-btn" @click="toggleDropdown" :class="{ 'active': isOpen }">
      <Bell :size="20" />
      <span v-if="authStore.unreadCount > 0" class="badge">{{ authStore.unreadCount }}</span>
    </button>

    <Transition name="fade-slide">
      <div v-if="isOpen" class="notification-dropdown shadow-xl">
        <div class="dropdown-header">
          <div class="header-left">
            <h3>Notifications</h3>
            <span class="count-tag" v-if="authStore.unreadCount > 0">{{ authStore.unreadCount }} NEW</span>
          </div>
          <button v-if="authStore.unreadCount > 0" @click="handleMarkAllRead" class="mark-all-btn">
            Mark all read
          </button>
        </div>

        <div class="notification-list custom-scrollbar">
          <div v-if="authStore.notifications.length === 0" class="empty-state">
            <div class="empty-icon">
              <Inbox :size="48" />
            </div>
            <p>Your inbox is empty</p>
            <span>We'll notify you about new drops and order updates here.</span>
          </div>

          <div v-for="notif in authStore.notifications" 
               :key="notif.id" 
               class="notification-item"
               :class="{ 'unread': !notif.isRead }"
               @click="handleMarkAsRead(notif.id)">
            
            <div class="notif-avatar">
               <img v-if="notif.image" :src="notif.image" alt="notif" class="notif-img" />
               <div v-else class="notif-fallback">{{ getIconForType(notif.type) }}</div>
            </div>

            <div class="notif-content">
              <div class="notif-meta">
                <span class="notif-type">{{ notif.type.replace('_', ' ') }}</span>
                <span class="notif-time">
                  <Clock :size="10" />
                  {{ formatDistanceToNow(new Date(notif.created_at), { addSuffix: true }) }}
                </span>
              </div>
              <h4 class="notif-title">{{ notif.title }}</h4>
              <p class="notif-message">{{ notif.message }}</p>
              
              <RouterLink v-if="notif.link" :to="notif.link" class="notif-link" @click="isOpen = false">
                View Details <ChevronRight :size="12" />
              </RouterLink>
            </div>

            <div class="unread-indicator" v-if="!notif.isRead"></div>
          </div>
        </div>

        <div class="dropdown-footer">
          <RouterLink to="/profile" class="view-all-link" @click="isOpen = false">
            View All in Profile
          </RouterLink>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.notification-center {
  position: relative;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #000;
  display: flex;
  align-items: center;
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  justify-content: center;
  transition: all 0.2s;
}

.icon-btn:hover, .icon-btn.active {
  background-color: #f1f5f9;
  color: #3b82f6;
}

.badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background-color: #ef4444;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 900;
  min-width: 16px;
  height: 16px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid #fff;
}

.notification-dropdown {
  position: absolute;
  top: calc(100% + 15px);
  right: -10px;
  width: 380px;
  background: #fff;
  border-radius: 20px;
  border: 1px solid #f1f5f9;
  z-index: 1000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dropdown-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-left h3 {
  font-size: 0.9rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.count-tag {
  font-size: 0.65rem;
  font-weight: 900;
  background: #eff6ff;
  color: #3b82f6;
  padding: 2px 8px;
  border-radius: 10px;
}

.mark-all-btn {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  background: none;
  border: none;
  cursor: pointer;
}

.mark-all-btn:hover {
  color: #3b82f6;
  text-decoration: underline;
}

.notification-list {
  max-height: 450px;
  overflow-y: auto;
}

.empty-state {
  padding: 60px 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon {
  color: #cbd5e1;
  margin-bottom: 20px;
}

.empty-state p {
  font-weight: 800;
  margin-bottom: 5px;
}

.empty-state span {
  font-size: 0.8rem;
  color: #64748b;
}

.notification-item {
  padding: 16px 20px;
  display: flex;
  gap: 15px;
  border-bottom: 1px solid #f8fafc;
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
}

.notification-item:hover {
  background-color: #f8fafc;
}

.notification-item.unread {
  background-color: #3b82f605;
}

.notif-avatar {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  overflow: hidden;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notif-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.notif-fallback {
  font-size: 1.25rem;
}

.notif-content {
  flex: 1;
}

.notif-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.notif-type {
  font-size: 0.65rem;
  font-weight: 900;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 1px;
}

.notif-time {
  font-size: 0.65rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 4px;
}

.notif-title {
  font-size: 0.85rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 4px;
}

.notif-message {
  font-size: 0.8rem;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notif-link {
  font-size: 0.75rem;
  font-weight: 800;
  color: #3b82f6;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.unread-indicator {
  position: absolute;
  top: 20px;
  right: 15px;
  width: 8px;
  height: 8px;
  background-color: #3b82f6;
  border-radius: 50%;
}

.dropdown-footer {
  padding: 15px;
  text-align: center;
  border-top: 1px solid #f1f5f9;
}

.view-all-link {
  font-size: 0.8rem;
  font-weight: 800;
  color: #3b82f6;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}
</style>
