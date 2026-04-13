<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const isLogin = ref(true)

const email = ref('')
const password = ref('')
const name = ref('')
const showPassword = ref(false)
const error = ref('')
const isLoading = ref(false)

const toggleMode = () => {
  isLogin.value = !isLogin.value
  email.value = ''
  password.value = ''
  name.value = ''
}

const isVerificationNeeded = ref(false)
const resendSuccess = ref(false)

const submitForm = async () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    error.value = 'Please enter a valid email address.'
    return
  }
  
  error.value = ''
  resendSuccess.value = false
  isLoading.value = true
  try {
    if (isLogin.value) {
      if (email.value && password.value) {
        await authStore.login(email.value, password.value)
        await handlePostLogin()
      }
    } else {
      if (name.value && email.value && password.value) {
        const result = await authStore.register(name.value, email.value, password.value)
        if (result?.verificationRequired) {
          isVerificationNeeded.value = true
          isLogin.value = true // Switch to login mode to show the message
        }
      }
    }
  } catch (err) {
    error.value = err.message || 'Authentication failed. Please check your credentials.'
    console.error('Auth error:', err)
  } finally {
    isLoading.value = false
  }
}

const resendVerification = async () => {
  if (!email.value || !password.value) {
    error.value = 'Please enter your email and password to resend the verification link.'
    return
  }
  
  error.value = ''
  isLoading.value = true
  try {
    await authStore.resendVerification(email.value, password.value)
    resendSuccess.value = true
  } catch (err) {
    error.value = 'Failed to resend verification email. Please check your credentials.'
  } finally {
    isLoading.value = false
  }
}

const handleGoogleLogin = async () => {
  error.value = ''
  isLoading.value = true
  try {
    await authStore.loginWithGoogle()
    await handlePostLogin()
  } catch (err) {
    error.value = 'Google sign-in failed. Please try again.'
    console.error('Google auth error:', err)
  } finally {
    isLoading.value = false
  }
}

const handlePostLogin = async () => {
  const result = await authStore.executePendingAction();
  if (result) {
    // If it was a 'BUY_NOW' action, direct to checkout is preferred
    if (result.type === 'BUY_NOW') {
      router.push('/checkout');
    } else if (result.redirect) {
      router.push(result.redirect);
    } else {
      router.push('/profile');
    }
  } else {
    const redirect = route.query.redirect || '/profile';
    router.push(redirect);
  }
}
</script>

<template>
  <div class="auth-view container">
    <div class="auth-box">
      <div class="auth-header">
        <h1>{{ isLogin ? 'Sign In' : 'Create Account' }}</h1>
        <p>{{ isLogin ? 'Welcome back! Please enter your details.' : 'Join us to get the best deals and tracking.' }}</p>
      </div>

      <div v-if="error" class="error-alert">
        {{ error }}
        <button v-if="error.includes('verify')" @click="resendVerification" class="resend-link">
          Resend Link
        </button>
      </div>

      <div v-if="isVerificationNeeded" class="success-alert">
        <strong>Verification Link Sent!</strong>
        <p>Please check your inbox ({{ email }}) and click the link to activate your account.</p>
      </div>

      <div v-if="resendSuccess" class="success-alert">
        Verification link resent successfully!
      </div>

      <form @submit.prevent="submitForm" class="auth-form">
        <div class="form-group" v-if="!isLogin">
          <label>Full Name</label>
          <input type="text" v-model="name" placeholder="John Doe" required />
        </div>
        
        <div class="form-group">
          <label>Email Address</label>
          <input type="email" v-model="email" placeholder="hello@example.com" required />
        </div>
        
        <div class="form-group">
          <label>Password</label>
          <div class="password-wrapper">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              v-model="password" 
              placeholder="••••••••" 
              required 
            />
            <button 
              type="button" 
              class="toggle-password" 
              @click="showPassword = !showPassword"
              tabindex="-1"
            >
              <Eye v-if="!showPassword" size="20" />
              <EyeOff v-else size="20" />
            </button>
          </div>
        </div>

        <div class="form-actions" v-if="isLogin">
          <div class="remember-me">
            <input type="checkbox" id="remember" />
            <label for="remember">Remember me</label>
          </div>
          <a href="#" class="forgot-pwd" @click.prevent>Forgot Password?</a>
        </div>

        <button type="submit" class="btn primary-btn submit-btn" :disabled="isLoading">
          <span v-if="isLoading">Please wait...</span>
          <span v-else>{{ isLogin ? 'Sign In' : 'Sign Up' }}</span>
        </button>
      </form>

      <!-- Google Divider -->
      <div class="google-divider">
        <span>OR</span>
      </div>

      <!-- Google Login Button -->
      <button @click="handleGoogleLogin" class="google-btn" :disabled="isLoading">
        <svg class="google-icon" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      <div class="auth-footer">
        <p v-if="isLogin">
          Don't have an account? 
          <a href="#" @click.prevent="toggleMode">Sign up here</a>
        </p>
        <p v-else>
          Already have an account? 
          <a href="#" @click.prevent="toggleMode">Sign in</a>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  padding: 60px 20px;
  background-color: #fafafa;
}

@media (max-width: 576px) {
  .auth-view { padding: 40px 15px; }
  .auth-box { padding: 30px 20px; }
  .auth-header h1 { font-size: 1.75rem; }
}

.auth-box {
  background: #fff;
  width: 100%;
  max-width: 450px;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  border: 1px solid #eee;
}

.error-alert {
  background-color: #fef2f2;
  color: #dc2626;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #fecaca;
  margin-bottom: 20px;
  font-size: 0.9rem;
  text-align: center;
}
.success-alert {
  background-color: #f0fdf4;
  color: #166534;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #bbfcce;
  margin-bottom: 24px;
  font-size: 0.9rem;
  line-height: 1.5;
}
.success-alert strong { display: block; margin-bottom: 4px; }
.resend-link {
  display: block;
  margin: 10px auto 0;
  background: none;
  border: none;
  color: #dc2626;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.85rem;
}

.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.auth-header h1 {
  font-family: var(--font-heading);
  font-size: 2rem;
  margin-bottom: 10px;
}

.auth-header p {
  color: #666;
  font-size: 0.95rem;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-family: inherit;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  outline: none;
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-wrapper input {
  padding-right: 50px !important;
}

.toggle-password {
  position: absolute;
  right: 15px;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 10;
}

.toggle-password:hover {
  color: #6366f1;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  font-size: 0.9rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
}

.forgot-pwd {
  color: #666;
}

.forgot-pwd:hover {
  color: #000;
  text-decoration: underline;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  font-size: 1rem;
  background: #000;
  color: #fff;
  border: none;
  font-weight: 600;
  border-radius: 5px;
  margin-bottom: 20px;
}

.submit-btn:hover {
  opacity: 0.85;
}

.auth-footer {
  text-align: center;
  font-size: 0.95rem;
  color: #555;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.auth-footer a {
  color: #000;
  font-weight: 600;
  text-decoration: underline;
}

.google-divider {
  position: relative;
  text-align: center;
  margin: 25px 0;
}

.google-divider::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #eee;
  z-index: 1;
}

.google-divider span {
  position: relative;
  z-index: 2;
  background: #fff;
  padding: 0 15px;
  color: #888;
  font-size: 0.8rem;
  font-weight: 600;
}

.google-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  color: #555;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s;
  margin-bottom: 25px;
  cursor: pointer;
}

.google-btn:hover {
  background: #f9f9f9;
  border-color: #ccc;
}

.google-icon {
  width: 18px;
  height: 18px;
}
</style>
