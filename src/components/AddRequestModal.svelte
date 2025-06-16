<script>
  export let show = false;
  export let onClose = () => {};
  export let onManual = () => {};
  export let onCurl = () => {};
</script>

{#if show}
  <div class="modal fade show d-block" tabindex="-1" style="background:rgba(0,0,0,0.4);">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Add New Request</h5>
          <button type="button" class="btn-close" aria-label="Close" on:click={onClose}></button>
        </div>
        <div class="modal-body">
          <p>How would you like to add a new request?</p>
          <div class="d-flex gap-2">
            <button class="btn btn-primary flex-fill" on:click={onManual}>Enter Manually</button>
            <button class="btn btn-secondary flex-fill" on:click={onCurl}>Import from curl</button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
