<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full bg-white rounded-lg shadow-xl p-8 space-y-8">
      <div>
        <div class="flex flex-col items-center">
          <h1 class="text-center font-rubik">
            <span class="text-3xl font-bold text-emerald-600">IFA</span>
            <span class="text-3xl text-gray-600 mx-2">|</span>
            <span class="text-3xl font-bold text-gray-800">Assistant</span>
          </h1>
        </div>
        <h2 class="mt-6 text-center text-2xl font-medium text-gray-900">
          Sign in to your account
        </h2>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="rounded-md space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
            <div class="mt-1">
              <InputText 
                id="email"
                v-model="email"
                type="email"
                autocomplete="email"
                placeholder="Email address"
                class="w-full p-inputtext-sm"
              />
            </div>
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <div class="mt-1">
              <Password
                id="password"
                v-model="password"
                :feedback="false"
                :toggleMask="true"
                placeholder="Password"
                class="w-full p-inputtext-sm"
              />
            </div>
          </div>
        </div>

        <div>
          <Button
            type="submit"
            :loading="loading"
            label="Sign in"
            icon="pi pi-sign-in"
            severity="secondary"
            raised
            class="w-full px-6 py-3 bg-emerald-600 border border-emerald-500 hover:bg-emerald-700 transition-colors duration-200 text-white font-medium rounded-lg"
          />
        </div>

        <div v-if="error" class="text-red-600 text-sm mt-2">
          {{ error }}
        </div>
      </form>

      <div class="flex flex-col items-center space-y-4 text-sm text-gray-600">
        <div class="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
          <p class="text-blue-800 font-medium mb-1">Demo Login:</p>
          <p class="text-blue-600">Email: admin@webserve.it</p>
          <p class="text-blue-600">Password: admin123</p>
        </div>
        <div class="flex flex-col items-center gap-2">
          <Button
            type="button"
            :label="refreshing ? 'Refreshing Data...' : 'Reset Database'"
            :icon="refreshing ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'"
            :disabled="refreshing"
            severity="secondary"
            raised
            class="px-6 py-3 bg-emerald-600 border border-emerald-500 hover:bg-emerald-700 transition-colors duration-200 text-white font-medium rounded-lg"
            @click="refreshData"
          />
          <div v-if="refreshMessage" :class="[
            'text-sm',
            refreshError ? 'text-red-600' : 'text-emerald-600'
          ]">
            {{ refreshMessage }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import { authService, db } from '../services/database';

export default {
  name: 'LoginForm',
  components: {
    Button,
    InputText,
    Password
  },
  emits: ['login'],
  setup(props, { emit }) {
    const email = ref('');
    const password = ref('');
    const error = ref('');
    const loading = ref(false);
    const refreshing = ref(false);
    const refreshMessage = ref('');
    const refreshError = ref(false);

    const handleSubmit = async () => {
      if (!email.value || !password.value) {
        error.value = 'Please enter both email and password.';
        return;
      }

      loading.value = true;
      error.value = '';

      try {
        const result = await authService.login(email.value, password.value);
        localStorage.setItem('auth_token', result.token);
        emit('login', result.user);
      } catch (err) {
        console.error('Login error:', err);
        error.value = err.message || 'Login failed. Please check your credentials.';
      } finally {
        loading.value = false;
      }
    };

    const refreshData = async () => {
      refreshing.value = true;
      refreshMessage.value = '';
      refreshError.value = false;
      
      try {
        await db.initialize(true); // Force reinitialize
        refreshMessage.value = 'Database reset successfully! You can now log in.';
        refreshError.value = false;
      } catch (err) {
        console.error('Database refresh error:', err);
        refreshMessage.value = 'Failed to reset database. Please try again.';
        refreshError.value = true;
      } finally {
        refreshing.value = false;
      }
    };

    return {
      email,
      password,
      error,
      loading,
      refreshing,
      refreshMessage,
      refreshError,
      handleSubmit,
      refreshData
    };
  }
};
</script>

<style scoped>
:deep(.p-password-input) {
  width: 100%;
}

:deep(.p-inputtext) {
  padding: 0.75rem 1rem;
}

:deep(.p-button) {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0.5rem !important;
}

:deep(.p-button .p-button-icon) {
  font-size: 1rem !important;
  margin: 0 !important;
  order: -1 !important;
}

:deep(.p-button .p-button-label) {
  font-weight: 500 !important;
}

:deep(.p-button:disabled) {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>