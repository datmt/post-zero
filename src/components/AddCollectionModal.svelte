<script>
  import { createEventDispatcher } from 'svelte';
  
  export let show = false;
  
  const dispatch = createEventDispatcher();
  let collectionName = '';
  
  function handleSubmit() {
    if (collectionName.trim()) {
      dispatch('add', { name: collectionName.trim() });
      collectionName = '';
    }
    handleClose();
  }
  
  function handleClose() {
    show = false;
    dispatch('close');
  }
</script>

<div class={`modal fade ${show ? 'show d-block' : 'd-none'}`} tabindex="-1" aria-hidden={!show}>
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Add Collection</h5>
        <button type="button" class="btn-close" aria-label="Close" on:click={handleClose}></button>
      </div>
      <div class="modal-body">
        <form on:submit|preventDefault={handleSubmit}>
          <div class="mb-3">
            <label for="collection-name" class="form-label">Collection Name</label>
            <input 
              type="text" 
              class="form-control" 
              id="collection-name" 
              placeholder="Enter collection name"
              bind:value={collectionName}
              autofocus
            />
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" on:click={handleClose}>Cancel</button>
        <button type="button" class="btn btn-primary" on:click={handleSubmit}>Add Collection</button>
      </div>
    </div>
  </div>
</div>

{#if show}
  <div class="modal-backdrop fade show"></div>
{/if}
