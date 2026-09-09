'use client';

import { ExternalLink, FileText } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import type { DemoFile } from '../../lib/demo/types';
import { getProgram } from '../../lib/demo/selectors';
import { useDemo } from './demo-provider';
import { DemoModal } from './overlay';
import { useOptionalOperations } from '../data/operations-provider';

export function DemoFileButton({ fileId, file: providedFile, label = 'Open file', onOpen }: { fileId?: string; file?: DemoFile; label?: ReactNode; onOpen?: () => void }) {
  const { state } = useDemo();
  const operations = useOptionalOperations();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const file = providedFile ?? state.files.find((item) => item.id === fileId);
  const openFile = async () => { onOpen?.(); const stored = operations?.state.files.find((item) => item.id === (fileId ?? file?.id)); if (operations && stored) { try { const url = await operations.repository.createSignedFileUrl(stored.storagePath); window.open(url, '_blank', 'noopener,noreferrer'); return; } catch { setError('The file link could not be created. Try again.'); } } setOpen(true); };
  return <><button className="demo-link-button" type="button" onClick={() => void openFile()}><FileText size={15} />{label}</button><DemoModal open={open} title={file?.name ?? 'File'} onClose={() => setOpen(false)}><div className="demo-file-card"><FileText size={32} /><div><strong>{file?.name ?? 'File'}</strong><p>{error || file?.description || 'No preview is available for this file.'}</p><small>Updated {file?.updatedAt ?? 'Unknown'}</small></div></div><button className="demo-button demo-button-secondary" type="button" onClick={() => setOpen(false)}><ExternalLink size={15} />Close</button></DemoModal></>;
}

export function DemoProgramFileButton({ programId, fileId }: { programId: string; fileId: string }) {
  const { state } = useDemo();
  const program = getProgram(state, programId);
  return <DemoFileButton fileId={fileId} label={`${program?.name ?? 'Program'} file`} />;
}
