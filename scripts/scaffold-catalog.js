import { mkdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const root = resolve(new URL('..', import.meta.url).pathname)

const loops = [
  loop('bug-autofix', 'Bug Autofix', 'engineering', 'Watch production errors, open scoped fix PRs, and verify that the error rate drops.', ['github', 'sentry'], 'Reduce production errors without introducing regressions.', 'A production error repeats, a paying user is affected, or a new error appears after deploy.', 'Sentry error groups, application logs, recent deploys, GitHub issues, CI status.', 'Rank by paying users affected, frequency, recency, deploy correlation, and fix reversibility.', 'Create issue, generate run brief, ask Codex or Claude Code for a patch, open PR, request merge approval.', 'Issues and PRs can be automatic. Merge, deploy, billing code, and emergency hotfixes require explicit authority.', 'After merge, check the error group for 24 hours. Success means error rate drops at least 80% and no related regression appears.', 'Run soon when a signal spikes. After PR creation, follow up in 6 hours. After merge, verify after 24 hours.', 'Root cause, changed files, test added, fix pattern, verification result, and what not to retry.'),
  loop('regression-watch', 'Regression Watch', 'engineering', 'Watch deploys for new errors, broken funnels, or sudden metric drops.', ['github', 'sentry', 'analytics'], 'Catch regressions quickly after releases.', 'A deploy finishes, a new error group appears, or a critical metric moves after release.', 'Deploy history, Sentry, logs, analytics events, funnel metrics, CI status.', 'Compare before and after deploy windows and isolate the smallest plausible cause.', 'Open issue, request rollback, ask executor for a patch, notify owner.', 'Rollback and customer-impacting changes require approval unless full autonomy is granted.', 'Verify the regressed metric returns to baseline and no new issue appears in the next 24 hours.', 'Check 30 minutes after deploy, again after 2 hours if anomalous, then after 24 hours.', 'Release pattern, regression cause, detection lag, rollback or patch outcome.'),
  loop('dependency-risk', 'Dependency Risk', 'engineering', 'Monitor vulnerable or outdated dependencies and open safe upgrade PRs.', ['github'], 'Keep dependencies secure without destabilizing the product.', 'A security advisory, lockfile drift, or stale critical dependency appears.', 'Package manifests, lockfiles, advisories, changelogs, CI status.', 'Prioritize security, runtime packages, and low-risk patch upgrades.', 'Open upgrade branch, run tests, open PR with risk notes.', 'Patch/minor PRs can be automatic. Major upgrades require approval.', 'CI passes and no runtime regression is reported after the verification window.', 'Run weekly, immediately on security advisories, and after blocked PRs are updated.', 'Upgrade pattern, package risk, test failures, rollback notes.'),
  loop('performance-fix', 'Performance Fix', 'engineering', 'Detect slow pages or endpoints, optimize, and verify latency improvement.', ['analytics', 'logs', 'github'], 'Improve user-visible latency and reliability.', 'Page speed or endpoint latency crosses target thresholds.', 'RUM metrics, server logs, Core Web Vitals, traces, code hot paths.', 'Rank by user volume, revenue impact, p95 latency, and implementation risk.', 'Create performance issue, profile, patch, open PR.', 'Read-only diagnosis is automatic. Code changes follow repository authority.', 'p95 latency or CWV improves against baseline without error increase.', 'Check daily while slow, verify after deploy and after traffic sample is sufficient.', 'Bottleneck, optimization, metric delta, and regression risk.'),
  loop('broken-flow-repair', 'Broken Flow Repair', 'engineering', 'Continuously test key product flows and repair failures.', ['playwright', 'github'], 'Keep signup, checkout, login, and core workflows functional.', 'Synthetic tests fail or product analytics show abnormal flow drop-off.', 'Browser checks, screenshots, console errors, network failures, funnel analytics.', 'Determine whether failure is frontend, backend, provider, auth, or content related.', 'Open issue, generate reproduction, ask executor for fix, attach screenshots.', 'Fix PRs can be automatic. Payment, auth, and deploy actions require approval.', 'Synthetic flow passes and funnel metric recovers or stabilizes.', 'Run after deploys, daily for critical flows, and immediately after a failure.', 'Broken step, root cause, screenshot, test added, fix result.'),
  loop('failed-job-recovery', 'Failed Job Recovery', 'engineering', 'Detect failed jobs, webhooks, or queues and recover safely.', ['logs', 'github'], 'Prevent background failures from silently damaging the business.', 'A recurring job, webhook, or queue worker fails repeatedly.', 'Job logs, webhook dashboards, retry counts, error payloads, recent changes.', 'Classify transient provider issue versus code/data bug.', 'Retry safe jobs, open issue, patch code, create support packet.', 'Retries are automatic when idempotent. Data mutation and billing retries require approval.', 'Failed job count drops and affected records are reconciled.', 'Recheck quickly during incident, then daily until zero failures.', 'Failure class, idempotency decision, affected records, recovery result.'),
  loop('seo-growth', 'SEO Growth', 'seo', 'Run a complete organic growth loop across GSC, competitor research, page updates, and delayed verification.', ['gsc', 'github'], 'Grow qualified organic traffic through repeated evidence-driven SEO improvements.', 'GSC shows opportunity, rankings decay, competitors gain share, or the owner requests an SEO improvement cycle.', 'GSC pages and queries, current content, sitemap, internal links, competitor SERPs, and prior SEO loop journals.', 'Choose whether the highest-leverage action is page refresh, new page, internal links, technical fix, or no-op.', 'Create page brief, edit existing page, draft new article, add internal links, or open a technical SEO issue.', 'Drafts and low-risk PRs can be automatic. Publishing follows website authority.', 'Verify after 14-28 days using clicks, CTR, rank, impressions, and indexed status.', 'Run when fresh GSC data contains material opportunity. After a change, wait for the search verification window.', 'SEO hypothesis, action taken, baseline, verification date, result, and failed tactics.'),
  loop('gsc-rank-growth', 'GSC Rank Growth', 'seo', 'Find GSC ranking and CTR opportunities, improve pages, and verify delayed impact.', ['gsc', 'github'], 'Increase qualified organic clicks from existing pages.', 'A page has impressions with weak CTR, rank 4-20 opportunity, or click decay.', 'GSC queries/pages/devices, current page content, SERP snippets, internal links.', 'Separate ranking, CTR, intent mismatch, cannibalization, and indexing issues.', 'Draft title/meta/content/internal-link improvements and open PR or CMS draft.', 'Drafts can be automatic. Publishing requires approval unless authority allows routine SEO edits.', 'Verify after 14-28 days using clicks, CTR, average position, and indexed status.', 'Run when GSC data refreshes, then wait for search verification window.', 'Query intent, change made, baseline, verification delta, failed hypotheses.'),
  loop('content-refresh', 'Content Refresh', 'seo', 'Refresh decaying pages with current content, better examples, and internal links.', ['gsc', 'github'], 'Recover organic traffic from pages losing relevance.', 'Clicks or impressions decay over several weeks without a known seasonality reason.', 'GSC history, page age, competitor pages, docs/API changes, internal links.', 'Identify whether decay comes from stale content, SERP change, title issue, or lost intent match.', 'Update content, screenshots, examples, FAQs, schema, and links.', 'Content PRs are automatic. Publishing follows website authority.', 'Traffic or CTR stabilizes or improves after verification window.', 'Run weekly for decaying pages and verify 21 days after changes.', 'Decay cause, refreshed sections, competitor insight, result.'),
  loop('new-page-opportunity', 'New Page Opportunity', 'seo', 'Research gaps and create new pages or articles when evidence supports demand.', ['gsc', 'ahrefs', 'github'], 'Capture search demand not covered by current site.', 'Competitor ranks for relevant terms, GSC shows adjacent queries, or customers use repeated language.', 'Ahrefs/SEO data, GSC, competitor SERPs, product capabilities, existing sitemap.', 'Score by intent, difficulty, business fit, content uniqueness, and cannibalization risk.', 'Draft page brief, create article/tool page, add internal links.', 'New page drafts are automatic. Publishing requires approval by default.', 'Verify indexing, impressions, and early ranking after 14-45 days.', 'Schedule after research, after publish, and when indexed data appears.', 'Keyword thesis, page angle, publish date, index/rank result.'),
  loop('internal-linking', 'Internal Linking', 'seo', 'Find underlinked pages and add contextual internal links.', ['gsc', 'github'], 'Improve crawlability and authority flow across existing content.', 'A valuable page is orphaned, underlinked, or ranking just below target.', 'Sitemap, page graph, GSC performance, content inventory.', 'Find relevant source pages with contextual anchor opportunities.', 'Open PR adding links and updating navigation or related content blocks.', 'Routine internal-link PRs can be automatic. Sitewide navigation changes require approval.', 'Verify crawl/index status and target page performance after 21 days.', 'Run monthly and after publishing new pages.', 'Source pages, anchors used, target pages, performance delta.'),
  loop('technical-seo', 'Technical SEO', 'seo', 'Monitor indexing, sitemap, canonicals, schema, metadata, and Core Web Vitals.', ['gsc', 'github'], 'Keep the site technically indexable and healthy.', 'GSC coverage warnings, sitemap errors, metadata regressions, schema failures, CWV drops.', 'GSC, sitemap, robots.txt, page HTML, structured data, CWV metrics.', 'Classify issue by indexability, duplication, metadata, structured data, or performance.', 'Open fix PR, update sitemap/schema/meta, request validation.', 'Technical fixes can be automatic if low-risk. Canonical/indexing changes require approval.', 'GSC validation passes or affected URL count declines.', 'Run weekly and immediately after GSC/indexing anomalies.', 'Issue class, URLs affected, fix, validation result.'),
  loop('programmatic-seo-qa', 'Programmatic SEO QA', 'seo', 'Audit generated pages for thin content, duplicates, cannibalization, and quality drift.', ['gsc', 'github'], 'Keep programmatic pages useful and non-spammy.', 'New page batch ships, traffic decays, duplicate/cannibalization risk appears.', 'Generated page samples, templates, GSC, duplicate clusters, quality rubric.', 'Identify thin pages, duplicate templates, missing unique evidence, and search intent conflicts.', 'Flag pages, improve templates, prune or noindex weak pages.', 'Pruning/noindex requires approval. Template quality PRs can be automatic.', 'Quality checks pass and indexed pages avoid traffic/CTR decline.', 'Run after page generation and monthly for mature page sets.', 'Template issue, pages affected, action, SEO outcome.'),
  loop('traffic-growth-optimizer', 'Traffic Growth Optimizer', 'growth', 'Diagnose traffic changes and choose the next highest-leverage channel action.', ['analytics', 'gsc'], 'Grow qualified traffic without chasing vanity metrics.', 'Traffic changes materially or a channel underperforms baseline.', 'Analytics channels, GSC, campaigns, referrals, landing pages, conversion by source.', 'Separate volume, quality, conversion, attribution, and seasonality effects.', 'Recommend channel action, create content brief, adjust internal links, or flag no-op.', 'Recommendations are automatic. Publishing/spend actions require loop-specific authority.', 'Traffic quality improves: qualified visits, activation, or paid conversion by channel.', 'Run when data changes enough, not on a fixed cadence.', 'Channel diagnosis, action, metric target, outcome.'),
  loop('conversion-optimizer', 'Conversion Optimizer', 'growth', 'Track visit-to-paid conversion, test changes, and keep or revert based on results.', ['analytics', 'stripe', 'github'], 'Improve conversion to paid with controlled changes.', 'Conversion drops, traffic mix shifts, or an experiment opportunity is identified.', 'Landing pages, funnel analytics, Stripe conversion, pricing, user sessions.', 'Check sample size, source mix, recent changes, and benchmark gap before acting.', 'Draft copy/UI/paywall changes, open PR, define verification window.', 'Tests and drafts automatic. Publishing experiment requires approval unless routine.', 'Keep change only if conversion improves with sufficient sample or no downside.', 'Wait until minimum sample size or verification window is reached.', 'Hypothesis, baseline, change, sample size, result, keep/revert decision.'),
  loop('activation-optimizer', 'Activation Optimizer', 'growth', 'Find onboarding drop-offs and ship improvements that increase first value.', ['analytics', 'github'], 'Increase the share of new users reaching activation.', 'Activation rate drops or onboarding step has high abandonment.', 'Event funnel, session recordings if available, support feedback, onboarding code.', 'Classify friction as clarity, technical, setup, pricing, or missing integration.', 'Draft onboarding change, checklist, empty state, or bug fix.', 'Product changes require normal code authority.', 'Activation rate improves and support confusion decreases.', 'Run when enough new users enter onboarding or after a product change.', 'Friction found, fix shipped, activation delta.'),
  loop('pricing-experiment', 'Pricing Experiment', 'growth', 'Monitor pricing metrics and propose reversible pricing tests.', ['stripe', 'analytics'], 'Improve ARPU and conversion without increasing churn unexpectedly.', 'Conversion, ARPU, churn, refund, or competitor pricing signals change.', 'Stripe plans, checkout conversion, churn cohorts, competitor pricing, support objections.', 'Estimate upside, downside, reversibility, affected cohorts, and trust impact.', 'Propose price/page/offer test with rollback plan.', 'Pricing changes require explicit approval. The loop may draft only by default.', 'Measure conversion, ARPU, churn, refunds, and support complaints.', 'Run monthly or when material pricing signal appears.', 'Hypothesis, cohort, test design, result, rollback decision.'),
  loop('winback', 'Winback Loop', 'growth', 'Identify churned or high-intent users and draft targeted winback actions.', ['stripe', 'email'], 'Recover qualified users who churned or stalled.', 'A churned segment emerges or a product fix addresses prior churn reason.', 'Stripe churn data, cancellation reasons, product changes, email history.', 'Segment by reason, value, timing, and whether the product now solves the issue.', 'Draft winback email, offer, or product update note.', 'Draft-only by default. Sending requires communication authority.', 'Measure replies, reactivations, unsubscribes, and revenue recovered.', 'Run after relevant product fixes and monthly for churn cohorts.', 'Segment, message angle, send status, recovered revenue.'),
  loop('ads-budget-guard', 'Ads Budget Guard', 'ads', 'Monitor paid campaigns and enforce CAC, ROAS, and spend safety.', ['ads', 'stripe', 'analytics'], 'Prevent paid acquisition from burning money.', 'Spend, CAC, ROAS, or conversion moves outside guardrails.', 'Ad platform spend, analytics, Stripe revenue, landing page conversion.', 'Separate tracking issue, creative fatigue, bad audience, landing mismatch, and seasonal noise.', 'Recommend cut, pause, budget cap, or new test.', 'Spend changes require ads authority and hard caps. Draft mode by default.', 'CAC/ROAS returns within guardrails or spend is safely paused.', 'Run daily for active spend, faster on spend spikes.', 'Campaign, diagnosis, action, spend saved or revenue impact.'),
  loop('creative-testing', 'Creative Testing', 'ads', 'Generate, test, kill, and scale ad creative variants under caps.', ['ads', 'analytics'], 'Improve paid creative performance through controlled iteration.', 'Creative fatigue, low CTR, high CAC, or campaign learning stagnation appears.', 'Ad performance, comments, landing page, audience, prior creative history.', 'Identify message, visual, audience, and landing mismatch hypotheses.', 'Draft new variants, recommend kill/keep/scale, update test plan.', 'Publishing and scaling require authority. Drafts can be automatic.', 'CTR/CVR/CAC improves against control with enough spend or impressions.', 'Run when spend/sample threshold is reached, not daily by default.', 'Creative hypothesis, variants, result, winning pattern.'),
  loop('landing-page-match', 'Landing Page Match', 'ads', 'Align ads with landing pages to reduce paid traffic waste.', ['ads', 'analytics', 'github'], 'Improve paid conversion by matching promise, audience, and landing page.', 'Paid clicks convert below benchmark or bounce rate rises.', 'Ad copy, creative, landing page, traffic source, funnel analytics.', 'Compare ad promise to first viewport, proof, CTA, pricing, and intent.', 'Draft landing copy/section changes or ad copy recommendations.', 'Landing PRs and ad changes follow respective authority.', 'Paid conversion or bounce improves after sufficient traffic.', 'Run when ad test starts, after enough clicks, and after landing change.', 'Mismatch found, fix, source-specific outcome.'),
  loop('feedback-to-fix', 'Feedback to Fix', 'customer', 'Classify user feedback, turn it into fixes or issues, and draft replies.', ['support', 'github'], 'Convert repeated user pain into product improvement and clear replies.', 'New feedback arrives, complaints cluster, or a high-value user reports pain.', 'Support threads, feedback forms, reviews, GitHub issues, product state.', 'Classify bug, feature request, support confusion, pricing objection, or edge case.', 'Open issue, ask executor for fix, draft customer reply, propose roadmap item.', 'Replies and PRs require communication/code authority. Classification can be automatic.', 'Issue is resolved or acknowledged, customer receives useful response, repeat complaints decline.', 'Run when feedback count threshold is reached or high-value feedback arrives.', 'Feedback cluster, classification, action, reply, resolution outcome.'),
  loop('support-quality', 'Support Quality', 'customer', 'Review support threads for unresolved pain and response quality.', ['support'], 'Improve support outcomes and extract product learnings.', 'Open threads age, repeated follow-ups, low satisfaction, or unresolved pain appears.', 'Support inbox, response times, customer sentiment, linked product issues.', 'Identify unresolved root cause, missing macro, product gap, or bad response.', 'Draft follow-up, propose macro, create issue, record learning.', 'Customer replies require authority. Internal notes are automatic.', 'Thread closes satisfactorily or gets escalated with clear owner.', 'Run daily for active inboxes and faster for urgent customers.', 'Thread pattern, support gap, action, customer outcome.'),
  loop('churn-reason-mining', 'Churn Reason Mining', 'customer', 'Mine churn, refunds, and support for repeated cancellation causes.', ['stripe', 'support'], 'Reduce churn by finding repeated causes worth fixing.', 'New churn events, refund requests, or cancellation feedback accumulates.', 'Stripe churn/refunds, cancellation reasons, support conversations, usage data.', 'Cluster causes by revenue, frequency, preventability, and product area.', 'Create churn insight, propose product/support/pricing action.', 'Analysis automatic. Product/communication actions require authority.', 'The targeted churn cause declines or is deprioritized with evidence.', 'Run when enough new churn data exists or monthly.', 'Churn cluster, evidence, proposed fix, outcome.'),
  loop('feature-request-scoring', 'Feature Request Scoring', 'customer', 'Cluster and score feature requests by evidence and business value.', ['support', 'analytics', 'stripe'], 'Prioritize features using demand evidence instead of anecdotes.', 'Feature requests accumulate or roadmap decision is needed.', 'Support requests, user segments, revenue, product usage, strategy docs.', 'Score by user count, revenue, frequency, strategic fit, effort, and alternatives.', 'Create ranked feature brief, open issue, recommend no-build when weak.', 'Roadmap changes require approval. Scoring is automatic.', 'Selected features show adoption or evidence remains insufficient and work is stopped.', 'Run after request threshold or before planning review.', 'Cluster, score, decision, adoption outcome.'),
  loop('review-testimonial', 'Review Testimonial Loop', 'customer', 'Ask happy users for reviews or testimonials at the right moment.', ['support', 'stripe', 'email'], 'Generate social proof without annoying users.', 'A user succeeds, upgrades, replies positively, or reaches usage milestone.', 'Customer success signals, support sentiment, revenue status, prior outreach.', 'Check fit, timing, ask fatigue, and testimonial angle.', 'Draft review/testimonial request and track response.', 'Sending requires communication authority and suppression rules.', 'Measure replies, reviews collected, unsubscribes, and relationship impact.', 'Run when positive signals arrive, with per-user cooldowns.', 'Trigger, ask angle, response, proof asset produced.'),
  loop('email-outreach', 'Email Outreach', 'sales', 'Build targeted outreach lists, draft messages, and measure replies safely.', ['email', 'crm'], 'Create qualified pipeline without spam.', 'A campaign goal exists and a verified target segment is available.', 'Prospect list, website, CRM, prior emails, suppression list, offer proof.', 'Score relevance, personalization evidence, risk, and expected value.', 'Draft messages, prepare send queue, record objections and replies.', 'Draft-only by default. Sending needs strict authority, caps, and suppression.', 'Measure replies, positive responses, unsubscribes, and conversions.', 'Run when list quality threshold is met and cooldown allows.', 'Segment, message pattern, reply outcome, suppression updates.'),
  loop('lead-followup', 'Lead Follow-up', 'sales', 'Detect stale leads or trials and draft next best follow-up.', ['crm', 'email', 'analytics'], 'Recover interested prospects with timely follow-up.', 'Lead is stale, trial has intent signal, or reply is waiting.', 'CRM stage, email history, product usage, website activity.', 'Determine next step: answer objection, ask question, offer help, or stop.', 'Draft follow-up and update CRM next action.', 'Sending requires communication authority.', 'Measure reply, conversion, or qualified close-lost reason.', 'Run when lead state changes or follow-up date arrives.', 'Lead status, reason for follow-up, message, outcome.'),
  loop('crm-hygiene', 'CRM Hygiene', 'sales', 'Clean stale deals, missing notes, and next actions.', ['crm'], 'Keep sales data usable and prevent silent pipeline decay.', 'Deals go stale, stages conflict, or required fields are missing.', 'CRM records, activity history, owner notes, expected close dates.', 'Identify stale, duplicate, blocked, or missing-context records.', 'Draft updates, create tasks, request missing info.', 'Safe metadata cleanup can be automatic. Deal stage changes may require approval.', 'Pipeline has fewer stale/unknown records and next actions are explicit.', 'Run weekly or after major sales activity.', 'Records changed, stale pattern, next-action quality.'),
  loop('failed-payment-recovery', 'Failed Payment Recovery', 'finance', 'Detect failed payments and recover revenue with controlled customer communication.', ['stripe', 'email'], 'Recover failed payments without damaging trust.', 'Payment fails, subscription becomes past due, or dunning does not recover.', 'Stripe invoices, customer history, plan, prior payment failures, email status.', 'Classify card issue, fraud risk, high-value account, and communication timing.', 'Draft recovery email, create task, update customer note.', 'Emails require communication authority. Refunds/credits require money authority.', 'Measure recovered MRR, cancellation, or no-response outcome.', 'Run on payment failure, then according to dunning intervals.', 'Customer segment, message, recovered amount, outcome.'),
  loop('refund-dispute-defense', 'Refund and Dispute Defense', 'finance', 'Gather evidence for refunds or disputes and draft responses.', ['stripe', 'support'], 'Handle payment disputes with evidence and consistent policy.', 'A dispute, refund request, or chargeback signal appears.', 'Stripe invoice, usage logs, terms, support history, product access.', 'Assess validity, policy, customer harm, evidence completeness, and goodwill risk.', 'Draft evidence packet, recommend refund/defense, create support response.', 'Submission/refund requires money authority. Drafting evidence is automatic.', 'Track dispute result, refund acceptance, and policy learning.', 'Run immediately on dispute and before submission deadline.', 'Reason, evidence, decision, outcome, future prevention.'),
  loop('margin-watch', 'Margin Watch', 'finance', 'Monitor infrastructure, model, ads, and vendor costs against revenue.', ['stripe', 'billing'], 'Protect gross margin and detect cost leaks.', 'Cost or margin moves outside threshold.', 'Revenue, model costs, hosting, provider bills, ad spend, usage by customer.', 'Separate growth-driven cost, leak, abuse, bad pricing, or provider change.', 'Recommend cuts, pricing changes, limits, or vendor changes.', 'Cost-cut recommendations automatic. Production changes require authority.', 'Margin returns to target or exception is documented.', 'Run weekly and on cost spike anomalies.', 'Cost driver, action, savings, margin result.'),
  loop('mrr-anomaly', 'MRR Anomaly', 'finance', 'Detect and diagnose MRR, churn, expansion, and refund anomalies.', ['stripe', 'analytics'], 'Explain revenue movement quickly and accurately.', 'MRR, churn, expansion, refunds, or trial conversion moves materially.', 'Stripe events, customer segments, plan changes, refunds, product usage.', 'Classify data issue, cohort behavior, pricing impact, churn driver, or expansion event.', 'Create diagnosis report, recommend action, open follow-up loops.', 'Analysis automatic. Money/customer actions require authority.', 'Anomaly is explained and linked actions are verified.', 'Run on anomaly and after follow-up data arrives.', 'Metric move, cause, confidence, action, result.'),
  loop('usage-drop-watch', 'Usage Drop Watch', 'product', 'Detect product usage drops by cohort or feature and investigate.', ['analytics'], 'Catch product value degradation before churn.', 'Active usage, feature use, or cohort retention drops.', 'Product analytics, cohort data, release history, support feedback.', 'Identify if drop is tracking, seasonality, broken flow, UX friction, or lost demand.', 'Create investigation, open issue, propose fix or no-op.', 'Read-only automatic. Product changes require code authority.', 'Usage stabilizes or cause is documented with next action.', 'Run when usage threshold changes and after relevant release.', 'Cohort, feature, cause, follow-up action.'),
  loop('quality-regression', 'Quality Regression', 'product', 'Monitor generation failures, retries, complaints, and refunds for quality decline.', ['analytics', 'support', 'stripe'], 'Keep product output quality above customer tolerance.', 'Failure rate, retries, complaints, or refunds increase.', 'Generation logs, support complaints, refunds, model/provider changes.', 'Classify provider issue, prompt regression, UX gap, abuse, or expectation mismatch.', 'Open issue, propose prompt/model/tool fix, draft customer note.', 'Prompt/config changes require authority defined by product risk.', 'Failure/complaint rate returns to baseline.', 'Run on quality anomaly and after model/provider changes.', 'Quality signal, root cause, fix, metric result.'),
  loop('roadmap-reality-check', 'Roadmap Reality Check', 'product', 'Compare roadmap ideas against evidence before building.', ['support', 'analytics', 'stripe'], 'Prevent low-evidence feature work.', 'A new idea appears, repeated request cluster forms, or planning review starts.', 'Feature requests, revenue segments, usage, strategy, competitor context.', 'Score evidence, opportunity cost, reversibility, and fastest validation path.', 'Recommend build, validate, defer, or kill.', 'Analysis automatic. Roadmap commitment requires approval.', 'Decision outcome is reviewed after planned interval.', 'Run before planning and when evidence changes.', 'Idea, evidence score, decision, eventual outcome.'),
  loop('weekly-business-review', 'Weekly Business Review', 'ops', 'Summarize business metrics, decisions, risks, and next actions.', ['stripe', 'analytics', 'support'], 'Maintain operator situational awareness and decision quality.', 'Weekly review time arrives or owner requests a review.', 'Revenue, traffic, activation, support, product changes, decisions, loop journals.', 'Separate meaningful changes from noise and identify the highest-leverage next action.', 'Write review, propose decisions, update beliefs.', 'Reports automatic. New actions follow their loop authority.', 'Next week, decision outcomes and metric predictions are checked.', 'Run weekly, then schedule outcome review for next cycle.', 'Metrics, decisions, predictions, misses, learnings.'),
  loop('decision-outcome-review', 'Decision Outcome Review', 'ops', 'Revisit past decisions and score whether expected outcomes happened.', ['analytics', 'stripe'], 'Improve judgment by closing the loop on decisions.', 'A decision verification date arrives or a major outcome lands.', 'Decision log, expected outcome, metrics, artifacts, follow-up notes.', 'Compare actual versus expected and classify why it matched or missed.', 'Score decision, update confidence, suggest policy change.', 'Scoring automatic. Policy changes require approval.', 'Decision has an outcome, learning, and next policy implication.', 'Run when verification dates arrive.', 'Decision, expectation, result, bias or pattern.'),
  loop('competitor-watch', 'Competitor Watch', 'ops', 'Track competitor launches, pricing, SEO, ads, and positioning changes.', ['web', 'seo'], 'Keep strategy informed without overreacting.', 'Competitor page changes, pricing shifts, ad changes, ranking moves, or news appear.', 'Competitor sites, SERPs, ads libraries, changelogs, public posts.', 'Classify threat, noise, copyable tactic, differentiation gap, or no-op.', 'Write brief, propose response, create SEO/product follow-up.', 'Analysis automatic. Public response/product changes require authority.', 'Response action is later evaluated for impact or marked no-op.', 'Run weekly or on material competitor change.', 'Change observed, assessment, response, result.'),
  loop('compliance-watch', 'Compliance Watch', 'ops', 'Track deadlines, policy changes, and required compliance tasks.', ['calendar', 'web'], 'Avoid missed deadlines and stale legal/operational obligations.', 'Deadline approaches, regulation changes, or required document is missing.', 'Calendar, official sources, internal policies, company context.', 'Assess applicability, urgency, owner, evidence source, and required action.', 'Create checklist, draft document, request approval or expert review.', 'Compliance tasks are draft/ask-first by default.', 'Deadline is met or risk is explicitly escalated.', 'Schedule based on deadline, lead time, and missing dependencies.', 'Rule, source, applicability, action, completion evidence.'),
  loop('knowledge-hygiene', 'Knowledge Hygiene', 'ops', 'Clean stale beliefs, contradictions, obsolete assumptions, and failed tactics.', ['memory'], 'Keep agent memory useful and current.', 'Weekly reflection, contradiction, stale claim, or repeated failed action appears.', 'Loop journals, decisions, beliefs, metrics, user corrections.', 'Detect stale facts, contradictions, weak evidence, and repeated failed tactics.', 'Draft memory updates and policy changes.', 'Memory updates can be automatic if low risk. Strategy changes require approval.', 'Future runs use cleaner context and avoid repeated failed tactics.', 'Run weekly and after major business changes.', 'Removed stale belief, resolved contradiction, new policy.'),
  loop('integration-health', 'Integration Health', 'ops', 'Monitor OAuth/API connectors and recover broken access before loops fail.', ['integrations'], 'Keep data sources connected and prevent silent blind spots.', 'Connector errors, expired tokens, missing scopes, or stale sync timestamps appear.', 'Connector status, last sync, API errors, scope grants, loop dependencies.', 'Classify credential, provider outage, scope, quota, or code issue.', 'Notify owner, create support packet, pause dependent loops, retry safe sync.', 'Credential repair requires user action. Safe retries automatic.', 'Connector syncs successfully and dependent loops resume.', 'Run when connector status changes and daily for critical integrations.', 'Connector, failure class, affected loops, recovery.'),
  loop('email-deliverability', 'Email Deliverability', 'sales', 'Monitor bounce, spam, unsubscribe, and reply quality for outbound email.', ['email'], 'Protect sender reputation and outreach quality.', 'Bounce rate, spam complaints, unsubscribes, or low reply quality crosses threshold.', 'Email provider metrics, suppression list, campaign copy, reply sentiment.', 'Classify list quality, copy issue, domain reputation, or offer mismatch.', 'Pause campaign, update suppression, improve copy, reduce volume.', 'Sending and volume changes require communication authority.', 'Deliverability metrics return within guardrails.', 'Run daily during campaigns and immediately on threshold breach.', 'Metric breach, cause, action, deliverability result.'),
  loop('lifecycle-nurture', 'Lifecycle Nurture', 'customer', 'Send or draft timely lifecycle messages based on user stage.', ['analytics', 'email'], 'Improve activation, retention, and expansion through relevant communication.', 'User enters milestone, stalls, upgrades, or risks churn.', 'Product events, lifecycle stage, plan, support history, prior messages.', 'Select useful message or no-op based on user context and cooldown.', 'Draft onboarding, education, upgrade, or retention message.', 'Sending requires authority and suppression rules.', 'Measure activation, reply, conversion, and unsubscribe.', 'Run on lifecycle events and cooldown windows.', 'Segment, message, result, learning.'),
  loop('security-scan-response', 'Security Scan Response', 'engineering', 'Respond to security scan findings with triage, fixes, and verification.', ['github'], 'Reduce security risk without noisy churn.', 'Security scan produces new finding or dependency advisory.', 'Static scan output, dependency advisories, code ownership, exploitability context.', 'Rank by severity, reachability, exploitability, and fix risk.', 'Open issue, patch, add test, request review.', 'Security PRs automatic if low-risk. Secrets/infra changes require approval.', 'Finding is resolved and no regression appears.', 'Run on new findings and weekly for open high severity issues.', 'Finding, risk, fix, verification.'),
  loop('analytics-tracking-qa', 'Analytics Tracking QA', 'growth', 'Detect broken or misleading analytics events and attribution gaps.', ['analytics', 'github'], 'Keep business decisions based on reliable data.', 'Key event volume drops, spikes, duplicates, or attribution changes unexpectedly.', 'Analytics event schema, recent deploys, page flows, server events.', 'Classify tracking break, real behavior change, bot traffic, or attribution shift.', 'Open tracking fix PR, update dashboard note, backfill if safe.', 'Tracking PRs automatic. Data backfills require approval.', 'Event counts return to expected range or anomaly is documented.', 'Run after deploys and on event anomalies.', 'Event, issue class, fix, data caveat.'),
  loop('docs-support-gap', 'Docs Support Gap', 'customer', 'Turn repeated support questions into documentation or UX improvements.', ['support', 'github'], 'Reduce support load by fixing unclear docs or product copy.', 'Multiple users ask the same support question or fail setup.', 'Support threads, docs pages, onboarding screens, search queries.', 'Identify missing doc, confusing UI, wrong expectation, or product gap.', 'Draft docs PR, FAQ, empty state, or onboarding copy.', 'Docs PRs automatic. Product UI changes follow code authority.', 'Repeat question frequency declines after publish.', 'Run when question cluster threshold is reached and verify after 14 days.', 'Question cluster, doc change, support volume result.'),
  loop('release-note-loop', 'Release Note Loop', 'product', 'Convert shipped changes into customer-facing release notes when useful.', ['github', 'email'], 'Communicate product progress without spamming users.', 'PRs merge, feature ships, or customer-requested fix is released.', 'Merged PRs, issues closed, affected customers, product changelog.', 'Decide whether change deserves public note, targeted reply, or no-op.', 'Draft changelog, targeted customer replies, or social post.', 'Publishing/sending requires authority.', 'Measure reads, replies, reduced confusion, or customer satisfaction.', 'Run after releases and batch low-value changes weekly.', 'Change, audience, message, response.'),
  loop('backup-restore-drill', 'Backup Restore Drill', 'ops', 'Verify backups and restore procedures before they are needed.', ['infra'], 'Ensure recovery capability is real, not assumed.', 'Scheduled drill date arrives or infrastructure changes.', 'Backup status, restore scripts, data stores, runbooks.', 'Check freshness, coverage, restore time, and missing credentials.', 'Run safe dry-run, update runbook, create issue for gaps.', 'Production restore actions require explicit approval.', 'Restore drill passes or gaps are documented with owner.', 'Run monthly or after infrastructure changes.', 'Backup source, drill result, gaps, fix.'),
  loop('abuse-fraud-watch', 'Abuse and Fraud Watch', 'finance', 'Detect suspicious usage, payment fraud, or account abuse.', ['stripe', 'analytics'], 'Limit abuse, fraud, and cost leakage without harming good users.', 'Usage/cost/payment patterns cross abuse thresholds.', 'Usage logs, Stripe risk signals, account history, IP/device patterns.', 'Separate legitimate heavy use, fraud, scraping, and configuration issue.', 'Flag account, recommend limits, draft customer note, request review.', 'Account restrictions and refunds require approval by default.', 'Abuse metric declines and false positives are reviewed.', 'Run on threshold breach and daily for active incidents.', 'Signal, classification, action, false-positive review.')
]

for (const item of loops) {
  const dir = join(root, 'loops', item.id)
  await mkdir(join(dir, 'examples'), { recursive: true })
  await mkdir(join(dir, 'evals'), { recursive: true })
  await writeFile(join(dir, 'LOOP.md'), renderLoop(item), 'utf8')
  await writeFile(join(dir, 'SKILL.md'), renderSkill(item), 'utf8')
  await writeFile(join(dir, 'journal.md'), renderJournal(item), 'utf8')
  await writeFile(join(dir, 'examples', 'input.json'), `${JSON.stringify(renderInput(item), null, 2)}\n`, 'utf8')
  await writeFile(join(dir, 'examples', 'run-brief.md'), renderBrief(item), 'utf8')
  await writeFile(join(dir, 'evals', 'contract.json'), `${JSON.stringify(renderEval(item), null, 2)}\n`, 'utf8')
}

console.log(`Scaffolded ${loops.length} loop packs.`)

function loop(id, title, category, description, requiredConnectors, goal, trigger, signals, diagnosis, actions, authority, verification, scheduling, memory) {
  return { id, title, category, description, requiredConnectors, goal, trigger, signals, diagnosis, actions, authority, verification, scheduling, memory }
}

function renderLoop(item) {
  return `---
name: ${item.id}
title: ${item.title}
description: ${item.description}
category: ${item.category}
required_connectors:
${item.requiredConnectors.map(connector => `  - ${connector}`).join('\n')}
default_authority: ask_first
---

# ${item.title}

## Goal

${item.goal}

## When This Runs

${item.trigger}

The loop may also run when the owner manually starts it from win.sh, the local CLI, Codex, or Claude Code.

## Signals

${item.signals}

The loop should ignore low-confidence or stale signals unless they repeat or affect important customers.

## Diagnosis

${item.diagnosis}

The loop must explicitly separate facts, assumptions, unknowns, and recommended next actions.

## Allowed Actions

${item.actions}

The loop may also create a decision record, attach artifacts, and request approval when the action exceeds authority.

## Authority

${item.authority}

Default mode is ask-first. Observe-only is allowed for newly installed loops. The loop cannot raise its own authority.

## Executor Instructions

Use the companion \`SKILL.md\` as the executor workflow. The executor receives a scoped run brief and should not broaden the business objective. Codex, Claude Code, GitHub Actions, or win.sh Cloud may act as executors.

## Verification

${item.verification}

Verification must produce an outcome: success, failed, inconclusive, or no-action-correct.

## Adaptive Scheduling

${item.scheduling}

Every execution must end with \`nextRunAt\`, a reason, a confidence level, and the signal required before the next meaningful run.

## Journal

Append one journal entry after each run with signal, diagnosis, action, expected outcome, verification date, actual outcome when known, and learning.

## Memory Update

${item.memory}

Write learnings as reusable loop memory, not generic notes. Failed tactics should be recorded so the loop does not retry them blindly.
`
}

function renderSkill(item) {
  return `---
name: win-${item.id}
description: Scoped loop execution skill for ${item.title}. Use when win.sh or win-loops gives a run brief for this loop.
---

# ${item.title} Executor

This is a scoped loop execution skill. Execute the run brief; do not redefine the business objective.

## Inputs

- The run brief from \`.win/runs/<run-id>.md\` or win.sh Cloud.
- The loop contract from \`.win/loops/${item.id}/LOOP.md\`.
- Any linked artifacts, logs, screenshots, metrics, issues, or customer messages.

## Workflow

1. Read the run brief and loop contract.
2. Restate the signal and target outcome in one short paragraph.
3. Gather only the context needed for this run.
4. Diagnose using the loop contract's Diagnosis section.
5. Take the smallest allowed action within authority.
6. Run relevant checks or explain why no check is available.
7. Report artifacts, risks, expected outcome, and recommended next check.

## Output

Return:

- Summary
- Action taken or proposed
- Artifact links
- Checks run
- Remaining risks
- Verification recommendation

## Constraints

- Do not exceed the loop authority.
- Do not spend money, publish, email customers, merge, deploy, or change billing unless the run brief explicitly authorizes it.
- Prefer no-op or escalation when evidence is weak.
`
}

function renderJournal(item) {
  return `# ${item.title} Journal

This journal is append-only. Each run records signal, diagnosis, action, expected outcome, verification date, actual outcome, and learning.
`
}

function renderInput(item) {
  return {
    loopId: item.id,
    trigger: 'manual',
    signal: `Example signal for ${item.title}: ${item.trigger}`
  }
}

function renderBrief(item) {
  return `# Example Run Brief: ${item.title}

## Signal

${item.trigger}

## Expected Action

Follow \`SKILL.md\`, stay within authority, and return artifacts plus a verification recommendation.
`
}

function renderEval(item) {
  return {
    loopId: item.id,
    checks: [
      'has_required_loop_sections',
      'has_executor_skill',
      'has_journal',
      'has_example_input',
      'has_adaptive_scheduling_policy'
    ]
  }
}
