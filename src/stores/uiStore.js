import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    notification: {
      show: false,
      title: 'Notification',
      message: '',
      type: 'info' // 'success' | 'error' | 'info' | 'warning'
    }
  }),
  actions: {
    showNotification(title, message, type = 'info') {
      this.notification = {
        show: true,
        title,
        message,
        type
      }
    },
    closeNotification() {
      this.notification.show = false
    }
  }
})
