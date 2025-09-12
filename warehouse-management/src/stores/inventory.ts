import { defineStore } from 'pinia'

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
    warehouses: sampleData() as Warehouse[]
  }),
  getters: {
    getWarehouseById: (state) => (id: string) => state.warehouses.find(w => w.id === id),
    totalItemsInWarehouse: () => (warehouse: Warehouse) => warehouse.items.length,
    totalQuantityInWarehouse: () => (warehouse: Warehouse) => warehouse.items.reduce((sum, i) => sum + i.quantity, 0),
  },
  actions: {
    addWarehouse(name: string, location: string) {
      const base = this._slugify(name) || `kho-${Date.now()}`
      let id = base
      let i = 1
      while (this.warehouses.some(w => w.id === id)) {
        id = `${base}-${i++}`
      }
      this.warehouses.push({ id, name, location, items: [] })
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
