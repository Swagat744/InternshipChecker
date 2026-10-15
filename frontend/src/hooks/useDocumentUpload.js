import { useCallback, useRef, useState } from 'react';
import { extractDocument, validateFile } from '../api.js';

/**
 * Manages one uploaded document: validation, upload progress, extraction, replace and remove.
 * Extracted text is delivered through onExtracted so the shared editable textarea is populated.
 */
export function useDocumentUpload({ onExtracted, getText, setText }) {
  // status: 'idle' | 'uploading' | 'extracting' | 'done' | 'error'
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState(null); // { name, type, size, extractedText, truncated, characterCount }
  const [error, setError] = useState('');
  const abortRef = useRef(null);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const upload = useCallback(async (selected) => {
    if (!selected) return;
    cancel();
    const problem = validateFile(selected);
    if (problem) {
      setStatus('error');
      setError(problem);
      setFile(null);
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setError('');
    setProgress(0);
    setStatus('uploading');
    setFile({ name: selected.name, size: selected.size, type: selected.name.split('.').pop().toLowerCase(), extractedText: '' });
    try {
      const data = await extractDocument(selected, {
        signal: controller.signal,
        onProgress: (p) => {
          setProgress(p);
          if (p >= 100) setStatus('extracting');
        },
      });
      if (controller.signal.aborted) return;
      setFile({
        name: data.filename || selected.name,
        size: selected.size,
        type: data.fileType,
        extractedText: data.extractedText,
        characterCount: data.characterCount,
        truncated: Boolean(data.truncated),
      });
      setStatus('done');
      onExtracted?.(data.extractedText);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setStatus('error');
      setError(err.message);
      setFile(null);
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  }, [cancel, onExtracted]);

  /** Remove the file. The extracted text is cleared only if the user has not edited it. */
  const remove = useCallback(() => {
    cancel();
    if (file?.extractedText && getText?.() === file.extractedText) setText?.('');
    setFile(null);
    setStatus('idle');
    setError('');
    setProgress(0);
  }, [cancel, file, getText, setText]);

  /** Full reset (used by Reset Analysis): never touches the text, the caller clears it. */
  const clear = useCallback(() => {
    cancel();
    setFile(null);
    setStatus('idle');
    setError('');
    setProgress(0);
  }, [cancel]);

  const busy = status === 'uploading' || status === 'extracting';
  return { status, progress, file, error, busy, upload, remove, clear };
}
