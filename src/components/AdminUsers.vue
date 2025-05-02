<template>
  <div class="p-4">
    <h2 class="text-2xl font-bold mb-4">User Management</h2>
    
    <!-- User List -->
    <div class="mb-8">
      <h3 class="text-xl font-semibold mb-3">Users</h3>
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.id">
              <td class="px-6 py-4 whitespace-nowrap">{{ user.username }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ user.email }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ user.firstName }} {{ user.lastName }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button 
                  @click="deleteUser(user)"
                  class="text-red-600 hover:text-red-900">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add New User -->
    <div v-if="showAddUserForm" class="bg-white shadow rounded-lg p-6">
      <h3 class="text-xl font-semibold mb-4">New User</h3>
      <form @submit.prevent="addUser" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Username</label>
            <input 
              v-model="newUser.username"
              type="text"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <input 
              v-model="newUser.email"
              type="email"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">First Name</label>
            <input 
              v-model="newUser.firstName"
              type="text"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Last Name</label>
            <input 
              v-model="newUser.lastName"
              type="text"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Password</label>
            <input 
              v-model="newUser.password"
              type="password"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div class="flex justify-end">
          <button 
            type="submit"
            class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add User
          </button>
        </div>
      </form>
    </div>
    <div v-if="errorMessage" class="text-red-500 mt-4">{{ errorMessage }}</div>
    <div v-if="successMessage" class="text-green-500 mt-4">{{ successMessage }}</div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { userService } from '../services/database';

export default {
  name: 'AdminUsers',
  setup() {
    const users = ref([]);
    const newUser = ref({
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      isAdmin: false
    });
    const showAddUserForm = ref(false);
    const errorMessage = ref('');
    const successMessage = ref('');

    const loadUsers = async () => {
      try {
        users.value = await userService.getAllUsers();
      } catch (error) {
        console.error('Error loading users:', error);
        errorMessage.value = 'Failed to load users';
      }
    };

    const addUser = async () => {
      try {
        await userService.addUser(newUser.value);
        successMessage.value = 'User added successfully';
        showAddUserForm.value = false;
        newUser.value = {
          username: '',
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          isAdmin: false
        };
        await loadUsers();
      } catch (error) {
        console.error('Error adding user:', error);
        errorMessage.value = error.message || 'Failed to add user';
      }
    };

    const deleteUser = async (user) => {
      if (!confirm(`Are you sure you want to delete user ${user.username}?`)) {
        return;
      }

      try {
        await userService.deleteUser(user.id);
        await loadUsers();
        successMessage.value = 'User deleted successfully';
      } catch (error) {
        console.error('Error deleting user:', error);
        errorMessage.value = 'Failed to delete user';
      }
    };

    onMounted(() => {
      loadUsers();
    });

    return {
      users,
      newUser,
      showAddUserForm,
      errorMessage,
      successMessage,
      addUser,
      deleteUser
    };
  }
};
</script>