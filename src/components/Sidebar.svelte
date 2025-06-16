<script>
  export let collections = [];
  export let onSelectCollection = () => {};
  export let onAddCollection = () => {};
</script>

<div class="d-flex flex-column h-100 bg-light border-end" style="width: 260px; min-width: 220px;">
  <div class="d-flex align-items-center justify-content-between px-3 py-3 border-bottom">
    <span class="fw-bold fs-5">Collections</span>
    <button class="btn btn-primary btn-sm" on:click={onAddCollection} title="Add Collection">+</button>
  </div>
  <ul class="list-group list-group-flush flex-grow-1 overflow-auto">
    {#each collections as col, i}
      <li class="list-group-item list-group-item-action" style="cursor:pointer;" tabindex="0" on:click={() => onSelectCollection(col)}>{col.name}</li>
    {/each}
  </ul>
</div>
