<template>
  <AppLayout>
    <section class="transfer-page">
      <div class="transfer-actions">
        <button class="btn btn-primary" @click="onSelect('import')">Nhập hàng</button>
        <button class="btn btn-danger" @click="onSelect('export')">Xuất hàng</button>
      </div>
    </section>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '../components/AppLayout.vue'

const onSelect = (mode: 'import' | 'export') => {
  // TODO: điều hướng tới form chi tiết hoặc mở bước tiếp theo
  console.log('Transfer mode selected:', mode)
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
</style>

