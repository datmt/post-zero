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
      <span class="fw-semibold">Headers:</span>
      <pre class="bg-white border rounded p-2 overflow-auto small">{JSON.stringify(response.headers, null, 2)}</pre>
    </div>
    <div>
      <span class="fw-semibold">Body:</span>
      <pre class="bg-white border rounded p-2 overflow-auto small">{typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2)}</pre>
    </div>
  {:else}
    <div class="text-muted p-3">No response yet. Click 'Send' to make a request.</div>
  {/if}
</div>
