import { useRef, useState, useEffect } from 'react';
import { ShieldCheck, FileSearch, Scale } from 'lucide-react';
import Navbar from './components/Navbar.jsx';
import OfferInput from './components/OfferInput.jsx';
import Report from './components/Report.jsx';
import { analyzeOffer, MAX_LENGTH } from './api.js';
import { useDocumentUpload } from './hooks/useDocumentUpload.js';

const POINTS = [
  { Icon: FileSearch, title: 'Evidence-based', text: 'Every warning links to the exact words in the offer.' },
  { Icon: Scale, title: 'Rules plus AI', text: 'Fraud-pattern rules combined with an AI review.' },
  { Icon: ShieldCheck, title: 'Honest limits', text: 'A risk estimate, never a claim that anything is verified.' },
];

export default function App() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const abortRef = useRef(null);
  const reportRef = useRef(null);
  const upload = useDocumentUpload({
    onExtracted: (extracted) => { setText(extracted); setError(''); },
    getText: () => text,
    setText,
  });

  useEffect(() => {
    if (result && reportRef.current) reportRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [result]);

  async function handleAnalyze() {
    if (loading || upload.busy) return;
    if (!text.trim()) return setError('Please paste an offer to analyze.');
    if (text.length > MAX_LENGTH) return setError(`Offer text exceeds ${MAX_LENGTH.toLocaleString()} characters.`);
    setError('');
    setLoading(true);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const data = await analyzeOffer(text, controller.signal);
      setResult(data);
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message);
    } finally {
      if (abortRef.current === controller) setLoading(false);
    }
  }

  function handleReset() {
    abortRef.current?.abort();
    upload.clear();
    setResult(null);
    setText('');
    setError('');
    setLoading(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleChange(v) {
    setText(v);
    if (error) setError('');
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <div className="bg-ink pb-28 pt-12 sm:pt-16">
          <div className="mx-auto max-w-6xl px-5">
            <p className="eyebrow !text-brand">Fake internship offer detector</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-[1.05] text-white sm:text-6xl">
              Before you trust the offer, <span className="text-brand">verify the risk.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base text-white/70 sm:text-lg">
              Paste an internship or job offer, or upload the offer document (PDF, DOCX, or TXT). InternShield AI reads the text
              inside it and checks for scam patterns such as upfront fees, pressure tactics, and credential requests, then shows you
              what to verify next.
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-3">
              {POINTS.map(({ Icon, title, text: t }) => (
                <li key={title} className="flex gap-3">
                  <Icon size={18} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
                  <p className="text-sm text-white/60"><span className="font-semibold text-white">{title}. </span>{t}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mx-auto -mt-20 max-w-6xl px-5 pb-16">
          <OfferInput value={text} onChange={handleChange} onAnalyze={handleAnalyze} loading={loading} error={error} upload={upload} />

          {loading && (
            <div className="card mt-5 p-6" role="status" aria-live="polite">
              <p className="font-semibold">Analyzing the offer…</p>
              <p className="mt-1 text-sm text-muted">Running fraud-pattern rules and the AI review. This usually takes a few seconds.</p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-canvas">
                <div className="h-full w-1/3 animate-[slide_1.2s_ease-in-out_infinite] rounded-full bg-brand" />
              </div>
            </div>
          )}

          <div ref={reportRef} className="mt-8 scroll-mt-6">
            {result && !loading && <Report key={`${result.riskScore}-${result.summary}`} result={result} onReset={handleReset} />}
          </div>
        </div>
      </main>
      <footer className="border-t border-line py-6 text-center text-xs text-muted">
        InternShield AI provides risk estimates only. Always verify offers through official company channels.
      </footer>
      <style>{`@keyframes slide{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}`}</style>
    </div>
  );
}
