'use client';

import { ExternalLink, FileText } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import type { DemoFile } from '../../lib/demo/types';
import { getProgram } from '../../lib/demo/selectors';
import { useDemo } from './demo-provider';
import { DemoModal } from './overlay';

export function DemoFileButton({ fileId, file: providedFile, label = 'Open demo file', onOpen }: { fileId?: string; file?: DemoFile; label?: ReactNode; onOpen?: () => void }) {
  const { state } = useDemo();
  const [open, setOpen] = useState(false);
  const file = providedFile ?? state.files.find((item) => item.id === fileId);
  const openFile = () => { setOpen(true); onOpen?.(); };
  return <><button className="demo-link-button" type="button" onClick={openFile}><FileText size={15} />{label}</button><DemoModal open={open} title={file?.name ?? 'Demo file'} onClose={() => setOpen(false)}><div className="demo-file-card"><FileText size={32} /><div><strong>{file?.name ?? 'Demo file'}</strong><p>{file?.description ?? 'This file is represented as a local mock preview.'}</p><small>Updated {file?.updatedAt ?? '2026-09-02'} · no external file service connected</small></div></div><button className="demo-button demo-button-secondary" type="button" onClick={() => setOpen(false)}><ExternalLink size={15} />Close preview</button></DemoModal></>;
}

export function DemoProgramFileButton({ programId, fileId }: { programId: string; fileId: string }) {
  const { state } = useDemo();
  const program = getProgram(state, programId);
  return <DemoFileButton fileId={fileId} label={`${program?.name ?? 'Program'} file`} />;
}
