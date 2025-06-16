<script>
  export let response = null;
</script>

<div class="container-fluid border-top py-3 bg-light" style="min-height:180px;">
  {#if response}
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
    <div class="text-muted">No response yet.</div>
  {/if}
</div>
