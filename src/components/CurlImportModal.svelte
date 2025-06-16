<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  export let show = false;
  export let onClose = () => {};
  let curl = '';
  let error = '';

  function handleImport() {
    if (!curl.trim()) {
      error = 'Please enter a curl command.';
      return;
    }
    dispatch('import', { curl });
    curl = '';
    error = '';
  }
  function handleClose() {
    curl = '';
    error = '';
    onClose();
  }
</script>

{#if show}
  <div class="modal fade show d-block" tabindex="-1" style="background:rgba(0,0,0,0.4);">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Import from curl</h5>
          <button type="button" class="btn-close" aria-label="Close" on:click={handleClose}></button>
        </div>
        <div class="modal-body">
          <label for="curl-input" class="form-label">Paste your curl command below:</label>
          <textarea id="curl-input" class="form-control mb-2" rows="4" bind:value={curl} placeholder="curl ..."></textarea>
          {#if error}
            <div class="text-danger small mb-2">{error}</div>
          {/if}
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" on:click={handleClose}>Cancel</button>
          <button class="btn btn-primary" on:click={handleImport}>Import</button>
        </div>
      </div>
    </div>
  </div>
{/if}
