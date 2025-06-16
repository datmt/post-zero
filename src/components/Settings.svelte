<script>
  import { onMount, createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  // Settings state
  let dbPath = '';
  let defaultPath = '';
  let saveStatus = '';
  let isEditMode = false;
  
  // Load settings on mount
  onMount(async () => {
    if (window.electronAPI?.getSettings) {
      const result = await window.electronAPI.getSettings();
      if (result.success) {
        dbPath = result.data.dbPath || '';
        defaultPath = result.data.defaultPath || '';
      }
    }
  });
  
  // Save settings
  async function saveSettings() {
    if (!window.electronAPI?.saveSettings) {
      saveStatus = 'Error: Electron API not available';
      return;
    }
    
    try {
      const result = await window.electronAPI.saveSettings({ dbPath });
      if (result.success) {
        saveStatus = 'Settings saved successfully. Restart the app to apply changes.';
        isEditMode = false;
      } else {
        saveStatus = `Error: ${result.error}`;
      }
    } catch (error) {
      saveStatus = `Error: ${error.message}`;
    }
  }
  
  // Browse for folder
  async function browseFolder() {
    if (!window.electronAPI?.selectDirectory) {
      saveStatus = 'Error: Electron API not available';
      return;
    }
    
    try {
      const result = await window.electronAPI.selectDirectory();
      if (result.success && result.path) {
        dbPath = result.path;
      }
    } catch (error) {
      saveStatus = `Error: ${error.message}`;
    }
  }
  
  // Reset to default
  function resetToDefault() {
    dbPath = defaultPath;
  }
</script>

<div class="settings-panel">
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h2>Settings</h2>
    <button class="btn btn-outline-secondary" on:click={() => dispatch('close')}>
      <i class="bi bi-arrow-left"></i> Back to App
    </button>
  </div>
  
  <div class="form-group">
    <label for="dbPath">Database Storage Location</label>
    
    {#if isEditMode}
      <div class="input-group">
        <input
          type="text"
          id="dbPath"
          bind:value={dbPath}
          class="form-control"
          placeholder="Path to store database files"
        />
        <button class="btn btn-secondary" on:click={browseFolder}>
          <i class="bi bi-folder"></i> Browse
        </button>
      </div>
      
      <div class="button-group">
        <button class="btn btn-primary" on:click={saveSettings}>
          <i class="bi bi-save"></i> Save
        </button>
        <button class="btn btn-outline-secondary" on:click={() => isEditMode = false}>
          Cancel
        </button>
        <button class="btn btn-outline-secondary" on:click={resetToDefault}>
          Reset to Default
        </button>
      </div>
    {:else}
      <div class="path-display">
        <span>{dbPath || 'Using default location'}</span>
        <button class="btn btn-outline-primary" on:click={() => isEditMode = true}>
          <i class="bi bi-pencil"></i> Edit
        </button>
      </div>
    {/if}
  </div>
  
  {#if saveStatus}
    <div class="alert {saveStatus.includes('Error') ? 'alert-danger' : 'alert-success'}">
      {saveStatus}
    </div>
  {/if}
  
  <div class="info-text">
    <p><small>
      <i class="bi bi-info-circle"></i>
      Changing the database location will require an application restart.
      All existing collections and requests will be available at the new location.
    </small></p>
  </div>
</div>

<style>
  .settings-panel {
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 20px;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .input-group {
    display: flex;
    margin-bottom: 10px;
  }
  
  .input-group input {
    flex-grow: 1;
    padding: 8px;
    border: 1px solid #ced4da;
    border-radius: 4px 0 0 4px;
  }
  
  .input-group button {
    border-radius: 0 4px 4px 0;
  }
  
  .button-group {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }
  
  .path-display {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    background-color: #e9ecef;
    border-radius: 4px;
  }
  
  .info-text {
    margin-top: 15px;
    color: #6c757d;
  }
  
  h2 {
    margin-bottom: 20px;
  }
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
  }
  
  .alert {
    padding: 10px;
    border-radius: 4px;
    margin: 15px 0;
  }
  
  .alert-success {
    background-color: #d4edda;
    color: #155724;
  }
  
  .alert-danger {
    background-color: #f8d7da;
    color: #721c24;
  }
</style>
