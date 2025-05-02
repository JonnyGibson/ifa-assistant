<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-md w-full m-4">
      <div class="mb-4">
        <h3 class="text-lg font-medium text-gray-900">Delete Client</h3>
        <p class="mt-2 text-sm text-gray-500">
          Are you sure you want to delete {{ client.firstName }} {{ client.lastName }}? This will permanently remove:
        </p>
        <ul class="mt-2 text-sm text-gray-600 list-disc pl-5">
          <li>Client profile and contact information</li>
          <li>Investment accounts and holdings</li>
          <li>Insurance policies</li>
          <li>Interaction history</li>
          <li>Fact find data</li>
        </ul>
        <p class="mt-2 text-sm text-red-600">This action cannot be undone.</p>
      </div>
      <div class="flex justify-end space-x-4">
        <button
          @click="$emit('cancel')"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          Cancel
        </button>
        <button
          @click="$emit('delete')"
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Delete Client
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DeleteConfirmationModal',
  props: {
    client: { type: Object, required: true },
    show: { type: Boolean, default: true }
  }
};
</script>
