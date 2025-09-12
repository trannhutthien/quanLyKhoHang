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
          <input v-model="keyword" type="text" class="search" placeholder="Tìm kiếm theo tên hoặc SKU..." />
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
import { computed, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'
import { useInventoryStore } from '../stores/inventory'

const route = useRoute()
const store = useInventoryStore()
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

</style>
