<template>
  <div class="p-4 max-w-7xl mx-auto">
    <h1 class="text-3xl font-bold mb-8">Settings</h1>

    <!-- Database Management -->
    <div class="mb-12 bg-white shadow rounded-lg p-6">
      <h2 class="text-2xl font-bold mb-4">Database Management</h2>
      <div class="space-y-4">
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 class="font-medium">Reset Database</h3>
            <p class="text-sm text-gray-500">Reset the database to its initial state with seed data</p>
          </div>
          <button 
            @click="confirmResetDatabase"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Reset Database
          </button>
        </div>

        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 class="font-medium">Clear All Data</h3>
            <p class="text-sm text-gray-500">Remove all data and start fresh</p>
          </div>
          <button 
            @click="confirmClearData"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Clear Data
          </button>
        </div>

        <div v-if="lastReset" class="text-sm text-gray-500">
          Last reset: {{ new Date(lastReset).toLocaleString() }}
        </div>
      </div>
    </div>

    <!-- User Management -->
    <div class="bg-white shadow rounded-lg p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">User Management</h2>
        <button 
          @click="showAddUserForm = true"
          class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Add User
        </button>
      </div>

      <!-- User List -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.id">
              <td class="px-6 py-4 whitespace-nowrap">{{ user.username }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ user.email }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ user.firstName }} {{ user.lastName }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="user.isAdmin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                  class="px-2 py-1 text-xs rounded-full"
                >
                  {{ user.isAdmin ? 'Admin' : 'User' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap space-x-2">
                <button 
                  @click="editUser(user)"
                  class="text-indigo-600 hover:text-indigo-900"
                >
                  Edit
                </button>
                <button 
                  @click="resetPassword(user)"
                  class="text-indigo-600 hover:text-indigo-900"
                >
                  Reset Password
                </button>
                <button 
                  v-if="!user.isAdmin || users.filter(u => u.isAdmin).length > 1"
                  @click="deleteUser(user)"
                  class="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit User Modal -->
    <div v-if="showAddUserForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-xl font-bold mb-4">{{ editingUser ? 'Edit User' : 'Add New User' }}</h3>
        <form @submit.prevent="saveUser" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Username</label>
            <input 
              v-model="userForm.username"
              type="text"
              required
              :disabled="editingUser"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <input 
              v-model="userForm.email"
              type="email"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">First Name</label>
            <input 
              v-model="userForm.firstName"
              type="text"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Last Name</label>
            <input 
              v-model="userForm.lastName"
              type="text"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div v-if="!editingUser">
            <label class="block text-sm font-medium text-gray-700">Password</label>
            <input 
              v-model="userForm.password"
              type="password"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div class="flex items-center">
            <input 
              type="checkbox"
              v-model="userForm.isAdmin"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label class="ml-2 block text-sm text-gray-900">Admin User</label>
          </div>
          <div class="flex justify-end space-x-3">
            <button 
              type="button"
              @click="showAddUserForm = false"
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button 
              type="submit"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {{ editingUser ? 'Save Changes' : 'Add User' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { db, authService } from '../services/db';

export default {
  name: 'Settings',
  setup() {
    const users = ref([]);
    const showAddUserForm = ref(false);
    const editingUser = ref(null);
    const lastReset = ref(null);
    const userForm = ref({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      isAdmin: false
    });

    const loadUsers = async () => {
      users.value = await db.users
        .toArray()
        .then(users => users.map(({ password, ...user }) => user));
    };

    const resetForm = () => {
      userForm.value = {
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        isAdmin: false
      };
      editingUser.value = null;
    };

    const editUser = (user) => {
      editingUser.value = user;
      userForm.value = { ...user };
      showAddUserForm.value = true;
    };

    const saveUser = async () => {
      try {
        if (editingUser.value) {
          // Update existing user
          const { password, ...updateData } = userForm.value;
          await db.users
            .where('id')
            .equals(editingUser.value.id)
            .modify(updateData);
        } else {
          // Add new user
          await authService.register(userForm.value);
        }
        showAddUserForm.value = false;
        resetForm();
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
      if (!confirm('Are you sure you want to delete ' + user.username + '?')) {
        return;
      }

      // Prevent deleting the last admin
      if (user.isAdmin) {
        const adminCount = users.value.filter(u => u.isAdmin).length;
        if (adminCount <= 1) {
          alert('Cannot delete the last admin user');
          return;
        }
      }

      await db.users.delete(user.id);
      await db.sessions.where('userId').equals(user.id).delete();
      await loadUsers();
    };

    const confirmResetDatabase = async () => {
      if (confirm('Are you sure you want to reset the database to its initial state? This will remove all changes and restore the default data.')) {
        await db.reset();
        lastReset.value = new Date().toISOString();
        await loadUsers();
      }
    };

    const confirmClearData = async () => {
      if (confirm('Are you sure you want to clear all data? This will remove everything except the admin user.')) {
        await db.transaction('rw', 
          db.users, 
          db.categories, 
          db.tasks, 
          db.sessions, 
          async () => {
            // Keep admin users
            const adminUsers = await db.users.where('isAdmin').equals(true).toArray();
            await db.sessions.clear();
            await db.tasks.clear();
            await db.categories.clear();
            await db.users.clear();
            // Restore admin users
            await db.users.bulkAdd(adminUsers);
          });
        lastReset.value = new Date().toISOString();
        await loadUsers();
      }
    };

    onMounted(async () => {
      await loadUsers();
      // Try to load last reset time from settings
      const resetSetting = await db.settings.get('lastReset');
      if (resetSetting) {
        lastReset.value = resetSetting.value;
      }
    });

    return {
      users,
      showAddUserForm,
      editingUser,
      userForm,
      lastReset,
      editUser,
      saveUser,
      resetPassword,
      deleteUser,
      confirmResetDatabase,
      confirmClearData
    };
  }
};
</script> 