<script>
  import Sidebar from '../components/Sidebar.svelte';
  import RequestEditor from '../components/RequestEditor.svelte';
  import ResponseViewer from '../components/ResponseViewer.svelte';

  let collections = [
    { name: 'Demo', requests: [] }
  ];
  let selectedCollection = collections[0];
  let request = {
    method: 'GET',
    url: '',
    headers: [{ key: '', value: '' }],
    body: ''
  };
  let response = null;

  function handleSend() {
    // Placeholder, will implement axios logic next
    response = {
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
</script>

<div class="container-fluid min-vh-100 p-0">
  <div class="row g-0 min-vh-100 flex-nowrap">
    <div class="col-auto bg-light border-end p-0" style="width:260px; min-width:220px;">
      <Sidebar {collections} onSelectCollection={handleSelectCollection} onAddCollection={handleAddCollection} />
    </div>
    <div class="col p-0 d-flex flex-column" style="overflow-x:auto;">
      <RequestEditor bind:request onSend={handleSend} onChange={handleChange} />
      <ResponseViewer {response} />
    </div>
  </div>
</div>
