<template>
  <header class="app-header">
    <div class="header-container">
      <!-- Logo Section -->
      <div class="logo-section">
        <router-link to="/" class="logo-link">
          <div class="logo">
            <span class="logo-icon">📦</span>
            <span class="logo-text">Hệ thống quản lý kho hàng</span>
          </div>
        </router-link>
      </div>

      <!-- Navigation Menu -->
      <nav class="main-nav" v-if="user">
        <ul class="nav-list">
          <li class="nav-item">
            <router-link to="/" class="nav-link">
              <span class="nav-icon">🏠</span>
              Trang chủ
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/inventory" class="nav-link">
              <span class="nav-icon">📦</span>
              Kho hàng
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/orders" class="nav-link">
              <span class="nav-icon">📋</span>
              Đơn hàng
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/reports" class="nav-link">
              <span class="nav-icon">📊</span>
              Báo cáo
            </router-link>
          </li>
          <li class="nav-item">
            <button class="nav-link nav-button" @click="showTransferModal = true">
              <span class="nav-icon">↔️</span>
              Xuất/Nhập
            </button>
          </li>

        </ul>
      </nav>

      <!-- User Section -->
      <div class="user-section" v-if="user">
        <div class="user-info">
          <span class="user-avatar">👤</span>
          <span class="user-name">{{ user.username }}</span>
        </div>
        <div class="user-actions">
          <button @click="handleLogout" class="logout-btn">
            <span class="logout-icon">🚪</span>
            Đăng xuất
          </button>
        </div>
      </div>

      <!-- Mobile Menu Toggle -->
      <button
        class="mobile-menu-toggle"
        @click="toggleMobileMenu"
        v-if="user"
      >
        <span class="hamburger"></span>
        <span class="hamburger"></span>
        <span class="hamburger"></span>
      </button>
    </div>

    <!-- Transfer Modal in Header -->
    <div v-if="showTransferModal" class="modal-backdrop" @click.self="showTransferModal = false">
      <div class="modal">
        <h3>Xuất/Nhập hàng</h3>
        <div class="transfer-actions">
          <button class="btn" @click="onTransferSelect('import')">Nhập hàng</button>
          <button class="btn btn-danger" @click="onTransferSelect('export')">Xuất hàng</button>
        </div>
        <p v-if="transferMode" class="transfer-note">
          Bạn đã chọn: {{ transferMode === 'import' ? 'Nhập hàng' : 'Xuất hàng' }}
        </p>
        <div class="modal-actions">
          <button type="button" class="btn" @click="showTransferModal = false">Đóng</button>
        </div>
      </div>
    </div>


    <!-- Mobile Navigation -->
    <nav class="mobile-nav" :class="{ 'mobile-nav--open': isMobileMenuOpen }" v-if="user">
      <ul class="mobile-nav-list">
        <li class="mobile-nav-item">
          <router-link to="/" class="mobile-nav-link" @click="closeMobileMenu">
            <span class="nav-icon">🏠</span>
            Trang chủ
          </router-link>
        </li>
        <li class="mobile-nav-item">
          <router-link to="/inventory" class="mobile-nav-link" @click="closeMobileMenu">
            <span class="nav-icon">📦</span>
            Kho hàng
          </router-link>
        </li>
        <li class="mobile-nav-item">
          <router-link to="/orders" class="mobile-nav-link" @click="closeMobileMenu">
            <span class="nav-icon">📋</span>
            Đơn hàng
          </router-link>
        </li>
        <li class="mobile-nav-item">
          <router-link to="/reports" class="mobile-nav-link" @click="closeMobileMenu">
            <span class="nav-icon">📊</span>
            Báo cáo


          </router-link>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref<any>(null)
const isMobileMenuOpen = ref(false)

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

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

// Transfer state in header
const showTransferModal = ref(false)
type TransferMode = 'import' | 'export' | null
const transferMode = ref<TransferMode>(null)
const onTransferSelect = (mode: 'import' | 'export') => { transferMode.value = mode }

</script>

<style scoped>
.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);


  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  max-width: none; /* full width */
  width: 100%;
  margin: 0 0px; /* không canh giữa */
  padding: 0 12px; /* chừa hai bên một khoảng nhỏ cho đẹp mắt */
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 70px;
}

/* Logo Section */
.logo-section {
  flex-shrink: 0;
}

.logo-link {
  text-decoration: none;
  color: inherit;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  font-size: 1.8rem;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

/* Navigation */
.main-nav {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem;
}

.nav-item {
  position: relative;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateY(-1px);
}

.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.nav-icon {
  font-size: 1.1rem;
}

/* User Section */
.user-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 25px;
}

.user-avatar {
  font-size: 1.2rem;
}

.user-name {
  font-weight: 500;
  font-size: 0.9rem;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.logout-icon {
  font-size: 1rem;
}

/* Mobile Menu Toggle */
.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  gap: 3px;
}

.hamburger {
  width: 20px;
  height: 2px;
  background: white;
  transition: 0.3s;
}

/* Mobile Navigation */
.mobile-nav {
  display: none;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.mobile-nav--open {
  display: block;
}

.mobile-nav-list {
  list-style: none;
  margin: 0;
  padding: 1rem 2rem;
}

.mobile-nav-item {
  margin-bottom: 0.5rem;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  text-decoration: none;
  color: white;
  border-radius: 8px;
  transition: background 0.3s ease;
}

.mobile-nav-link:hover,
.mobile-nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.1);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .main-nav {
    display: none;
  }

  .mobile-menu-toggle {
    display: flex;
  }

  .mobile-nav {
    display: none;
  }

  .user-info {
    display: none;
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 8px; /* chừa hai bên nhỏ trên mobile */
    min-height: 60px;
  }

  .logo-text {
    font-size: 1.2rem;
  }

  .logo-icon {
    font-size: 1.5rem;
  }

  .logout-btn {
    padding: 0.5rem 0.8rem;
    font-size: 0.9rem;
  }
}


/* Header transfer modal + button styling */
.nav-button { background: none; border: none; cursor: pointer; font: inherit; color: inherit; }
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.55); backdrop-filter: blur(2px); display: grid; place-items: center; z-index: 1200; }
.modal { width: min(480px, 92vw); background: #fff; border: 1px solid rgba(0,0,0,0.1); border-radius: 12px; padding: 1rem; box-shadow: 0 10px 30px rgba(0,0,0,0.15); color: #000; }
.modal h3 { margin: 0 0 0.75rem 0; color: #000; }
.transfer-actions { display: flex; gap: 0.5rem; justify-content: center; margin: 0.5rem 0 0.75rem; }
.transfer-note { color: #000; margin: 0.25rem 0 0; text-align: center; }
.modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.25rem; }
.btn { appearance: none; border: none; padding: 0.6rem 1rem; border-radius: 8px; cursor: pointer; background: #e2e8f0; color: #000; }
.btn.btn-danger { background: #ef4444; color: #fff; }

@media (max-width: 480px) {
  .logo-text {
    display: none;
  }
}
</style>
