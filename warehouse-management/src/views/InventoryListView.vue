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
            <input v-model="newName" type="text" placeholder="Ví dụ: Kho C" :disabled="createLoading" />
            <div v-if="createErrors.name" class="error-message">{{ createErrors.name }}</div>
            <label>Địa chỉ</label>
            <input v-model="newLocation" type="text" placeholder="Ví dụ: Đà Nẵng" :disabled="createLoading" />
            <div v-if="createErrors.location" class="error-message">{{ createErrors.location }}</div>
            <div v-if="createErrors.general" class="error-message">{{ createErrors.general }}</div>
            <div class="modal-actions">
              <button type="button" class="btn" @click="showCreate = false" :disabled="createLoading">Hủy</button>
              <button type="submit" class="btn btn-primary" :disabled="createLoading">
                <span v-if="createLoading">Đang lưu...</span>
                <span v-else>Lưu</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal xác thực xóa kho -->

      <div v-if="showDeleteAuth" class="modal-backdrop" @click.self="cancelDeleteAuth">
        <div class="modal">
          <h3>Xác nhận xóa kho hàng</h3>
          <p>Nhập tài khoản và mật khẩu để xác nhận thao tác này.</p>
          <form @submit.prevent="onSubmitAuthDelete">
            <label>Tên đăng nhập</label>
            <input v-model="authUsername" type="text" required :disabled="authLoading" />
            <label>Tên kho hàng</label>
            <input v-model="authWarehouseName" type="text" required :disabled="authLoading" />

            <label>Mật khẩu</label>
            <input v-model="authPassword" type="password" required :disabled="authLoading" />
            <div v-if="authError" class="error-message">{{ authError }}</div>
            <div class="modal-actions">
              <button type="button" class="btn" @click="cancelDeleteAuth" :disabled="authLoading">Hủy</button>
              <button type="submit" class="btn btn-danger" :disabled="authLoading">Xóa</button>
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
import { ref, onMounted, reactive } from 'vue'

import { RouterLink } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'
import axios from 'axios'
const API_BASE = (typeof window !== 'undefined' && window.location?.hostname)
  ? `http://${window.location.hostname}:3001`
  : 'http://localhost:3001'

import { useInventoryStore, type Warehouse } from '../stores/inventory'

const inventory = useInventoryStore()
const { warehouses } = storeToRefs(inventory)

onMounted(() => {
  // Tải dữ liệu kho + hàng hóa từ JSON Server (chỉ 1 lần)
  // Không await để UI không bị chặn; các component sẽ tự cập nhật khi state đổi
  inventory.ensureLoaded()
})

// Xác thực trước khi xóa kho
const showDeleteAuth = ref(false)
const deletingWarehouseId = ref<string | null>(null)
const authUsername = ref('')
const authPassword = ref('')
const authError = ref('')
const authLoading = ref(false)
const authWarehouseName = ref('')



const onDeleteWarehouse = (id: string) => {
  if (!id) return
  deletingWarehouseId.value = id
  authUsername.value = ''
  authPassword.value = ''
  authWarehouseName.value = ''
  authError.value = ''
  showDeleteAuth.value = true
}

const cancelDeleteAuth = () => {
  showDeleteAuth.value = false
  deletingWarehouseId.value = null
  authUsername.value = ''
  authPassword.value = ''
  authWarehouseName.value = ''
  authError.value = ''
}

const onSubmitAuthDelete = async () => {
  if (!deletingWarehouseId.value) return
  authError.value = ''
  // Kiểm tra nhập đủ cả 3 trường
  if (!authWarehouseName.value.trim()) {
    authError.value = 'Vui lòng nhập tên kho hàng cần xóa'
    return
  }
  if (!authUsername.value.trim() || !authPassword.value) {
    authError.value = 'Vui lòng nhập đầy đủ tài khoản và mật khẩu'
    return
  }
  authLoading.value = true
  try {
    // 1) Kiểm tra tên kho từ db.json
    const wid = deletingWarehouseId.value
    const wResp = await axios.get(`${API_BASE}/warehouses/${encodeURIComponent(wid)}`)
    const currentName = (wResp?.data?.name || '').trim()
    if (!currentName || currentName !== authWarehouseName.value.trim()) {
      authError.value = 'Tên kho hàng không khớp'
      return
    }

    // 2) Xác thực user
    const resp = await axios.get(`${API_BASE}/users`, {
      params: { username: authUsername.value.trim(), password: authPassword.value }
    })
    const users = Array.isArray(resp.data) ? resp.data : []
    if (users.length === 0) {
      authError.value = 'Tài khoản hoặc mật khẩu không đúng'
      return
    }

    // 3) Thực hiện xóa
    await inventory.deleteWarehouse(deletingWarehouseId.value)
    cancelDeleteAuth()
  } catch (e) {
    console.error(e)
    authError.value = 'Không thể kết nối tới máy chủ. Hãy chạy JSON Server.'
  } finally {
    authLoading.value = false
  }
}



const showCreate = ref(false)
const newName = ref('')
const newLocation = ref('')
const createLoading = ref(false)
const createErrors = reactive<{ name: string; location: string; general: string }>({ name: '', location: '', general: '' })

const onSubmitCreate = async () => {
  createErrors.name = ''
  createErrors.location = ''
  createErrors.general = ''
  const name = newName.value.trim()
  const location = newLocation.value.trim()
  if (!name) createErrors.name = 'Vui lòng nhập tên kho hàng'
  if (!location) createErrors.location = 'Vui lòng nhập địa chỉ kho'
  if (createErrors.name || createErrors.location) return
  createLoading.value = true
  try {
    const id = await inventory.addWarehouse(name, location)
    if (!id) {
      createErrors.general = 'Không thể lưu kho hàng. Vui lòng thử lại hoặc kiểm tra JSON Server.'
      return
    }
    showCreate.value = false
    newName.value = ''
    newLocation.value = ''
  } catch (e) {
    console.error(e)
    createErrors.general = 'Có lỗi xảy ra khi lưu. Vui lòng thử lại.'
  } finally {
    createLoading.value = false
  }
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
  .error-message { background:#fee; color:#c53030; border:1px solid #fed7d7; padding:0.5rem; border-radius:6px; font-size:0.9rem; }

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
