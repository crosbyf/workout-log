const DB_NAME = 'GorsLogBackups';
const STORE_NAME = 'backups';
const MAX_BACKUPS = 5;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

export async function createBackup(data) {
  const db = await openDB();

  const backup = {
    timestamp: new Date().toISOString(),
    workouts: data.workouts || [],
    presets: data.presets || [],
    weightEntries: data.weightEntries || [],
    exercises: data.exercises || [],
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const addRequest = store.add(backup);

    addRequest.onsuccess = () => {
      const getAllRequest = store.getAll();
      getAllRequest.onsuccess = () => {
        const allBackups = getAllRequest.result;
        if (allBackups.length > MAX_BACKUPS) {
          const toDelete = allBackups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(MAX_BACKUPS);
          toDelete.forEach((b) => {
            store.delete(b.id);
          });
        }
        resolve(backup);
      };
      getAllRequest.onerror = () => {
        reject(getAllRequest.error);
      };
    };

    addRequest.onerror = () => {
      reject(addRequest.error);
    };
  });
}

export async function loadBackups() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const backups = request.result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      resolve(backups);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export function restoreBackup(backup) {
  return {
    workouts: backup.workouts || [],
    presets: backup.presets || [],
    weightEntries: backup.weightEntries || [],
    exercises: backup.exercises || [],
  };
}

export async function checkAndAutoBackup(data) {
  const lastBackupStr = localStorage.getItem('lastBackup');
  const lastBackupTime = lastBackupStr ? new Date(lastBackupStr).getTime() : 0;
  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  if (now - lastBackupTime >= sevenDaysMs) {
    await createBackup(data);
    localStorage.setItem('lastBackup', new Date().toISOString());
  }
}
