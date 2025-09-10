<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref<any>(null)

onMounted(() => {
  const userData = localStorage.getItem('user')
  if (userData) {
    user.value = JSON.parse(userData)
  }
})

const handleLogout = () => {
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<template>
  <div class="home">
    <header class="header">
      <div class="header-content">
        <h1>Hệ thống quản lý kho hàng</h1>
        <div class="user-info">
          <span v-if="user">Xin chào, {{ user.username }}!</span>
          <button @click="handleLogout" class="logout-btn">Đăng xuất</button>
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="welcome-section">
        <h2>Chào mừng đến với hệ thống quản lý kho</h2>
        <p>Quản lý hiệu quả hàng tồn kho, đơn hàng và logistics của bạn</p>
      </div>

      <div class="features-grid">
        <div class="feature-card">
          <h3>📦 Quản lý hàng tồn kho</h3>
          <p>Theo dõi số lượng, vị trí và trạng thái hàng hóa</p>
        </div>

        <div class="feature-card">
          <h3>📋 Quản lý đơn hàng</h3>
          <p>Xử lý đơn hàng từ nhận đến giao hàng</p>
        </div>

        <div class="feature-card">
          <h3>🚚 Logistics</h3>
          <p>Tối ưu hóa vận chuyển và phân phối</p>
        </div>

        <div class="feature-card">
          <h3>📊 Báo cáo</h3>
          <p>Phân tích dữ liệu và tạo báo cáo chi tiết</p>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  background-color: var(--color-background);
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

.welcome-section {
  text-align: center;
  margin-bottom: 3rem;
}

.welcome-section h2 {
  color: var(--color-heading);
  margin-bottom: 1rem;
  font-size: 2rem;
}

.welcome-section p {
  color: var(--color-text);
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid var(--color-border);
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.feature-card h3 {
  color: var(--color-heading);
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.feature-card p {
  color: var(--color-text);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .header h1 {
    font-size: 1.5rem;
  }

  .main-content {
    padding: 2rem 1rem;
  }

  .welcome-section h2 {
    font-size: 1.5rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
