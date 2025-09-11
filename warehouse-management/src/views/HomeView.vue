<script setup lang="ts">
import AppLayout from '../components/AppLayout.vue'
</script>

<template>
  <AppLayout>
    <div class="home">
      <div class="welcome-section">
        <h1>Chào mừng đến với hệ thống quản lý kho</h1>
        <p>Quản lý hiệu quả hàng tồn kho, đơn hàng và logistics của bạn</p>
      </div>

      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-content">
            <h3>1,234</h3>
            <p>Sản phẩm trong kho</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📋</div>
          <div class="stat-content">
            <h3>56</h3>
            <p>Đơn hàng chờ xử lý</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🚚</div>
          <div class="stat-content">
            <h3>23</h3>
            <p>Đang vận chuyển</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <h3>189</h3>
            <p>Hoàn thành hôm nay</p>
          </div>
        </div>
      </div>

      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-header">
            <span class="feature-icon">📦</span>
            <h3>Quản lý hàng tồn kho</h3>
          </div>
          <p>Theo dõi số lượng, vị trí và trạng thái hàng hóa trong thời gian thực</p>
          <div class="feature-actions">
            <button class="feature-btn">Xem chi tiết</button>
          </div>
        </div>

        <div class="feature-card">
          <div class="feature-header">
            <span class="feature-icon">📋</span>
            <h3>Quản lý đơn hàng</h3>
          </div>
          <p>Xử lý đơn hàng từ nhận đến giao hàng một cách hiệu quả</p>
          <div class="feature-actions">
            <button class="feature-btn">Xem chi tiết</button>
          </div>
        </div>

        <div class="feature-card">
          <div class="feature-header">
            <span class="feature-icon">🚚</span>
            <h3>Logistics</h3>
          </div>
          <p>Tối ưu hóa vận chuyển và phân phối hàng hóa</p>
          <div class="feature-actions">
            <button class="feature-btn">Xem chi tiết</button>
          </div>
        </div>

        <div class="feature-card">
          <div class="feature-header">
            <span class="feature-icon">📊</span>
            <h3>Báo cáo & Phân tích</h3>
          </div>
          <p>Phân tích dữ liệu và tạo báo cáo chi tiết về hoạt động kho</p>
          <div class="feature-actions">
            <button class="feature-btn">Xem chi tiết</button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.home {
  width: 100%;
}

.welcome-section {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem 0;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%);
  border-radius: 16px;
  margin-bottom: 3rem;
}

.welcome-section h1 {
  color: var(--color-heading);
  margin-bottom: 1rem;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-section p {
  color: var(--color-text);
  font-size: 1.2rem;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.stat-content h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-heading);
}

.stat-content p {
  margin: 0;
  color: var(--color-text);
  font-size: 0.9rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.feature-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.feature-icon {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.feature-header h3 {
  color: var(--color-heading);
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.feature-card p {
  color: var(--color-text);
  line-height: 1.6;
  margin-bottom: 1.5rem;
  flex: 1;
}

.feature-actions {
  margin-top: auto;
}

.feature-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  width: 100%;
}

.feature-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

@media (max-width: 768px) {
  .welcome-section h1 {
    font-size: 2rem;
  }

  .welcome-section p {
    font-size: 1.1rem;
  }

  .stats-section {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }

  .stat-card {
    padding: 1rem;
    flex-direction: column;
    text-align: center;
  }

  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .welcome-section {
    padding: 1.5rem 1rem;
  }

  .welcome-section h1 {
    font-size: 1.8rem;
  }

  .stats-section {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
