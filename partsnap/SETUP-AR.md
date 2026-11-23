# دليل تشغيل Fixwise

## الموجود في المشروع
| الملف | الوظيفة |
|---|---|
| `index.html` | الموقع كامل: التصميم والحركات والخدمات الثمانية |
| `functions/api/label.js` | قراءة ملصق الجهاز بالذكاء الاصطناعي |
| `functions/api/diagnose.js` | تشخيص العطل (قفل أمان للغاز والتبريد والميكروويف من السيرفر) |
| `functions/api/filter.js` | قراءة مقاس فلتر المكيّف من صورة |
| `functions/api/recalls.js` | فحص الأجهزة المسحوبة من قاعدة بيانات الحكومة الأمريكية (CPSC) |
| `functions/api/event.js` | عدّاد زيارات بدون كوكيز |
| `public/` | صفحات الخصوصية والشروط والأيقونات وإعدادات الأمان |
| `build.py` | يجهّز نسخة النشر في `dist/` |

## خطوات الإطلاق (مرة وحدة)
1. **Cloudflare** (مجاني): أنشئ مشروع Pages باسم `fixwise`.
2. **مفتاح الذكاء الاصطناعي:** من console.anthropic.com أنشئ مفتاح API، وحطّ حد صرف شهري (مثلاً 50 دولار).
3. **حماية البوتات:** من لوحة Cloudflare أنشئ Turnstile، وخذ Site Key وSecret.
4. **التخزين:** أنشئ KV namespace واربطه بالمشروع باسم `PS_KV`. ده مسؤول عن الحماية والسقف اليومي والتخزين المؤقت.
5. **الإعدادات في Cloudflare Pages ← Settings ← Variables:**
   - **أسرار (Secrets):** `ANTHROPIC_API_KEY` و`TURNSTILE_SECRET`
   - **متغيرات عادية:**
     - `TURNSTILE_SITE_KEY`
     - `ALLOWED_ORIGIN=https://نطاقك.com`
     - `DAILY_AI_LIMIT=3000`
     - `PER_IP_PER_MINUTE=8`
6. **النشر:**
   ```
   python3 build.py نطاقك.com
   npx wrangler pages deploy dist
   ```
7. **روابط العمولة:** عبّي قيم `CONFIG` في أول الكود (`index.html`) بعد قبولك في كل برنامج.

## ترتيب التقديم على برامج العمولة
1. PartSelect (عن طريق Impact)
2. AppliancePartsPros (عن طريق Rakuten)
3. Sears PartsDirect
4. RepairClinic (عن طريق CJ)
5. Filterbuy
6. Sears Home Services وAngi وThumbtack (لزرار «احجز فني»)
7. أمازون، بعد ما يجي ترافيك: لو ما جات 3 مبيعات في 180 يوم بيقفلوا الحساب
8. eBay

في كل برنامج حتعبّي نموذج **W-8BEN** الضريبي.

## التكلفة المتوقعة
- **قراءة الملصق:** حوالي 1.5 إلى 2.5 سنت للمرة.
- **التشخيص بالذكاء الاصطناعي:** حوالي 1 إلى 3.5 سنت، وبيشتغل بس لما الزبون يكتب وصف أو يضيف صورة. الأعطال المعروفة بتشتغل مجاناً من دليلنا.
- **فحص الأجهزة المسحوبة:** مجاني.
- **الاستضافة على Cloudflare:** مجانية في البداية.
