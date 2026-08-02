import { test, expect } from '@playwright/test'

test.describe('Plan Workflow E2E Tests', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/')
        await page.evaluate(() => localStorage.clear())
        await page.reload()

        await page.fill('#register-email', 'test@example.com')
        await page.fill('#register-password', 'Password123!')
        await page.click('button[type="submit"]')

        await expect(page).toHaveURL(/.*#\/dashboard/, { timeout: 10000 })
    })

    test('should open add subject modal and create a new subject', async ({ page }) => {
        const uniqueSubjectName = `Robotics ${Date.now()}`

        await page.getByRole('button', { name: /add subject/i }).click()

        await expect(page.locator('text=Add Subject').first()).toBeVisible()

        await page.fill('#subject-name', uniqueSubjectName)
        await page.fill('#classroom', 'Room 302')

        await page.click('button[type="submit"]:has-text("Add Subject")')

        await expect(page.locator(`text=${uniqueSubjectName}`).first()).toBeVisible({ timeout: 10000 })
    })

    test('should toggle subject completion optimistically on the Gantt chart', async ({ page }) => {
        // 1. Click on the first subject row on the Gantt chart:
        const firstSubject = page.locator('.gantt-row-name').first()
        await expect(firstSubject).toBeVisible({ timeout: 10000 })
        await firstSubject.click()

        const completeBtn = page.locator('button:has-text("Mark Complete"), button:has-text("Done")').first()
        await expect(completeBtn).toBeVisible({
            timeout:
                10000
        })
        await completeBtn.click()

        await expect(page.locator('text=Done').first()).toBeVisible({
            timeout:
                10000
        })
    })
})