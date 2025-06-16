import { join, dirname } from 'path';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import fs from 'fs/promises';

/**
 * Storage utility for managing collections and requests
 * Uses lowdb for easy JSON persistence in Electron userData directory
 */
export class Storage {
  constructor(userDataPath, fileName = 'postzero-db') {
    this.userDataPath = userDataPath;
    this.dbPath = join(userDataPath, `${fileName}.json`);
    this.dbInitialized = false;
    this.initPromise = this.initializeDb();
  }
  
  /**
   * Get the database file path
   * @returns {string} Path to the database file
   */
  getDbPath() {
    return this.dbPath;
  }
  
  /**
   * Public initialization method to ensure database is ready
   * @returns {Promise<boolean>} True if initialization was successful
   */
  async init() {
    // Return the existing initialization promise
    return this.initPromise;
  }

  /**
   * Initialize the database with lowdb
   */
  async initializeDb() {
    try {
      console.log(`Ensuring database path exists: ${this.dbPath}`);
      
      // Make sure the directory exists
      const dirPath = dirname(this.dbPath);
      try {
        await fs.mkdir(dirPath, { recursive: true });
        console.log(`Ensured directory exists: ${dirPath}`);
      } catch (dirErr) {
        console.warn(`Warning creating directory (may already exist): ${dirErr.message}`);
      }
      
      // Create a JSONFile adapter
      const adapter = new JSONFile(this.dbPath);
      
      // Create a lowdb instance
      this.db = new Low(adapter, { collections: [] });
      
      console.log('Reading database file...');
      
      try {
        // Read existing data from disk
        await this.db.read();
        console.log('Database read successfully, collections:', 
          this.db.data?.collections?.length || 0);
      } catch (readError) {
        console.warn('Could not read database, initializing with empty data:', readError.message);
        this.db.data = { collections: [] };
      }
      
      // Set default values if data is empty
      if (!this.db.data || !this.db.data.collections) {
        console.log('No collections found, initializing empty collections array');
        this.db.data = { collections: [] };
        // Write initial data structure
        try {
          await this.db.write();
          console.log('Successfully wrote initial database structure');
        } catch (writeErr) {
          console.error('Error writing initial database:', writeErr);
          throw writeErr; // Propagate the error to be handled in the outer catch
        }
      }
      
      // Mark as initialized
      this.dbInitialized = true;
      console.log(`Database initialized successfully with ${this.db.data.collections.length} collections at: ${this.dbPath}`);
      return true;
    } catch (error) {
      console.error('Fatal error initializing database:', error);
      // Fallback to in-memory data if file operations fail
      this.db = { data: { collections: [] }, write: async () => {} };
      this.dbInitialized = true; // Even if using fallback, mark as initialized to prevent endless retries
      return false;
    }
  }
  
  /**
   * Safely write data to disk with retries and error handling
   * @returns {Promise<boolean>} True if successful, false if failed
   */
  async write() {
    if (!this.db) {
      console.error('Cannot write to database: Database not initialized');
      return false;
    }
    
    // First, make sure the directory exists
    const dirPath = dirname(this.dbPath);
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (dirErr) {
      console.warn(`Warning checking directory (continuing anyway): ${dirErr.message}`);
    }
    
    // Log what we're about to write for debugging
    const collCount = this.db.data?.collections?.length || 0;
    console.log(`Writing database with ${collCount} collections to: ${this.dbPath}`);
    
    try {
      // Try to write data to disk with retry logic
      let retries = 3;
      let success = false;
      
      while (retries > 0 && !success) {
        try {
          // Force a direct write to disk
          await this.db.write();
          
          // Verify data was written by reading it back
          if (retries === 3) { // Only on first attempt to avoid infinite loops
            try {
              await this.db.read();
              const verifiedCount = this.db.data?.collections?.length || 0;
              console.log(`Database verified with ${verifiedCount} collections`);
            } catch (verifyErr) {
              console.warn('Could not verify database write, continuing anyway:', verifyErr.message);
            }
          }
          
          success = true;
          console.log('Database written successfully');
        } catch (err) {
          console.error(`Error writing to database (${retries} retries left):`, err);
          
          // If we're on the last retry, try writing to userData as a fallback
          if (retries === 1) {
            try {
              const originalPath = this.dbPath;
              // Get just the filename from the path
              const filename = originalPath.split(/[\\/]/).pop();
              // Use the constructor's userDataPath as fallback
              this.dbPath = join(this.userDataPath, filename);
              console.log(`Attempting fallback write to: ${this.dbPath}`);
              await this.db.write();
              success = true;
              console.log(`Fallback write successful, using: ${this.dbPath}`);
            } catch (fallbackErr) {
              console.error('Fallback write failed:', fallbackErr);
            }
          }
          
          retries--;
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      return success;
    } catch (error) {
      console.error('Fatal error writing to database:', error);
      return false;
    }
  }
  
  /**
   * Ensure database is ready before operations
   */
  async ensureDbReady() {
    // Wait for the initial initialization to complete if it's in progress
    if (this.initPromise) {
      await this.initPromise;
      this.initPromise = null;
    }
    
    // If still not initialized, try again
    if (!this.dbInitialized || !this.db) {
      await this.initializeDb();
    }
    return this.db;
  }

  /**
   * Get all collections
   * @returns {Array} Array of collections
   */
  async getCollections() {
    await this.ensureDbReady();
    return this.db.data.collections;
  }

  /**
   * Create a new collection
   * @param {Object} collection Collection object with name property
   * @returns {Object} Created collection with id
   */
  async createCollection(collection) {
    await this.ensureDbReady();
    
    // Generate a unique id for the collection
    const id = Date.now().toString();
    const newCollection = {
      id,
      name: collection.name,
      requests: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.db.data.collections.push(newCollection);
    await this.write();
    return newCollection;
  }

  /**
   * Update a collection
   * @param {String} id Collection ID
   * @param {Object} updates Updates to apply to the collection
   * @returns {Object|null} Updated collection or null if not found
   */
  async updateCollection(id, updates) {
    await this.ensureDbReady();
    
    const collections = this.db.data.collections;
    const index = collections.findIndex(c => c.id === id);
    
    if (index === -1) return null;
    
    collections[index] = {
      ...collections[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await this.write();
    return collections[index];
  }

  /**
   * Delete a collection
   * @param {String} id Collection ID
   * @returns {Boolean} True if deleted, false if not found
   */
  async deleteCollection(id) {
    await this.ensureDbReady();
    
    const collections = this.db.data.collections;
    const initialLength = collections.length;
    this.db.data.collections = collections.filter(c => c.id !== id);
    
    if (this.db.data.collections.length === initialLength) return false;
    
    await this.write();
    return true;
  }

  /**
   * Add a request to a collection
   * @param {String} collectionId Collection ID
   * @param {Object} request Request object to add
   * @returns {Object|null} Added request or null if collection not found
   */
  async addRequest(collectionId, request) {
    await this.ensureDbReady();
    
    const collections = this.db.data.collections;
    const collectionIndex = collections.findIndex(c => c.id === collectionId);
    
    if (collectionIndex === -1) return null;
    
    // Generate a unique id for the request if it doesn't have one
    const id = request.id || Date.now().toString();
    
    // Process the request body based on content type
    let processedRequest = { ...request };
    
    // Handle JSON body properly
    if (request.contentType === 'application/json' && request.body) {
      try {
        // If it's a string, parse it to ensure it's valid JSON
        if (typeof request.body === 'string') {
          const jsonObj = JSON.parse(request.body);
          // Store the parsed object directly
          processedRequest.bodyObject = jsonObj;
          // Keep the string version too for compatibility
          processedRequest.body = request.body;
        } else {
          // If it's already an object, stringify it for the body field
          processedRequest.bodyObject = request.body;
          processedRequest.body = JSON.stringify(request.body);
        }
      } catch (e) {
        console.warn('Invalid JSON body in request:', e.message);
        // Keep the original body if parsing fails
      }
    }
    
    // Create the new request object with metadata
    const newRequest = {
      id,
      ...processedRequest,
      collectionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Ensure the collection has a requests array
    if (!collections[collectionIndex].requests) {
      collections[collectionIndex].requests = [];
    }
    
    // Add the request to the collection
    collections[collectionIndex].requests.push(newRequest);
    collections[collectionIndex].updatedAt = new Date().toISOString();
    
    // Write changes to disk
    await this.write();
    return newRequest;
  }

  /**
   * Update a request in a collection
   * @param {String} collectionId Collection ID
   * @param {String} requestId Request ID
   * @param {Object} updates Updates to apply to the request
   * @returns {Object|null} Updated request or null if not found
   */
  async updateRequest(collectionId, requestId, updates) {
    await this.ensureDbReady();
    
    const collections = this.db.data.collections;
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
    await this.write();
    
    return collections[collectionIndex].requests[requestIndex];
  }

  /**
   * Delete a request from a collection
   * @param {String} collectionId Collection ID
   * @param {String} requestId Request ID
   * @returns {Boolean} True if deleted, false if not found
   */
  async deleteRequest(collectionId, requestId) {
    await this.ensureDbReady();
    
    const collections = this.db.data.collections;
    const collectionIndex = collections.findIndex(c => c.id === collectionId);
    
    if (collectionIndex === -1) return false;
    
    const initialLength = collections[collectionIndex].requests.length;
    collections[collectionIndex].requests = collections[collectionIndex].requests.filter(r => r.id !== requestId);
    
    if (collections[collectionIndex].requests.length === initialLength) return false;
    
    collections[collectionIndex].updatedAt = new Date().toISOString();
    await this.write();
    
    return true;
  }

  /**
   * Get all requests for a collection
   * @param {String} collectionId Collection ID
   * @returns {Array|null} Array of requests or null if collection not found
   */
  async getRequests(collectionId) {
    await this.ensureDbReady();
    
    const collections = this.db.data.collections;
    const collection = collections.find(c => c.id === collectionId);
    
    if (!collection) return null;
    
    return collection.requests || [];
  }
}
