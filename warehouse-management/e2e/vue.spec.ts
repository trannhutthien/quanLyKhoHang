import { test, expect } from '@playwright/test';

test('redirects to login when not authenticated', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/.*\/login/);
  await expect(page.locator('h1')).toHaveText('Đăng nhập');
});

test('can login with credentials', async ({ page }) => {
  await page.goto('/login');

  // Fill login form (default test credentials)
  await page.fill('#username', 'admin');
  await page.fill('#password', '123456');

  // Submit form
  await page.click('button[type="submit"]');

  // Should redirect to home page
  await expect(page).toHaveURL('/');
  await expect(page.locator('h1')).toHaveText('Hệ thống quản lý kho hàng');
});
