import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

test('Full End-to-End: Dari Login sampai Eksplorasi Detail Merchant', async ({ page }) => {
  
  test.setTimeout(120000); 

  // 1. PROSES LOGIN (Hanya dilakukan 1 kali)
  await page.goto(`${process.env.BASE_URL}/login`);
  await page.getByRole('textbox', { name: 'Enter your email address' }).fill(process.env.LOGIN_EMAIL as string);
  await page.getByRole('textbox', { name: 'Enter your password' }).fill(process.env.LOGIN_PASSWORD as string);
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Tunggu masuk ke home
  await expect(page).toHaveURL(`${process.env.BASE_URL}/splashscreen`);
  await expect(page.getByText('Login successfully')).toBeVisible();
  await expect(page).toHaveURL(`${process.env.BASE_URL}/home`);

  // 2. MASUK KE MERCHANT LIST
  await page.getByRole('button', { name: 'Merchant' }).click();
  await page.getByRole('link', { name: 'Merchant List' }).click();
  await expect(page).toHaveURL(/.*merchant\/list/);
  await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(2000); 

  // 3. TES FITUR SEARCH DI LIST
  await page.getByPlaceholder('Search').fill('merdeka');
  await page.getByPlaceholder('Search').press('Enter');
  await page.waitForTimeout(2000); // Lihat hasil pencarian
  await expect(page.getByRole('row', { name: /Merdeka Outlet/i }).first()).toBeVisible();

  // Reset Search agar data utuh kembali
  await page.getByPlaceholder('Search').clear();
  await page.getByPlaceholder('Search').fill('');
  await page.getByPlaceholder('Search').press('Enter');
  await page.waitForTimeout(2000); // Lihat data kembali utuh

  // 4. MASUK KE MERCHANT DETAIL
  // Klik baris pertama untuk masuk ke detail
  await page.locator('.cursor-pointer.rounded-md').first().click();
  await expect(page.getByRole('button', { name: 'Outlet List' })).toBeVisible({ timeout: 15000 });

  // 5. EKSPLORASI TAB INFO
  await page.getByRole('button', { name: 'Location' }).click();
  await page.waitForTimeout(1000); // Lihat accordion terbuka
  await page.getByRole('button', { name: 'PIC' }).click();
  await page.waitForTimeout(1000);

  // 6. EKSPLORASI TAB OUTLET LIST
  await page.getByRole('button', { name: 'Outlet List' }).click();
  await page.waitForTimeout(1000);
  
  // Klik Action -> Coba mati/nyalakan toggle
  await page.locator('td > div > .py-3 > .h-4').first().click();
  await page.getByText('Off').first().click();
  await page.waitForTimeout(2000); // Lihat toggle berubah

  // 7. EKSPLORASI TAB BRAND
  await page.getByRole('button', { name: 'Brand' }).click();
  await page.waitForTimeout(1000);

  // Buka form Create New Brand
  await page.getByRole('button', { name: 'Create New Brand' }).click();
  const createBrandModal = page.locator('#modal-create-brand');
  await expect(createBrandModal).toBeVisible({ timeout: 15000 });
  
  await page.waitForTimeout(3000); 
  
 
  await page.keyboard.press('Escape');
  await expect(createBrandModal).toBeHidden({ timeout: 15000 });

  await page.waitForTimeout(5000);
});