<template>
  <AppLayout>
    <section class="inventory-detail" v-if="warehouse">
      <header class="page-header">
        <div class="breadcrumbs">
          <RouterLink to="/inventory" class="breadcrumb">Kho hàng</RouterLink>
          <span class="sep">/</span>
          <span class="current">{{ warehouse.name }}</span>
        </div>
        <h1>{{ warehouse.name }}</h1>
        <p class="location"><span>📍</span> {{ warehouse.location }}</p>
      </header>

      <div class="cards">
        <div class="card">
          <div class="card-number">{{ warehouse.items.length }}</div>
          <div class="card-label">Mặt hàng</div>
        </div>
        <div class="card">
          <div class="card-number">{{ totalQuantity }}</div>
          <div class="card-label">Tổng số lượng</div>
        </div>
      </div>

      <div class="table-wrapper">
        <div class="table-header">
          <h2>Danh sách hàng hóa</h2>
          <div class="controls">
            <button class="btn btn-primary" @click="showAddItem = true">+ Thêm món hàng</button>
            <input v-model="keyword" type="text" class="search" placeholder="Tìm kiếm theo tên hoặc SKU..." />
          </div>
        </div>
        <div v-if="showAddItem" class="modal-backdrop" @click.self="showAddItem = false">
          <div class="modal">
            <h3>Thêm món hàng</h3>
            <form @submit.prevent="onSubmitAddItem">
              <label>Tên hàng hóa</label>
              <input v-model="newItemName" type="text" required placeholder="Ví dụ: Thùng carton" />
              <label>SKU</label>
              <input v-model="newItemSku" type="text" required placeholder="Ví dụ: BOX-604040" />
              <div class="grid-2">
                <div>
                  <label>Số lượng</label>
                  <input v-model.number="newItemQuantity" type="number" min="0" required placeholder="0" />
                </div>
                <div>
                  <label>Đơn vị</label>
                  <input v-model="newItemUnit" type="text" required placeholder="cái, cuộn, ..." />
                </div>
              </div>
              <label>Danh mục (tùy chọn)</label>
              <input v-model="newItemCategory" type="text" placeholder="Ví dụ: Bao bì" />
              <div class="modal-actions">
                <button type="button" class="btn" @click="showAddItem = false">Hủy</button>
                <button type="submit" class="btn btn-primary">Lưu</button>
              </div>
            </form>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Tên hàng hóa</th>
              <th>SKU</th>
              <th class="text-right">Số lượng</th>
              <th>Đơn vị</th>
              <th>Danh mục</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredItems" :key="item.id">
              <td>{{ item.name }}</td>
              <td><code>{{ item.sku }}</code></td>
              <td class="text-right">{{ item.quantity }}</td>
              <td>{{ item.unit }}</td>
              <td>{{ item.category || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-else class="not-found">
      <AppLayout>
        <div class="not-found-card">
          <h2>Không tìm thấy kho hàng</h2>
          <RouterLink to="/inventory" class="btn btn-primary">Quay lại danh sách kho</RouterLink>
        </div>
      </AppLayout>
    </section>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'
import { useInventoryStore } from '../stores/inventory'

const route = useRoute()
const store = useInventoryStore()

onMounted(() => {
  store.ensureLoaded()
})
const id = computed(() => String(route.params.id))
const warehouse = computed(() => store.getWarehouseById(id.value))

const totalQuantity = computed(() => {
  return warehouse.value ? warehouse.value.items.reduce((sum, i) => sum + i.quantity, 0) : 0
})

const keyword = ref('')
const filteredItems = computed(() => {
  if (!warehouse.value) return []
  const k = keyword.value.trim().toLowerCase()
  if (!k) return warehouse.value.items
  return warehouse.value.items.filter(i =>
    i.name.toLowerCase().includes(k) || i.sku.toLowerCase().includes(k)
  )
})

// State & handler for adding item
const showAddItem = ref(false)
const newItemName = ref('')
const newItemSku = ref('')
const newItemQuantity = ref<number>(0)
const newItemUnit = ref('')
const newItemCategory = ref('')

const onSubmitAddItem = async () => {
  if (!warehouse.value) return
  const name = newItemName.value.trim()
  const sku = newItemSku.value.trim()
  const unit = newItemUnit.value.trim()
  const qty = Number(newItemQuantity.value) || 0
  if (!name || !sku || !unit) return
  const id = await store.addItemToWarehouse(warehouse.value.id, {
    name,
    sku,
    quantity: qty,
    unit,
    category: newItemCategory.value.trim() || undefined
  })
  if (!id) return
  showAddItem.value = false
  newItemName.value = ''
  newItemSku.value = ''
  newItemQuantity.value = 0
  newItemUnit.value = ''
  newItemCategory.value = ''
}

</script>

<style scoped>
.page-header {
  margin-bottom: 1rem;
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text);
  margin-bottom: 0.25rem;
}

.breadcrumb {
  color: var(--color-text);
  text-decoration: none;
}

.sep {
  opacity: 0.6;
}

.location {
  color: var(--color-text);
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin: 1rem 0 1.5rem;
}

.card {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
}

.card-number {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--color-heading);
}

.card-label {
  color: var(--color-text);
}

.table-wrapper {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
}

.search {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
}

.items-table thead th {
  text-align: left;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border-bottom: 1px solid var(--color-border);
}

.items-table tbody td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.text-right { text-align: right; }

.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
}

.not-found-card {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
}

.btn {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  text-decoration: none;
}

.btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }

/* Increase text contrast to black/darker tones for readability on white background */
.page-header h1 { color: #000; font-weight: 800; }
.breadcrumbs, .breadcrumb, .current, .location { color: #111; }
.breadcrumb:hover { color: #000; }

.cards .card-number { color: #000; }
.cards .card-label { color: #222; font-weight: 500; }

.table-header h2 { color: #000; }
.items-table thead th { color: #000; }
.items-table tbody td { color: #111; }
.items-table code { color: #000; font-weight: 600; }


/* Controls + Modal styles */
.table-header .controls { display: flex; align-items: center; gap: 0.5rem; }
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: grid; place-items: center; z-index: 1000; }
.modal { width: min(520px, 92vw); background: #fff; border: 1px solid var(--color-border); border-radius: 12px; padding: 1rem; box-shadow: 0 10px 30px rgba(0,0,0,0.15); }
.modal h3 { margin: 0 0 0.75rem 0; color: #000; }
.modal form { display: grid; gap: 0.75rem; }
.modal form label { font-weight: 600; color: #111; }
.modal form input { padding: 0.6rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; }
.modal .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.25rem; }

</style>
