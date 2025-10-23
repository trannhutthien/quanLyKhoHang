<template>
  <AppLayout>
    <section class="transfer-page">
      <div class="transfer-actions">
        <button class="btn btn-primary" @click="onSelect('import')">Nhập hàng</button>
        <button class="btn btn-danger" @click="onSelect('export')">Xuất hàng</button>
      </div>

      <div v-if="selectedMode === 'import'" class="panel">
        <h2>Phiếu nhập hàng</h2>
        <form class="import-form" @submit.prevent="submitImport">
          <div class="form-grid">
            <label>
              <span>Số phiếu</span>
              <input v-model="importForm.receiptNo" type="text" placeholder="VD: PN-0001" required />
            </label>
            <label>
              <span>Ngày chứng từ</span>
              <input v-model="importForm.docDate" type="date" required />
            </label>
            <label>
              <span>Ngày hoạch toán</span>
              <input v-model="importForm.postDate" type="date" />
            </label>
            <label>
              <span>Nhà cung cấp</span>
              <input v-model="importForm.supplierName" type="text" placeholder="Tên nhà cung cấp" />
            </label>
            <label>
              <span>Mã số thuế</span>
              <input v-model="importForm.taxCode" type="text" placeholder="VD: 0101234567" />
            </label>
            <label>
              <span>Địa chỉ NCC</span>
              <input v-model="importForm.supplierAddress" type="text" placeholder="Địa chỉ nhà cung cấp" />
            </label>
            <label>
              <span>Số tham chiếu</span>
              <input v-model="importForm.referenceNo" type="text" placeholder="Số tham chiếu" />
            </label>
            <label class="full">
              <span>Ghi chú</span>
              <textarea v-model="importForm.note" rows="3" placeholder="Ghi chú thêm..."></textarea>
            </label>
          </div>
          <div class="line-items">
            <div class="line-items-header">
              <h3>Danh sách mặt hàng</h3>
              <button type="button" class="btn" @click="addRow">+ Thêm dòng</button>
            </div>
            <div class="table-wrapper">
              <table class="items-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Mã hàng</th>
                    <th>Tên hàng</th>
                    <th>Đơn vị tính</th>
                    <th>Kho đích</th>
                    <th>Giá nhập</th>
                    <th>Giá xuất</th>
                    <th>Hạn sử dụng</th>
                    <th>Đánh giá chất lượng</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in importItems" :key="idx">
                    <td class="text-center">{{ idx + 1 }}</td>
                    <td><input v-model="row.itemCode" type="text" placeholder="SKU" /></td>
                    <td><input v-model="row.itemName" type="text" placeholder="Tên hàng" required /></td>
                    <td><input v-model="row.unit" type="text" placeholder="VD: cái, hộp" required /></td>
                    <td>
                      <select v-model="row.destWarehouseId">
                        <option value="">— chọn kho —</option>
                        <option v-for="w in store.warehouses" :key="w.id" :value="w.id">{{ w.name }}</option>
                      </select>
                    </td>
                    <td><input v-model.number="row.unitPrice" type="number" min="0" step="any" placeholder="VND" /></td>
                    <td><input v-model.number="row.salePrice" type="number" min="0" step="any" placeholder="VND" /></td>
                    <td><input v-model="row.expiry" type="date" /></td>
                    <td>
                      <select v-model="row.quality">
                        <option value="">— chọn —</option>
                        <option value="tốt">tốt</option>
                        <option value="ổn trung bình">ổn trung bình</option>
                        <option value="không đạt">không đạt</option>
                      </select>
                    </td>
                    <td>
                      <button type="button" class="btn btn-danger" @click="removeRow(idx)">Xóa</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="form-actions">
            <div class="total-box">Tổng tiền (giá nhập): <strong>{{ fmtVND(totalImport) }}</strong></div>
            <div class="actions">
              <button type="button" class="btn" @click="cancelImport">Hủy</button>
              <button type="submit" class="btn btn-primary">Lưu tạm</button>
            </div>
          </div>
        </form>
      </div>

      <div v-else-if="selectedMode === 'export'" class="panel">
        <h2>Phiếu xuất hàng</h2>
        <form class="import-form" @submit.prevent="submitExport">
          <div class="form-grid">
            <label>
              <span>Số phiếu</span>
              <input v-model="exportForm.receiptNo" type="text" placeholder="VD: PX-0001" required />
            </label>
            <label>
              <span>Ngày chứng từ</span>
              <input v-model="exportForm.docDate" type="date" required />
            </label>
            <label class="full">
              <span>Tham chiếu PN</span>
              <input v-model="exportForm.referenceImport" type="text" placeholder="Số phiếu nhập tham chiếu" />
            </label>
            <label class="full">
              <span>Ghi chú</span>
              <textarea v-model="exportForm.note" rows="3" placeholder="Ghi chú thêm..."></textarea>
            </label>
          </div>

          <div class="line-items">
            <div class="line-items-header">
              <h3>Danh sách mặt hàng xuất</h3>
              <div class="pickers" style="display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;">
                <label style="display:grid; gap:0.25rem;">
                  <span>Kho nguồn</span>
                  <select v-model="exportSourceWarehouseId">
                    <option value="">— chọn kho —</option>
                    <option v-for="w in store.warehouses" :key="w.id" :value="w.id">{{ w.name }}</option>
                  </select>
                </label>
                <label style="display:grid; gap:0.25rem; min-width:260px;">
                  <span>Chọn mặt hàng</span>
                  <select v-model="exportSelectedItemId" :disabled="!exportSourceWarehouseId" @change="onPickExportItem">
                    <option value="">— chọn mặt hàng —</option>
                    <option v-for="it in exportWarehouseItems" :key="it.id" :value="it.id">{{ it.sku }} - {{ it.name }}</option>
                  </select>
                </label>
              </div>
            </div>
            <div class="table-wrapper">
              <table class="items-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Mã hàng</th>
                    <th>Tên hàng</th>
                    <th>Đơn vị tính</th>
                    <th>Số lượng</th>
                    <th>Giá xuất</th>


                    <th>Kho nguồn</th>
                        <th>Xóa</th>

                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in exportItems" :key="idx">
                    <td class="text-center">{{ idx + 1 }}</td>
                    <td><input v-model="row.itemCode" type="text" placeholder="SKU" /></td>
                    <td><input v-model="row.itemName" type="text" placeholder="Tên hàng" /></td>
                    <td><input v-model="row.unit" type="text" placeholder="VD: cái, hộp" /></td>
                    <td><input v-model.number="row.quantity" type="number" min="0" step="any" placeholder="0" /></td>
                    <td><input v-model.number="row.unitPrice" type="number" min="0" step="any" placeholder="VND" /></td>
                    <td>{{ warehouseNameById(exportSourceWarehouseId) }}</td>
                    <td>
                      <button type="button" class="btn btn-danger" @click="removeExportRow(idx)">Xóa</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="form-actions">
            <div class="total-box">Tổng tiền (giá xuất): <strong>{{ fmtVND(totalExport) }}</strong></div>
            <div class="actions">
              <button type="button" class="btn" @click="cancelImport">Hủy</button>
              <button type="submit" class="btn btn-primary">Lưu tạm</button>
            </div>
          </div>
        </form>
      </div>

    </section>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import AppLayout from '../components/AppLayout.vue'
import { useInventoryStore } from '../stores/inventory'
import { useOrdersStore } from '../stores/orders'

const store = useInventoryStore()
const orders = useOrdersStore()
const selectedMode = ref<'import' | 'export' | null>(null)

const importForm = reactive({
  receiptNo: '',
  docDate: '',
  postDate: '',
  supplierName: '',
  taxCode: '',
  supplierAddress: '',
  referenceNo: '',
  note: ''
})


// Danh sách dòng hàng nhập
type Quality = 'tốt' | 'ổn trung bình' | 'không đạt' | ''
type LineItem = { itemCode: string; itemName: string; unit: string; quantity: number | null; unitPrice: number | null; salePrice: number | null; expiry: string; quality: Quality; destWarehouseId: string }
const importItems = ref<LineItem[]>([
  { itemCode: '', itemName: '', unit: '', quantity: null, unitPrice: null, salePrice: null, expiry: '', quality: '', destWarehouseId: '' }
])

const addRow = () => {
  importItems.value.push({ itemCode: '', itemName: '', unit: '', quantity: null, unitPrice: null, salePrice: null, expiry: '', quality: '', destWarehouseId: '' })
}
const removeRow = (idx: number) => {
  importItems.value.splice(idx, 1)
}

onMounted(() => { store.ensureLoaded() })

const totalImport = computed(() => {
  return importItems.value.reduce((sum, r) => sum + (r.unitPrice != null ? Number(r.unitPrice) : 0), 0)
})

function fmtVND(n: number) {
  return (n || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
}

const onSelect = (mode: 'import' | 'export') => {
  selectedMode.value = mode
  if (mode === 'export') {
    buildExportFromImport()
  }
}


// Phiếu xuất (tạo dựa trên phiếu nhập)
type ExportLineItem = { itemCode: string; itemName: string; unit: string; quantity: number | null; unitPrice: number | null; sourceWarehouseId: string }
const exportForm = reactive({ receiptNo: '', docDate: '', referenceImport: '', note: '' })
const exportItems = ref<ExportLineItem[]>([])

const totalExport = computed(() => {
  return exportItems.value.reduce((sum, r) => {
    const qty = r.quantity != null ? Number(r.quantity) : 0
    const price = r.unitPrice != null ? Number(r.unitPrice) : 0
    return sum + qty * price
  }, 0)
})

/*

function buildExportFromImport() {

// Chon kho + chon mot mat hang tu kho nguon de them nhanh
const exportSourceWarehouseId = ref('')
const exportSelectedItemId = ref('')

const exportWarehouseItems = computed(() => {
  const w = store.warehouses.find(x => x.id === exportSourceWarehouseId.value)
  return w ? w.items : []
})

function onPickExportItem() {
  if (!exportSelectedItemId.value) return
  addExportByItemId(exportSelectedItemId.value)
  exportSelectedItemId.value = ''
}

function addExportByItemId(itemId: string) {
  const w = store.warehouses.find(x => x.id === exportSourceWarehouseId.value)
  if (!w) return
  const it = w.items.find(i => i.id === itemId)
  if (!it) return
  exportItems.value.push({
    itemCode: it.sku,
    itemName: it.name,
    unit: it.unit,
    quantity: 1,
    unitPrice: it.salePrice ?? null,
    sourceWarehouseId: w.id
  })
}

  exportForm.referenceImport = importForm.receiptNo || ''
  exportForm.docDate = new Date().toISOString().slice(0, 10)
  // Gợi ý số phiếu PX dựa trên PN (nếu có), không bắt buộc
  const pnNum = (importForm.receiptNo || '').replace(/[^0-9]/g, '')
  exportForm.receiptNo = pnNum ? `PX-${pnNum}` : `PX-${String(Date.now()).slice(-6)}`
  exportForm.note = ''
  exportItems.value = importItems.value.map(r => ({
    itemCode: r.itemCode,
    itemName: r.itemName,
    unit: r.unit,
    quantity: 1,
    unitPrice: r.salePrice ?? null,
    sourceWarehouseId: r.destWarehouseId || ''
  }))
}
*/

function buildExportFromImport() {
  exportForm.referenceImport = importForm.receiptNo || ''
  exportForm.docDate = new Date().toISOString().slice(0, 10)
  const pnNum = (importForm.receiptNo || '').replace(/[^0-9]/g, '')
  exportForm.receiptNo = pnNum ? `PX-${pnNum}` : `PX-${String(Date.now()).slice(-6)}`
  exportForm.note = ''
  exportItems.value = importItems.value.map(r => ({
    itemCode: r.itemCode,
    itemName: r.itemName,
    unit: r.unit,
    quantity: 1,
    unitPrice: r.salePrice ?? null,
    sourceWarehouseId: r.destWarehouseId || ''
  }))
}

// Chọn kho + chọn mặt hàng từ kho nguồn để thêm nhanh
const exportSourceWarehouseId = ref('')
const exportSelectedItemId = ref('')

const exportWarehouseItems = computed(() => {
  const w = store.warehouses.find(x => x.id === exportSourceWarehouseId.value)
  return w ? w.items : []
})

function onPickExportItem() {
  if (!exportSelectedItemId.value) return
  addExportByItemId(exportSelectedItemId.value)
  exportSelectedItemId.value = ''
}

function warehouseNameById(id: string) {
  const w = store.warehouses.find(x => x.id === id)
  return w ? w.name : ''
}

function addExportByItemId(itemId: string) {
  const w = store.warehouses.find(x => x.id === exportSourceWarehouseId.value)
  if (!w) return
  const it = w.items.find(i => i.id === itemId)
  if (!it) return
  exportItems.value.push({
    itemCode: it.sku,
    itemName: it.name,
    unit: it.unit,
    quantity: 1,
    unitPrice: it.salePrice ?? null,
    sourceWarehouseId: w.id
  })
}


const submitExport = async () => {
  try {
    const payload = {
      receiptNo: exportForm.receiptNo,
      docDate: exportForm.docDate,
      referenceImport: exportForm.referenceImport,
      note: exportForm.note,
      warehouseId: exportSourceWarehouseId.value || (exportItems.value[0]?.sourceWarehouseId || ''),
      items: exportItems.value.map(r => ({
        itemCode: r.itemCode,
        itemName: r.itemName,
        unit: r.unit,
        quantity: r.quantity,
        unitPrice: r.unitPrice,
        warehouseId: r.sourceWarehouseId
      })),
      total: totalExport.value
    }
    await orders.addExport(payload)
    alert('✅ Đã lưu phiếu xuất vào database!')
    selectedMode.value = null
  } catch (err) {
    alert('❌ Lỗi khi lưu phiếu xuất. Kiểm tra console.')
    console.error(err)
  }
}

function removeExportRow(idx: number) {
  exportItems.value.splice(idx, 1)
}


const cancelImport = () => {
  selectedMode.value = null
}

const submitImport = async () => {
  try {
    const payload = {
      receiptNo: importForm.receiptNo,
      docDate: importForm.docDate,
      postDate: importForm.postDate,
      supplierName: importForm.supplierName,
      taxCode: importForm.taxCode,
      supplierAddress: importForm.supplierAddress,
      referenceNo: importForm.referenceNo,
      note: importForm.note,
      items: importItems.value.map(r => ({
        itemCode: r.itemCode,
        itemName: r.itemName,
        unit: r.unit,
        quantity: r.quantity ?? 1,
        unitPrice: r.unitPrice,
        salePrice: r.salePrice,
        expiry: r.expiry,
        quality: r.quality,
        warehouseId: r.destWarehouseId
      })),
      total: totalImport.value
    }
    await orders.addImport(payload)
    alert('✅ Đã lưu phiếu nhập vào database!')
    selectedMode.value = null
  } catch (err) {
    alert('❌ Lỗi khi lưu phiếu nhập. Kiểm tra console.')
    console.error(err)
  }
}
</script>

<style scoped>
.transfer-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  padding: 1rem 0;
}

.panel {
  background: #ffffff;
  border: 1px solid #e2e8f0;


  border-radius: 12px;
  padding: 1rem;
  width: min(96vw, 1360px);
  max-width: 1360px;
  margin: 0 auto;
}
.panel h2 { margin: 0 0 0.75rem 0; color: #0f172a; }

.import-form .form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem 1rem;
}
.import-form label { display: grid; gap: 0.25rem; color: #0f172a; }
.import-form label.full { grid-column: 1 / -1; }
.import-form input, .import-form select, .import-form textarea {
  padding: 0.6rem 0.75rem;
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  outline: none;
  color: #0f172a;
  font-weight: 600;
}
.import-form input:focus, .import-form select:focus, .import-form textarea:focus {
  border-color: #94a3b8;
  box-shadow: 0 0 0 2px rgba(148, 163, 184, 0.2);
}
.import-form input::placeholder, .import-form textarea::placeholder {
  color: #64748b;
  font-weight: 500;
}


.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
}
.form-actions .actions { display: flex; gap: 0.5rem; }
.total-box { font-weight: 700; color: #0f172a; }

.btn {
  appearance: none;
  border: none;
  padding: 0.7rem 1.1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}
.btn-primary { background: #3b82f6; color: #fff; }
.btn-primary:hover { background: #2563eb; }
.btn-danger { background: #ef4444; color: #fff; }
.btn-danger:hover { background: #dc2626; }

.items-table select { width: 100%; padding: 0.45rem 0.5rem; border: 1.5px solid #cbd5e1; border-radius: 6px; color: #0f172a; font-weight: 600; background: #fff; }


/* Line items table */
.line-items { margin-top: 1rem; }
.line-items-header { display: flex; align-items: center; justify-content: space-between; margin: 0.25rem 0 0.5rem; }
.table-wrapper { overflow-x: auto; }
.items-table { width: 100%; border-collapse: collapse; }
.items-table th, .items-table td { border: 1px solid #e2e8f0; padding: 0.5rem; white-space: nowrap; }
.items-table th { background: #f8fafc; color: #0f172a; font-weight: 600; }
.items-table input { width: 100%; padding: 0.45rem 0.5rem; border: 1.5px solid #cbd5e1; border-radius: 6px; color: #0f172a; font-weight: 600; }
.items-table input::placeholder { color: #64748b; font-weight: 500; }


@media (max-width: 768px) {
  .import-form .form-grid { grid-template-columns: 1fr; }
}
</style>

