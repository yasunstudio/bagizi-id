# Procurement Settings Error Debug Guide

## Issue: "Failed to initialize settings"

### Root Cause Analysis

**Problem**: User sees "Failed to initialize settings" error when accessing `/procurement/settings` page.

**Investigation Steps Taken**:

1. ✅ **Database Migration Check**
   - Migration for `procurement_settings` table created: `20251028110812_add_procurement_settings`
   - All 13 migrations applied successfully
   - Table exists in database

2. ✅ **Seed Data Verification**
   ```bash
   npx tsx scripts/verify-sppg-consistency.ts
   ```
   - Result: **1 ProcurementSettings record exists** for SPPG `DEMO-2025`
   - Settings already seeded in database

3. ✅ **API Endpoint Validation**
   - GET `/api/sppg/procurement/settings` - ✅ Returns settings or null
   - POST `/api/sppg/procurement/settings/initialize` - ✅ Creates with defaults
   - Middleware `withSppgAuth` - ✅ Properly checks authentication and sppgId

4. ✅ **Seed Consistency Audit**
   - Fixed `schools-seed.ts` to use `code: 'DEMO-2025'` instead of name search
   - All SPPG seeds now consistently use `DEMO-2025` code
   - Verification script confirms all data belongs to correct SPPG

### The Real Issue

**Settings already exist from seed**, but page logic wasn't handling the scenario properly:

1. Settings seeded during `npm run db:seed`
2. Page loads settings successfully
3. But if user manually clicks "Initialize" button (shouldn't show), API returns 409 Conflict
4. Error message "Failed to initialize settings" shown

### Fix Applied

**1. Added Debug Logging** (`src/features/sppg/procurement/settings/hooks/index.ts`):

```typescript
export function useInitializeSettings() {
  return useMutation({
    mutationFn: async () => {
      console.log('[useInitializeSettings] Starting initialization...')
      const result = await settingsApi.initialize()
      console.log('[useInitializeSettings] API result:', result)
      
      if (!result.success || !result.data) {
        const errorMsg = result.error || 'Failed to initialize procurement settings'
        console.error('[useInitializeSettings] Error:', errorMsg)
        throw new Error(errorMsg)
      }
      
      return result.data
    },
    onSuccess: (data) => {
      console.log('[useInitializeSettings] Success! Data:', data)
      queryClient.setQueryData(settingsKeys.detail(), data)
      toast.success('Pengaturan default berhasil dibuat')
    },
    onError: (error: Error) => {
      console.error('[useInitializeSettings] onError:', error.message)
      toast.error(error.message || 'Gagal membuat pengaturan default')
    },
  })
}
```

**2. Improved Error Handling** (`src/app/(sppg)/procurement/settings/page.tsx`):

```typescript
// Error state - show error dengan detail dan reload button
if (error) {
  console.error('[SettingsPage] Error:', error)
  return (
    <div className="container mx-auto py-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Gagal memuat pengaturan: {error.message}
        </AlertDescription>
      </Alert>
      <div className="mt-4">
        <Button onClick={() => window.location.reload()}>
          Muat Ulang Halaman
        </Button>
      </div>
    </div>
  )
}

// Only show initialize button if truly no settings exist
if (!settings) {
  console.log('[SettingsPage] No settings found, showing initialize button')
  // ... initialize UI
}

// Log loaded settings
console.log('[SettingsPage] Settings loaded:', { 
  hasGeneralSettings: !!settings,
  approvalLevelsCount: settings?.approvalLevels?.length || 0,
  categoriesCount: settings?.customCategories?.length || 0,
  paymentTermsCount: settings?.paymentTerms?.length || 0,
  qcChecklistsCount: settings?.qcChecklists?.length || 0,
})
```

### Testing Checklist

**Prerequisites:**
```bash
# Ensure database is seeded
npm run db:seed

# Verify settings exist
npx tsx scripts/verify-sppg-consistency.ts | grep "Procurement Settings"
# Expected: ✅ Procurement Settings: 1 records
```

**Browser Testing:**

1. **Open DevTools Console** (F12 → Console tab)

2. **Login** as SPPG admin:
   - Email: `admin@demo.sppg.id`
   - Password: `demo2025`

3. **Navigate** to `/procurement/settings`

4. **Check Console Logs**:
   ```
   [SettingsPage] Settings loaded: {
     hasGeneralSettings: true,
     approvalLevelsCount: 3,
     categoriesCount: 0,
     paymentTermsCount: 4,
     qcChecklistsCount: 3
   }
   ```

5. **Expected Behavior**:
   - ✅ Settings page loads with tabs
   - ✅ General tab shows settings form
   - ✅ Approval tab shows 3 levels
   - ✅ Payment Terms tab shows 4 terms
   - ✅ QC Checklist tab shows 3 checklists
   - ✅ No "Initialize" button shown
   - ✅ No errors in console

### Possible Scenarios & Solutions

**Scenario 1: Settings not loaded (null)**
- **Console**: `[SettingsPage] No settings found, showing initialize button`
- **Action**: Click "Inisialisasi Pengaturan Default"
- **Expected**: Settings created with defaults

**Scenario 2: Settings already exist (409 error)**
- **Console**: `[useInitializeSettings] Error: Settings already exist`
- **Cause**: Trying to initialize when settings exist
- **Fix**: Page should show settings, not initialize button

**Scenario 3: Authentication error (401)**
- **Console**: `Failed to fetch settings` + network 401
- **Cause**: Not logged in or session expired
- **Fix**: Redirect to login page

**Scenario 4: Permission error (403)**
- **Console**: `Forbidden` + network 403
- **Cause**: User not SPPG role or no sppgId
- **Fix**: Check user role and sppgId in session

### Database Quick Check

```bash
# Check if settings exist for DEMO-2025 SPPG
npx prisma studio

# Or via script
npx tsx scripts/verify-sppg-consistency.ts
```

### API Manual Testing

```bash
# Get settings (requires authentication cookie from browser)
curl -X GET http://localhost:3000/api/sppg/procurement/settings \
  -H "Cookie: authjs.session-token=YOUR_TOKEN_FROM_BROWSER"

# Expected response:
{
  "success": true,
  "data": {
    "id": "...",
    "sppgId": "...",
    "autoApproveThreshold": 5000000,
    "approvalLevels": [...],
    "paymentTerms": [...],
    "qcChecklists": [...]
  }
}
```

### Files Modified

1. `prisma/seeds/schools-seed.ts`
   - Fixed SPPG selection to use `code: 'DEMO-2025'`
   - Was using `name: 'SPPG Demo Bagizi 2025'`

2. `src/features/sppg/procurement/settings/hooks/index.ts`
   - Added comprehensive debug logging in `useInitializeSettings()`
   - Logs API calls, results, errors

3. `src/app/(sppg)/procurement/settings/page.tsx`
   - Enhanced error display with reload button
   - Added console logs for settings state
   - Improved error messages

4. `scripts/verify-sppg-consistency.ts` (created)
   - Verifies all SPPG data consistency
   - Shows record counts per table
   - Validates sample data

### Next Steps if Issue Persists

1. **Check browser console** for specific error messages
2. **Check Network tab** (F12 → Network) for API responses
3. **Verify login** as correct user (`admin@demo.sppg.id`)
4. **Check database** directly via Prisma Studio
5. **Re-seed** if needed: `npm run db:seed`

### Related Documentation

- `/docs/ADMIN_PLATFORM_TODO.md` - Platform admin features
- `/docs/API_IMPLEMENTATION_STATUS.md` - API status tracking
- `/.github/copilot-instructions.md` - Development guidelines
