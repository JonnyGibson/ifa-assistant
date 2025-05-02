<template>
  <div v-if="editHoldingModal.open" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-md w-full m-4">
      <div class="mb-4">
        <h3 class="text-lg font-medium text-gray-900">Edit Fund Holding</h3>
        <p class="mt-2 text-sm text-gray-500">
          Edit the number of units for this holding.
        </p>
      </div>
      <form @submit.prevent="$emit('save')">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Units</label>
          <input v-model.number="editHoldingModal.units" type="number" min="0" step="any" class="w-full border border-gray-300 rounded px-3 py-2" />
        </div>
        <div class="flex justify-between items-center">
          <button type="button" @click="$emit('close')" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">Cancel</button>
          <div class="flex gap-2">
            <button type="button" @click="$emit('delete')" class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Delete</button>
            <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">Save</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EditHoldingModal',
  props: {
    editHoldingModal: { type: Object, required: true }
  }
};
</script>
