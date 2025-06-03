# 🧪 Next.js Test Files

Use these sample files to test if the Next.js metrics detection is working correctly:

## 1. Server Component (app/page.tsx)
```tsx
import { headers } from 'next/headers';
import Image from 'next/image';

export default function HomePage() {
  const headersList = headers();
  
  return (
    <div>
      <h1>Server Component</h1>
      <Image 
        src="/hero.jpg" 
        alt="Hero" 
        width={800} 
        height={400}
      />
      <p>This should be detected as a Server Component with Image Optimization</p>
    </div>
  );
}
```

**Expected detections:**
- ✅ Server Components (file in /app/ + headers import)
- ✅ Image Optimization (next/image import)

## 2. Client Component (app/components/Counter.tsx)
```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Counter() {
  const [count, setCount] = useState(0);
  const router = useRouter();
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={() => router.push('/about')}>
        Navigate
      </button>
    </div>
  );
}
```

**Expected detections:**
- ✅ Client Components ('use client' directive)
- ✅ Dynamic behavior (navigation hook)

## 3. Server Actions (app/actions.ts)
```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  
  // Simulate database operation
  await new Promise(resolve => setTimeout(resolve, 100));
  
  revalidatePath('/posts');
  redirect('/posts');
}

export async function deletePost(id: string) {
  // Simulate deletion
  revalidatePath('/posts');
}
```

**Expected detections:**
- ✅ Server Actions ('use server' directive + revalidatePath/redirect calls)

## 4. Dynamic Import Component (app/components/LazyChart.tsx)
```tsx
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const Chart = dynamic(() => import('./Chart'), {
  loading: () => <p>Loading chart...</p>,
  ssr: false
});

export default function LazyChart() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Chart data={[1, 2, 3, 4, 5]} />
    </Suspense>
  );
}
```

**Expected detections:**
- ✅ Dynamic Imports (next/dynamic import + dynamic() call)
- ✅ Client Components (dynamic loading usually indicates client-side)

## 5. API Route (app/api/users/route.ts)
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const users = [
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' }
  ];
  
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Simulate user creation
  const newUser = { id: Date.now(), ...body };
  
  return NextResponse.json(newUser, { status: 201 });
}
```

**Expected detections:**
- ✅ Server Actions (API route with HTTP method exports)

## 6. Mixed Features Component (app/dashboard/page.tsx)
```tsx
import { Suspense } from 'react';
import { headers, cookies } from 'next/headers';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const DynamicChart = dynamic(() => import('../components/Chart'), {
  ssr: false
});

export default function Dashboard() {
  const headersList = headers();
  const cookieStore = cookies();
  
  return (
    <div>
      <h1>Dashboard</h1>
      <Image src="/logo.png" alt="Logo" width={100} height={100} />
      <Suspense fallback={<div>Loading chart...</div>}>
        <DynamicChart />
      </Suspense>
    </div>
  );
}
```

**Expected detections:**
- ✅ Server Components (headers/cookies imports)
- ✅ Image Optimization (next/image)
- ✅ Dynamic Imports (next/dynamic)

## Testing Instructions

1. **Upload one of these files** to your code analyzer
2. **Check the browser console** for detection logs like:
   - `🔍 Analyzing enhanced metrics for: app/page.tsx`
   - `Detected Next.js App Router file (Server Component by default): app/page.tsx`
   - `Detected next/image import: app/page.tsx`
   - `📊 Enhanced metrics result: { nextjsFeatures: { ... } }`

3. **Check the Architecture Map** - Click on the file node and verify the Next.js section shows the expected features

4. **Verify tooltips** - Hover over each detected feature to see explanatory tooltips

## Common Issues

### No Next.js Features Detected
- **Check file paths**: Must be in `/app/` or `/pages/` directories
- **Check file extensions**: Must be `.tsx`, `.jsx`, `.ts`, or `.js`
- **Check console logs**: Look for analysis and detection messages

### Server Components Not Detected
- **App Router files**: Should auto-detect files in `/app/` directory
- **Import patterns**: Look for `next/headers`, `next/cookies` imports
- **'use client' override**: Client directive overrides server detection

### Client Components Not Detected
- **'use client' directive**: Must be at top of file
- **Navigation hooks**: `useRouter`, `usePathname` indicate client components
- **Browser APIs**: Event handlers, `useState`, etc.

If you're still not seeing Next.js metrics, try uploading one of these test files and check the console for detailed logging! 