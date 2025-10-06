<template>
  <AppLayout>
    <section class="orders-page">
      <header class="page-header">
        <div class="title">
          <h1>Đơn hàng</h1>
          <p>Danh sách tất cả phiếu nhập/xuất đã lưu</p>
        </div>
      </header>

      <div class="table-wrapper">
        <table class="orders-table">
          <thead>
            <tr>
              <th>Loại phiếu</th>
              <th>Số phiếu</th>
              <th>Ngày</th>
              <th>Kho</th>
              <th class="text-right">Số dòng</th>
              <th class="text-right">Tổng tiền</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in rows" :key="r.id">
              <td>{{ typeLabel(r.type) }}</td>
              <td>{{ r.receiptNo }}</td>
              <td>{{ r.docDate }}</td>
              <td>{{ warehouseName(r.warehouseId) }}</td>
              <td class="text-right">{{ r.itemsCount }}</td>
              <td class="text-right">{{ fmtVND(r.total) }}</td>
            </tr>
            <tr v-if="rows.length === 0">
              <td colspan="6" class="empty">Chưa có phiếu nào. Hãy lưu phiếu ở mục Xuất/Nhập.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import AppLayout from '../components/AppLayout.vue'
import { useOrdersStore } from '../stores/orders'
import { useInventoryStore } from '../stores/inventory'

const orders = useOrdersStore()
const inventory = useInventoryStore()

onMounted(() => { inventory.ensureLoaded() })

const rows = computed(() => orders.allReceipts)

function typeLabel(t: 'import' | 'export') {
  return t === 'import' ? 'Phiếu nhập' : 'Phiếu xuất'
}
function warehouseName(id?: string) {
  if (!id) return ''
  const w = inventory.warehouses.find(x => x.id === id)
  return w ? w.name : ''
}
function fmtVND(n: number) {
  return (n || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.table-wrapper { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
.orders-table { width: 100%; border-collapse: collapse; }
.orders-table th, .orders-table td { padding: 0.75rem 0.9rem; border-bottom: 1px solid #f1f5f9; }
.orders-table thead th { background: #f8fafc; color: #0f172a; text-align: left; }
.text-right { text-align: right; }
.empty { text-align: center; color: #64748b; }
</style>

