<div dir="rtl">

# ۷. راه‌اندازی دیتابیس

> بدون این مرحله سایت کار می‌کند ولی استعلام‌ها به صاحب کسب‌وکار **نمی‌رسند**.
> هر مرورگر داده‌های خودش را نگه می‌دارد و هیچ‌کدام به دیگری وصل نیست.

## ۱. پروژهٔ Supabase

supabase.com → New project. رمز دیتابیس را جایی امن ذخیره کنید (دیگر نشانش نمی‌دهد).

منطقه: نزدیک‌ترین به کاربران. برای ایران، Frankfurt.

## ۲. جدول‌ها و امنیت

**SQL Editor** → New query → کل `supabase/schema.sql` را بچسبانید → **Run**.

بعد این را جدا اجرا کنید. هر دو باید `true` باشند:

```sql
select tablename, rowsecurity from pg_tables
 where schemaname='public' and tablename in ('leads','bookings');
```

و این — `anon` باید **فقط یک ردیف** داشته باشد: `INSERT` روی `leads`:

```sql
select table_name, privilege_type
  from information_schema.role_table_grants
 where grantee='anon' and table_schema='public';
```

اگر چیز دیگری دیدید، جلوتر نروید.

## ۳. حساب مدیر

**Authentication → Users → Add user → Create new user**

ایمیل و رمز صاحب کسب‌وکار. تیک **Auto Confirm User** را بزنید.

بعد **Authentication → Providers → Email** و **Allow new users to sign up** را **خاموش** کنید.

⚠️ **این مرحله را رد نکنید.** بدون آن هرکسی برای خودش حساب می‌سازد و چون سیاست‌ها به کاربر واردشده دسترسی کامل می‌دهند، مستقیم وارد پنل می‌شود.

## ۴. کلیدها

**Project Settings → API** — دو چیز بردارید:
- `Project URL`
- کلید `anon` / `publishable`

⚠️ کلید `service_role` / `secret` را **هرگز** برندارید. آن همهٔ قوانین امنیتی را دور می‌زند.

## ۵. تست محلی

فایل `.env.local` در ریشهٔ پروژه:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxxxx
```

سرور را **restart** کنید (`Ctrl+C` بعد `npm run dev`) — این تنها فایلی است که با ذخیره‌شدن به‌تنهایی خوانده نمی‌شود.

**نشانهٔ موفقیت:** در صفحهٔ ورود پنل، فیلد اول به‌جای «نام کاربری» می‌گوید **«ایمیل»**.

## ۶. تست امنیت — انجامش بدهید

در ترمینال، با URL و کلید خودتان:

```bash
URL="https://xxxxx.supabase.co"
KEY="sb_publishable_xxxxx"

# باید 401 بدهد — بازدیدکننده نباید بتواند استعلام‌ها را بخواند
curl -s -o /dev/null -w "%{http_code}\n" "$URL/rest/v1/leads?select=*" \
  -H "apikey: $KEY" -H "Authorization: Bearer $KEY"

# باید 401 بدهد — رزروها اصلاً نباید دیده شوند
curl -s -o /dev/null -w "%{http_code}\n" "$URL/rest/v1/bookings?select=*" \
  -H "apikey: $KEY" -H "Authorization: Bearer $KEY"
```

اگر هرکدام `200` داد، **سایت را منتشر نکنید**. یعنی داده‌های مشتری عمومی است.

</div>
