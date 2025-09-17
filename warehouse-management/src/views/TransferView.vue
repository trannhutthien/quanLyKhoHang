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
    </section>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import AppLayout from '../components/AppLayout.vue'
import { useInventoryStore } from '../stores/inventory'

const store = useInventoryStore()
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
}

const cancelImport = () => {
  selectedMode.value = null
}

const submitImport = () => {
  // Tạm thời chỉ log dữ liệu — sẽ kết nối API/lưu state theo yêu cầu sau
  console.log('Import form data:', { ...importForm })
  alert('Đã lưu tạm thông tin phiếu nhập (demo).')
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

