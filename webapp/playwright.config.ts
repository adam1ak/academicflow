/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    timeout: 30 * 1000,
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    use : {
        baseURL: 'http://localhost:5173',
        trace: 'on-first-retry',
        headless: false,
        launchOptions: {
            slowMo: 500
        }
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome']}
        }
    ]
})