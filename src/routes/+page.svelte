<script>
  import Sidebar from '../components/Sidebar.svelte';
  import RequestEditor from '../components/RequestEditor.svelte';
  import ResponseViewer from '../components/ResponseViewer.svelte';
  import CurlImportModal from '../components/CurlImportModal.svelte';
  import AddCollectionModal from '../components/AddCollectionModal.svelte';

  // Track loading state for request in progress
  let isLoading = false;
  import { parseCurlCommand } from '../shared/parseCurl.js';

  // Track collections and requests
  let collections = [];
  let selectedCollection = null;

  // Track unsaved changes
  let unsavedRequests = new Set();

  // Tabbed requests
  let requests = [{
    id: Date.now().toString(),
    name: 'New Request',
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/todos/1',
    headers: [{ key: 'Accept', value: 'application/json' }],
    body: '',
    collectionId: null
  }];
  let responses = [null];
  let activeRequestIdx = 0;
  let showCurlImportModal = false;
  let showAddCollectionModal = false;
  let curlImportError = '';
  let editingTabIdx = null;
  let editingTabName = '';
  let tabEditJustConfirmed = false;

  function startEditingTab(idx) {
    editingTabIdx = idx;
    editingTabName = requests[idx].name || `Request ${idx+1}`;
    tabEditJustConfirmed = false;
  }
  async function saveTabName(idx) {
    const request = requests[idx];
    const newName = editingTabName.trim() || `Request ${idx+1}`;
    request.name = newName;
    
    // Update the request in storage if it belongs to a collection
    if (request.collectionId && window.electronAPI?.updateRequest) {
      try {
        await window.electronAPI.updateRequest(request.collectionId, request.id, request);
      } catch (err) {
        console.error('Failed to update request name:', err);
      }
    }
    
    editingTabIdx = null;
    editingTabName = '';
    tabEditJustConfirmed = true;
  }
  function handleTabInputKeydown(e, idx) {
    if (e.key === 'Enter') {
      saveTabName(idx);
      // prevent blur handler from firing after Enter
      setTimeout(() => { tabEditJustConfirmed = false; }, 0);
    }
  }
  function handleTabInputBlur(idx) {
    if (!tabEditJustConfirmed) {
      saveTabName(idx);
    }
    tabEditJustConfirmed = false;
  }

  async function saveCurrentRequest() {
    const req = requests[activeRequestIdx];
    
    // Only save if it belongs to a collection
    if (req.collectionId && window.electronAPI?.updateRequest && unsavedRequests.has(req.id)) {
      try {
        const response = await window.electronAPI.updateRequest(req.collectionId, req.id, req);
        if (response.success) {
          // Remove from unsaved set
          unsavedRequests.delete(req.id);
          unsavedRequests = unsavedRequests; // Trigger reactivity
          console.log('Request saved successfully');
        }
      } catch (err) {
        console.error('Failed to save request:', err);
      }
    }
  }
  
  // Handle changes to the request form
  function markRequestAsUnsaved() {
    const requestIndex = activeRequestIdx;
    const requestId = requests[requestIndex].id;
    
    // Mark request as unsaved
    unsavedRequests.add(requestId);
    unsavedRequests = unsavedRequests; // Trigger reactivity
  }

  async function handleSend() {
    const req = requests[activeRequestIdx];
    const start = performance.now();
    isLoading = true;
    try {
      const headers = {};
      (req.headers || []).forEach(h => {
        if (h.key) headers[h.key] = h.value;
      });
      const config = {
        method: req.method,
        url: req.url,
        headers,
        data: req.body || undefined
        // Remove validateStatus as functions can't be serialized over IPC
      };
      console.log('Sending request:', config);
      if (!window.electronAPI?.sendRequest) {
        throw new Error('Electron API not available. Please run in Electron.');
      }
      console.log('Electron API available, before sending', config);
      const res = await window.electronAPI.sendRequest(config);
      console.log('Response:', res);
      const time = Math.round(performance.now() - start);
      if (res.success) {
        responses[activeRequestIdx] = {
          status: res.status,
          statusText: res.statusText,
          time,
          size: res.data ? JSON.stringify(res.data).length : 0,
          headers: res.headers,
          data: res.data
        };
      } else {
        responses[activeRequestIdx] = {
          status: res.status,
          statusText: res.statusText,
          time,
          size: res.data ? JSON.stringify(res.data).length : 0,
          headers: res.headers,
          data: res.error || 'Request failed'
        };
      }
    } catch (e) {
      responses[activeRequestIdx] = {
        status: 0,
        statusText: 'Error',
        time: Math.round(performance.now() - start),
        size: 0,
        headers: {},
        data: e.message || 'Request failed'
      };
    } finally {
      isLoading = false;
    }
  }
  function handleChange() {
    markRequestAsUnsaved();
  }
  async function handleSelectCollection(col) {
    selectedCollection = col;
    
    // Load requests for the selected collection
    if (col && window.electronAPI?.getRequests) {
      try {
        const response = await window.electronAPI.getRequests(col.id);
        if (response.success) {
          // Create tabs for collection requests
          requests = response.data.map(req => ({
            ...req,
            collectionId: col.id
          }));
          
          // Add an empty request if none exist
          if (requests.length === 0) {
            requests = [{
              id: Date.now().toString(),
              name: 'New Request',
              method: 'GET',
              url: '',
              headers: [{ key: '', value: '' }],
              body: '',
              collectionId: col.id
            }];
          }
          
          responses = Array(requests.length).fill(null);
          activeRequestIdx = 0;
          unsavedRequests = new Set();
        }
      } catch (err) {
        console.error('Failed to load requests:', err);
      }
    }
  }
  function handleAddCollection() {
    showAddCollectionModal = true;
  }
  
  async function handleAddCollectionSubmit(event) {
    const { name } = event.detail;
    if (name) {
      if (window.electronAPI?.createCollection) {
        try {
          const response = await window.electronAPI.createCollection({ name });
          if (response.success) {
            collections = [...collections, response.data];
            selectedCollection = response.data;
          }
        } catch (err) {
          console.error('Failed to create collection:', err);
        }
      } else {
        // Fallback for browser environment
        const newCollection = { 
          id: Date.now().toString(), 
          name, 
          requests: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        collections = [...collections, newCollection];
        selectedCollection = newCollection;
      }
    }
    showAddCollectionModal = false;
  }
  async function addManualRequest() {
    const newRequest = {
      id: Date.now().toString(),
      name: `Request ${requests.length+1}`,
      method: 'GET',
      url: '',
      headers: [{ key: '', value: '' }],
      body: '',
      collectionId: selectedCollection?.id || null
    };
  
    if (selectedCollection && window.electronAPI?.addRequest) {
      try {
        const response = await window.electronAPI.addRequest(selectedCollection.id, newRequest);
        if (response.success) {
          requests = [...requests, response.data];
        } else {
          // Fallback if API call fails
          requests = [...requests, newRequest];
        }
      } catch (err) {
        console.error('Failed to add request:', err);
        // Fallback
        requests = [...requests, newRequest];
      }
    } else {
      // For browser environment or no collection selected
      requests = [...requests, newRequest];
    }
  
    responses = [...responses, null];
    activeRequestIdx = requests.length - 1;
  }
async function handleCurlImport({ detail }) {
  try {
    const curl = detail.curl;
    const parsed = parseCurlCommand(curl);
    
    // Create new request object
    const newRequest = {
      id: Date.now().toString(),
      name: parsed.url || `Imported curl`,
      method: parsed.method || 'GET',
      url: parsed.url || '',
      headers: Array.isArray(parsed.headers) ? parsed.headers.map(h => ({ key: h.key, value: h.value })) : [],
      body: parsed.data || '',
      collectionId: selectedCollection?.id || null
    };
    
    // If a collection is selected, save to collection
    if (selectedCollection && window.electronAPI?.addRequest) {
      try {
        const response = await window.electronAPI.addRequest(selectedCollection.id, newRequest);
        if (response.success) {
          requests = [...requests, response.data];
        } else {
          // Fallback to client-side only
          requests = [...requests, newRequest];
          // Mark as unsaved
          unsavedRequests.add(newRequest.id);
          unsavedRequests = unsavedRequests; // Trigger reactivity
        }
      } catch (err) {
        console.error('Failed to add request to collection:', err);
        // Fallback to client-side only
        requests = [...requests, newRequest];
        // Mark as unsaved
        unsavedRequests.add(newRequest.id);
        unsavedRequests = unsavedRequests; // Trigger reactivity
      }
    } else {
      // No collection selected, just add to UI
      requests = [...requests, newRequest];
    }
    
    responses = [...responses, null];
    activeRequestIdx = requests.length - 1;
    curlImportError = '';
    showCurlImportModal = false;
  } catch (e) {
    curlImportError = 'Failed to parse curl command.';
  }
}

  async function removeRequest(idx) {
    if (requests.length === 1) return; // Don't remove if it's the only request
    
    const requestToRemove = requests[idx];
    
    // If request belongs to a collection, remove from backend
    if (requestToRemove.collectionId && window.electronAPI?.deleteRequest) {
      try {
        await window.electronAPI.deleteRequest(requestToRemove.collectionId, requestToRemove.id);
      } catch (err) {
        console.error('Failed to delete request:', err);
      }
    }
    
    // Remove from unsaved set
    if (unsavedRequests.has(requestToRemove.id)) {
      unsavedRequests.delete(requestToRemove.id);
      unsavedRequests = unsavedRequests; // Trigger reactivity
    }
    
    // Update UI
    requests = requests.filter((_, i) => i !== idx);
    responses = responses.filter((_, i) => i !== idx);
    if (activeRequestIdx >= requests.length) {
      activeRequestIdx = requests.length - 1;
    }
  }
</script>

<div class="container-fluid min-vh-100 p-0">
  <div class="row g-0 min-vh-100 flex-nowrap">
    <div class="col-auto bg-light border-end p-0" style="width:260px; min-width:220px;">
      <Sidebar {collections} onSelectCollection={handleSelectCollection} onAddCollection={handleAddCollection} />
    </div>
    <div class="col p-0 d-flex flex-column" style="overflow-x:auto;">
      <div class="d-flex align-items-center border-bottom px-3 py-2 bg-white">
        <ul class="nav nav-tabs flex-grow-1" role="tablist">
  {#each requests as req, idx}
    <li class="nav-item" role="presentation">
      <div class="nav-link {activeRequestIdx === idx ? 'active' : ''}" role="tab" style="cursor: pointer;" 
           on:click={() => activeRequestIdx = idx}
           on:keydown={(e) => e.key === 'Enter' && (activeRequestIdx = idx)}
           tabindex="0"
           aria-selected={activeRequestIdx === idx}>
        {#if editingTabIdx === idx}
          <input
            class="form-control form-control-sm d-inline w-auto"
            style="max-width:120px; display:inline-block;"
            bind:value={editingTabName}
            on:blur={() => handleTabInputBlur(idx)}
            on:keydown={(e) => handleTabInputKeydown(e, idx)}
          />
        {:else}
          <!-- Tab name container -->
          <span 
            class="tab-name" 
            on:click|stopPropagation={() => startEditingTab(idx)}
            tabindex="0"
            role="button"
            aria-label="Edit tab name"
            on:keydown={(e) => e.key === 'Enter' && startEditingTab(idx)}
          >
            {req.name || `Request ${idx+1}`}
            {#if unsavedRequests.has(req.id)}
              <span class="ms-1 text-danger">*</span>
            {/if}
          </span>
        {/if}
        {#if requests.length > 1}
          <!-- Close button -->
          <span 
            class="ms-1" 
            style="cursor:pointer;" 
            title="Close tab"
            role="button"
            tabindex="0"
            aria-label="Close tab"
            on:click|stopPropagation={(e) => removeRequest(idx)}
            on:keydown|stopPropagation={(e) => e.key === 'Enter' && removeRequest(idx)}
          >&times;</span>
        {/if}
      </div>
    </li>
  {/each}
</ul>
        <button class="btn btn-outline-primary btn-sm ms-2" on:click={addManualRequest}>+ Add Request</button>
<button class="btn btn-outline-secondary btn-sm ms-2" on:click={() => showCurlImportModal = true}>Import from curl</button>
{#if unsavedRequests.has(requests[activeRequestIdx]?.id)}
  <button class="btn btn-outline-success btn-sm ms-2" on:click={saveCurrentRequest}>Save</button>
{/if}
      </div>
      <div class="flex-grow-1 d-flex flex-column">
        <RequestEditor
          request={requests[activeRequestIdx]}
          onSend={handleSend}
          onChange={handleChange}
        />
        <div class="mt-3">
          <ResponseViewer response={responses[activeRequestIdx]} isLoading={isLoading} />
        </div>
      </div>
    </div>
  </div>
  <CurlImportModal
    show={showCurlImportModal}
    onClose={() => { showCurlImportModal = false; curlImportError = ''; }}
    on:import={handleCurlImport}
  />
  <AddCollectionModal
    show={showAddCollectionModal}
    on:close={() => { showAddCollectionModal = false; }}
    on:add={handleAddCollectionSubmit}
  />
{#if curlImportError}
  <div class="alert alert-danger position-fixed top-0 start-50 translate-middle-x mt-3" style="z-index:2000; min-width:300px; max-width:90vw;">
    {curlImportError}
  </div>
{/if}
</div>

