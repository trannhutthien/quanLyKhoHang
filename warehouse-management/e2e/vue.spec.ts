import { test, expect } from '@playwright/test';

test('redirects to login when not authenticated', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/.*\/login/);
  await expect(page.locator('h1')).toHaveText('Đăng nhập');
});

test('can login with credentials', async ({ page }) => {
  await page.goto('/login');

  // Fill login form
  await page.fill('#username', 'testuser');
  await page.fill('#password', 'testpass');

  // Submit form
  await page.click('button[type="submit"]');

  // Should redirect to home page
  await expect(page).toHaveURL('/');
  await expect(page.locator('h1')).toHaveText('Hệ thống quản lý kho hàng');
});
