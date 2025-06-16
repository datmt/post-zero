<script>
  export let request = {
    method: 'GET',
    url: '',
    headers: [{ key: '', value: '' }],
    body: ''
  };
  export let onSend = () => {};
  export let onChange = () => {};
  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
</script>

<div class="container-fluid py-3">
  <form class="row g-2 align-items-center" on:submit|preventDefault={onSend}>
    <div class="col-auto">
      <select bind:value={request.method} class="form-select" on:change={onChange} style="min-width:90px;">
        {#each methods as m}
          <option value={m}>{m}</option>
        {/each}
      </select>
    </div>
    <div class="col flex-grow-1">
      <input type="text" bind:value={request.url} class="form-control" placeholder="Request URL" on:input={onChange} />
    </div>
    <div class="col-auto">
      <button class="btn btn-success px-4" type="submit">Send</button>
    </div>
  </form>

  <div class="mt-4">
    <div class="fw-semibold mb-2">Headers</div>
    <div class="row g-2 align-items-center">
      {#if request.headers.length === 0}
        <div class="col-12 mb-2 text-muted">No headers. Add one below.</div>
      {:else}
        {#each request.headers as header, i}
          <div class="col-4 mb-2">
            <input type="text" bind:value={header.key} class="form-control" placeholder="Key" on:input={onChange} />
          </div>
          <div class="col-6 mb-2">
            <input type="text" bind:value={header.value} class="form-control" placeholder="Value" on:input={onChange} />
          </div>
          <div class="col-2 mb-2 d-flex align-items-center gap-1">
            <button type="button" class="btn btn-danger btn-sm" title="Remove header" on:click={() => { request.headers = request.headers.filter((_, idx) => idx !== i); onChange(); }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5.5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6zm3 .5a.5.5 0 0 1 .5-.5.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6z"/>
                <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1 0-2h3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3a1 1 0 0 1 1 1zm-11-1a.5.5 0 0 0-.5.5V4h11V2.5a.5.5 0 0 0-.5-.5h-10zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118z"/>
              </svg>
            </button>
          </div>
        {/each}
      {/if}
    </div>
    <div class="row mb-2">
      <div class="col-12">
        <button type="button" class="btn btn-outline-primary btn-sm" on:click={() => { request.headers = [...request.headers, {key:'',value:''}]; onChange(); }}>+ Add Header</button>
      </div>
    </div>
  </div>

  <div class="mt-4">
    <div class="fw-semibold mb-2">Body</div>
    <textarea bind:value={request.body} class="form-control" placeholder="JSON or raw text" rows="4" on:input={onChange}></textarea>
  </div>
</div>
