import fs from 'fs';
import path from 'path';

/**
 * Storage utility for managing collections and requests
 * Uses simple JSON files stored in the Electron userData directory
 */
export class Storage {
  constructor(userDataPath) {
    this.userDataPath = userDataPath;
    this.collectionsPath = path.join(userDataPath, 'collections.json');
    this.ensureStorageExists();
  }

  /**
   * Ensure storage directory and files exist
   */
  ensureStorageExists() {
    if (!fs.existsSync(this.userDataPath)) {
      fs.mkdirSync(this.userDataPath, { recursive: true });
    }
    
    if (!fs.existsSync(this.collectionsPath)) {
      // Initialize with an empty collections array
      this.saveCollections([]);
    }
  }

  /**
   * Get all collections
   * @returns {Array} Array of collections
   */
  getCollections() {
    try {
      const data = fs.readFileSync(this.collectionsPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading collections:', error);
      return [];
    }
  }

  /**
   * Save all collections
   * @param {Array} collections Array of collections
   */
  saveCollections(collections) {
    try {
      fs.writeFileSync(this.collectionsPath, JSON.stringify(collections, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error('Error saving collections:', error);
      return false;
    }
  }

  /**
   * Create a new collection
   * @param {Object} collection Collection object with name property
   * @returns {Object} Created collection with id
   */
  createCollection(collection) {
    const collections = this.getCollections();
    // Generate a unique id for the collection
    const id = Date.now().toString();
    const newCollection = {
      id,
      name: collection.name,
      requests: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    collections.push(newCollection);
    this.saveCollections(collections);
    return newCollection;
  }

  /**
   * Update a collection
   * @param {String} id Collection ID
   * @param {Object} updates Updates to apply to the collection
   * @returns {Object|null} Updated collection or null if not found
   */
  updateCollection(id, updates) {
    const collections = this.getCollections();
    const index = collections.findIndex(c => c.id === id);
    
    if (index === -1) return null;
    
    collections[index] = {
      ...collections[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.saveCollections(collections);
    return collections[index];
  }

  /**
   * Delete a collection
   * @param {String} id Collection ID
   * @returns {Boolean} True if deleted, false if not found
   */
  deleteCollection(id) {
    const collections = this.getCollections();
    const initialLength = collections.length;
    const filtered = collections.filter(c => c.id !== id);
    
    if (filtered.length === initialLength) return false;
    
    this.saveCollections(filtered);
    return true;
  }

  /**
   * Add a request to a collection
   * @param {String} collectionId Collection ID
   * @param {Object} request Request object to add
   * @returns {Object|null} Added request or null if collection not found
   */
  addRequest(collectionId, request) {
    const collections = this.getCollections();
    const collectionIndex = collections.findIndex(c => c.id === collectionId);
    
    if (collectionIndex === -1) return null;
    
    // Generate a unique id for the request
    const id = Date.now().toString();
    const newRequest = {
      id,
      ...request,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (!collections[collectionIndex].requests) {
      collections[collectionIndex].requests = [];
    }
    
    collections[collectionIndex].requests.push(newRequest);
    collections[collectionIndex].updatedAt = new Date().toISOString();
    
    this.saveCollections(collections);
    return newRequest;
  }

  /**
   * Update a request in a collection
   * @param {String} collectionId Collection ID
   * @param {String} requestId Request ID
   * @param {Object} updates Updates to apply to the request
   * @returns {Object|null} Updated request or null if not found
   */
  updateRequest(collectionId, requestId, updates) {
    const collections = this.getCollections();
    const collectionIndex = collections.findIndex(c => c.id === collectionId);
    
    if (collectionIndex === -1) return null;
    
    const requestIndex = collections[collectionIndex].requests.findIndex(r => r.id === requestId);
    
    if (requestIndex === -1) return null;
    
    collections[collectionIndex].requests[requestIndex] = {
      ...collections[collectionIndex].requests[requestIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    collections[collectionIndex].updatedAt = new Date().toISOString();
    this.saveCollections(collections);
    
    return collections[collectionIndex].requests[requestIndex];
  }

  /**
   * Delete a request from a collection
   * @param {String} collectionId Collection ID
   * @param {String} requestId Request ID
   * @returns {Boolean} True if deleted, false if not found
   */
  deleteRequest(collectionId, requestId) {
    const collections = this.getCollections();
    const collectionIndex = collections.findIndex(c => c.id === collectionId);
    
    if (collectionIndex === -1) return false;
    
    const initialLength = collections[collectionIndex].requests.length;
    collections[collectionIndex].requests = collections[collectionIndex].requests.filter(r => r.id !== requestId);
    
    if (collections[collectionIndex].requests.length === initialLength) return false;
    
    collections[collectionIndex].updatedAt = new Date().toISOString();
    this.saveCollections(collections);
    
    return true;
  }

  /**
   * Get all requests for a collection
   * @param {String} collectionId Collection ID
   * @returns {Array|null} Array of requests or null if collection not found
   */
  getRequests(collectionId) {
    const collections = this.getCollections();
    const collection = collections.find(c => c.id === collectionId);
    
    if (!collection) return null;
    
    return collection.requests || [];
  }
}
