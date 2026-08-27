/* ============================================================
   MOCK BACKEND DATA — demo only.

   Client names are deliberately generic-fictional. This ships to a
   public URL, so nothing here may resemble a real reservation.
   ============================================================ */

export const STATUS = {
  free: { key: 'free', label: 'آزاد', color: 'var(--color-free)' },
  tentative: { key: 'tentative', label: 'پیش‌قرار', color: 'var(--color-tentative)' },
  booked: { key: 'booked', label: 'رزرو شده', color: 'var(--color-booked)' },
}

export const seedBookings = [
  {
    id: 'b1',
    date: '1405-06-12',
    client: 'خانوادهٔ رضایی',
    phone: '۰۹۱۲ ۳۳۴ ۵۵ ۶۷',
    status: 'booked',
    guests: 380,
    contract: 420000000,
    deposit: 150000000,
    hall: 'سالن اصلی',
    note: 'سفرهٔ عقد در محوطهٔ باز، ساعت ۱۸.',
  },
  {
    id: 'b2',
    date: '1405-06-19',
    client: 'خانوادهٔ موسوی',
    phone: '۰۹۱۲ ۸۸۰ ۱۲ ۴۴',
    status: 'booked',
    guests: 250,
    contract: 310000000,
    deposit: 310000000,
    hall: 'سالن مروارید',
    note: 'تسویهٔ کامل انجام شده.',
  },
  {
    id: 'b3',
    date: '1405-06-26',
    client: 'خانوادهٔ کریمی',
    phone: '۰۹۳۵ ۴۴۱ ۰۹ ۲۱',
    status: 'tentative',
    guests: 300,
    contract: 350000000,
    deposit: 0,
    hall: 'سالن اصلی',
    note: 'منتظر واریز بیعانه تا پایان هفته.',
  },
  {
    id: 'b4',
    date: '1405-07-02',
    client: 'خانوادهٔ احمدی',
    phone: '۰۹۱۹ ۵۵۲ ۷۷ ۳۰',
    status: 'booked',
    guests: 450,
    contract: 510000000,
    deposit: 200000000,
    hall: 'سالن اصلی',
    note: 'آتش‌بازی هماهنگ شد.',
  },
  {
    id: 'b5',
    date: '1405-07-09',
    client: 'خانوادهٔ نوری',
    phone: '۰۹۱۲ ۱۰۲ ۸۸ ۱۵',
    status: 'tentative',
    guests: 200,
    contract: 260000000,
    deposit: 50000000,
    hall: 'سالن مروارید',
    note: 'تعداد مهمان ممکن است تغییر کند.',
  },
  {
    id: 'b6',
    date: '1405-07-16',
    client: 'خانوادهٔ صادقی',
    phone: '۰۹۲۱ ۷۷۴ ۳۳ ۰۸',
    status: 'booked',
    guests: 320,
    contract: 390000000,
    deposit: 180000000,
    hall: 'سالن اصلی',
    note: '',
  },
  {
    id: 'b7',
    date: '1405-06-05',
    client: 'خانوادهٔ حسینی',
    phone: '۰۹۳۰ ۲۲۸ ۵۵ ۹۱',
    status: 'booked',
    guests: 280,
    contract: 330000000,
    deposit: 120000000,
    hall: 'سالن مروارید',
    note: 'مراسم امشب — هماهنگی نهایی انجام شد.',
  },
]

export const seedLeads = [
  {
    id: 'l1',
    name: 'مریم اکبری',
    date: '1405-08-14',
    phone: '۰۹۱۲ ۴۴۵ ۶۶ ۷۸',
    message: 'برای حدود ۳۰۰ مهمان، امکان بازدید در آخر هفته هست؟',
    status: 'new',
    at: Date.now() - 1000 * 60 * 42,
  },
  {
    id: 'l2',
    name: 'پویا شریفی',
    date: '1405-07-23',
    phone: '۰۹۳۶ ۱۱۹ ۰۲ ۵۴',
    message: 'منوی کامل و شرایط بیعانه را لطفاً ارسال کنید.',
    status: 'new',
    at: Date.now() - 1000 * 60 * 60 * 5,
  },
  {
    id: 'l3',
    name: 'الهام دادگر',
    date: '1405-09-05',
    phone: '۰۹۱۲ ۹۰۳ ۴۴ ۱۲',
    message: 'مراسم عقد کوچک، حدود ۱۲۰ نفر.',
    status: 'contacted',
    at: Date.now() - 1000 * 60 * 60 * 26,
  },
]
