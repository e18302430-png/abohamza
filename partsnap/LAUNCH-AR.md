# قائمة الإطلاق: الخطوات اللازم تعملها إنت بنفسك

دي خطوات مربوطة بهويتك قانونياً، فما ممكن يعملها موظف ذكاء اصطناعي. الوقت الكلي حوالي 3 إلى 5 ساعات، مرة وحدة بس. امشي عليها بالترتيب:

| # | الخطوة | الرابط | ملاحظة |
|---|---|---|---|
| 1 | حساب Payoneer لاستلام الدولار | https://www.payoneer.com/ | بيقبل المقيمين في السعودية، وبيديك حساب استلام أمريكي |
| 2 | حساب Cloudflare | https://dash.cloudflare.com/sign-up | مجاني. فعّل التحقق بخطوتين |
| 3 | شراء نطاق (دومين) | من لوحة Cloudflare: Domains ← Register | حوالي 10 دولار في السنة |
| 4 | إنشاء مشروع Pages | Workers & Pages ← Create ← Pages | حتنشر عليه بالأمر `npx wrangler pages deploy dist` |
| 5 | خطة Workers المدفوعة | Workers & Pages ← Plans | **5 دولار في الشهر**. لازمة للتخزين المؤقت وعدادات الحماية، لأن الخطة المجانية بتسمح بـ 1000 كتابة في اليوم بس |
| 6 | KV باسم `PS_KV` | Workers ← KV | اربطه بالمشروع |
| 7 | Turnstile (حماية البوتات) | Cloudflare ← Turnstile | خذ Site Key وSecret |
| 8 | مفتاح الذكاء الاصطناعي | https://console.anthropic.com | السعودية من الدول المدعومة. **حطّ حد صرف شهري، مثلاً 50 دولار، من Settings ← Limits**. ده هو السقف الحقيقي للصرف |
| 9 | برامج العمولة | | شوف التفاصيل تحت الجدول |
| 10 | أمازون وeBay | https://affiliate-program.amazon.com/ ، https://partnernetwork.ebay.com/ | **بعد ما يجي ترافيك**: أمازون بيقفل الحساب لو ما جات 3 مبيعات في 180 يوم. تأكد إن eBay بيقبل المقيمين في السعودية |

**برامج العمولة (الخطوة 9):** كلها بتقبل الناشرين من برّه أمريكا، لكن كل تاجر بيوافق أو يرفض بنفسه.
- **Impact (PartSelect):** https://app.impact.com/signup/create-mediapartner-account-flow.ihtml
- **Rakuten (AppliancePartsPros):** https://rakutenadvertising.com/publishers/
- **Awin (Sears PartsDirect):** https://ui.awin.com/publisher-signup
- **CJ (RepairClinic):** https://signup.cj.com/member/signup/publisher/
- **FlexOffers (Sears Home Services):** https://www.flexoffers.com/affiliates/
- **Thumbtack:** https://www.thumbtack.com/partners. Thumbtack وAngi ممكن يطلبوا شركة أمريكية.

في كل برنامج حتعبّي نموذج **W-8BEN**.


## 💳 الدخل السريع: خطط الإصلاح المدفوعة عن طريق Payhip (فلوسها بتوصل خلال أيام)
1. **افتح حساب في https://payhip.com** واربطه بـ **PayPal**، عشان الفلوس تنزل فوراً مع كل بيعة.
2. **أنشئ 3 منتجات رقمية** (Digital product)، وفي كل واحد فعّل من Advanced Options الخيار **"Generate unique license keys for each sale"**:

   | المنتج | السعر |
   |---|---|
   | Fixwise Repair Plan | 3.99$ |
   | Fixwise 5 Plans | 12.99$ |
   | Fixwise Pro (1 year) | 29$ |

3. **من صفحة تعديل كل منتج انسخ «Product secret key»**، وحطّه في Cloudflare كسرّ (Secret) بالأسماء دي بالترتيب:
   - `PAYHIP_SECRET_SINGLE` لمنتج الخطة الواحدة
   - `PAYHIP_SECRET_PACK` لمنتج الخمس خطط
   - `PAYHIP_SECRET_YEAR` لمنتج السنة
4. **انسخ روابط الشراء الثلاثة** (شكلها `https://payhip.com/b/...`) وحطّها في `CONFIG.PAYHIP` في أول `index.html`. أو أرسلها لي وأنا أحطّها.

الزبون يشتري ← يجيه مفتاح في الإيميل ← يلصقه في الموقع ← السيرفر يتأكد من المفتاح عند Payhip ويكتب ليه الخطة. ولو الزبون رجّع فلوسه، Payhip بتوقف المفتاح تلقائياً.


## 🔗 روابط العمولة: بتتحط من Cloudflare، ومحتاجة إعادة نشر
في **Cloudflare Pages ← Settings ← Variables**، كل ما يجيك قبول من برنامج حطّ القيمة المقابلة ليه:

| المتغير | القيمة |
|---|---|
| `AMAZON_TAG` | رقم أمازون (مثلاً `fixwise-20`) |
| `EBAY_CAMPID` | رقم حملة eBay |
| `PARTSELECT_WRAP` و`FILTERBUY_WRAP` | رابط التتبع من Impact، وفيه `{url}` و`{subid}` |
| `PAYHIP_LINK_SINGLE` و`PAYHIP_LINK_PACK` و`PAYHIP_LINK_YEAR` | روابط الشراء من Payhip |
| `PRO_LINK_SEARS` | رابط Sears Home Services من FlexOffers |
| `PRO_CALL_NUMBER` | رقم تتبع من شبكة «ادفع على المكالمة»، وبعضها بيدفع أسبوعياً |
| `DAILY_AI_LIMIT=200` | سقف استخدام الذكاء الاصطناعي في اليوم. خلّيه كده لحد ما يجي دخل |

**مهم:** المتغيرات دي بتتقري في الموقع وقت ما يكون شغّال. في Cloudflare Pages أي متغير جديد بيشتغل بس بعد **إعادة النشر**، يعني بعد ما تحطّها شغّل `npx wrangler pages deploy dist` مرة كمان.

- **أزرار شراء خطط الإصلاح** ما بتظهر إلا لما يكون مفتاح Anthropic ومفاتيح Payhip كلها موجودة، عشان ما يدفع زبون في خدمة ما بتشتغل.
- **Angi وThumbtack:** ما لقينا ليهم برنامج عمولة عام، فشلتهم. البديل Sears Home Services، وشبكات «ادفع على المكالمة».

## بعد ما تفتح الحسابات
1. **في Cloudflare Pages ← Settings ← Variables حطّ القيم دي:**
   - **أسرار:** `ANTHROPIC_API_KEY` و`TURNSTILE_SECRET`
   - **متغيرات عادية:**
     - `TURNSTILE_SITE_KEY`
     - `ALLOWED_ORIGIN=https://نطاقك.com`
     - `DAILY_AI_LIMIT=3000`
2. **عبّي روابط العمولة** في `CONFIG` أول الكود (`index.html`).
3. **عبّي البيانات اللي بين [أقواس]** في `public/privacy.html` و`public/terms.html`: الاسم القانوني، والعنوان، والإيميل، والولاية. الأحسن تخلي محامي يراجعهم.
4. **انشر:**
   ```
   python3 build.py نطاقك.com
   npx wrangler pages deploy dist
   ```

## تيك توك
- **الفيديو جاهز:** `marketing/tiktok-1080x1920.mp4`، والنصوص في `marketing/CAPTIONS.md`.
- **في كل منشور فعّل خيارين:** "Content disclosure" و"AI-generated content".

## ملاحظات مهمة
- **المثال في الموقع بماركة وهمية (NORTHGATE)** عشان ما نوحي إننا تابعين لأي شركة. أسماء الماركات الحقيقية بتظهر بس لما الزبون يكتب جهازه.
- **الحماية:** موجودة في الكود، وحد الصرف في حساب Anthropic هو الضمان الأخير.
- **المحاسب:** محاسب أمريكي مرخّص (CPA) لو فتحت شركة أمريكية (LLC)، ومستشار سعودي مرخّص لوضع الزكاة والضريبة. التفاصيل في `OPERATIONS.md`.
