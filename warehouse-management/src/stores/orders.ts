import { defineStore } from 'pinia'

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
    addImport(payload: Omit<Receipt, 'id' | 'type' | 'itemsCount' | 'total'> & { items: ReceiptLine[]; total?: number }) {
      const total = payload.total != null ? payload.total : payload.items.reduce((s, r) => s + (r.unitPrice != null ? Number(r.unitPrice) : 0), 0)
      const rec: Receipt = {
        id: genId('PN'),
        type: 'import',
        receiptNo: payload.receiptNo,
        docDate: payload.docDate,
        referenceImport: payload.referenceImport,
        note: payload.note,
        warehouseId: payload.warehouseId,
        items: payload.items,
        itemsCount: payload.items.length,
        total
      }
      this.receipts.push(rec)
      return rec.id
    },
    addExport(payload: Omit<Receipt, 'id' | 'type' | 'itemsCount' | 'total'> & { items: ReceiptLine[]; total?: number }) {
      const total = payload.total != null ? payload.total : payload.items.reduce((s, r) => s + (r.quantity ? Number(r.quantity) : 0) * (r.unitPrice != null ? Number(r.unitPrice) : 0), 0)
      const rec: Receipt = {
        id: genId('PX'),
        type: 'export',
        receiptNo: payload.receiptNo,
        docDate: payload.docDate,
        referenceImport: payload.referenceImport,
        note: payload.note,
        warehouseId: payload.warehouseId,
        items: payload.items,
        itemsCount: payload.items.length,
        total
      }
      this.receipts.push(rec)
      return rec.id
    }
  }
})

