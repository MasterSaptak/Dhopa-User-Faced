const DB_NAME = "dhopa_offline"
const DB_VERSION = 1
const STORE_DRAFT_ORDERS = "draft_orders"
const STORE_CATALOG_CACHE = "catalog_cache"

export interface DraftOrder {
  id: string
  items: any[]
  addons: any[]
  deliveryType: string
  specialInstructions?: string
  createdAt: string
  synced: boolean
  clientTotal: number
}

class OfflineStorage {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create draft orders store
        if (!db.objectStoreNames.contains(STORE_DRAFT_ORDERS)) {
          const draftStore = db.createObjectStore(STORE_DRAFT_ORDERS, {
            keyPath: "id",
          })
          draftStore.createIndex("synced", "synced", { unique: false })
          draftStore.createIndex("createdAt", "createdAt", { unique: false })
        }

        // Create catalog cache store
        if (!db.objectStoreNames.contains(STORE_CATALOG_CACHE)) {
          db.createObjectStore(STORE_CATALOG_CACHE, { keyPath: "key" })
        }
      }
    })
  }

  private getStore(storeName: string, mode: IDBTransactionMode = "readonly"): IDBObjectStore {
    if (!this.db) throw new Error("Database not initialized")
    const transaction = this.db.transaction(storeName, mode)
    return transaction.objectStore(storeName)
  }

  // Draft Orders Methods
  async saveDraftOrder(draft: DraftOrder): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(STORE_DRAFT_ORDERS, "readwrite")
      const request = store.put(draft)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getDraftOrders(): Promise<DraftOrder[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(STORE_DRAFT_ORDERS)
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async getUnsyncedDrafts(): Promise<DraftOrder[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(STORE_DRAFT_ORDERS)
      const index = store.index("synced")
      const request = index.getAll(false)
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async deleteDraftOrder(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(STORE_DRAFT_ORDERS, "readwrite")
      const request = store.delete(id)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async markDraftSynced(id: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const store = this.getStore(STORE_DRAFT_ORDERS, "readwrite")
        const getRequest = store.get(id)

        getRequest.onsuccess = () => {
          const draft = getRequest.result
          if (draft) {
            draft.synced = true
            const putRequest = store.put(draft)
            putRequest.onsuccess = () => resolve()
            putRequest.onerror = () => reject(putRequest.error)
          } else {
            resolve()
          }
        }
        getRequest.onerror = () => reject(getRequest.error)
      } catch (error) {
        reject(error)
      }
    })
  }

  // Catalog Cache Methods
  async saveCatalogCache(key: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(STORE_CATALOG_CACHE, "readwrite")
      const request = store.put({ key, data, cachedAt: Date.now() })
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getCatalogCache(key: string): Promise<any | null> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(STORE_CATALOG_CACHE)
      const request = store.get(key)
      request.onsuccess = () => {
        const result = request.result
        // Cache expires after 1 hour
        if (result && Date.now() - result.cachedAt < 3600000) {
          resolve(result.data)
        } else {
          resolve(null)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  async clearAllData(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve()
        return
      }

      const transaction = this.db.transaction([STORE_DRAFT_ORDERS, STORE_CATALOG_CACHE], "readwrite")

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)

      transaction.objectStore(STORE_DRAFT_ORDERS).clear()
      transaction.objectStore(STORE_CATALOG_CACHE).clear()
    })
  }
}

export const offlineStorage = new OfflineStorage()
