import { join } from 'path';
import fs from 'fs/promises';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

/**
 * Settings manager for PostZero
 * Handles user preferences and application settings
 */
export class SettingsManager {
  constructor(userDataPath) {
    this.userDataPath = userDataPath;
    this.settingsPath = join(userDataPath, 'settings.json');
    this.defaultSettings = {
      dbPath: '',  // Empty means use default location
      defaultPath: userDataPath,
      theme: 'light',
      lastBackup: null
    };
    this.settings = { ...this.defaultSettings };
    this.db = null;
  }

  /**
   * Initialize settings
   */
  async initialize() {
    try {
      const adapter = new JSONFile(this.settingsPath);
      this.db = new Low(adapter, this.defaultSettings);
      
      try {
        await this.db.read();
        console.log('Settings loaded:', this.db.data);
        
        // Ensure we have all default fields if loading from an older version
        this.settings = {
          ...this.defaultSettings,
          ...this.db.data
        };
        
        // Update settings file with merged defaults
        this.db.data = this.settings;
        await this.db.write();
      } catch (readError) {
        console.warn('Could not read settings, initializing with defaults:', readError.message);
        this.db.data = this.defaultSettings;
        await this.db.write();
        this.settings = { ...this.defaultSettings };
      }
      
      return this.settings;
    } catch (error) {
      console.error('Error initializing settings:', error);
      // Fall back to in-memory settings
      this.settings = { ...this.defaultSettings };
      return this.settings;
    }
  }
  
  /**
   * Get current settings
   */
  getSettings() {
    return { ...this.settings };
  }
  
  /**
   * Update settings
   * @param {Object} newSettings - Settings to update
   */
  async updateSettings(newSettings) {
    try {
      // Merge settings
      const updatedSettings = {
        ...this.settings,
        ...newSettings
      };
      
      // Validate paths if provided
      if (newSettings.dbPath) {
        try {
          // Check if directory exists and is accessible
          await fs.access(newSettings.dbPath);
        } catch (e) {
          try {
            // Try to create the directory if it doesn't exist
            await fs.mkdir(newSettings.dbPath, { recursive: true });
          } catch (mkdirErr) {
            throw new Error(`Cannot access or create directory: ${newSettings.dbPath}`);
          }
        }
      }
      
      // Update in-memory settings
      this.settings = updatedSettings;
      
      // Save to file
      if (this.db) {
        this.db.data = updatedSettings;
        await this.db.write();
      }
      
      return this.settings;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }
  
  /**
   * Get the database path (either custom or default)
   */
  getDatabasePath() {
    // If no custom path is set, return default
    if (!this.settings.dbPath) {
      return this.userDataPath;
    }
    return this.settings.dbPath;
  }
  
  /**
   * Reset settings to defaults
   */
  async resetToDefaults() {
    try {
      this.settings = { ...this.defaultSettings };
      if (this.db) {
        this.db.data = this.settings;
        await this.db.write();
      }
      return this.settings;
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw error;
    }
  }
}
