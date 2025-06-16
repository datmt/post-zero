<script>
  export let collections = [];
  export let onSelectCollection = () => {};
  export let onAddCollection = () => {};
  export let onDeleteCollection = () => {};
  export let selectedCollection = null;
  export let onSelectRequest = () => {};
  
  // Track expanded collections
  let expandedCollections = new Set();
  
  function toggleExpand(collectionId) {
    if (expandedCollections.has(collectionId)) {
      expandedCollections.delete(collectionId);
    } else {
      expandedCollections.add(collectionId);
    }
    expandedCollections = expandedCollections; // Trigger reactivity
  }
  
  function handleDelete(event, collection) {
    // Prevent the click from also selecting the collection
    event.stopPropagation();
    // Confirm before deleting
    if (confirm(`Delete collection "${collection.name}"? This cannot be undone.`)) {
      onDeleteCollection(collection);
    }
  }
  
  function handleSelectRequest(event, request) {
    event.stopPropagation();
    onSelectRequest(request);
  }
</script>

<div class="d-flex flex-column h-100 bg-light border-end" style="width: 260px; min-width: 220px;">
  <div class="d-flex align-items-center justify-content-between px-3 py-3 border-bottom">
    <span class="fw-bold fs-5">Collections</span>
    <button class="btn btn-primary btn-sm" on:click={onAddCollection} title="Add Collection">
      <i class="bi bi-plus-circle"></i> New
    </button>
  </div>
  
  {#if collections.length === 0}
    <div class="p-3 text-center text-muted">
      <p>No collections yet</p>
      <button class="btn btn-sm btn-outline-primary" on:click={onAddCollection}>
        Create your first collection
      </button>
    </div>
  {:else}
    <ul class="list-group list-group-flush flex-grow-1 overflow-auto">
      {#each collections as col}
        <div class="collection-container">
          <div 
            class="list-group-item list-group-item-action d-flex justify-content-between align-items-center {selectedCollection?.id === col.id ? 'collection-active' : ''}" 
            role="button" 
            tabindex="0"
            aria-pressed={selectedCollection?.id === col.id}
            on:click={() => {
              onSelectCollection(col);
              // Auto-expand when selecting
              expandedCollections.add(col.id);
              expandedCollections = expandedCollections;
            }} 
            on:keydown={(e) => e.key === 'Enter' && onSelectCollection(col)}
          >
            <div class="d-flex align-items-center">
              <!-- Expand/collapse icon -->
              <button 
                class="btn btn-sm btn-link p-0 me-1" 
                on:click|stopPropagation={() => toggleExpand(col.id)}
                aria-label={expandedCollections.has(col.id) ? 'Collapse collection' : 'Expand collection'}
              >
                <i class="bi {expandedCollections.has(col.id) ? 'bi-chevron-down' : 'bi-chevron-right'}" aria-hidden="true"></i>
              </button>
              
              <!-- Collection icon -->
              {#if selectedCollection?.id === col.id}
                <i class="bi bi-folder2-open text-primary me-2" aria-hidden="true"></i>
              {:else}
                <i class="bi bi-folder2 me-2" aria-hidden="true"></i>
              {/if}
              
              <!-- Collection name -->
              {col.name}
            </div>
            
            <div class="d-flex align-items-center">
              <!-- Request count -->
              <span class="badge bg-secondary rounded-pill me-2">
                {col.requests?.length || 0}
              </span>
              
              <!-- Delete button -->
              <button 
                type="button"
                class="btn btn-sm btn-outline-danger" 
                title="Delete collection"
                aria-label="Delete collection {col.name}"
                on:click={(e) => handleDelete(e, col)}
              >
                <i class="bi bi-trash" aria-hidden="true"></i>
              </button>
            </div>
          </div>
          
          <!-- Requests list (collapsible) -->
          {#if expandedCollections.has(col.id) && col.requests && col.requests.length > 0}
            <ul class="list-group list-group-flush request-list ms-4">
              {#each col.requests as request}
                <div 
                  class="list-group-item list-group-item-action py-2 d-flex justify-content-between align-items-center" 
                  role="button"
                  tabindex="0"
                  on:click={(e) => handleSelectRequest(e, request)}
                  on:keydown={(e) => e.key === 'Enter' && handleSelectRequest(e, request)}
                >
                  <div class="d-flex align-items-center overflow-hidden">
                    <i class="bi bi-file-earmark-code me-2 text-secondary" aria-hidden="true"></i>
                    <span class="text-truncate" title={request.name}>
                      {request.name || `${request.method} ${new URL(request.url).pathname}`}
                    </span>
                  </div>
                  <span class="badge {request.method === 'GET' ? 'bg-success' : request.method === 'POST' ? 'bg-primary' : request.method === 'PUT' ? 'bg-warning' : request.method === 'DELETE' ? 'bg-danger' : 'bg-secondary'} ms-1">
                    {request.method}
                  </span>
                </div>
              {/each}
            </ul>
          {/if}
        </div>
      {/each}
    </ul>
  {/if}
  
  <div class="p-3 border-top">
    <small class="text-muted">Select a collection to manage your requests</small>
  </div>
</div>
