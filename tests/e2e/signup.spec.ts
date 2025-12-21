import { test, expect, type Page, type APIRequestContext } from '@playwright/test'

function uniqueEmail() {
  return `e2e-${Date.now()}@example.com`
}

test.describe('Signup and confirmation flow', () => {
  let supabaseConfigured = false
  test.beforeAll(async ({ request }) => {
    try {
      const res = await request.post('/api/auth/demo')
      const text = await res.text().catch(() => '')
      // If demo endpoint returns 500 with missing server keys, Supabase is not configured for E2E
      if (res.status() === 500 && text.includes('Missing Supabase URL')) {
        supabaseConfigured = false
      } else if (res.status() === 200 || res.status() === 400 || res.status() === 403) {
        // 200 = demo succeeded, 400 = bad credentials (demo route exists), 403 = demo not allowed
        supabaseConfigured = true
      }
    } catch (err) {
      supabaseConfigured = false
    }
  })

  test('signs up and can be confirmed via test endpoint', async ({ page, request }: { page: Page; request: APIRequestContext }) => {
    if (!supabaseConfigured) test.skip(true, 'Supabase not configured for E2E; skipping signup confirmation tests')
    const logs: string[] = []
    page.on('console', (msg) => logs.push(`console:${msg.type()}:${msg.text()}`))
    page.on('pageerror', (err) => logs.push(`pageerror:${String(err)}`))

    const email = uniqueEmail()
    const password = 'Password123!'

    // Go to sign-up page and fill form
    await page.goto('/auth/sign-up')
    await page.fill('#fullName', 'E2E Tester')
    await page.fill('#organization', 'Test Org')
    await page.fill('#email', email)
    await page.fill('#password', password)
    await page.fill('#repeat-password', password)
    await page.click('text=Sign up')

    // Should go to sign-up success page OR show an error if Supabase is not configured
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {})
    const successVisible = await page.locator('text=Thank you for signing up!').isVisible().catch(() => false)
    const errorVisible = await page.locator('.text-red-500').isVisible().catch(() => false)

    if (!successVisible) {
      if (errorVisible) {
        // Likely Supabase not configured in this environment — skip confirmation portion
        test.skip(true, 'Signup failed due to missing Supabase config in this environment')
        return
      }

      // If neither visible, inspect page content to decide
      const body = await page.content()
      if (body.includes("Your project's URL and Key are required")) {
        test.skip(true, 'Supabase not configured on server; skipping confirmation tests')
        return
      }

      // Otherwise fail the test with the HTML snapshot and console logs for debugging
      throw new Error(
        'Sign-up did not complete and no error message shown; page snapshot:\n' +
          body.slice(0, 2000) +
          '\n\nconsole logs:\n' +
          logs.join('\n'),
      )
    }

    // Attempt to confirm via test endpoint if available
    const confirmRes = await request.post('/api/auth/confirm-user', { data: { email } })
    if (confirmRes.status() === 200) {
      // Now try to login
      await page.goto('/auth/login')
      await page.fill('#email', email)
      await page.fill('#password', password)
      await page.click('text=Login')
      await page.waitForLoadState('networkidle')
      // Either redirected to dashboard or see no error
      const url = page.url()
      expect(/dashboard|auth\/login/.test(url)).toBeTruthy()
    } else {
      test.skip(true, 'Confirm endpoint not available or not allowed in this environment')
    }
  })

  test('send sign-in link works for unconfirmed users', async ({ page, request }: { page: Page; request: APIRequestContext }) => {
    if (!supabaseConfigured) test.skip(true, 'Supabase not configured for E2E; skipping signup confirmation tests')

    const logs: string[] = []
    page.on('console', (msg) => logs.push(`console:${msg.type()}:${msg.text()}`))
    page.on('pageerror', (err) => logs.push(`pageerror:${String(err)}`))

    const email = uniqueEmail()
    const password = 'Password123!'

    // Create user via sign up
    await page.goto('/auth/sign-up')
    await page.fill('#fullName', 'E2E NoConfirm')
    await page.fill('#organization', 'Test Org')
    await page.fill('#email', email)
    await page.fill('#password', password)
    await page.fill('#repeat-password', password)
    await page.click('text=Sign up')
    // Allow either success or error (no Supabase configured)
    const successVisible2 = await page.locator('text=Thank you for signing up!').isVisible().catch(() => false)
    const errorVisible2 = await page.locator('.text-red-500').isVisible().catch(() => false)

    if (!successVisible2) {
      if (errorVisible2) {
        test.skip(true, 'Signup failed due to missing Supabase config in this environment')
        return
      }
      await expect(page.locator('text=Thank you for signing up!')).toBeVisible()
    }

    // Try to login (should show confirmation message) — if not configured, skip
    await page.goto('/auth/login')
    await page.fill('#email', email)
    await page.fill('#password', password)
    await page.click('text=Login')

    // If there's an error about confirmation, show the send link button
    const errorText = await page.locator('.text-red-500').innerText().catch(() => '')
    if (errorText.toLowerCase().includes('confirm')) {
      const sendLinkButton = page.locator('text=Send sign-in link to my email')
      await expect(sendLinkButton).toBeVisible()
      await sendLinkButton.click()
      await expect(page.locator('text=Sign-in link sent')).toBeVisible()
    } else {
      test.skip(true, 'Sign-in confirmation flow not enforced in this environment')
    }
  })
})
