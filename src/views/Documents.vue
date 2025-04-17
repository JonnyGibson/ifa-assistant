<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header Section -->
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Document Management</h1>
      <div class="flex space-x-4">
        <button 
          @click="showUploadModal = true"
          class="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300 flex items-center"
        >
          <i class="fas fa-upload mr-2"></i>Upload Document
        </button>
        <button 
          @click="showNewFolderModal = true"
          class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300 flex items-center"
        >
          <i class="fas fa-folder-plus mr-2"></i>New Folder
        </button>
      </div>
    </div>

    <!-- Search and Filter Section -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-8">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search documents..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
          </div>
        </div>
        <div class="flex space-x-4">
          <select
            v-model="selectedFolder"
            class="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Folders</option>
            <option v-for="folder in folders" :key="folder.id" :value="folder.id">
              {{ folder.name }}
            </option>
          </select>
          <select
            v-model="sortBy"
            class="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="name">Name</option>
            <option value="date">Date</option>
            <option value="type">Type</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Documents Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <!-- Folders -->
      <div 
        v-for="folder in filteredFolders" 
        :key="folder.id"
        class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
        @click="openFolder(folder)"
      >
        <div class="flex items-center">
          <i class="fas fa-folder text-yellow-500 text-3xl mr-4"></i>
          <div>
            <h3 class="font-semibold text-gray-800">{{ folder.name }}</h3>
            <p class="text-sm text-gray-500">{{ folder.document_count }} documents</p>
          </div>
        </div>
      </div>

      <!-- Documents -->
      <div 
        v-for="document in filteredDocuments" 
        :key="document.id"
        class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center">
            <i :class="getFileIcon(document.type)" class="text-3xl mr-4"></i>
            <div>
              <h3 class="font-semibold text-gray-800">{{ document.name }}</h3>
              <p class="text-sm text-gray-500">{{ formatDate(document.created_at) }}</p>
            </div>
          </div>
          <div class="dropdown relative">
            <button 
              @click="toggleDropdown(document.id)"
              class="text-gray-500 hover:text-gray-700"
            >
              <i class="fas fa-ellipsis-v"></i>
            </button>
            <div 
              v-if="activeDropdown === document.id"
              class="dropdown-menu absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10"
            >
              <button 
                @click="downloadDocument(document)"
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <i class="fas fa-download mr-2"></i>Download
              </button>
              <button 
                @click="shareDocument(document)"
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <i class="fas fa-share mr-2"></i>Share
              </button>
              <button 
                @click="deleteDocument(document)"
                class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                <i class="fas fa-trash mr-2"></i>Delete
              </button>
            </div>
          </div>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-500">{{ document.size }}</span>
          <span 
            :class="getStatusClass(document.status)"
            class="px-2 py-1 rounded-full text-xs"
          >
            {{ document.status }}
          </span>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <div v-if="showUploadModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-2xl w-full">
        <h2 class="text-2xl font-bold mb-6">Upload Document</h2>
        <form @submit.prevent="handleUpload">
          <div class="mb-6">
            <label class="block text-gray-700 mb-2">Select File</label>
            <input
              type="file"
              @change="handleFileChange"
              class="w-full border border-gray-300 rounded-lg p-2"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
            />
          </div>
          <div class="mb-6">
            <label class="block text-gray-700 mb-2">Folder</label>
            <select
              v-model="uploadFolder"
              class="w-full border border-gray-300 rounded-lg p-2"
            >
              <option value="">Root Folder</option>
              <option v-for="folder in folders" :key="folder.id" :value="folder.id">
                {{ folder.name }}
              </option>
            </select>
          </div>
          <div class="flex justify-end space-x-4">
            <button
              type="button"
              @click="showUploadModal = false"
              class="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg"
            >
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- New Folder Modal -->
    <div v-if="showNewFolderModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 class="text-2xl font-bold mb-6">Create New Folder</h2>
        <form @submit.prevent="createFolder">
          <div class="mb-6">
            <label class="block text-gray-700 mb-2">Folder Name</label>
            <input
              v-model="newFolderName"
              type="text"
              class="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Enter folder name"
            />
          </div>
          <div class="flex justify-end space-x-4">
            <button
              type="button"
              @click="showNewFolderModal = false"
              class="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase'

export default {
  name: 'Documents',
  setup() {
    const documents = ref([])
    const folders = ref([])
    const searchQuery = ref('')
    const selectedFolder = ref('')
    const sortBy = ref('name')
    const showUploadModal = ref(false)
    const showNewFolderModal = ref(false)
    const activeDropdown = ref(null)
    const uploadFolder = ref('')
    const newFolderName = ref('')
    const selectedFile = ref(null)

    const fetchDocuments = async () => {
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        documents.value = data
      } catch (error) {
        console.error('Error fetching documents:', error)
      }
    }

    const fetchFolders = async () => {
      try {
        const { data, error } = await supabase
          .from('folders')
          .select('*')
        
        if (error) throw error
        folders.value = data
      } catch (error) {
        console.error('Error fetching folders:', error)
      }
    }

    const filteredDocuments = computed(() => {
      let filtered = documents.value

      if (searchQuery.value) {
        filtered = filtered.filter(doc => 
          doc.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      }

      if (selectedFolder.value) {
        filtered = filtered.filter(doc => doc.folder_id === selectedFolder.value)
      }

      return filtered.sort((a, b) => {
        switch (sortBy.value) {
          case 'name':
            return a.name.localeCompare(b.name)
          case 'date':
            return new Date(b.created_at) - new Date(a.created_at)
          case 'type':
            return a.type.localeCompare(b.type)
          default:
            return 0
        }
      })
    })

    const filteredFolders = computed(() => {
      return folders.value.filter(folder => 
        folder.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    })

    const handleFileChange = (event) => {
      selectedFile.value = event.target.files[0]
    }

    const handleUpload = async () => {
      if (!selectedFile.value) return

      try {
        const fileExt = selectedFile.value.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        
        const { data, error } = await supabase.storage
          .from('documents')
          .upload(fileName, selectedFile.value)

        if (error) throw error

        const { data: document, error: insertError } = await supabase
          .from('documents')
          .insert({
            name: selectedFile.value.name,
            type: fileExt,
            size: formatFileSize(selectedFile.value.size),
            folder_id: uploadFolder.value || null,
            status: 'active'
          })

        if (insertError) throw insertError

        showUploadModal.value = false
        selectedFile.value = null
        fetchDocuments()
      } catch (error) {
        console.error('Error uploading document:', error)
      }
    }

    const createFolder = async () => {
      if (!newFolderName.value) return

      try {
        const { data, error } = await supabase
          .from('folders')
          .insert({
            name: newFolderName.value
          })

        if (error) throw error

        showNewFolderModal.value = false
        newFolderName.value = ''
        fetchFolders()
      } catch (error) {
        console.error('Error creating folder:', error)
      }
    }

    const downloadDocument = async (document) => {
      try {
        const { data, error } = await supabase.storage
          .from('documents')
          .download(document.path)

        if (error) throw error

        const url = window.URL.createObjectURL(data)
        const link = document.createElement('a')
        link.href = url
        link.download = document.name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Error downloading document:', error)
      }
    }

    const shareDocument = async (document) => {
      try {
        const { data, error } = await supabase
          .from('document_shares')
          .insert({
            document_id: document.id,
            shared_with: 'user@example.com' // Replace with actual user selection
          })

        if (error) throw error
      } catch (error) {
        console.error('Error sharing document:', error)
      }
    }

    const deleteDocument = async (document) => {
      if (!confirm('Are you sure you want to delete this document?')) return

      try {
        const { error } = await supabase
          .from('documents')
          .delete()
          .eq('id', document.id)

        if (error) throw error

        fetchDocuments()
      } catch (error) {
        console.error('Error deleting document:', error)
      }
    }

    const toggleDropdown = (documentId) => {
      activeDropdown.value = activeDropdown.value === documentId ? null : documentId
    }

    const openFolder = (folder) => {
      selectedFolder.value = folder.id
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString()
    }

    const formatFileSize = (bytes) => {
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      if (bytes === 0) return '0 Byte'
      const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
      return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i]
    }

    const getFileIcon = (type) => {
      const icons = {
        pdf: 'fas fa-file-pdf text-red-500',
        doc: 'fas fa-file-word text-blue-500',
        docx: 'fas fa-file-word text-blue-500',
        xls: 'fas fa-file-excel text-green-500',
        xlsx: 'fas fa-file-excel text-green-500',
        default: 'fas fa-file text-gray-500'
      }
      return icons[type] || icons.default
    }

    const getStatusClass = (status) => {
      const classes = {
        active: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        archived: 'bg-gray-100 text-gray-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }

    onMounted(() => {
      fetchDocuments()
      fetchFolders()
    })

    return {
      documents,
      folders,
      searchQuery,
      selectedFolder,
      sortBy,
      showUploadModal,
      showNewFolderModal,
      activeDropdown,
      uploadFolder,
      newFolderName,
      filteredDocuments,
      filteredFolders,
      handleFileChange,
      handleUpload,
      createFolder,
      downloadDocument,
      shareDocument,
      deleteDocument,
      toggleDropdown,
      openFolder,
      formatDate,
      getFileIcon,
      getStatusClass
    }
  }
}
</script>

<style scoped>
.dropdown-menu {
  display: none;
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 10;
}

.dropdown:hover .dropdown-menu {
  display: block;
}
</style> 