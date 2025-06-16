<script>
  export let response = null;
  export let isLoading = false;
</script>

<div class="container-fluid border-top py-3 bg-light" style="min-height:180px;">
  {#if isLoading}
    <!-- Loading animation -->
    <div class="d-flex flex-column align-items-center justify-content-center h-100 py-5">
      <div class="spinner-border text-primary mb-3" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <div class="text-primary">Sending request...</div>
    </div>
  {:else if response}
    <div class="row mb-2">
      <div class="col-auto"><span class="fw-semibold">Status:</span> <span class="badge bg-info">{response.status}</span></div>
      <div class="col-auto"><span class="fw-semibold">Time:</span> {response.time} ms</div>
      <div class="col-auto"><span class="fw-semibold">Size:</span> {response.size} bytes</div>
    </div>
    <div class="mb-2">
      <div class="d-flex justify-content-between align-items-center mb-1">
        <span class="fw-semibold">Headers:</span>
        <button 
          type="button" 
          class="btn btn-sm btn-outline-secondary" 
          title="Copy headers to clipboard"
          aria-label="Copy headers to clipboard"
          on:click={() => {
            navigator.clipboard.writeText(JSON.stringify(response.headers, null, 2) || '');
            // Show a brief visual confirmation
            const btn = document.activeElement;
            if (btn) {
              const originalText = btn.innerHTML;
              btn.innerHTML = '<span>Copied!</span>';
              setTimeout(() => { btn.innerHTML = originalText; }, 1000);
            }
          }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard" viewBox="0 0 16 16">
            <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"/>
            <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"/>
          </svg>
        </button>
      </div>
      <pre class="bg-white border rounded p-2 overflow-auto small">{JSON.stringify(response.headers, null, 2)}</pre>
    </div>
    <div>
      <div class="d-flex justify-content-between align-items-center mb-1">
        <span class="fw-semibold">Body:</span>
        <button 
          type="button" 
          class="btn btn-sm btn-outline-secondary" 
          title="Copy body to clipboard"
          aria-label="Copy response body to clipboard"
          on:click={() => {
            const content = typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2);
            navigator.clipboard.writeText(content || '');
            // Show a brief visual confirmation
            const btn = document.activeElement;
            if (btn) {
              const originalText = btn.innerHTML;
              btn.innerHTML = '<span>Copied!</span>';
              setTimeout(() => { btn.innerHTML = originalText; }, 1000);
            }
          }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard" viewBox="0 0 16 16">
            <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"/>
            <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"/>
          </svg>
        </button>
      </div>
      <pre class="bg-white border rounded p-2 overflow-auto small">{typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2)}</pre>
    </div>
  {:else}
    <div class="text-muted p-3">No response yet. Click 'Send' to make a request.</div>
  {/if}
</div>
