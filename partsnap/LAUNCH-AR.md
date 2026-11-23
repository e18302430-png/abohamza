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
