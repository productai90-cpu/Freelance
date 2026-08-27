import { Container } from '../../components/Section.jsx'
import { hall } from '../../config.js'

/* The «ورود مدیر» link lives here as small muted text — never in the
   top nav. Present for the demo, invisible to a casual visitor on a
   publicly-shared link. */

export default function Footer() {
  return (
    <footer className="bg-ink pt-20 pb-8">
      <Container>
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="font-display text-3xl font-extralight text-ivory">{hall.name}</p>
            <div
              className="mt-5 h-px w-20"
              style={{ background: 'linear-gradient(90deg, #C2A575, transparent)' }}
            />
            <p className="mt-5 max-w-sm leading-loose text-muted-lt">{hall.heroSub}</p>
          </div>

          <div>
            <p className="eyebrow mb-5">تماس</p>
            <ul className="space-y-3 text-sm text-muted-lt">
              <li>
                <a
                  href={`tel:${hall.phoneHref}`}
                  className="num transition-colors hover:text-ivory"
                >
                  {hall.phone}
                </a>
              </li>
              <li>
                <a
                  href={hall.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-ivory"
                >
                  اینستاگرام@{hall.instagram}
                </a>
              </li>
              <li className="num">{hall.hours}</li>
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-5">نشانی</p>
            <p className="text-sm leading-loose text-muted-lt">{hall.address}</p>
            <p className="mt-3 text-sm text-muted-lt">
              ظرفیت: <span className="num">{hall.capacity}</span>
            </p>
          </div>
        </div>

        <div className="mt-16 border-t border-ivory/10 pt-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-muted">
              © <span className="num">۱۴۰۵</span> {hall.fullName}. تمامی حقوق محفوظ است.
            </p>

            {/* Deliberately quiet */}
            <a
              href="#/admin"
              className="text-xs text-muted/70 transition-colors duration-300 hover:text-brass"
            >
              ورود مدیر
            </a>
          </div>
        </div>
      </Container>
    </footer>
  )
}
