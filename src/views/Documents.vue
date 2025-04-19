<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header Section -->
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Document Management</h1>
      <p class="text-red-500 text-sm">(Note: File upload/download disabled - Local Dev Mode)</p>
      <div class="flex space-x-4">
        <button 
          @click="showUploadModal = true"
          class="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300 flex items-center disabled:opacity-50"
          :disabled="true" 
        >
          <i class="fas fa-upload mr-2"></i>Upload Document (Disabled)
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
              placeholder="Search documents or folders..."
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
            <option value="date">Date Added</option>
            <option value="type">Type</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading Indicator -->
    <div v-if="isLoading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
    </div>

    <!-- Documents Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      <!-- Folders -->
      <div 
        v-for="folder in filteredFolders" 
        :key="`folder-${folder.id}`"
        class="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300 cursor-pointer flex flex-col justify-between"
        @dblclick="openFolder(folder.id)" 
      >
        <div class="flex items-center mb-2">
          <i class="fas fa-folder text-yellow-500 text-3xl mr-3"></i>
          <h3 class="font-semibold text-gray-800 truncate flex-1" :title="folder.name">{{ folder.name }}</h3>
        </div>
        <div class="text-right text-sm text-gray-500">
          <button @click.stop="confirmDeleteFolder(folder.id)" class="text-red-500 hover:text-red-700 text-xs">
              <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>

      <!-- Documents (Metadata only) -->
      <div 
        v-for="document in filteredDocuments" 
        :key="`doc-${document.id}`"
        class="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between"
      >
        <div>
          <div class="flex items-center mb-2">
            <i :class="getFileIcon(document.type)" class="text-3xl mr-3"></i>
            <h3 class="font-semibold text-gray-800 truncate flex-1" :title="document.name">{{ document.name }}</h3>
          </div>
          <p class="text-xs text-gray-500 mb-2">Added: {{ formatDate(document.createdAt) }}</p>
          <p class="text-xs text-gray-500 mb-2">Client: {{ document.clientName || 'N/A' }}</p>
        </div>
        <div class="flex justify-between items-center mt-2">
          <span class="text-xs text-gray-500">{{ document.type || 'N/A' }}</span>
           <button @click.stop="confirmDeleteDocument(document.id)" class="text-red-500 hover:text-red-700 text-xs">
              <i class="fas fa-trash"></i>
           </button>
        </div>
      </div>
       <!-- Grid Placeholder if empty -->
      <div v-if="!isLoading && filteredFolders.length === 0 && filteredDocuments.length === 0" class="col-span-full text-center py-10 text-gray-500">
        No documents or folders found.
      </div>
    </div>

    <!-- Upload Modal (Disabled) -->
    <div v-if="showUploadModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-2xl w-full">
        <h2 class="text-2xl font-bold mb-6">Upload Document (Disabled)</h2>
        <p class="text-gray-600 mb-4">File uploads are disabled in local development mode as IndexedDB is not suitable for large file storage.</p>
        <div class="flex justify-end">
          <button type="button" @click="showUploadModal = false" class="px-4 py-2 text-gray-600 hover:text-gray-800">
            Close
          </button>
        </div>
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
              required
              class="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Enter folder name"
            />
          </div>
           <div class="mb-6">
              <label class="block text-gray-700 mb-1 text-sm font-medium">Assign to Client (Optional)</label>
              <select v-model="newFolderClientId" class="w-full border border-gray-300 rounded-lg p-2 text-sm">
                <option value="">None</option>
                <option v-for="client in clients" :key="client.id" :value="client.id">
                  {{ client.firstName }} {{ client.lastName }}
                </option>
              </select>
            </div>
          <div class="flex justify-end space-x-4">
            <button type="button" @click="closeFolderModal" class="px-4 py-2 text-gray-600 hover:text-gray-800">
              Cancel
            </button>
            <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, inject, watch } from 'vue'
import { dataService } from '../services/db' // Use our data service

export default {
  name: 'Documents',
  setup() {
    const documents = ref([]);
    const folders = ref([]);
    const clients = ref([]); // To map client IDs to names
    const isLoading = ref(true);
    const searchQuery = ref('');
    const selectedFolder = ref(''); // For filtering, though folders aren't hierarchical yet
    const sortBy = ref('name');
    const showUploadModal = ref(false);
    const showNewFolderModal = ref(false);
    const newFolderName = ref('');
    const newFolderClientId = ref('');

    const currentUser = inject('currentUser', ref(null)); 
    const userId = computed(() => currentUser.value?.id);

    const fetchData = async () => {
        if (!userId.value) return;
        isLoading.value = true;
        try {
            const [docsData, foldersData, clientsData] = await Promise.all([
                dataService.getDocuments(userId.value),
                dataService.getFolders(userId.value),
                dataService.getClients(userId.value) // Fetch clients for names
            ]);
            documents.value = docsData;
            folders.value = foldersData;
            clients.value = clientsData;
            enrichDocumentsWithClientNames(); // Add client names to documents
        } catch (error) {
            console.error('Error fetching documents/folders/clients:', error);
            alert('Failed to load data.');
        } finally {
            isLoading.value = false;
        }
    };
    
    const enrichDocumentsWithClientNames = () => {
        const clientMap = new Map(clients.value.map(c => [c.id, `${c.firstName} ${c.lastName}`]));
        documents.value = documents.value.map(doc => ({
            ...doc,
            clientName: clientMap.get(doc.clientId)
        }));
    };

    const filteredDocuments = computed(() => {
      let filtered = documents.value;
      // Filter by search query (name)
      if (searchQuery.value) {
        filtered = filtered.filter(doc => 
          doc.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
      }
      // Filter by folder (if implemented fully)
      // if (selectedFolder.value) {
      //   filtered = filtered.filter(doc => doc.folderId === selectedFolder.value);
      // }

      // Sort
      return filtered.sort((a, b) => {
        if (sortBy.value === 'date') {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        if (sortBy.value === 'type') {
          return (a.type || '').localeCompare(b.type || '');
        }
        return a.name.localeCompare(b.name); // Default sort by name
      });
    });

     const filteredFolders = computed(() => {
        let filtered = folders.value;
        // Filter by search query (name)
        if (searchQuery.value) {
            filtered = filtered.filter(folder => 
            folder.name.toLowerCase().includes(searchQuery.value.toLowerCase())
            );
        }
        // Add sorting if needed, e.g., by name
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
    });

    const closeFolderModal = () => {
      showNewFolderModal.value = false;
      newFolderName.value = '';
      newFolderClientId.value = '';
    };

    const createFolder = async () => {
      if (!userId.value || !newFolderName.value) return;
      try {
        await dataService.addFolder(userId.value, { 
            name: newFolderName.value, 
            clientId: newFolderClientId.value || null // Store null if no client selected
        });
        await fetchData(); // Refresh data
        closeFolderModal();
      } catch (error) {
        console.error('Error creating folder:', error);
        alert('Failed to create folder.');
      }
    };

    const confirmDeleteFolder = async (folderId) => {
        if (!userId.value) return;
        if (confirm('Are you sure you want to delete this folder? Any documents inside will need to be reassigned (functionality TBD).')) {
             try {
                await dataService.deleteFolder(userId.value, folderId);
                await fetchData(); // Refresh data
            } catch (error) {
                console.error('Error deleting folder:', error);
                alert('Failed to delete folder.');
            }
        }
    };

    const confirmDeleteDocument = async (documentId) => {
        if (!userId.value) return;
        if (confirm('Are you sure you want to delete this document record?')) {
            try {
                await dataService.deleteDocument(userId.value, documentId);
                await fetchData(); // Refresh data
            } catch (error) {
                console.error('Error deleting document:', error);
                alert('Failed to delete document record.');
            }
        }
    };

    // Function to determine file icon class
    const getFileIcon = (type) => {
      if (!type) return 'fas fa-file text-gray-500';
      if (type.includes('pdf')) return 'fas fa-file-pdf text-red-500';
      if (type.includes('word')) return 'fas fa-file-word text-blue-500';
      if (type.includes('excel')) return 'fas fa-file-excel text-green-500';
      if (type.includes('image')) return 'fas fa-file-image text-purple-500';
      return 'fas fa-file-alt text-gray-500'; // Default
    };

    // Function to format date
    const formatDate = (dateStr) => {
      if (!dateStr) return 'N/A';
      return new Date(dateStr).toLocaleDateString('en-GB');
    };

    // Fetch data when component mounts or user changes
     onMounted(() => {
        if (userId.value) {
            fetchData();
        } else {
            const unwatch = watch(userId, (newUserId) => {
                if (newUserId) {
                    fetchData();
                    unwatch();
                }
            });
        }
    });

    return {
      documents,
      folders,
      clients,
      isLoading,
      searchQuery,
      selectedFolder,
      sortBy,
      showUploadModal,
      showNewFolderModal,
      newFolderName,
      newFolderClientId,
      filteredDocuments,
      filteredFolders,
      createFolder,
      confirmDeleteFolder,
      confirmDeleteDocument,
      closeFolderModal,
      getFileIcon,
      formatDate,
      // Note: upload/download/share functionality removed or disabled
    };
  }
}; 
</script> 