// This service handles the automatic IndexedDB backups
export const StorageService = {
  dbName: 'GorsLogBackups',

  async createBackup(data) {
    const { workouts, presets, weightEntries, exercises } = data;
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
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
          workouts,
          presets,
          weightEntries,
          exercises
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
        resolve(true);
      };

      request.onerror = (err) => reject(err);
    });
  },

  shouldBackup() {
    const lastBackup = localStorage.getItem('lastBackup');
    if (!lastBackup) return true;
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return (Date.now() - parseInt(lastBackup)) > sevenDays;
  }
};
