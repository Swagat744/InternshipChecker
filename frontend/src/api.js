export const MAX_LENGTH = 12000;
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_EXTENSIONS = ['.pdf', '.docx', '.txt'];

export function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

/** Returns an error message, or null if the file looks acceptable (server re-validates everything). */
export function validateFile(file) {
  const name = file.name.toLowerCase();
  if (!ACCEPTED_EXTENSIONS.some((e) => name.endsWith(e))) return 'Unsupported file type. Please upload a PDF, DOCX, or TXT file.';
  if (file.size === 0) return 'The selected file is empty.';
  if (file.size > MAX_FILE_BYTES) return `File is too large (${formatBytes(file.size)}). The maximum size is 10 MB.`;
  return null;
}

/**
 * Upload a document for server-side text extraction. Uses XMLHttpRequest so we can report upload progress.
 * onProgress(percent) is called while bytes are uploading; percent reaches 100 when the server starts extracting.
 */
export function extractDocument(file, { onProgress, signal } = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/extract');
    xhr.responseType = 'json';
    xhr.timeout = 60000;
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      const data = xhr.response;
      if (xhr.status >= 200 && xhr.status < 300 && data && typeof data.extractedText === 'string') return resolve(data);
      const fallback = xhr.status === 429 ? 'Too many requests. Please wait a moment.' : 'The document could not be processed. Please try again.';
      reject(new Error(data?.error || fallback));
    };
    xhr.onerror = () => reject(new Error('Cannot reach the server. Make sure the backend is running.'));
    xhr.ontimeout = () => reject(new Error('Reading the document took too long. Try a smaller file.'));
    xhr.onabort = () => reject(Object.assign(new Error('Upload cancelled'), { name: 'AbortError' }));
    signal?.addEventListener('abort', () => xhr.abort(), { once: true });
    const form = new FormData();
    form.append('file', file);
    xhr.send(form);
  });
}

export const SAMPLES = [
  {
    id: 'A',
    label: 'Sample A',
    hint: 'Upfront fee',
    text: 'You are selected without an interview. Pay ₹2,000 security fees today to receive your internship offer letter. Transfer immediately or lose your seat.',
  },
  {
    id: 'B',
    label: 'Sample B',
    hint: 'Vague details',
    text: 'We are hiring software development interns. Attractive stipend, flexible work, immediate joining. Contact our recruiter for details.',
  },
  {
    id: 'C',
    label: 'Sample C',
    hint: 'Detailed offer',
    text: `Subject: Software Development Internship – Nimbus Software Pvt. Ltd., Pune

Dear Candidate,

Following your online coding assessment and technical interview on 4 March, Nimbus Software Pvt. Ltd. is pleased to offer you a 3-month Software Development Internship (Backend) at our Pune office, starting 1 April.

You will work with our engineering team on REST APIs, writing unit tests and fixing bugs under a mentor's guidance.
Stipend: ₹15,000 per month.

There is no fee of any kind to accept or take part in this internship. Please confirm your acceptance by replying to careers@nimbussoftware.com within 7 working days.

Regards,
Talent Acquisition Team
Nimbus Software Pvt. Ltd.`,
  },
];

export async function analyzeOffer(offerText, signal) {
  let res;
  try {
    res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offerText }),
      signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new Error('Cannot reach the analysis server. Make sure the backend is running.');
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON error body */
  }
  if (!res.ok) {
    const fallback = res.status === 429 ? 'Too many requests. Please wait a moment.' : 'The analysis failed. Please try again.';
    throw new Error(data?.error || fallback);
  }
  if (!data || !data.riskLevel) throw new Error('Received an unexpected response from the server.');
  return data;
}

export function buildReportText(r) {
  const d = r.extractedDetails;
  const lines = [
    'INTERNSHIELD AI — OFFER RISK REPORT',
    '',
    `Risk level: ${r.riskLevel}`,
    `Risk score: ${r.riskScore}/100 (estimated heuristic score, not a verified probability of fraud)`,
    `Analysis mode: ${r.analysisMode === 'AI_HYBRID' ? 'AI + rules' : `Rules-based fallback (${r.fallbackReason || 'AI unavailable'})`}`,
    '',
    'SUMMARY',
    r.summary,
    '',
    'WARNING INDICATORS',
    ...(r.indicators.length
      ? r.indicators.flatMap((i, n) => [
          `${n + 1}. [${i.severity}] ${i.title}`,
          i.evidence ? `   ${i.evidenceType === 'QUOTE' ? 'Evidence' : 'Inference'}: "${i.evidence}"` : null,
          `   Why: ${i.explanation}`,
        ].filter(Boolean))
      : ['None detected.']),
    '',
    'EXTRACTED DETAILS',
    `Company: ${d.company}`,
    `Role: ${d.role}`,
    `Salary/stipend: ${d.salary}`,
    `Payment terms: ${d.paymentTerms}`,
    `Urgency: ${d.urgency}`,
    `Recruiter contact: ${d.contact}`,
    '',
    'RECOMMENDED STEPS',
    ...r.recommendedActions.map((a, n) => `${n + 1}. ${a}`),
    '',
    `NEXT ACTION: ${r.nextAction}`,
    '',
    `Disclaimer: ${r.disclaimer}`,
  ];
  return lines.join('\n');
}
