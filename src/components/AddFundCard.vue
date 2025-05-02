<template>
  <section v-if="isAdding" class="bg-gray-50 rounded-lg border-2 border-dashed border-emerald-300 p-4 flex flex-col justify-center items-center">
    <form @submit.prevent="handleSubmit" class="w-full flex flex-col gap-2">
      <label :for="'add-isin-input-' + accountId" class="text-sm font-medium text-gray-700">Add Fund by ISIN</label>
      <div class="flex gap-2">
        <input 
          :id="'add-isin-input-' + accountId" 
          v-model="isin" 
          type="text" 
          maxlength="12" 
          pattern="[A-Za-z0-9]{12}" 
          required 
          autocomplete="off" 
          placeholder="Enter ISIN" 
          class="border border-gray-300 rounded px-2 py-1 w-40" 
        />
        <button type="submit" class="px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm">Find</button>
        <button type="button" @click="$emit('cancel')" class="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm">Cancel</button>
      </div>
      <span v-if="error" class="text-red-600 text-sm">{{ error }}</span>
      <span v-if="result" class="text-emerald-700 text-sm">{{ result }}</span>
    </form>
  </section>
  <section v-else class="flex items-center justify-center">
    <button 
      type="button" 
      @click="$emit('startAdd')" 
      class="w-full px-4 py-3 border-2 border-dashed border-emerald-300 rounded-lg text-emerald-700 bg-gray-50 hover:bg-emerald-50 font-semibold"
    >
      + Add Fund
    </button>
  </section>
</template>

<script>
export default {
  name: 'AddFundCard',
  props: {
    accountId: { type: [String, Number], required: true },
    isAdding: { type: Boolean, required: true },
    error: { type: String, default: '' },
    result: { type: String, default: '' }
  },
  emits: ['startAdd', 'cancel', 'submit'],
  data() {
    return {
      isin: ''
    };
  },
  methods: {
    handleSubmit() {
      this.$emit('submit', this.isin);
    }
  }
};
</script>