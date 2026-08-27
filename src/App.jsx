import { Suspense, lazy } from 'react'
import { DataProvider } from './store/DataContext.jsx'
import { segments, useRoute } from './lib/router.js'
import PublicSite from './public-site/PublicSite.jsx'

/* The manager backend is code-split: a visitor arriving from Instagram
   should never download the admin bundle to read the menu. */
const AdminShell = lazy(() => import('./admin/AdminShell.jsx'))

export default function App() {
  const route = useRoute()
  const isAdmin = segments(route)[0] === 'admin'

  return (
    <DataProvider>
      {isAdmin ? (
        <Suspense
          fallback={
            <div className="flex min-h-[100svh] items-center justify-center bg-ivory">
              <span className="h-5 w-5 animate-spin rounded-full border border-brass border-t-transparent" />
            </div>
          }
        >
          <AdminShell route={route} />
        </Suspense>
      ) : (
        <PublicSite />
      )}
    </DataProvider>
  )
}
