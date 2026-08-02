import { test, expect } from '@playwright/test'

test.describe('Authentication Flow E2E Tests', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/')
        await page.evaluate(() => localStorage.clear())
        await page.reload()
    })

    test('should successfully log in with valid credentials', async ({ page }) => {
        await page.fill('#register-email', 'test@example.com')
        await page.fill('#register-password', 'Password123!')

        await page.click('button[type="submit"]')

        await expect(page).toHaveURL(/.*#\/dashboard/, { timeout: 10000 })
        await expect(page.locator('text=AcademicFlow').first()).toBeVisible({ timeout: 10000 })
    })

    test('should show error popup on invalid credentials', async ({ page }) => {
        await page.fill('#register-email', 'test@example.com')
        await page.fill('#register-password', 'WrongPassword123!')

        await page.click('button[type="submit"]')

        await expect(
            page.locator('text=Incorrect username or password')
                .or(page.locator('text=Invalid credentials'))
                .or(page.locator('text=Error from server'))
        ).toBeVisible({ timeout: 10000 })
    })

})