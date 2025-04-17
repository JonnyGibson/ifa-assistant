<template>
  <div class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center overflow-hidden">
    <!-- Animated Background Container -->
    <div class="absolute inset-0 overflow-hidden">
      <img 
        src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80" 
        alt="Office Background"
        class="absolute inset-0 w-full h-full object-cover ken-burns"
      />
      <div class="absolute inset-0 bg-gradient-to-r from-emerald-900/80 to-emerald-800/80 backdrop-blur-sm"></div>
    </div>
    
    <div class="relative w-full max-w-md z-10">
      <!-- Login Form -->
      <div class="bg-white/90 backdrop-blur-lg p-8 rounded-lg shadow-xl">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-emerald-900">Welcome Back</h2>
          <p class="text-gray-600 mt-2">Sign in to your account</p>
        </div>
        
        <form @submit.prevent="$emit('login', loginForm)" class="space-y-6">
          <div>
            <label class="block text-gray-700 text-sm font-semibold mb-2" for="email">
              Email Address
            </label>
            <input 
              v-model="loginForm.email" 
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition duration-200" 
              type="email" 
              placeholder="Enter your email"
              required
            >
          </div>
          
          <div>
            <label class="block text-gray-700 text-sm font-semibold mb-2" for="password">
              Password
            </label>
            <input 
              v-model="loginForm.password" 
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition duration-200" 
              type="password" 
              placeholder="Enter your password"
              required
            >
          </div>
          
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input 
                v-model="loginForm.remember" 
                class="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded" 
                type="checkbox"
              >
              <label class="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <a href="#" class="text-sm text-emerald-600 hover:text-emerald-800">
              Forgot password?
            </a>
          </div>
          
          <button 
            class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-300"
            type="submit"
          >
            Sign In
          </button>
        </form>
        
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Don't have an account? 
            <a href="#" class="text-emerald-600 hover:text-emerald-800 font-semibold">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginForm',
  data() {
    return {
      loginForm: {
        email: '',
        password: '',
        remember: false
      }
    }
  }
}
</script>

<style>
@keyframes kenBurns {
  0% {
    transform: scale(1) translate(0, 0);
  }
  50% {
    transform: scale(1.05) translate(-1%, -1%);
  }
  100% {
    transform: scale(1) translate(0, 0);
  }
}

.ken-burns {
  animation: kenBurns 45s ease-in-out infinite;
  transform-origin: center;
}
</style> 