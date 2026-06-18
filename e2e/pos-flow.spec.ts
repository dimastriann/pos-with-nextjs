import { test, expect } from '@playwright/test';

// Log in as cashier before each test
test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/username/i).fill('cashier');
  await page.getByLabel(/password/i).fill('cashier');
  await page.getByRole('button', { name: /sign in|login/i }).click();
  await page.waitForURL(/\/pos/);
});

test.describe('Session gate', () => {
  test('shows session gate page', async ({ page }) => {
    await expect(page).toHaveURL(/\/pos\/session/);
    await expect(
      page.getByRole('heading', { name: /cash register/i }),
    ).toBeVisible();
  });

  test('can open or resume a session', async ({ page }) => {
    const resumeBtn = page.getByRole('button', { name: /resume session/i });
    const openBtn = page.getByRole('button', {
      name: /open cash register|open new session/i,
    });
    // One of the two buttons must be visible
    await expect(resumeBtn.or(openBtn)).toBeVisible();
    await resumeBtn.or(openBtn).first().click();
    await expect(page).toHaveURL(/\/pos$/);
  });
});

test.describe('POS order screen', () => {
  test.beforeEach(async ({ page }) => {
    // Open / resume session
    const resumeBtn = page.getByRole('button', { name: /resume session/i });
    const openBtn = page.getByRole('button', {
      name: /open cash register|open new session/i,
    });
    await resumeBtn.or(openBtn).first().click();
    await page.waitForURL(/\/pos$/);
  });

  test('product grid is visible', async ({ page }) => {
    // On desktop the grid should show products
    await expect(page.getByText(/search products/i)).toBeVisible();
  });

  test('add product to cart', async ({ page }) => {
    // Click first product card
    const firstCard = page.locator('[data-testid="product-card"]').first();
    // Fallback: any card in the product grid
    const card = firstCard.or(
      page.locator('.grid > div').first(),
    );
    await card.click();
    // Cart should show at least one item
    await expect(page.getByText(/Rp/)).toBeVisible();
  });

  test('barcode manual scan input is present', async ({ page }) => {
    await expect(
      page.getByPlaceholder(/scan or type barcode/i),
    ).toBeVisible();
  });

  test('proceeds to payment screen', async ({ page }) => {
    // Add a product first
    const card = page.locator('.grid > div').first();
    await card.click();
    // Click Payment button in numpad
    await page.getByRole('button', { name: /^payment$/i }).click();
    await expect(page.getByText(/order summary/i)).toBeVisible();
  });
});

test.describe('Payment flow', () => {
  test.beforeEach(async ({ page }) => {
    const resumeBtn = page.getByRole('button', { name: /resume session/i });
    const openBtn = page.getByRole('button', {
      name: /open cash register|open new session/i,
    });
    await resumeBtn.or(openBtn).first().click();
    await page.waitForURL(/\/pos$/);
    // Add a product and go to payment
    await page.locator('.grid > div').first().click();
    await page.getByRole('button', { name: /^payment$/i }).click();
  });

  test('payment screen shows order total', async ({ page }) => {
    await expect(page.getByText(/total/i)).toBeVisible();
    await expect(page.getByText(/Rp/)).toBeVisible();
  });

  test('can select payment method and pay', async ({ page }) => {
    // Select first available payment method
    const method = page
      .locator('button')
      .filter({ hasText: /cash|bank|e-wallet/i })
      .first();
    await method.click();
    // Click Pay
    await page.getByRole('button', { name: /pay/i }).click();
    // Should land on receipt
    await expect(
      page.getByRole('button', { name: /new order/i }),
    ).toBeVisible();
  });
});
