# Fixwise operations plan: AI employees and automation

Summary in Arabic: the site and the business run themselves. The owner's minimum involvement is listed at the end.

## AI employees (Claude Managed Agents on schedules; each has a spend cap)
| Role | Schedule | Does | Guardrails | Reports |
|---|---|---|---|---|
| Content Producer | daily | Writes 1–3 TikTok scripts and captions from real symptoms; labels AI content and affiliate posts | Banned-claims list; at most 3 posts a day; official Content Posting API only | Posts, views, profile-to-site clicks |
| SEO Editor | weekly | Writes or refreshes up to 10–20 high-quality `/fix/` pages | Checks must pass before publish; no invented part numbers | Pages indexed, clicks |
| Ops Monitor | hourly | Watches AI spend, errors, latency, broken links | Switches to a cheaper mode at 150% of the daily budget | Uptime, cost per scan |
| Affiliate Manager | daily | Pulls earnings from each network, ranks merchants by earnings per click | Cannot create accounts or change link formats | Revenue by network |
| Support Agent | on each email | Answers common questions | Legal, refund, privacy and press requests go to the owner | Tickets, response time |
| Bookkeeper | daily, plus monthly close | Categorizes income, reconciles Payoneer/Wise deposits, monthly P&L, tracks forms | Read-only bank access; cannot move money | Profit, unmatched items, deadlines |
| Compliance Officer | monthly | Audits FTC and Amazon disclosures, AI labels, recall data freshness | Reports only | Violations found and fixed |
| Ads Analyst | daily, from January | Adjusts TikTok bids and kills losing ads | Hard daily budget; any increase needs the owner's approval | Spend, cost per scan, ROAS |

Scheduled jobs need a small companion Cloudflare Worker (`fixwise-cron`), because Cron Triggers don't run on Pages.

## Accountant: a human is legally required
- **AI bookkeeper:** day-to-day bookkeeping and reports.
- **Licensed US CPA:** signs Form 5472 and the pro-forma 1120 every year if there is a foreign-owned LLC. Late filing carries a $25,000 penalty. Budget about $300–1,500 a year.
- **Licensed Saudi adviser:** sets the zakat or income-tax position once, then files yearly if required.
- **Recommended total:** about $1,000–3,000 a year, covering accounting software, the AI bookkeeper and a specialist CPA for foreign-owned LLCs.

## What the owner must still do (legally tied to his identity)
- **Once (3–5 hours):** identity checks on Payoneer or Wise, each affiliate network, TikTok, Anthropic and Cloudflare; sign the W-8BEN and EIN forms; set up two-factor login.
- **Weekly (10 minutes):** read the dashboard and approve or deny escalations.
- **Monthly (15 minutes):** glance at the close report.
- **Yearly (1 hour):** sign the return the CPA prepares.
- **When asked:** contracts, legal notices, and identity re-verification.

## Red lines (to avoid account bans)
- No posting bots or engagement automation on TikTok; use the official API only.
- No Amazon links in emails, and no Amazon prices unless pulled live from Amazon's API.
- No incentivized clicks, and no automated link checks that count as fake clicks (send requests without cookies).
- An affiliate disclosure next to every link and in every TikTok caption.
