<script>
  import Sidebar from '../components/Sidebar.svelte';
  import RequestEditor from '../components/RequestEditor.svelte';
  import ResponseViewer from '../components/ResponseViewer.svelte';
  import CurlImportModal from '../components/CurlImportModal.svelte';
  import AddCollectionModal from '../components/AddCollectionModal.svelte';
  
  // Track loading state for request in progress
  let isLoading = false;
import { parseCurlCommand } from '../shared/parseCurl.js';

  let collections = [
    { name: 'Demo', requests: [] }
  ];
  let selectedCollection = collections[0];

  // Tabbed requests
  let requests = [
    {
      name: 'Request 1',
      method: 'GET',
      url: '',
      headers: [{ key: '', value: '' }],
      body: ''
    }
  ];
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
function saveTabName(idx) {
  requests[idx].name = editingTabName.trim() || `Request ${idx+1}`;
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
    // For now, just a stub
  }
  function handleSelectCollection(col) {
    selectedCollection = col;
  }
  function handleAddCollection() {
    showAddCollectionModal = true;
  }
  
  function handleAddCollectionSubmit(event) {
    const { name } = event.detail;
    if (name) {
      collections = [...collections, { name, requests: [] }];
    }
    showAddCollectionModal = false;
  }
  function addManualRequest() {
  requests = [...requests, {
    name: `Request ${requests.length+1}`,
    method: 'GET',
    url: '',
    headers: [{ key: '', value: '' }],
    body: ''
  }];
  responses = [...responses, null];
  activeRequestIdx = requests.length - 1;
}
function handleCurlImport({ detail }) {
  try {
    const curl = detail.curl;
    const parsed = parseCurlCommand(curl);
    requests = [...requests, {
      name: parsed.url || `Imported curl`,
      method: parsed.method || 'GET',
      url: parsed.url || '',
      headers: Array.isArray(parsed.headers) ? parsed.headers.map(h => ({ key: h.key, value: h.value })) : [],
      body: parsed.data || ''
    }];
    responses = [...responses, null];
    activeRequestIdx = requests.length - 1;
    curlImportError = '';
    showCurlImportModal = false;
  } catch (e) {
    curlImportError = 'Failed to parse curl command.';
  }
}

  function removeRequest(idx) {
    if (requests.length === 1) return;
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

