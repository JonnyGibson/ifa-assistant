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
                v-model="formData.email"
                type="email"
                autocomplete="email"
                placeholder="Email address"
                class="w-full p-inputtext-sm"
                :class="{ 'p-invalid': v$.email.$error }"
                aria-describedby="email-error"
              />
              <small v-if="v$.email.$error" id="email-error" class="text-red-600">
                {{ v$.email.$errors[0].$message }}
              </small>
            </div>
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <div class="mt-1">
              <Password
                id="password"
                v-model="formData.password"
                :feedback="false"
                :toggleMask="true"
                placeholder="Password"
                class="w-full p-inputtext-sm"
                :class="{ 'p-invalid': v$.password.$error }"
                aria-describedby="password-error"
              />
              <small v-if="v$.password.$error" id="password-error" class="text-red-600">
                {{ v$.password.$errors[0].$message }}
              </small>
            </div>
          </div>
        </div>

        <div>
          <Button
            type="submit"
            :loading="loading"
            label="Sign in"
            icon="pi pi-sign-in"
            class="w-full"
            severity="success"
          />
        </div>
      </form>

      <div class="flex flex-col items-center space-y-4 text-sm text-gray-600">
        <p>Contact your administrator if you need access</p>
        <button 
          @click="resetDatabase" 
          class="text-emerald-600 hover:text-emerald-700 underline"
          :disabled="resetting"
        >
          {{ resetting ? 'Resetting database...' : 'Reset database to seed data' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required, email } from '@vuelidate/validators'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import { db } from '../services/db'

export default {
  name: 'LoginForm',
  components: {
    Button,
    InputText,
    Password
  },
  emits: ['login'],
  setup(props, { emit }) {
    const formData = ref({
      email: 'admin@webserve.it',
      password: 'password'
    })
    
    const loading = ref(false)
    const resetting = ref(false)

    const rules = computed(() => ({
      email: { required, email },
      password: { required }
    }))

    const v$ = useVuelidate(rules, formData)

    const handleSubmit = async () => {
      loading.value = true
      try {
        const isFormCorrect = await v$.value.$validate()
        
        if (!isFormCorrect) {
          return
        }

        emit('login', {
          email: formData.value.email,
          password: formData.value.password
        })
      } catch (error) {
        console.error('Login error:', error)
      } finally {
        loading.value = false
      }
    }

    const resetDatabase = async () => {
      if (!confirm('Are you sure you want to reset the database to its initial state? This will remove all changes.')) {
        return
      }
      resetting.value = true
      try {
        await db.reset()
        alert('Database reset successfully. You can now log in with admin@webserve.it / password')
      } catch (error) {
        console.error('Error resetting database:', error)
        alert('Failed to reset database: ' + error.message)
      } finally {
        resetting.value = false
      }
    }

    return {
      formData,
      loading,
      resetting,
      v$,
      handleSubmit,
      resetDatabase
    }
  }
}
</script>

<style scoped>
:deep(.p-password-input) {
  width: 100%;
}

:deep(.p-inputtext) {
  padding: 0.75rem 1rem;
}

:deep(.p-button) {
  padding: 0.75rem 1.5rem;
}
</style>