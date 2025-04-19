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
                  @click="resetPassword(user)"
                  class="text-indigo-600 hover:text-indigo-900 mr-3">
                  Reset Password
                </button>
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
    <div class="bg-white shadow rounded-lg p-6">
      <h3 class="text-xl font-semibold mb-4">Add New User</h3>
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
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { db, authService } from '../services/db';

export default {
  name: 'AdminUsers',
  setup() {
    const users = ref([]);
    const newUser = ref({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      password: ''
    });

    const loadUsers = async () => {
      users.value = await db.users
        .toArray()
        .then(users => users.map(({ password, ...user }) => user));
    };

    const addUser = async () => {
      try {
        await authService.register(newUser.value);
        newUser.value = {
          username: '',
          email: '',
          firstName: '',
          lastName: '',
          password: ''
        };
        await loadUsers();
      } catch (error) {
        alert(error.message);
      }
    };

    const resetPassword = async (user) => {
      const newPassword = prompt('Enter new password for ' + user.username);
      if (newPassword) {
        await db.users
          .where('id')
          .equals(user.id)
          .modify(user => { user.password = newPassword; });
        alert('Password updated successfully');
      }
    };

    const deleteUser = async (user) => {
      if (confirm('Are you sure you want to delete ' + user.username + '?')) {
        await db.users.delete(user.id);
        await db.sessions.where('userId').equals(user.id).delete();
        await loadUsers();
      }
    };

    onMounted(loadUsers);

    return {
      users,
      newUser,
      addUser,
      resetPassword,
      deleteUser
    };
  }
};
</script> 