<script>
  import Sidebar from '../components/Sidebar.svelte';
  import RequestEditor from '../components/RequestEditor.svelte';
  import ResponseViewer from '../components/ResponseViewer.svelte';
  import CurlImportModal from '../components/CurlImportModal.svelte';
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

  function handleSend() {
    // Placeholder, will implement axios logic next
    responses[activeRequestIdx] = {
      status: 200,
      time: 123,
      size: 42,
      headers: { 'content-type': 'application/json' },
      data: { message: 'Hello from PostZero!' }
    };
  }
  function handleChange() {
    // For now, just a stub
  }
  function handleSelectCollection(col) {
    selectedCollection = col;
  }
  function handleAddCollection() {
    const name = prompt('Collection name?');
    if (name) collections = [...collections, { name, requests: [] }];
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
      <button class="nav-link {activeRequestIdx === idx ? 'active' : ''}" type="button" role="tab" aria-selected={activeRequestIdx === idx} on:click={() => activeRequestIdx = idx}>
        {#if editingTabIdx === idx}
          <input
            class="form-control form-control-sm d-inline w-auto"
            style="max-width:120px; display:inline-block;"
            bind:value={editingTabName}
            on:blur={() => handleTabInputBlur(idx)}
            on:keydown={(e) => handleTabInputKeydown(e, idx)}
            autofocus
          />
        {:else}
          <span on:click|stopPropagation={() => startEditingTab(idx)} style="cursor:pointer;">
            {req.name || `Request ${idx+1}`}
          </span>
        {/if}
        {#if requests.length > 1}
          <span class="ms-1" style="cursor:pointer;" title="Close" on:click={(e) => {e.stopPropagation(); removeRequest(idx);}}>&times;</span>
        {/if}
      </button>
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
        <ResponseViewer response={responses[activeRequestIdx]} />
      </div>
    </div>
  </div>
  <CurlImportModal
    show={showCurlImportModal}
    onClose={() => { showCurlImportModal = false; curlImportError = ''; }}
    on:import={handleCurlImport}
  />
{#if curlImportError}
  <div class="alert alert-danger position-fixed top-0 start-50 translate-middle-x mt-3" style="z-index:2000; min-width:300px; max-width:90vw;">
    {curlImportError}
  </div>
{/if}
</div>

