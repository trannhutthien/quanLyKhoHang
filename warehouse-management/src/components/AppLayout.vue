<template>
  <div class="app-layout">
    <AppHeader />
    
    <main class="main-content">
      <div class="content-container">
        <slot />
      </div>
    </main>
    
    <footer class="app-footer" v-if="showFooter">
      <div class="footer-container">
        <div class="footer-content">
          <div class="footer-section">
            <h4>Hệ thống quản lý kho hàng</h4>
            <p>Giải pháp toàn diện cho quản lý kho bãi hiện đại</p>
          </div>
          
          <div class="footer-section">
            <h4>Liên kết nhanh</h4>
            <ul class="footer-links">
              <li><router-link to="/">Trang chủ</router-link></li>
              <li><router-link to="/inventory">Kho hàng</router-link></li>
              <li><router-link to="/orders">Đơn hàng</router-link></li>
              <li><router-link to="/reports">Báo cáo</router-link></li>
            </ul>
          </div>
          
          <div class="footer-section">
            <h4>Hỗ trợ</h4>
            <ul class="footer-links">
              <li><a href="#" @click.prevent>Hướng dẫn sử dụng</a></li>
              <li><a href="#" @click.prevent>Liên hệ hỗ trợ</a></li>
              <li><a href="#" @click.prevent>Báo lỗi</a></li>
            </ul>
          </div>
          
          <div class="footer-section">
            <h4>Thông tin</h4>
            <p class="footer-info">
              <span>📧 support@warehouse.com</span>
              <span>📞 (84) 123-456-789</span>
              <span>📍 Hà Nội, Việt Nam</span>
            </p>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>&copy; 2024 Hệ thống quản lý kho hàng. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './AppHeader.vue'

const route = useRoute()

// Hide footer on login page
const showFooter = computed(() => {
  return route.name !== 'login'
})
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-background);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content-container {
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 2rem;
}

/* Footer Styles */
.app-footer {
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  color: white;
  margin-top: auto;
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 3rem 2rem 1rem;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section h4 {
  color: white;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.footer-section p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin: 0;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 0.5rem;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: white;
}

.footer-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-info span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1.5rem;
  text-align: center;
}

.footer-bottom p {
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-size: 0.9rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .content-container {
    padding: 1rem;
  }
  
  .footer-container {
    padding: 2rem 1rem 1rem;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .footer-info {
    gap: 0.75rem;
  }
}

@media (max-width: 480px) {
  .content-container {
    padding: 0.5rem;
  }
  
  .footer-section h4 {
    font-size: 1rem;
  }
}
</style>
