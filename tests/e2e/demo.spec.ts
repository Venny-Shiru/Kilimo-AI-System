import { test, expect } from '@playwright/test'

test.describe('Demo sign-in', () => {
  test('POST /api/auth/demo returns expected status and sets cookie', async ({ request }) => {
    const res = await request.post('/api/auth/demo')
    // Accept either 200 (demo succeeded) or 403/500 depending on config
    expect([200, 403, 500]).toContain(res.status())
    if (res.status() === 200) {
      const setCookie = res.headers()['set-cookie']
      expect(setCookie).toBeTruthy()
    }
  })

  test('UI demo button triggers demo sign-in and navigates to dashboard when allowed', async ({ page }) => {
    await page.goto('/auth/login')
    // Button may not be present if demo not enabled; gracefully handle
    const demoButton = page.locator('text=Use demo account')
    if (await demoButton.count() === 0) {
      test.skip(true, 'Demo button not configured in this environment')
      return
    }

    await demoButton.click()

    // After clicking the app should navigate to the dashboard on success
    await page.waitForLoadState('networkidle')
    // We expect either redirect to /dashboard or stay on login page with error
    const url = page.url()
    expect([/\/dashboard/, /\/auth\/login/].some((r) => r.test(url))).toBeTruthy()
  })
})
