import test, { expect } from "@playwright/test";

test.describe('Deadlines Managment E2E', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/')
        await page.evaluate(() => localStorage.clear())
        await page.reload()

        await page.fill('#register-email', 'test@example.com')
        await page.fill('#register-password', 'Password123!')
        await page.click('button[type="submit"]')

        await expect(page).toHaveURL(/.*#\/dashboard/, {
            timeout:
                10000
        })
    })

    test('should open add deadline modal and create a new exam deadline', async ({ page }) => {
    const uniqueDeadlineTitle = `Exam ${Date.now()}`

    // 1. Click on "+ Add Deadline" button specifically:
    const addDeadlineBtn = page.getByRole('button', { name: /add deadline/i })
    await expect(addDeadlineBtn).toBeVisible({ timeout: 10000 })
    await addDeadlineBtn.click()

        await expect(page.locator('text=Add Deadline').first()).toBeVisible()

        await page.fill('#deadline-title', uniqueDeadlineTitle)
        await page.click('button[type="submit"]:has-text("Add Deadline")')

        await expect(page.locator(`text=${uniqueDeadlineTitle}`).first()).toBeVisible({
            timeout: 10000
        })
    })
})