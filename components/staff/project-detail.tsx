'use client';

import Link from 'next/link';
import { ArrowLeft, Check, FolderKanban, Plus, Save } from 'lucide-react';
import { useState } from 'react';
import { formatDemoDate, getOwnerName, getProjectProgress } from '../../lib/demo/selectors';
import type { Project, TaskDraft, TaskStatus } from '../../lib/demo/types';
import { useDemo } from '../demo/demo-provider';
import { DemoFileButton } from '../demo/demo-file-preview';
import { DemoModal } from '../demo/overlay';
import { EmptyState, StatusBadge } from '../demo/demo-ui';

const taskStatuses: TaskStatus[] = ['not-started', 'in-progress', 'awaiting-reply', 'blocked', 'done', 'canceled'];

export function ProjectDetail({ projectId }: { projectId: string }) {
  const { state, addTask, updateTask, updateProject } = useDemo();
  const project = state.projects.find((item) => item.id === projectId);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<TaskDraft>({ title: '', ownerId: 'staff-demo', dueDate: state.demoDate, status: 'not-started', priority: 'medium', projectId });
  if (!project) return <EmptyState title="Project not found" description="This demo project may have been reset." action={<Link href="/staff/projects" className="staff-button">Back to projects</Link>} />;
  const tasks = state.tasks.filter((task) => task.projectId === project.id);
  const progress = getProjectProgress(state, project.id);
  const set = (key: keyof TaskDraft, value: string) => setDraft((current) => ({ ...current, [key]: value } as TaskDraft));
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.title.trim()) return;
    addTask(draft);
    setOpen(false);
    setDraft({ title: '', ownerId: 'staff-demo', dueDate: state.demoDate, status: 'not-started', priority: 'medium', projectId });
  };
  return <div className="staff-page">
    <Link className="staff-back-link" href="/staff/projects"><ArrowLeft size={15} /> Projects</Link>
    <div className="staff-detail-hero"><div><div className="staff-inline-kicker"><FolderKanban size={15} /> {project.priority} priority</div><h1>{project.name}</h1><p>{project.description}</p></div><div className="staff-hero-actions"><StatusBadge status={project.status} /><select className="staff-inline-select" aria-label="Project status" value={project.status} onChange={(event) => updateProject(project.id, { status: event.target.value as Project['status'] })}><option value="planning">Planning</option><option value="in-progress">In progress</option><option value="blocked">Blocked</option><option value="done">Done</option></select></div></div>
    <div className="staff-detail-meta"><span><b>Owner</b>{getOwnerName(state, project.ownerId)}</span><span><b>Contributors</b>{project.contributorIds.map((id) => getOwnerName(state, id)).join(', ') || 'None'}</span><span><b>Target</b>{formatDemoDate(project.targetDate, { month: 'short', day: 'numeric', year: 'numeric' })}</span><span><b>Progress</b>{progress.complete}/{progress.total} tasks · {progress.percent}%</span></div>
    <div className="project-detail-layout"><section className="staff-panel"><div className="staff-panel-heading"><div><span className="staff-kicker">Tasks</span><h2>Work to finish</h2></div><button className="staff-button" onClick={() => setOpen(true)} type="button"><Plus size={16} /> Add task</button></div><div className="task-detail-list">{tasks.length ? tasks.map((task) => <div className="task-detail-row" key={task.id}><button className={`task-check ${task.status === 'done' ? 'done' : ''}`} type="button" aria-label={`Mark ${task.title} ${task.status === 'done' ? 'not done' : 'done'}`} onClick={() => updateTask(task.id, { status: task.status === 'done' ? 'in-progress' : 'done' })}>{task.status === 'done' ? <Check size={15} /> : null}</button><div><b>{task.title}</b><small>{getOwnerName(state, task.ownerId)} · due {formatDemoDate(task.dueDate)}</small></div><select aria-label={`Status for ${task.title}`} value={task.status} onChange={(event) => updateTask(task.id, { status: event.target.value as TaskStatus })}>{taskStatuses.map((status) => <option value={status} key={status}>{status.replaceAll('-', ' ')}</option>)}</select><StatusBadge status={task.status} /></div>) : <EmptyState title="No tasks yet" description="Add the first task for this project." />}</div></section><aside className="staff-panel"><div className="staff-panel-heading"><div><span className="staff-kicker">Project details</span><h2>Ownership</h2></div><Save size={17} /></div><dl className="detail-list"><div><dt>Owner</dt><dd>{getOwnerName(state, project.ownerId)}</dd></div><div><dt>Dates</dt><dd>{formatDemoDate(project.startDate)} → {formatDemoDate(project.targetDate)}</dd></div><div><dt>Status</dt><dd>{project.status.replaceAll('-', ' ')}</dd></div></dl>{project.driveFileIds.length > 0 && <div className="file-list">{project.driveFileIds.map((id) => { const file = state.files.find((item) => item.id === id); return file ? <DemoFileButton file={file} label={file.name} key={file.id} /> : null; })}</div>}<div className="project-progress-large"><span><i style={{ width: `${progress.percent}%` }} /></span><b>{progress.percent}% complete</b></div></aside></div>
    <DemoModal open={open} title="Add project task" onClose={() => setOpen(false)}><form className="staff-form" onSubmit={save}><div className="staff-form-grid"><label className="full-field">Task title *<input required value={draft.title} onChange={(event) => set('title', event.target.value)} /></label><label>Owner<select value={draft.ownerId} onChange={(event) => set('ownerId', event.target.value)}>{state.staffProfiles.map((profile) => <option value={profile.id} key={profile.id}>{profile.name}</option>)}</select></label><label>Due date<input type="date" value={draft.dueDate} onChange={(event) => set('dueDate', event.target.value)} /></label><label>Priority<select value={draft.priority} onChange={(event) => set('priority', event.target.value)}><option>low</option><option>medium</option><option>high</option></select></label></div><div className="modal-actions"><button className="staff-button staff-button-outline" type="button" onClick={() => setOpen(false)}>Cancel</button><button className="staff-button" type="submit"><Plus size={15} /> Add task</button></div></form></DemoModal>
  </div>;
}
