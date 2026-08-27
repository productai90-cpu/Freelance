import { useEffect, useState } from 'react'

/* ============================================================
   Minimal hash router.

   Hash routing (not history) because the site is served from a
   GitHub Pages subpath: `#/admin/leads` refreshes and deep-links
   without a 404, and no server rewrite rule is needed.

   Small enough not to warrant react-router for a prototype.
   ============================================================ */

export const getRoute = () => {
  const raw = window.location.hash.replace(/^#/, '')
  return raw.startsWith('/') ? raw : '/'
}

export const navigate = (path) => {
  window.location.hash = path
}

export function useRoute() {
  const [route, setRoute] = useState(getRoute)

  useEffect(() => {
    const onChange = () => {
      setRoute(getRoute())
      // A hash change is a page change here — start at the top.
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return route
}

/** '/admin/booking/b3' -> ['admin','booking','b3'] */
export const segments = (route) => route.split('/').filter(Boolean)
