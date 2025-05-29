# E2E Testing Setup

This directory contains end-to-end tests for the flashcards application using Playwright.

## Database Cleanup (Teardown)

The project is configured with automatic database cleanup after all tests complete using Playwright's project dependencies feature.

### Configuration

- **Playwright Config**: The configuration includes a teardown project that runs after all tests
- **Environment**: Uses `.env.test` file for test-specific Supabase configuration
- **Target Tables**: Cleans up `flashcards`, `generations`, and `generation_error_logs` tables

### How it works

1. **Project Dependencies**: The `chromium` project includes a `teardown: 'cleanup db'` configuration
2. **Global Teardown**: `global.teardown.ts` runs after all tests complete
3. **Selective Cleanup**: Only deletes data for the test user specified in `E2E_USERNAME_ID`
4. **Error Handling**: Provides detailed logging and error handling for cleanup operations

### Environment Variables Required

Make sure `.env.test` contains:

```env
SUPABASE_URL=your_test_supabase_url
SUPABASE_KEY=your_test_supabase_key
E2E_USERNAME_ID=test_user_uuid
E2E_USERNAME=test@example.com
E2E_PASSWORD=test_password
```

### Running Tests

```bash
# Run all tests (teardown will run automatically after)
npx playwright test

# Run specific test only (no teardown)
npx playwright test --no-deps example.spec.ts

# List all tests including teardown
npx playwright test --list
```

### Security Considerations

- The teardown only deletes data for the specific test user ID
- Uses service role key from test environment for proper permissions
- Includes error handling to prevent accidental data loss
- Logs all cleanup operations for debugging

### Troubleshooting

If teardown fails:
1. Check environment variables are properly loaded
2. Verify Supabase connection and permissions
3. Check test user ID exists and has proper permissions
4. Review console logs for specific error messages 