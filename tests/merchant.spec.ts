import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';

// Memuat variabel environment dari file .env
dotenv.config();

// =====================================================================
// PENGUJIAN MERCHANT LIST
// =====================================================================
test.describe('Fitur Halaman Merchant List', () => {

  // --- BEFORE EACH: Setup Login & Masuk ke Menu ---
  test.beforeEach(async ({ page }) => {
    // URL, Email, dan Password menggunakan .env
    await page.goto(`${process.env.BASE_URL}/login`);
    await page.getByRole('textbox', { name: 'Enter your email address' }).fill(process.env.LOGIN_EMAIL as string);
    await page.getByRole('textbox', { name: 'Enter your password' }).fill(process.env.LOGIN_PASSWORD as string);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Tunggu loading pop-up dan masuk home
    await expect(page).toHaveURL(`${process.env.BASE_URL}/splashscreen`);
    await expect(page.getByText('Login successfully')).toBeVisible();
    await expect(page).toHaveURL(`${process.env.BASE_URL}/home`);

    // Masuk ke Merchant List
    await page.getByRole('button', { name: 'Merchant' }).click();
    await page.getByRole('link', { name: 'Merchant List' }).click();
    await expect(page).toHaveURL(/.*merchant\/list/);
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 15000 });
  });

  // --- SKENARIO 1: FITUR SEARCH 
  test('Fitur Search (Positif & Negatif)', async ({ page }) => {
    await page.getByPlaceholder('Search').fill('merdeka');
    await page.getByPlaceholder('Search').press('Enter');
    await page.waitForTimeout(2000);
    await expect(page.getByRole('row', { name: /Merdeka Outlet/i }).first()).toBeVisible();
    await expect(page.getByText('MRCHN-007')).toBeVisible();
    await expect(page.getByText('CPSH-008')).toBeVisible();

    // Negatif: Cari data random "ssss"
    await page.getByPlaceholder('Search').clear();
    await page.getByPlaceholder('Search').fill('ssss');
    await expect(page.getByText('No Merchants Found')).toBeVisible();
  });

  // --- SKENARIO 2: FITUR FILTER 
  test('Fitur Filter Merchant Type & Category', async ({ page }) => {
    // 1. Filter Merchant Type -> Pilih Provider
    await page.locator('div').filter({ hasText: /^Merchant Type$/ }).nth(1).click();
    await page.getByRole('listitem').filter({ hasText: 'Provider' }).click();

    // 2. Filter Merchant Category -> Pilih Treatments
    await page.getByText('Merchant Category').nth(1).click();
    await page.getByRole('listitem').filter({ hasText: 'Treatments' }).click();

    // Validasi: tabel masih memunculkan baris data setelah difilter
    await expect(page.locator('tbody tr').first()).toBeVisible();
  });

  // --- SKENARIO 3: FITUR COLUMN VISIBILITY 
  test('Fitur Column Visibility', async ({ page }) => {
    await page.getByText('Column Visibility').click();
    await page.getByRole('listitem').filter({ hasText: 'Priority' }).click();
    
    await page.getByText('Column Visibility').click();
    await page.getByRole('listitem').filter({ hasText: 'Category' }).click();

    await page.getByText('Column Visibility').click();
    await page.getByRole('listitem').filter({ hasText: 'Provider' }).click();

    await page.getByText('Column Visibility').click();
    await page.getByRole('listitem').filter({ hasText: 'Redemption' }).click();
  });

});

// =====================================================================
// PENGUJIAN MERCHANT DETAIL
// =====================================================================
test.describe('Fitur Halaman Merchant Detail', () => {

  test.beforeEach(async ({ page }) => {
    // URL, Email, dan Password menggunakan .env
    await page.goto(`${process.env.BASE_URL}/login`);
    await page.getByRole('textbox', { name: 'Enter your email address' }).fill(process.env.LOGIN_EMAIL as string);
    await page.getByRole('textbox', { name: 'Enter your password' }).fill(process.env.LOGIN_PASSWORD as string);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Tunggu loading pop-up dan masuk home
    await expect(page).toHaveURL(`${process.env.BASE_URL}/splashscreen`);
    await expect(page.getByText('Login successfully')).toBeVisible();
    await expect(page).toHaveURL(`${process.env.BASE_URL}/home`);

    // Masuk ke Merchant List
    await page.getByRole('button', { name: 'Merchant' }).click();
    await page.getByRole('link', { name: 'Merchant List' }).click();
    await expect(page).toHaveURL(/.*merchant\/list/);
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 15000 });

    // MEMBUKA DETAIL MERCHANT
    await page.locator('.cursor-pointer.rounded-md').first().click();

    // Pastikan halaman detail sudah siap sebelum skenario berjalan
    await expect(page.getByRole('button', { name: 'Outlet List' })).toBeVisible({ timeout: 15000 });
  });

  // --- SKENARIO 1: TAB INFO 
  test('Eksplorasi Tab Info (Membuka Accordion)', async ({ page }) => {
    // Membuka bagian-bagian dropdown (accordion) di Info
    await page.getByRole('button', { name: 'Location' }).click();
    await page.getByRole('button', { name: 'PIC' }).click();
    await page.getByRole('button', { name: 'Settlement & Payment' }).click();
  });

  // --- SKENARIO 2: TAB OUTLET LIST 
  test('Eksplorasi Tab Outlet List', async ({ page }) => {
    // Pindah ke tab Outlet List
    await page.getByRole('button', { name: 'Outlet List' }).click();

    // 1. Coba klik icon action (Mata/Edit) di dalam tabel outlet
    await page.locator('td > div > .py-3 > .h-4').first().click();

    // 2. Coba klik tombol toggle (On/Off)
    await page.getByText('Off').first().click();

    // 3. Coba fitur Search
    await page.getByRole('textbox', { name: 'Search' }).fill('Test');
    await page.getByRole('textbox', { name: 'Search' }).press('Enter');
    await page.waitForTimeout(2000);
    await expect(page.getByText('No outlets have been created yet')).toBeVisible();
  });

  // --- SKENARIO 3: TAB BRAND ---
  test('Eksplorasi Tab Brand', async ({ page }) => {
    test.setTimeout(60000);

    // Pindah ke tab Brand
    await page.getByRole('button', { name: 'Brand' }).click();

    // 1. Coba fitur Search Brand (Negatif)
    await page.getByRole('textbox', { name: 'Search' }).fill('ppp');
    await page.getByRole('textbox', { name: 'Search' }).press('Enter');
    
    await page.waitForTimeout(2000); 
    await expect(page.getByText('No Brands Found')).toBeVisible();

    // Reset pencarian agar data kembali muncul
    await page.getByRole('textbox', { name: 'Search' }).fill('');
    await page.getByRole('textbox', { name: 'Search' }).press('Enter');
    await page.waitForTimeout(2000); 

    // 2. Lihat Detail Brand (Ikon Mata) - Hanya Lihat & Tutup
    const brandDetailIcon = page.locator('.cursor-pointer.rounded-md.p-1').first();
    await expect(brandDetailIcon).toBeVisible({ timeout: 15000 });
    await brandDetailIcon.click();

    const brandDetailModal = page.locator('#modal-brand-detail');
    await expect(brandDetailModal).toBeVisible({ timeout: 15000 });
    
    await page.waitForTimeout(3000); 
    
    // Tutup modal detail
    const closeBrandDetail = brandDetailModal.locator('button[aria-label*="close"], button[aria-label*="tutup"], button:has-text("Close"), button:has-text("×"), button:has-text("X")');
    if (await closeBrandDetail.count() > 0) {
      await closeBrandDetail.first().click();
    } else {
      await page.keyboard.press('Escape');
    }
    await expect(brandDetailModal).toBeHidden({ timeout: 15000 });

    // 3. Lihat Form Create New Brand - Hanya Lihat & Tutup
    await page.getByRole('button', { name: 'Create New Brand' }).click();
    
    const createBrandModal = page.locator('#modal-create-brand');
    await expect(createBrandModal).toBeVisible({ timeout: 15000 });

    await page.waitForTimeout(4000); 

    // Tutup modal create 
    const closeCreateBrand = createBrandModal.locator('button[aria-label*="close"], button[aria-label*="tutup"], button:has-text("Close"), button:has-text("×"), button:has-text("X")');
    if (await closeCreateBrand.count() > 0) {
      await closeCreateBrand.first().click();
    } else {
      await page.keyboard.press('Escape');
    }
    await expect(createBrandModal).toBeHidden({ timeout: 15000 });

    // 4. Edit Status Brand (Ikon Mata -> Edit -> Status -> Save)
    await page.locator('.cursor-pointer.rounded-md.p-1').first().click();
    
    const editButton = page.getByRole('button', { name: 'Edit', exact: true });
    await expect(editButton).toBeVisible({ timeout: 15000 });
    await editButton.click();

    await page.getByRole('switch').click(); 
    await page.waitForTimeout(2000); 

    await page.getByRole('button', { name: /Save/i }).click();

    await expect(page.getByText('Brand "FS Regenera Test" updated successfully!')).toBeVisible({ timeout: 10000 });

    await page.waitForTimeout(2000);
  });
});