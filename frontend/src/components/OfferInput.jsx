import { useRef, useState } from 'react';
import {
  Loader2, ScanSearch, AlertCircle, FileText, FileType2, FileUp, UploadCloud, X, RefreshCw, CheckCircle2, ClipboardPaste,
} from 'lucide-react';
import { MAX_LENGTH, SAMPLES, formatBytes } from '../api.js';

const TABS = [
  { id: 'paste', label: 'Paste Offer', Icon: ClipboardPaste },
  { id: 'upload', label: 'Upload Document', Icon: FileUp },
];

function DropZone({ onFile, disabled }) {
  const inputRef = useRef(null);
  const [over, setOver] = useState(false);

  function pick(files) {
    if (files && files[0]) onFile(files[0]);
  }

  return (
    <div
      id="drop-zone"
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label="Upload a PDF, DOCX, or TXT document. Press Enter to browse files."
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragEnter={(e) => { e.preventDefault(); if (!disabled) setOver(true); }}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setOver(true); }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOver(false); }}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (!disabled) pick(e.dataTransfer.files);
      }}
      className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
        over ? 'border-brand bg-brand-soft' : 'border-line bg-canvas/60 hover:border-ink'
      } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
    >
      <span className={`flex h-12 w-12 items-center justify-center rounded-full ${over ? 'bg-brand text-ink' : 'bg-ink text-brand'}`}>
        <UploadCloud size={22} aria-hidden="true" />
      </span>
      <p className="mt-4 text-base font-semibold">Drop a PDF, DOCX, or TXT file here</p>
      <p className="mt-1 text-sm text-muted">or browse your device. The text inside the document is extracted and analyzed.</p>
      <button
        id="browse-files"
        type="button"
        tabIndex={-1}
        disabled={disabled}
        onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
        className="btn-ghost mt-4"
      >
        <FileUp size={16} aria-hidden="true" /> Upload Document
      </button>
      <ul className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-muted" aria-label="Supported file types">
        {['PDF', 'DOCX', 'TXT'].map((t) => (
          <li key={t} className="rounded-md border border-line bg-white px-2 py-0.5 font-semibold">{t}</li>
        ))}
        <li className="px-1 py-0.5">Max 10 MB</li>
      </ul>
      <input
        ref={inputRef}
        id="file-input"
        type="file"
        accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => { pick(e.target.files); e.target.value = ''; }}
      />
    </div>
  );
}

function FileCard({ upload, onReplace }) {
  const { file, status, progress, remove } = upload;
  const inputRef = useRef(null);
  const busy = status === 'uploading' || status === 'extracting';
  const Icon = file.type === 'txt' ? FileText : FileType2;
  return (
    <div id="file-card" className="mt-4 rounded-xl border border-line bg-white p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink text-brand">
          <Icon size={19} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold" title={file.name}>{file.name}</p>
          <p className="text-xs text-muted">
            <span className="font-semibold uppercase">{file.type}</span> · {formatBytes(file.size)}
            {status === 'done' && <> · {file.characterCount?.toLocaleString()} characters extracted</>}
          </p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <button id="replace-file" type="button" className="btn-ghost !px-3 !py-1.5" onClick={() => inputRef.current?.click()} aria-label="Replace file">
            <RefreshCw size={14} aria-hidden="true" /><span className="hidden sm:inline">Replace</span>
          </button>
          <button id="remove-file" type="button" className="btn-ghost !px-3 !py-1.5" onClick={remove} aria-label="Remove file">
            <X size={14} aria-hidden="true" /><span className="hidden sm:inline">Remove</span>
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => { if (e.target.files[0]) onReplace(e.target.files[0]); e.target.value = ''; }}
        />
      </div>

      {busy && (
        <div className="mt-4" role="status" aria-live="polite">
          <div className="mb-1.5 flex justify-between text-xs font-medium">
            <span>{status === 'uploading' ? 'Uploading document…' : 'Extracting text from the document…'}</span>
            {status === 'uploading' && <span className="tabular-nums text-muted">{progress}%</span>}
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-canvas" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={status === 'uploading' ? progress : undefined}>
            {status === 'uploading' ? (
              <div className="h-full rounded-full bg-brand transition-[width] duration-200" style={{ width: `${progress}%` }} />
            ) : (
              <div className="h-full w-1/3 animate-[slide_1.2s_ease-in-out_infinite] rounded-full bg-brand" />
            )}
          </div>
        </div>
      )}

      {status === 'done' && (
        <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-risk-green" role="status">
          <CheckCircle2 size={16} aria-hidden="true" /> Document uploaded successfully. Review the extracted text below.
        </p>
      )}
      {status === 'done' && file.truncated && (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-risk-amber">
          <AlertCircle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          The document was longer than {MAX_LENGTH.toLocaleString()} characters, so only the first part was kept.
        </p>
      )}
    </div>
  );
}

export default function OfferInput({ value, onChange, onAnalyze, loading, error, upload }) {
  const [tab, setTab] = useState('paste');
  const length = value.length;
  const tooLong = length > MAX_LENGTH;
  const empty = !value.trim();
  const near = length > MAX_LENGTH * 0.9;
  const validation = tooLong ? `Offer text exceeds ${MAX_LENGTH.toLocaleString()} characters.` : null;
  const extracting = upload.busy;
  const showText = tab === 'paste' || upload.status === 'done' || value.trim().length > 0;
  const hasFile = Boolean(upload.file);
  const fromDocument = tab === 'upload' && hasFile && upload.status === 'done';
  const locked = loading || extracting;

  function onTabKey(e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next = tab === 'paste' ? 'upload' : 'paste';
    setTab(next);
    document.getElementById(`tab-${next}`)?.focus();
  }

  return (
    <section id="analyzer" className="card rise p-5 sm:p-6" aria-labelledby="input-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="input-title" className="text-xl font-bold">Check an offer</h2>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Sample offers">
          <span className="eyebrow mr-1">Try a sample</span>
          {SAMPLES.map((s) => (
            <button
              key={s.id}
              type="button"
              id={`sample-${s.id.toLowerCase()}`}
              onClick={() => { onChange(s.text); setTab('paste'); }}
              disabled={locked}
              className="rounded-full border border-line bg-canvas px-3 py-1 text-xs font-medium transition hover:border-ink disabled:opacity-50"
              title={s.hint}
            >
              {s.label} <span className="text-muted">· {s.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <div role="tablist" aria-label="Input method" onKeyDown={onTabKey} className="mt-4 inline-flex w-full rounded-xl bg-canvas p-1 sm:w-auto">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            id={`tab-${id}`}
            type="button"
            role="tab"
            aria-selected={tab === id}
            aria-controls={`panel-${id}`}
            tabIndex={tab === id ? 0 : -1}
            onClick={() => setTab(id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition sm:flex-none ${
              tab === id ? 'bg-ink text-white shadow-card' : 'text-muted hover:text-ink'
            }`}
          >
            <Icon size={16} aria-hidden="true" /> {label}
            {id === 'upload' && hasFile && <span className="h-2 w-2 rounded-full bg-brand" aria-label="File attached" />}
          </button>
        ))}
      </div>

      {tab === 'upload' && (
        <div id="panel-upload" role="tabpanel" aria-labelledby="tab-upload">
          {!hasFile && <DropZone onFile={upload.upload} disabled={locked} />}
          {hasFile && <FileCard upload={upload} onReplace={upload.upload} />}
          {upload.error && (
            <p id="upload-error" role="alert" className="mt-3 flex items-start gap-1.5 rounded-lg border border-risk-red/30 bg-risk-redSoft px-3 py-2 text-sm text-risk-red">
              <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" /> {upload.error}
            </p>
          )}
        </div>
      )}

      <div id="panel-paste" role={tab === 'paste' ? 'tabpanel' : undefined} aria-labelledby={tab === 'paste' ? 'tab-paste' : undefined}>
        {showText && !(tab === 'upload' && extracting) && (
          <>
            <label htmlFor="offer-text" className={fromDocument ? 'eyebrow mt-5 block' : 'sr-only'}>
              {fromDocument ? 'Extracted text preview (editable)' : 'Internship or job offer text'}
            </label>
            <textarea
              id="offer-text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={loading}
              rows={fromDocument ? 10 : 9}
              placeholder="Paste an email, WhatsApp message, or social media post offering an internship or job…"
              aria-invalid={tooLong}
              aria-describedby="offer-count offer-error"
              className={`${fromDocument ? 'mt-2' : 'mt-4'} w-full resize-y rounded-xl border bg-canvas/60 p-4 text-[15px] leading-relaxed outline-none transition placeholder:text-muted/70 focus:border-ink focus:bg-white ${tooLong ? 'border-risk-red' : 'border-line'}`}
            />
          </>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
        <p id="offer-error" role="alert" className="flex min-h-[1.25rem] items-center gap-1.5 text-risk-red">
          {(validation || error) && <AlertCircle size={15} aria-hidden="true" />}
          {validation || error}
        </p>
        <p id="offer-count" className={`tabular-nums ${tooLong ? 'font-semibold text-risk-red' : near ? 'text-risk-amber' : 'text-muted'}`}>
          {length.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
        </p>
      </div>

      <div className="mt-4 flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-xs text-muted">
          Text and documents are processed in memory on the server and are not stored. Scanned (image-only) PDFs are not supported yet.
        </p>
        <button
          id="analyze-button"
          type="button"
          onClick={onAnalyze}
          disabled={locked || empty || tooLong}
          className="btn-primary px-6 py-3 text-base"
        >
          {loading ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <ScanSearch size={18} aria-hidden="true" />}
          {loading ? 'Analyzing offer…' : extracting ? 'Reading document…' : 'Analyze Offer'}
        </button>
      </div>
    </section>
  );
}
