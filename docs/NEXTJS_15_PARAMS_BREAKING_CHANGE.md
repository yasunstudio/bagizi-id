# Next.js 15 Breaking Change: Params as Promise

**Updated**: November 10, 2025  
**Next.js Version**: 15.5.4  
**Breaking Change**: `params` property is now a Promise

---

## 🚨 Breaking Change Overview

In **Next.js 15**, dynamic route parameters (`params`) are now **asynchronous** and must be awaited before use.

### Before (Next.js 14 and earlier)

```typescript
// ❌ Old Pattern (Next.js 14)
interface PageProps {
  params: { id: string }  // Direct object
}

export default function Page({ params }: PageProps) {
  const id = params.id  // Direct access
  // ...
}
```

### After (Next.js 15)

```typescript
// ✅ New Pattern (Next.js 15+)
interface PageProps {
  params: Promise<{ id: string }>  // Now a Promise!
}

export default async function Page({ params }: PageProps) {
  const { id } = await params  // Must await first
  // ...
}
```

---

## 🔍 Why This Change?

Next.js 15 made this change to support:
- **Progressive rendering** with Partial Prerendering (PPR)
- **Streaming** capabilities for dynamic segments
- **Better performance** by deferring parameter resolution
- **Consistent async behavior** across Server Components

---

## 📋 Migration Checklist

### Step 1: Update Type Definitions

```typescript
// ❌ Before
interface MyPageProps {
  params: { id: string, slug: string }
}

// ✅ After
interface MyPageProps {
  params: Promise<{ id: string, slug: string }>
}
```

### Step 2: Make Component Async

```typescript
// ❌ Before
export default function MyPage({ params }: MyPageProps) {

// ✅ After
export default async function MyPage({ params }: MyPageProps) {
```

### Step 3: Await Params Before Use

```typescript
// ❌ Before
const id = params.id

// ✅ After
const { id } = await params
// or
const params_resolved = await params
const id = params_resolved.id
```

---

## 🎯 Common Patterns

### Pattern 1: Simple Parameter Access

```typescript
interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  // Destructure after await
  const { id } = await params
  
  const product = await fetchProduct(id)
  return <ProductDetail product={product} />
}
```

### Pattern 2: Multiple Parameters

```typescript
interface BlogPostProps {
  params: Promise<{ category: string, slug: string }>
}

export default async function BlogPost({ params }: BlogPostProps) {
  // Get multiple params
  const { category, slug } = await params
  
  const post = await fetchPost(category, slug)
  return <Post data={post} />
}
```

### Pattern 3: With SSR Authentication

```typescript
import { headers } from 'next/headers'

interface DetailPageProps {
  params: Promise<{ id: string }>
}

export default async function DetailPage({ params }: DetailPageProps) {
  // Step 1: Await params
  const { id } = await params
  
  // Step 2: Call API with headers forwarding
  const result = await myApi.getById(id, await headers())
  
  return <DetailView data={result.data} />
}
```

### Pattern 4: Dynamic Metadata

```typescript
interface PageProps {
  params: Promise<{ id: string }>
}

// Metadata generation also needs await
export async function generateMetadata({ 
  params 
}: PageProps): Promise<Metadata> {
  const { id } = await params  // Must await here too!
  
  const data = await fetchData(id)
  
  return {
    title: data.title,
    description: data.description,
  }
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  // ...
}
```

### Pattern 5: Error Handling

```typescript
interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  try {
    const { id } = await params
    
    // Validate id format
    if (!id || typeof id !== 'string') {
      notFound()
    }
    
    const data = await fetchData(id)
    return <View data={data} />
  } catch (error) {
    console.error('Page error:', error)
    notFound()
  }
}
```

---

## ⚠️ Common Errors

### Error 1: "Cannot convert object to primitive value"

**Cause**: Trying to use params directly without awaiting

```typescript
// ❌ WRONG
const id = params.id  // params is Promise, not object!

// ✅ CORRECT
const { id } = await params
```

### Error 2: "params is not iterable"

**Cause**: Trying to destructure Promise directly

```typescript
// ❌ WRONG
const { id } = params  // Can't destructure Promise!

// ✅ CORRECT
const { id } = await params
```

### Error 3: "await is only valid in async functions"

**Cause**: Forgot to make component async

```typescript
// ❌ WRONG
export default function Page({ params }) {
  const { id } = await params  // Error!

// ✅ CORRECT
export default async function Page({ params }) {
  const { id } = await params  // OK!
```

---

## 🔧 Automated Migration

### Find Files That Need Migration

```bash
# Search for old pattern
grep -r "params: {" src/app --include="*.tsx" --include="*.ts"

# Or more specific
grep -r "interface.*Props" src/app -A 3 | grep "params: {"
```

### VS Code Search & Replace

**Search (regex)**:
```
params: \{ (.*?) \}
```

**Replace**:
```
params: Promise<{ $1 }>
```

---

## 📊 Bagizi-ID Migration Status

### Files Already Migrated ✅

1. `/src/app/(sppg)/procurement/suppliers/[id]/page.tsx`
2. `/src/app/(sppg)/production/[id]/edit/page.tsx`
3. `/src/app/(sppg)/beneficiary-organizations/[id]/page.tsx`
4. `/src/app/(sppg)/beneficiary-organizations/[id]/edit/page.tsx`

### Pattern Used in Bagizi-ID

```typescript
// Standard pattern across all dynamic routes
interface DetailPageProps {
  params: Promise<{ id: string }>
}

export default async function DetailPage({ params }: DetailPageProps) {
  const { id } = await params
  const result = await myApi.getById(id, await headers())
  
  if (!result.success || !result.data) {
    notFound()
  }
  
  return <DetailComponent data={result.data} />
}
```

---

## 📚 Additional Resources

### Official Documentation
- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)
- [Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

### Related Changes in Next.js 15
- `searchParams` is also now a Promise
- `cookies()` requires await
- `headers()` requires await

### Example with All Async Props

```typescript
import { headers, cookies } from 'next/headers'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function Page({ params, searchParams }: PageProps) {
  // All async operations
  const { id } = await params
  const { tab } = await searchParams
  const headersList = await headers()
  const cookieStore = await cookies()
  
  // Now can use all values
  const result = await api.getData(id, headersList)
  const activeTab = tab || 'overview'
  
  return <View data={result.data} activeTab={activeTab} />
}
```

---

## 🎯 Best Practices

### ✅ DO

1. **Always await params** before accessing properties
2. **Make component async** when using dynamic params
3. **Destructure after await** for cleaner code
4. **Update TypeScript types** to `Promise<{ ... }>`
5. **Test all dynamic routes** after migration

### ❌ DON'T

1. **Don't access params properties directly** without await
2. **Don't forget to update metadata generators** - they need await too
3. **Don't mix sync/async patterns** - be consistent
4. **Don't skip TypeScript type updates** - you'll get runtime errors
5. **Don't assume params is always defined** - validate and handle errors

---

## 🔍 Debugging Tips

### Check if params is Promise

```typescript
console.log('params type:', params)  
// Promise { <pending> } ← It's a Promise!

const resolved = await params
console.log('resolved params:', resolved)
// { id: 'abc123' } ← Now it's an object
```

### Type Guard

```typescript
async function isValidParams(params: Promise<{ id: string }>) {
  const { id } = await params
  return typeof id === 'string' && id.length > 0
}
```

---

## 📝 Quick Reference Card

```typescript
// =============================================
// NEXT.JS 15 PARAMS QUICK REFERENCE
// =============================================

// 1. TYPE DEFINITION
interface Props {
  params: Promise<{ id: string }>  // Always Promise
}

// 2. COMPONENT SIGNATURE
export default async function Page({ params }: Props) {
  // Must be async ↑

// 3. EXTRACT PARAMS
  const { id } = await params  // Must await

// 4. USE PARAMS
  const data = await fetchData(id)  // Now can use id
  
// 5. WITH SSR AUTH
  const result = await api.get(id, await headers())
  
// 6. METADATA (also needs await!)
export async function generateMetadata({ params }: Props) {
  const { id } = await params  // Await here too!
  return { title: `Item ${id}` }
}

// =============================================
```

---

## ✅ Migration Complete!

This breaking change affects **all dynamic routes** in Next.js 15. Make sure to:

1. Update all `params` type definitions to `Promise<{ ... }>`
2. Make all route handlers `async`
3. Add `await` before accessing params
4. Test all dynamic routes thoroughly
5. Update metadata generators if they use params

**Status**: 🎉 All Bagizi-ID routes migrated to Next.js 15 pattern!
