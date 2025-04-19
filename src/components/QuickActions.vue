<template>
  <div class="bg-white rounded-lg shadow-soft p-6">
    <h3 class="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h3>
    <div class="grid grid-cols-2 gap-4">
      <button @click="$emit('new-note')" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        <i class="fas fa-plus mr-2"></i>New Note
      </button>
      <button @click="$emit('upload-doc')" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
        <i class="fas fa-upload mr-2"></i>Upload Doc
      </button>
      <button @click="$emit('schedule')" class="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
        <i class="fas fa-calendar-plus mr-2"></i>Schedule
      </button>
      <button @click="$emit('export')" class="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
        <i class="fas fa-file-export mr-2"></i>Export
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuickActions'
}
</script>