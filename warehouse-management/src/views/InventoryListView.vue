<template>
  <AppLayout>
    <section class="inventory-list">
      <header class="page-header">
        <div class="title">
          <h1>Kho hàng</h1>
          <p>Danh sách các kho hàng và tổng quan hàng hóa</p>
        </div>
        <div class="actions">
          <button class="btn btn-primary" @click="showCreate = true">+ Thêm kho hàng</button>

      <div v-if="showCreate" class="modal-backdrop" @click.self="showCreate = false">
        <div class="modal">
          <h3>Thêm kho hàng</h3>
          <form @submit.prevent="onSubmitCreate">
            <label>Tên kho hàng</label>
            <input v-model="newName" type="text" required placeholder="Ví dụ: Kho C" />
            <label>Địa chỉ</label>
            <input v-model="newLocation" type="text" required placeholder="Ví dụ: Đà Nẵng" />
            <div class="modal-actions">
              <button type="button" class="btn" @click="showCreate = false">Hủy</button>
              <button type="submit" class="btn btn-primary">Lưu</button>
            </div>
          </form>
        </div>
      </div>

        </div>
      </header>

      <div class="warehouses-grid">
        <div v-for="w in warehouses" :key="w.id" class="warehouse-card">
          <div class="warehouse-header">
            <div class="warehouse-title">
              <div class="warehouse-icon">🏬</div>
              <div>
                <h3>{{ w.name }}</h3>
                <p class="location">📍 {{ w.location }}</p>
              </div>
            </div>
          </div>

          <div class="warehouse-stats">
            <div class="stat">
              <div class="stat-number">{{ totalItems(w) }}</div>
              <div class="stat-label">Mặt hàng</div>
            </div>
            <div class="stat">
              <div class="stat-number">{{ totalQuantity(w) }}</div>
              <div class="stat-label">Tổng số lượng</div>
            </div>
          </div>

          <div class="warehouse-actions">
            <button class="btn btn-danger" @click="onDeleteWarehouse(w.id)">Xóa</button>
            <RouterLink :to="`/inventory/${w.id}`" class="btn btn-primary">Xem chi tiết</RouterLink>
          </div>
        </div>
      </div>
    </section>
  </AppLayout>

</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref, onMounted } from 'vue'

import { RouterLink } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'
import { useInventoryStore, type Warehouse } from '../stores/inventory'

const inventory = useInventoryStore()
const { warehouses } = storeToRefs(inventory)

onMounted(() => {
  // Tải dữ liệu kho + hàng hóa từ JSON Server (chỉ 1 lần)
  // Không await để UI không bị chặn; các component sẽ tự cập nhật khi state đổi
  inventory.ensureLoaded()
})

const onDeleteWarehouse = async (id: string) => {
  if (!id) return
  if (!confirm('Bạn có chắc chắn muốn xóa kho hàng này? Tất cả món hàng thuộc kho cũng sẽ bị xóa.')) return
  await inventory.deleteWarehouse(id)
}


const showCreate = ref(false)
const newName = ref('')
const newLocation = ref('')

const onSubmitCreate = async () => {
  const name = newName.value.trim()
  const location = newLocation.value.trim()
  if (!name || !location) return
  const id = await inventory.addWarehouse(name, location)
  if (!id) return
  showCreate.value = false
  newName.value = ''
  newLocation.value = ''
}


const totalItems = (w: Warehouse) => inventory.totalItemsInWarehouse(w)
const totalQuantity = (w: Warehouse) => inventory.totalQuantityInWarehouse(w)
</script>

<style scoped>
.page-header {
  margin-bottom: 1.5rem;
}

.title h1 {
  margin: 0 0 0.25rem 0;
  font-size: 1.8rem;
  color: var(--color-heading);
}

.title p {
  margin: 0;
  color: var(--color-text);
}

.warehouses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
}

.warehouse-card {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
}

.warehouse-header {
  margin-bottom: 0.75rem;
}

.warehouse-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.warehouse-icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  color: white;
  font-size: 1.2rem;
}

.warehouse-title h3 {
  margin: 0 0 2px 0;
  font-size: 1.1rem;
}

.location {
  margin: 0;
  color: var(--color-text);
  font-size: 0.9rem;
}

.warehouse-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.stat {
  padding: 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  text-align: center;
}

.stat-number {
  font-weight: 700;
  color: var(--color-heading);
}

.stat-label {
  color: var(--color-text);
  font-size: 0.85rem;
}

.warehouse-actions {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn {
  appearance: none;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.btn-danger {
  background: #ef4444;
  color: #fff;
}
.btn-danger:hover { filter: brightness(0.95); }


/* Header actions & modal styles */
.page-header { display: flex; align-items: center; justify-content: space-between; }
.actions { display: flex; align-items: center; }

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: grid;
  place-items: center;
  z-index: 1000;
}
.modal {
  width: min(480px, 92vw);
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}
.modal h3 { margin: 0 0 0.75rem 0; color: #000; }
.modal form { display: grid; gap: 0.75rem; }
.modal form label { font-weight: 600; color: #111; }
.modal form input { padding: 0.6rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.25rem; }

.btn-primary:hover {
  filter: brightness(1.05);
}

/* Increase text contrast inside warehouse cards for readability */
.warehouse-card { color: #111; }
.warehouse-card h3 { color: #000; font-weight: 700; }
.warehouse-card .location { color: #111; }
.warehouse-card .stat-number { color: #000; }
.warehouse-card .stat-label { color: #222; font-weight: 500; }

</style>
