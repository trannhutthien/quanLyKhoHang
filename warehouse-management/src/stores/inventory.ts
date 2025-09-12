import { defineStore } from 'pinia'
import axios from 'axios'
const API_BASE = 'http://localhost:3001'


export interface InventoryItem {
  id: string
  name: string
  sku: string
  quantity: number
  unit: string
  category?: string
}

export interface Warehouse {
  id: string
  name: string
  location: string
  items: InventoryItem[]
}

function sampleData(): Warehouse[] {
  return [
    {
      id: 'kho-a',
      name: 'Kho A',
      location: 'Hà Nội',
      items: [
        { id: 'sp-001', name: 'Thùng carton 60x40x40', sku: 'BOX-604040', quantity: 120, unit: 'cái', category: 'Bao bì' },
        { id: 'sp-002', name: 'Băng keo 48mm', sku: 'TAPE-48', quantity: 340, unit: 'cuộn', category: 'Bao bì' },
        { id: 'sp-003', name: 'Nón bảo hộ', sku: 'SAF-HELM', quantity: 58, unit: 'cái', category: 'An toàn' },
      ]
    },
    {
      id: 'kho-b',
      name: 'Kho B',
      location: 'TP. Hồ Chí Minh',
      items: [
        { id: 'sp-004', name: 'Găng tay cao su', sku: 'GTC-01', quantity: 200, unit: 'đôi', category: 'An toàn' },
        { id: 'sp-005', name: 'Máy quét mã vạch', sku: 'BARC-SCAN', quantity: 15, unit: 'cái', category: 'Thiết bị' },
        { id: 'sp-006', name: 'Pallet nhựa', sku: 'PAL-PLS', quantity: 75, unit: 'cái', category: 'Kho bãi' },
      ]
    }
  ]
}

export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    warehouses: sampleData() as Warehouse[],
    loaded: false
  }),
  getters: {
    getWarehouseById: (state) => (id: string) => state.warehouses.find(w => w.id === id),
    totalItemsInWarehouse: () => (warehouse: Warehouse) => warehouse.items.length,
    totalQuantityInWarehouse: () => (warehouse: Warehouse) => warehouse.items.reduce((sum, i) => sum + i.quantity, 0),
  },
  actions: {
    async ensureLoaded() {
      if (this.loaded) return
      await this.fetchWarehousesWithItems()
      this.loaded = true
    },
    async fetchWarehousesWithItems() {
      const ws = await axios.get(`${API_BASE}/warehouses`)
      const itemsResp = await axios.get(`${API_BASE}/items`)
      const itemsBy: Record<string, InventoryItem[]> = {}
      for (const it of itemsResp.data as any[]) {
        const wid = (it as any).warehouseId
        if (!itemsBy[wid]) itemsBy[wid] = []
        itemsBy[wid].push({ id: it.id, name: it.name, sku: it.sku, quantity: Number(it.quantity) || 0, unit: it.unit, category: it.category })
      }
      this.warehouses = (ws.data as any[]).map(w => ({ id: w.id, name: w.name, location: w.location, items: itemsBy[w.id] || [] }))
    },

    async addWarehouse(name: string, location: string) {
      const base = this._slugify(name) || `kho-${Date.now()}`
      let id = base
      let i = 1
      while (this.warehouses.some(w => w.id === id)) {
        id = `${base}-${i++}`
      }
      await axios.post(`${API_BASE}/warehouses`, { id, name, location })
      this.warehouses.push({ id, name, location, items: [] })
      return id
    },
    async addItemToWarehouse(warehouseId: string, payload: { name: string; sku: string; quantity: number; unit: string; category?: string }) {
      const w = this.warehouses.find(w => w.id === warehouseId)
      if (!w) return false
      const baseSlug = payload.sku ? this._slugify(payload.sku) : this._slugify(payload.name) || 'sp'
      let base = baseSlug || 'sp'
      if (!base.startsWith('sp-')) base = `sp-${base}`
      let id = base
      let i = 1
      const allItems = this.warehouses.flatMap(x => x.items)
      while (allItems.some(it => it.id === id)) {
        id = `${base}-${i++}`
      }
      await axios.post(`${API_BASE}/items`, {
        id,
        warehouseId,
        name: payload.name,
        sku: payload.sku,
        quantity: Number(payload.quantity) || 0,
        unit: payload.unit,
        category: payload.category
      })
      w.items.push({ id, name: payload.name, sku: payload.sku, quantity: Number(payload.quantity) || 0, unit: payload.unit, category: payload.category })
      return id
    },
    _slugify(text: string) {
      return text
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    }
  }
})
