import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('redirects unauthenticated users from /pos to /login', async ({ page }) => {
    await page.goto('/pos');
    await expect(page).toHaveURL(/\/login/);
  });

  test('login with admin credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/username/i).fill('admin');
    await page.getByLabel(/password/i).fill('admin');
    await page.getByRole('button', { name: /sign in|login/i }).click();
    // Admin should land on admin dashboard or pos session
    await expect(page).toHaveURL(/\/(admin|pos)/);
  });

  test('login with cashier credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/username/i).fill('cashier');
    await page.getByLabel(/password/i).fill('cashier');
    await page.getByRole('button', { name: /sign in|login/i }).click();
    await expect(page).toHaveURL(/\/pos/);
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/username/i).fill('wrong');
    await page.getByLabel(/password/i).fill('wrong');
    await page.getByRole('button', { name: /sign in|login/i }).click();
    await expect(page.getByText(/invalid|incorrect|failed/i)).toBeVisible();
  });

  test('logout returns to login page', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/username/i).fill('cashier');
    await page.getByLabel(/password/i).fill('cashier');
    await page.getByRole('button', { name: /sign in|login/i }).click();
    await page.getByRole('button', { name: /logout/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
