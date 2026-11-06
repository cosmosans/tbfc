import type { ClubData } from "./model";

export type LocalDraft = { data: ClubData; revision: number; dirty: boolean };
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("tbfc-local", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("drafts");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function readDraft(): Promise<LocalDraft | undefined> {
  const db = await openDatabase();
  try {
    return await new Promise<LocalDraft | undefined>((resolve, reject) => {
      const request = db.transaction("drafts").objectStore("drafts").get("club");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally { db.close(); }
}
export async function writeDraft(draft: LocalDraft): Promise<void> {
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction("drafts", "readwrite");
      transaction.objectStore("drafts").put(draft, "club");
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally { db.close(); }
}
