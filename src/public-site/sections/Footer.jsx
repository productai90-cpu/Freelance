import { Container } from '../../components/Section.jsx'
import { hall } from '../../config.js'
import Monogram from '../../components/Monogram.jsx'

/* Silver-grey ground closes the page — cooler than the surface above it, so
   the footer reads as a base rather than as another content section.

   No «ورود مدیر» link. The manager backend is reached by URL only —
   `#/admin`, still routed in App.jsx — so the public site carries no
   visible door into it at all. */

function TelegramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M21.94 4.6 18.9 19.2c-.23 1.02-.84 1.27-1.7.79l-4.7-3.47-2.27 2.19c-.25.25-.46.46-.95.46l.34-4.8 8.72-7.88c.38-.34-.08-.53-.59-.19L6.98 13.1l-4.64-1.45c-1.01-.32-1.03-1.01.21-1.5l18.15-7c.84-.3 1.58.2 1.24 1.45Z" />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="bg-base pt-20 pb-8">
      <Container>
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <Monogram size={40} />
              <p className="font-display text-3xl font-extralight text-ink">{hall.name}</p>
            </div>
            <div
              className="mt-5 h-px w-20"
              style={{ background: 'linear-gradient(90deg, var(--color-accent), transparent)' }}
            />
            <p className="mt-5 max-w-sm leading-loose text-ink">{hall.heroSub}</p>
          </div>

          <div>
            <p className="eyebrow mb-5">تماس</p>
            <ul className="space-y-3 text-sm text-ink">
              {/* dir=ltr so the digits read correctly, inline-block so the
                  element still starts at the column edge like every other
                  item. A full-width block would push it out of line. */}
              <li>
                <a
                  href={`tel:${hall.phoneHref}`}
                  dir="ltr"
                  className="num inline-block transition-colors duration-300 hover:text-accent-deep"
                >
                  {hall.phone}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${hall.mobileHref}`}
                  dir="ltr"
                  className="num inline-block transition-colors duration-300 hover:text-accent-deep"
                >
                  {hall.mobile}
                </a>
              </li>
              <li>
                <a
                  href={hall.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors duration-300 hover:text-accent-deep"
                >
                  اینستاگرام@{hall.instagram}
                </a>
              </li>
              <li>{hall.hours}</li>
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-5">نشانی</p>
            <p className="text-sm leading-loose text-ink">{hall.address}</p>
            <p className="mt-3 text-sm text-ink">
              ظرفیت: <span className="num">{hall.capacity}</span>
            </p>
          </div>
        </div>

        <div className="mt-16 border-t border-line pt-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-muted">
              © <span className="num">۱۴۰۵</span> {hall.fullName}. تمامی حقوق محفوظ است.
            </p>

            <div className="flex items-center gap-5">
              <span className="flex items-center gap-2 text-xs text-muted">
                طراحی و توسعه توسط
                <a
                  href={hall.credit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`تلگرام ${hall.credit.label}`}
                  title={hall.credit.label}
                  className="text-accent transition-colors duration-300 hover:text-accent-deep"
                >
                  <TelegramIcon className="h-4 w-4" />
                </a>
              </span>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  )
}
