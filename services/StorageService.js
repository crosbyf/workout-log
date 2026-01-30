// services/StorageService.js
// Handles localStorage operations and IndexedDB backups

export const StorageService = {
  // Save data to localStorage and update React state
  save: (data, key, setter) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
    if (setter) {
      setter(data);
    }
  },

  // Load data from localStorage
  load: (key, defaultValue = null) => {
    if (typeof window === 'undefined') return defaultValue;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error(`Error parsing ${key} from localStorage:`, e);
        return defaultValue;
      }
    }
    return defaultValue;
  },

  // Check if backup is needed (every 7 days)
  shouldBackup: () => {
    const lastBackup = localStorage.getItem('lastBackup');
    if (!lastBackup) return true;
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return (Date.now() - parseInt(lastBackup)) > sevenDays;
  },

  // Create backup in IndexedDB
  createBackup: async (data) => {
    const { workouts, presets, weightEntries, exercises, proteinEntries } = data;
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('GorsLogBackups', 1);
      
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('backups')) {
          db.createObjectStore('backups', { keyPath: 'timestamp' });
        }
      };
      
      request.onsuccess = (e) => {
        const db = e.target.result;
        const transaction = db.transaction(['backups'], 'readwrite');
        const store = transaction.objectStore('backups');
        
        const backup = {
          timestamp: Date.now(),
          workouts: workouts || [],
          presets: presets || [],
          weightEntries: weightEntries || [],
          exercises: exercises || [],
          proteinEntries: proteinEntries || []
        };
        
        store.add(backup);
        
        // Keep only the last 5 backups
        const getAllRequest = store.getAll();
        getAllRequest.onsuccess = () => {
          const allBackups = getAllRequest.result.sort((a, b) => b.timestamp - a.timestamp);
          if (allBackups.length > 5) {
            allBackups.slice(5).forEach(b => store.delete(b.timestamp));
          }
        };
        
        localStorage.setItem('lastBackup', backup.timestamp.toString());
        console.log('Backup created:', new Date(backup.timestamp).toLocaleString());
        resolve(backup);
      };
      
      request.onerror = (err) => {
        console.error('Backup failed:', err);
        reject(err);
      };
    });
  },

  // Get all backups from IndexedDB
  getBackups: async () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('GorsLogBackups', 1);
      
      request.onsuccess = (e) => {
        const db = e.target.result;
        
        if (!db.objectStoreNames.contains('backups')) {
          resolve([]);
          return;
        }
        
        const transaction = db.transaction(['backups'], 'readonly');
        const store = transaction.objectStore('backups');
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = () => {
          const backups = getAllRequest.result.sort((a, b) => b.timestamp - a.timestamp);
          resolve(backups);
        };
        
        getAllRequest.onerror = () => reject(getAllRequest.error);
      };
      
      request.onerror = () => reject(request.error);
    });
  },

  // Restore from a backup
  restoreBackup: (backup, setters) => {
    const { setWorkouts, setPresets, setWeightEntries, setExercises, setProteinEntries } = setters;
    
    if (backup.workouts) StorageService.save(backup.workouts, 'workouts', setWorkouts);
    if (backup.presets) StorageService.save(backup.presets, 'presets', setPresets);
    if (backup.weightEntries) StorageService.save(backup.weightEntries, 'weightEntries', setWeightEntries);
    if (backup.exercises) StorageService.save(backup.exercises, 'exercises', setExercises);
    if (backup.proteinEntries) StorageService.save(backup.proteinEntries, 'proteinEntries', setProteinEntries);
  }
};
