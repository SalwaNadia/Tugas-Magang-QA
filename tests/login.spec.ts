import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

test.describe('Pengujian Modul Login (Negative & Positive)', () => {

  // NEGATIVE TEST 
  test('Negative: Login Gagal karena Password Salah', async ({ page }) => {
    await page.goto(`${process.env.BASE_URL}/login`);
    await page.getByRole('textbox', { name: 'Enter your email address' }).fill(process.env.LOGIN_EMAIL as string);
    await page.getByRole('textbox', { name: 'Enter your password' }).fill('passoword bebas');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByText('Password must have 8+ characters, uppercase, lowercase, number, and symbol')).toBeVisible();
    await expect(page).toHaveURL(/.*login/);
  });

  // NEGATIVE TEST 
  test('Negative: Login Gagal karena email dan password kosong', async ({ page }) => {
    await page.goto(`${process.env.BASE_URL}/login`);
    await page.getByRole('textbox', { name: 'Enter your email address' }).fill('');
    await page.getByRole('textbox', { name: 'Enter your password' }).fill('');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
    await expect(page).toHaveURL(/.*login/);
  });
  
  // POSITIVE TEST 
  test('Positive: Login Berhasil dengan Password Benar', async ({ page }) => {
    await page.goto(`${process.env.BASE_URL}/login`);
    await page.getByRole('textbox', { name: 'Enter your email address' }).fill(process.env.LOGIN_EMAIL as string);
    await page.getByRole('textbox', { name: 'Enter your password' }).fill(process.env.LOGIN_PASSWORD as string);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(`${process.env.BASE_URL}/splashscreen`);
    await expect(page.getByText('Login successfully')).toBeVisible();
    await expect(page).toHaveURL(`${process.env.BASE_URL}/home`);
  });

});