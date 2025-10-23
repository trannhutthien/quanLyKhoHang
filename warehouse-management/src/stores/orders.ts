import { defineStore } from 'pinia'
import axios from 'axios'

const API_BASE = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL)
  ? (import.meta as any).env.VITE_API_BASE_URL
  : 'http://localhost:3001'

export type ReceiptType = 'import' | 'export'

export interface ReceiptLine {
  itemCode: string
  itemName: string
  unit: string
  quantity: number | null
  unitPrice: number | null
  warehouseId?: string
}

export interface Receipt {
  id: string
  type: ReceiptType
  receiptNo: string
  docDate: string
  referenceImport?: string
  note?: string
  warehouseId?: string
  items: ReceiptLine[]
  itemsCount: number
  total: number
}

function genId(prefix: string) {
  return `${prefix}-${Date.now()}`
}

export const useOrdersStore = defineStore('orders', {
  state: () => ({
    receipts: [] as Receipt[],
  }),
  getters: {
    allReceipts: (state) =>
      [...state.receipts].sort((a, b) => {
        // Sort by date desc then id desc
        const d = (b.docDate || '').localeCompare(a.docDate || '')
        return d !== 0 ? d : (b.id || '').localeCompare(a.id || '')
      })
  },
  actions: {
    async loadReceipts() {
      try {
        const response = await axios.get(`${API_BASE}/receipts`)
        this.receipts = response.data
      } catch (err) {
        console.error('Failed to load receipts:', err)
      }
    },
    
    async addImport(payload: any) {
      try {
        const response = await axios.post(`${API_BASE}/receipts/import`, payload)
        
        // Thêm vào state local
        const rec: Receipt = {
          id: response.data.id,
          type: 'import',
          receiptNo: payload.receiptNo,
          docDate: payload.docDate,
          referenceImport: payload.referenceImport,
          note: payload.note,
          warehouseId: payload.warehouseId,
          items: payload.items,
          itemsCount: payload.items.length,
          total: payload.total || 0
        }
        this.receipts.push(rec)
        return rec.id
      } catch (err) {
        console.error('Failed to create import receipt:', err)
        throw err
      }
    },
    
    async addExport(payload: any) {
      try {
        const response = await axios.post(`${API_BASE}/receipts/export`, payload)
        
        // Thêm vào state local
        const rec: Receipt = {
          id: response.data.id,
          type: 'export',
          receiptNo: payload.receiptNo,
          docDate: payload.docDate,
          referenceImport: payload.referenceImport,
          note: payload.note,
          warehouseId: payload.warehouseId,
          items: payload.items,
          itemsCount: payload.items.length,
          total: payload.total || 0
        }
        this.receipts.push(rec)
        return rec.id
      } catch (err) {
        console.error('Failed to create export receipt:', err)
        throw err
      }
    }
  }
})

