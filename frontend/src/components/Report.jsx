import { useState } from 'react';
import {
  Building2, BadgeCheck, Banknote, Clock, Mail, Briefcase, Wallet, Copy, Check, RotateCcw,
  AlertTriangle, ShieldAlert, ShieldCheck, ListChecks, Info, Quote, Cpu, Ruler, ArrowRight,
} from 'lucide-react';
import { buildReportText } from '../api.js';

const LEVEL = {
  'HIGH RISK': { color: '#C62828', soft: 'bg-risk-redSoft', text: 'text-risk-red', border: 'border-risk-red/30', Icon: ShieldAlert },
  SUSPICIOUS: { color: '#B26A00', soft: 'bg-risk-amberSoft', text: 'text-risk-amber', border: 'border-risk-amber/30', Icon: AlertTriangle },
  SAFE: { color: '#2E7D4F', soft: 'bg-risk-greenSoft', text: 'text-risk-green', border: 'border-risk-green/30', Icon: ShieldCheck },
};
const SEV = {
  HIGH: 'bg-risk-redSoft text-risk-red',
  MEDIUM: 'bg-risk-amberSoft text-risk-amber',
  LOW: 'bg-canvas text-muted',
};

function ScoreRing({ score, color }) {
  const r = 52, c = 2 * Math.PI * r;
  return (
    <div className="relative h-36 w-36 shrink-0" role="img" aria-label={`Estimated risk score ${score} out of 100`}>
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
        <circle cx="64" cy="64" r={r} fill="none" stroke="#EDEDEA" strokeWidth="11" />
        <circle
          cx="64" cy="64" r={r} fill="none" stroke={color} strokeWidth="11" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)}
          style={{ transition: 'stroke-dashoffset .8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl font-extrabold tabular-nums leading-none">{score}</span>
        <span className="mt-1 text-[11px] font-medium text-muted">out of 100</span>
      </div>
    </div>
  );
}

const DETAILS = [
  ['company', 'Company', Building2],
  ['role', 'Role', Briefcase],
  ['salary', 'Salary / stipend', Wallet],
  ['paymentTerms', 'Payment demands', Banknote],
  ['urgency', 'Urgency / deadline', Clock],
  ['contact', 'Recruiter contact', Mail],
];

export default function Report({ result, onReset }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const L = LEVEL[result.riskLevel] || LEVEL.SUSPICIOUS;
  const fallback = result.analysisMode !== 'AI_HYBRID';

  async function copy() {
    const text = buildReportText(result);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if (!ok) { setCopyError(true); setTimeout(() => setCopyError(false), 2500); return; }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section id="report" className="rise space-y-5" aria-labelledby="report-title" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="report-title" className="text-2xl font-bold">Offer risk report</h2>
        <div className="flex gap-2">
          <button id="copy-report" type="button" onClick={copy} className="btn-ghost">
            {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
            {copied ? 'Copied' : copyError ? 'Copy failed' : 'Copy Report'}
          </button>
          <button id="reset-analysis" type="button" onClick={onReset} className="btn-ghost">
            <RotateCcw size={16} aria-hidden="true" /> Reset Analysis
          </button>
        </div>
      </div>

      {fallback && (
        <div role="status" className="flex gap-3 rounded-xl border border-risk-amber/30 bg-risk-amberSoft p-4 text-sm">
          <Cpu size={18} className="mt-0.5 shrink-0 text-risk-amber" aria-hidden="true" />
          <p>
            <strong>Rules-based fallback result.</strong> {result.fallbackReason || 'The Nugen API was unavailable'}, so this
            report uses deterministic fraud-pattern rules only. No AI analysis was performed.
          </p>
        </div>
      )}

      {!fallback && (
        <p id="ai-source" role="status" className="flex items-center gap-2 text-xs text-muted">
          <Cpu size={14} aria-hidden="true" /> Analyzed by the Nugen AI model combined with fraud-pattern rules.
        </p>
      )}

      {/* Verdict */}
      <div className={`card overflow-hidden border ${L.border}`}>
        <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:p-7">
          <ScoreRing score={result.riskScore} color={L.color} />
          <div className="min-w-0 flex-1">
            <span id="risk-badge" className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold tracking-wide ${L.soft} ${L.text}`}>
              <L.Icon size={15} aria-hidden="true" /> {result.riskLevel}
            </span>
            <p className="mt-3 text-lg font-medium leading-snug">{result.summary}</p>
            <p className="mt-2 flex items-start gap-1.5 text-xs text-muted">
              <Ruler size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
              {result.scoreLabel || 'Estimated heuristic score, not a verified probability of fraud.'}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 border-t border-line bg-ink px-5 py-4 text-white sm:px-7">
          <ArrowRight size={18} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
          <p className="text-sm"><span className="font-semibold text-brand">Next action: </span>{result.nextAction}</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Indicators */}
        <div className="card p-5 sm:p-6 lg:col-span-3">
          <h3 className="flex items-center gap-2 text-lg font-bold">
            <AlertTriangle size={18} aria-hidden="true" /> Warning indicators
            <span className="rounded-full bg-canvas px-2 py-0.5 text-xs font-semibold text-muted">{result.indicators.length}</span>
          </h3>
          {result.indicators.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No warning indicators were detected in the text. This does not confirm the offer is genuine.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {result.indicators.map((ind, i) => (
                <li key={`${ind.title}-${i}`} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded px-2 py-0.5 text-[11px] font-bold tracking-wide ${SEV[ind.severity]}`}>{ind.severity}</span>
                    <h4 className="font-semibold">{ind.title}</h4>
                  </div>
                  {ind.evidence && (
                    <blockquote className="mt-2 flex gap-2 rounded-lg border-l-[3px] border-brand bg-canvas px-3 py-2 text-sm">
                      <Quote size={14} className="mt-1 shrink-0 text-muted" aria-hidden="true" />
                      <span>
                        <span className="eyebrow mr-2">{ind.evidenceType === 'QUOTE' ? 'Evidence' : 'Inference'}</span>
                        <span className="italic">{ind.evidence}</span>
                      </span>
                    </blockquote>
                  )}
                  <p className="mt-2 text-sm text-muted">{ind.explanation}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-5 lg:col-span-2">
          {/* Extracted */}
          <div className="card p-5 sm:p-6">
            <h3 className="flex items-center gap-2 text-lg font-bold"><BadgeCheck size={18} aria-hidden="true" /> Extracted details</h3>
            <dl className="mt-4 space-y-3">
              {DETAILS.map(([key, label, Icon]) => {
                const v = result.extractedDetails[key];
                const missing = /^not found/i.test(v);
                return (
                  <div key={key} className="flex gap-3">
                    <Icon size={16} className="mt-0.5 shrink-0 text-muted" aria-hidden="true" />
                    <div className="min-w-0">
                      <dt className="eyebrow">{label}</dt>
                      <dd className={`break-words text-sm ${missing ? 'text-muted' : 'font-medium'}`}>{v}</dd>
                    </div>
                  </div>
                );
              })}
            </dl>
          </div>

          {/* Checklist */}
          <div className="card p-5 sm:p-6">
            <h3 className="flex items-center gap-2 text-lg font-bold"><ListChecks size={18} aria-hidden="true" /> Verification checklist</h3>
            <ol className="mt-4 space-y-3">
              {result.recommendedActions.map((a, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-white">{i + 1}</span>
                  <span>{a}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <p className="flex gap-2 rounded-xl border border-line bg-white p-4 text-sm text-muted" role="note">
        <Info size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span><strong className="text-ink">Disclaimer:</strong> {result.disclaimer}</span>
      </p>
    </section>
  );
}
