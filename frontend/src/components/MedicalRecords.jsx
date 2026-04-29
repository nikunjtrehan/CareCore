// src/components/MedicalRecords.jsx
// Converts the ruixenui FileUpload component to JSX, dark-themed,
// wired to DDownload via backend + Firestore for persistence.
import React, {
  useCallback, useEffect, useRef, useState, useMemo,
} from 'react';
import {
  AlertCircleIcon, CheckIcon, CopyIcon, DownloadIcon,
  ExternalLinkIcon, FileArchiveIcon, FileIcon, FileSpreadsheetIcon,
  FileTextIcon, GridIcon, HeadphonesIcon, ImageIcon, ListIcon,
  SearchIcon, SortAscIcon, SortDescIcon, Trash2Icon,
  UploadCloudIcon, UploadIcon, Loader2Icon,
} from 'lucide-react';
import { collection, addDoc, getDocs, deleteDoc, doc, query as fsQuery, orderBy } from 'firebase/firestore';
import { getFirebaseDb, getFirebaseAuth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

// ── Helpers ──────────────────────────────────────────────────────────────────
const formatBytes = (bytes, decimals = 2) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals < 0 ? 0 : decimals)) + ' ' + sizes[i];
};

const getExt = (name) => {
  const dot = name?.lastIndexOf('.');
  return dot > -1 ? name.slice(dot + 1).toLowerCase() : '';
};

const niceSubtype = (mime) => {
  if (!mime) return 'UNKNOWN';
  const p = mime.split('/');
  return (p[1] || p[0] || 'unknown').toUpperCase();
};

const getFileIcon = (entry) => {
  const type = entry.type || '';
  const ext  = getExt(entry.name || '');
  if (type.includes('pdf') || ext === 'pdf' || type.includes('word') || ext === 'doc' || ext === 'docx')
    return <FileTextIcon className="size-4 opacity-60" />;
  if (type.includes('zip') || type.includes('archive') || ['zip','rar','7z','tar'].includes(ext))
    return <FileArchiveIcon className="size-4 opacity-60" />;
  if (type.includes('excel') || ['xls','xlsx','csv'].includes(ext))
    return <FileSpreadsheetIcon className="size-4 opacity-60" />;
  if (type.startsWith('video/') || ['mp4','mov','webm','mkv'].includes(ext))
    return <VideoIcon className="size-4 opacity-60" />;
  if (type.startsWith('audio/') || ['mp3','wav','flac','m4a'].includes(ext))
    return <HeadphonesIcon className="size-4 opacity-60" />;
  if (type.startsWith('image/') || ['png','jpg','jpeg','gif','webp'].includes(ext))
    return <ImageIcon className="size-4 opacity-60" />;
  return <FileIcon className="size-4 opacity-60" />;
};

// ── Tiny styled primitives (no shadcn needed) ─────────────────────────────────
function Btn({ children, onClick, disabled, variant = 'outline', size = 'sm', className = '', title, 'aria-label': al }) {
  const base = 'inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none';
  const sizes = { sm: 'px-2.5 py-1.5 text-xs', icon: 'w-8 h-8 p-0 text-sm' };
  const variants = {
    outline: 'border border-white/15 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white',
    ghost:   'border-none bg-transparent hover:bg-white/10 text-white/50 hover:text-white',
    destructive: 'border-none bg-transparent hover:bg-red-500/10 text-red-400/70 hover:text-red-400',
    default: 'border border-white/20 bg-white/15 text-white hover:bg-white/20',
  };
  return (
    <button onClick={onClick} disabled={disabled} title={title} aria-label={al}
      className={`${base} ${sizes[size] || sizes.sm} ${variants[variant] || variants.outline} ${className}`}>
      {children}
    </button>
  );
}

// ── useFileUpload hook ────────────────────────────────────────────────────────
function useFileUpload({ maxFiles = Infinity, maxSize = Infinity, accept = '*', multiple = false, onFilesAdded } = {}) {
  const [files, setFiles]         = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors]       = useState([]);
  const inputRef = useRef(null);

  const genId = (file) => `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const validate = useCallback((file) => {
    if (file.size > maxSize) return `"${file.name}" exceeds ${formatBytes(maxSize)} limit.`;
    if (accept !== '*') {
      const accepted = accept.split(',').map(t => t.trim());
      const ext = `.${getExt(file.name)}`;
      const ok = accepted.some(t =>
        t.startsWith('.') ? ext.toLowerCase() === t.toLowerCase()
          : t.endsWith('/*') ? file.type.startsWith(t.split('/')[0] + '/')
          : file.type === t
      );
      if (!ok) return `"${file.name}" is not an accepted type.`;
    }
    return null;
  }, [accept, maxSize]);

  const addFiles = useCallback((incoming) => {
    const arr = Array.from(incoming);
    const errs = [];
    if (multiple && maxFiles !== Infinity && files.length + arr.length > maxFiles)
      return setErrors([`Max ${maxFiles} files allowed.`]);

    const valid = [];
    arr.forEach(f => {
      if (multiple && files.some(e => e.file.name === f.name && e.file.size === f.size)) return;
      const err = validate(f);
      if (err) { errs.push(err); return; }
      valid.push({ file: f, id: genId(f), preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined });
    });
    if (valid.length) {
      onFilesAdded?.(valid);
      setFiles(prev => multiple ? [...prev, ...valid] : valid);
    }
    setErrors(errs);
    if (inputRef.current) inputRef.current.value = '';
  }, [files, multiple, maxFiles, validate, onFilesAdded]);

  const removeFile   = useCallback((id) => setFiles(p => p.filter(f => f.id !== id)), []);
  const clearFiles   = useCallback(() => setFiles([]), []);
  const clearErrors  = useCallback(() => setErrors([]), []);
  const openDialog   = useCallback(() => inputRef.current?.click(), []);

  const onDragEnter  = useCallback(e => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }, []);
  const onDragLeave  = useCallback(e => { e.preventDefault(); e.stopPropagation(); if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false); }, []);
  const onDragOver   = useCallback(e => { e.preventDefault(); e.stopPropagation(); }, []);
  const onDrop       = useCallback(e => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); if (e.dataTransfer.files.length) addFiles(multiple ? e.dataTransfer.files : [e.dataTransfer.files[0]]); }, [addFiles, multiple]);
  const onChange     = useCallback(e => { if (e.target.files?.length) addFiles(e.target.files); }, [addFiles]);

  return [
    { files, isDragging, errors },
    { removeFile, clearFiles, clearErrors, openDialog, onDragEnter, onDragLeave, onDragOver, onDrop, onChange, inputRef, accept, multiple },
  ];
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MedicalRecords() {
  const { user } = useAuth();
  const BACKEND  = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Persisted records from Firestore
  const [records, setRecords]     = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  // Upload state
  const [uploading, setUploading] = useState({});  // { [tempId]: { progress, error } }

  // UI state
  const [view, setView]     = useState('list');
  const [query, setQuery]   = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [selected, setSelected] = useState(new Set());
  const [copied, setCopied] = useState(null);

  // Load records from Firestore on mount
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const db   = getFirebaseDb();
        const col  = collection(db, 'users', user.uid, 'medicalRecords');
        const q    = fsQuery(col, orderBy('uploadedAt', 'desc'));
        const snap = await getDocs(q);
        setRecords(snap.docs.map(d => ({ firestoreId: d.id, ...d.data() })));
        console.log('[MedicalRecords] Loaded', snap.docs.length, 'records');
      } catch (err) {
        console.error('[MedicalRecords] Load error:', err.code, err.message);
      } finally {
        setLoadingRecs(false);
      }
    })();
  }, [user]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(null), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  // Handle new files dropped/selected → upload immediately
  const handleFilesAdded = useCallback(async (newFiles) => {
    if (!user) return;
    for (const entry of newFiles) {
      const tempId = entry.id;
      setUploading(p => ({ ...p, [tempId]: { progress: 0 } }));
      try {
        console.log('[MedicalRecords] Uploading:', entry.file.name);
        const formData = new FormData();
        formData.append('file', entry.file);
        const res = await fetch(`${BACKEND}/api/records/upload`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        console.log('[MedicalRecords] Upload response:', data);
        if (!res.ok) throw new Error(data.error || 'Upload failed');

        // Save to Firestore
        const db  = getFirebaseDb();
        const col = collection(db, 'users', user.uid, 'medicalRecords');
        const ref = await addDoc(col, {
          file_code:    data.file_code,
          name:         data.name,
          size:         data.size,
          type:         data.type,
          download_url: data.download_url,
          uploadedAt:   data.uploadedAt,
        });
        setRecords(p => [{ firestoreId: ref.id, ...data }, ...p]);
        setUploading(p => { const n = { ...p }; delete n[tempId]; return n; });
      } catch (err) {
        setUploading(p => ({ ...p, [tempId]: { error: err.message } }));
        setTimeout(() => setUploading(p => { const n = { ...p }; delete n[tempId]; return n; }), 4000);
      }
    }
  }, [user, BACKEND]);

  const [{ files: pendingFiles, isDragging, errors }, {
    removeFile: removePending, clearFiles, clearErrors,
    openDialog, onDragEnter, onDragLeave, onDragOver, onDrop, onChange, inputRef, accept, multiple,
  }] = useFileUpload({
    multiple: true,
    maxFiles: 20,
    maxSize:  10 * 1024 * 1024,
    accept:   '.pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx,.txt',
    onFilesAdded: handleFilesAdded,
  });

  const handleRemoveRecord = async (rec) => {
    try {
      await fetch(`${BACKEND}/api/records/${rec.file_code}`, { method: 'DELETE' });
      const db = getFirebaseDb();
      await deleteDoc(doc(db, 'users', user.uid, 'medicalRecords', rec.firestoreId));
      setRecords(p => p.filter(r => r.firestoreId !== rec.firestoreId));
      setSelected(p => { const n = new Set(p); n.delete(rec.firestoreId); return n; });
    } catch (err) {
      console.error('Delete error:', err.message);
    }
  };

  // ── Filtering / sorting ───────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q ? records.filter(r =>
      r.name?.toLowerCase().includes(q) ||
      r.type?.toLowerCase().includes(q) ||
      getExt(r.name).includes(q)
    ) : records;
    return [...base].sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = (a.name || '').localeCompare(b.name || '');
      else if (sortBy === 'type') cmp = (a.type || '').localeCompare(b.type || '');
      else cmp = (a.size || 0) - (b.size || 0);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [records, query, sortBy, sortDir]);

  const totalSize   = useMemo(() => records.reduce((a, r) => a + (r.size || 0), 0), [records]);
  const allSelected = selected.size > 0 && filtered.every(r => selected.has(r.firestoreId));
  const noneSelected = selected.size === 0;

  const toggleOne = (id) => setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setSelected(filtered.every(r => selected.has(r.firestoreId)) ? new Set() : new Set(filtered.map(r => r.firestoreId)));
  const removeSelected = () => { filtered.filter(r => selected.has(r.firestoreId)).forEach(handleRemoveRecord); };
  const downloadOne = (rec) => window.open(rec.download_url, '_blank', 'noopener,noreferrer');
  const downloadSelected = () => filtered.filter(r => selected.has(r.firestoreId)).forEach(downloadOne);
  const copyLink = async (rec) => {
    try { await navigator.clipboard.writeText(rec.download_url); setCopied(rec.firestoreId); } catch {}
  };

  const uploadingEntries = Object.entries(uploading);

  // ── Styles ────────────────────────────────────────────────────────────────
  const cell = 'px-3 py-2.5 text-xs text-white/60 border-b border-white/5';
  const headCell = 'px-3 py-2 text-[10px] font-semibold text-white/30 uppercase tracking-widest border-b border-white/8 bg-white/[0.02]';

  return (
    <div className="flex flex-col gap-4">

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-white">
            Files <span className="text-white/30">({records.length})</span>
          </h3>
          <span className="text-white/30 text-xs">Total: {formatBytes(totalSize)}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search by name, type…"
              className="h-8 w-52 rounded-lg border border-white/10 bg-white/5 px-7 text-xs text-white placeholder:text-white/20 outline-none focus:border-white/25"
            />
            <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-white/30 pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="h-8 rounded-lg border border-white/10 bg-white/5 px-2 text-xs text-white outline-none">
              <option value="name">Name</option>
              <option value="type">Type</option>
              <option value="size">Size</option>
            </select>
            <Btn size="icon" variant="outline" onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
              title="Toggle sort direction">
              {sortDir === 'asc' ? <SortAscIcon className="size-4" /> : <SortDescIcon className="size-4" />}
            </Btn>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1">
            <Btn size="icon" variant={view === 'list' ? 'default' : 'outline'} onClick={() => setView('list')} title="List view">
              <ListIcon className="size-4" />
            </Btn>
            <Btn size="icon" variant={view === 'grid' ? 'default' : 'outline'} onClick={() => setView('grid')} title="Grid view">
              <GridIcon className="size-4" />
            </Btn>
          </div>

          <Btn variant="outline" size="sm" onClick={openDialog}>
            <UploadCloudIcon className="size-3.5 opacity-60" /> Add files
          </Btn>
          <Btn variant="outline" size="sm" onClick={() => { clearFiles(); setRecords([]); }} disabled={records.length === 0}>
            <Trash2Icon className="size-3.5 opacity-60" /> Remove all
          </Btn>
        </div>
      </div>

      {/* ── Drop zone ── */}
      <div onDragEnter={onDragEnter} onDragLeave={onDragLeave} onDragOver={onDragOver} onDrop={onDrop}
        className={`rounded-xl border border-dashed p-3 transition-colors ${isDragging ? 'border-white/30 bg-white/5' : 'border-white/10'}`}>
        <input ref={inputRef} type="file" onChange={onChange} accept={accept} multiple={multiple} className="sr-only" aria-label="Upload files" />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center shrink-0">
              <FileIcon className="size-4 text-white/40" />
            </div>
            <div className="text-xs">
              <p className="font-medium text-white">Drop files to upload</p>
              <p className="text-white/30">Up to 20 files · 10 MB per file · PDF, Images, Word, Excel</p>
            </div>
          </div>
          <Btn variant="outline" size="sm" onClick={openDialog}>
            <UploadIcon className="size-3.5 opacity-60" /> Select files
          </Btn>
        </div>
      </div>

      {/* ── Active uploads ── */}
      {uploadingEntries.length > 0 && (
        <div className="space-y-2">
          {uploadingEntries.map(([id, state]) => (
            <div key={id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/8 bg-white/[0.03] text-xs">
              {state.error ? (
                <>
                  <AlertCircleIcon className="size-3.5 text-red-400 shrink-0" />
                  <span className="text-red-400">{state.error}</span>
                </>
              ) : (
                <>
                  <Loader2Icon className="size-3.5 text-white/40 animate-spin shrink-0" />
                  <span className="text-white/50">Uploading to DDownload…</span>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── File list ── */}
      {loadingRecs ? (
        <div className="flex items-center justify-center py-16 gap-2 text-white/30 text-sm">
          <Loader2Icon className="size-4 animate-spin" /> Loading records…
        </div>
      ) : filtered.length > 0 ? (
        <>
          {/* Bulk actions */}
          <div className="flex items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-xs text-white/40 cursor-pointer">
              <input type="checkbox" checked={allSelected} onChange={toggleAll}
                className="size-3.5 accent-white" aria-label={allSelected ? 'Deselect all' : 'Select all'} />
              {selected.size}/{filtered.length} selected
            </label>
            <div className="flex items-center gap-2">
              <Btn variant="outline" size="sm" onClick={downloadSelected} disabled={noneSelected}>
                <DownloadIcon className="size-3.5 opacity-60" /> Download selected
              </Btn>
              <Btn variant="outline" size="sm" onClick={removeSelected} disabled={noneSelected}>
                <Trash2Icon className="size-3.5 opacity-60" /> Remove selected
              </Btn>
            </div>
          </div>

          {view === 'list' ? (
            <div className="rounded-xl border border-white/8 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className={`${headCell} w-10`}><span className="sr-only">Select</span></th>
                    <th className={`${headCell} text-left`}>Name</th>
                    <th className={`${headCell} text-left`}>Type</th>
                    <th className={`${headCell} text-left`}>Size</th>
                    <th className={`${headCell} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(rec => {
                    const isSel = selected.has(rec.firestoreId);
                    const pct   = Math.min(100, Math.round((rec.size / (10 * 1024 * 1024)) * 100));
                    return (
                      <tr key={rec.firestoreId} className={`transition-colors ${isSel ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'}`}>
                        <td className={`${cell} text-center`}>
                          <input type="checkbox" checked={isSel} onChange={() => toggleOne(rec.firestoreId)}
                            className="size-3.5 accent-white" aria-label={`Select ${rec.name}`} />
                        </td>
                        <td className={`${cell} max-w-[240px]`}>
                          <span className="flex items-center gap-2">
                            <span className="shrink-0 text-white/50">{getFileIcon(rec)}</span>
                            <span className="truncate font-medium text-white/80">{rec.name}</span>
                          </span>
                          <div className="mt-1.5 h-1 w-36 rounded overflow-hidden bg-white/5">
                            <div className="h-full bg-white/30" style={{ width: `${pct}%` }} />
                          </div>
                        </td>
                        <td className={cell}>{niceSubtype(rec.type)}</td>
                        <td className={cell}>{formatBytes(rec.size)}</td>
                        <td className={`${cell} text-right whitespace-nowrap`}>
                          <Btn size="icon" variant="ghost" onClick={() => window.open(rec.download_url, '_blank')} title="Open">
                            <ExternalLinkIcon className="size-4" />
                          </Btn>
                          <Btn size="icon" variant="ghost" onClick={() => downloadOne(rec)} title="Download">
                            <DownloadIcon className="size-4" />
                          </Btn>
                          <Btn size="icon" variant="ghost" onClick={() => copyLink(rec)} title="Copy link">
                            {copied === rec.firestoreId ? <CheckIcon className="size-4 text-green-400" /> : <CopyIcon className="size-4" />}
                          </Btn>
                          <Btn size="icon" variant="destructive" onClick={() => handleRemoveRecord(rec)} title="Remove">
                            <Trash2Icon className="size-4" />
                          </Btn>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Grid view */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map(rec => {
                const isSel  = selected.has(rec.firestoreId);
                const isImg  = rec.type?.startsWith('image/');
                return (
                  <div key={rec.firestoreId}
                    className={`relative flex flex-col overflow-hidden rounded-xl border transition-colors ${isSel ? 'border-white/25 bg-white/[0.05]' : 'border-white/8 bg-white/[0.02] hover:border-white/15'}`}>
                    <label className="absolute left-2 top-2 z-10 flex items-center gap-1 bg-black/50 rounded px-1.5 py-1 cursor-pointer">
                      <input type="checkbox" checked={isSel} onChange={() => toggleOne(rec.firestoreId)}
                        className="size-3.5 accent-white" aria-label={`Select ${rec.name}`} />
                    </label>
                    <div className="relative h-24 w-full overflow-hidden bg-white/5 flex items-center justify-center">
                      {isImg && rec.download_url ? (
                        <img src={rec.download_url} alt={rec.name} className="h-full w-full object-cover" draggable={false} />
                      ) : (
                        <span className="text-white/30">{getFileIcon(rec)}</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 p-2">
                      <p className="truncate text-xs font-medium text-white/80" title={rec.name}>{rec.name}</p>
                      <p className="text-[11px] text-white/30">{niceSubtype(rec.type)} · {formatBytes(rec.size)}</p>
                      <div className="mt-auto flex items-center justify-end gap-0.5">
                        <Btn size="icon" variant="ghost" onClick={() => window.open(rec.download_url, '_blank')} title="Open"><ExternalLinkIcon className="size-3.5" /></Btn>
                        <Btn size="icon" variant="ghost" onClick={() => downloadOne(rec)} title="Download"><DownloadIcon className="size-3.5" /></Btn>
                        <Btn size="icon" variant="ghost" onClick={() => copyLink(rec)} title="Copy link">
                          {copied === rec.firestoreId ? <CheckIcon className="size-3.5 text-green-400" /> : <CopyIcon className="size-3.5" />}
                        </Btn>
                        <Btn size="icon" variant="destructive" onClick={() => handleRemoveRecord(rec)} title="Remove"><Trash2Icon className="size-3.5" /></Btn>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-sm text-white/25 py-12">
          {records.length === 0 ? 'No records yet. Drop or select files above to upload.' : 'No files match your search.'}
        </p>
      )}

      {/* ── Errors ── */}
      {errors.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-red-400" role="alert">
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}
    </div>
  );
}
