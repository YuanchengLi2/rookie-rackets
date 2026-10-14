'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import type { OrganizationStatus, OrganizationType } from '../../lib/data/types';
import { useOperations } from '../data/operations-provider';

const types: OrganizationType[] = ['school', 'nonprofit', 'sports-facility', 'community-center', 'college', 'sponsor', 'government', 'other'];
const statuses: OrganizationStatus[] = ['researching', 'not-contacted', 'contacted', 'follow-up-due', 'meeting-scheduled', 'interested', 'planning', 'active-partner', 'paused', 'declined', 'dormant'];

export function OrganizationManagement({ organizationId }: { organizationId: string }) {
  const router = useRouter();
  const { state, mutate, isSaving } = useOperations();
  const organization = state.organizations.find((item) => item.id === organizationId && !item.archivedAt);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(''); const [type, setType] = useState<OrganizationType>('school');
  const [status, setStatus] = useState<OrganizationStatus>('researching');
  const [website, setWebsite] = useState(''); const [address, setAddress] = useState('');
  const [contact, setContact] = useState(''); const [email, setEmail] = useState('');
  const [nextStep, setNextStep] = useState('');
  useEffect(() => {
    if (!organization || editing) return;
    setName(organization.name); setType(organization.type); setStatus(organization.status);
    setWebsite(organization.website); setAddress(organization.address);
    setContact(organization.primaryContact); setEmail(organization.primaryContactEmail);
    setNextStep(organization.nextStep);
  }, [organization, editing]);
  if (!organization) return null;
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    try {
      await mutate(`organization:${organizationId}:edit`, (repository) => repository.updateOrganization(organizationId, {
        name: name.trim(), type, status, website: website.trim(), address: address.trim(),
        primaryContact: contact.trim(), primaryContactEmail: email.trim(), nextStep: nextStep.trim(),
      }), 'Organization saved.');
      setEditing(false);
    } catch { /* Keep the form open for correction. */ }
  };
  const archive = async () => {
    if (!window.confirm(`Archive ${organization.name}? Linked programs and history will remain.`)) return;
    try {
      await mutate(`organization:${organizationId}:archive`, (repository) => repository.archiveOrganization(organizationId), 'Organization archived.');
      router.push('/staff/organizations');
    } catch { /* The operations toast shows the error. */ }
  };
  return <section className="staff-panel record-management" aria-label="Organization management">
    <div className="staff-panel-heading"><div><span className="staff-kicker">Organization record</span><h2>Edit or archive this partner</h2></div><div className="staff-heading-actions"><button className="staff-button staff-button-outline" type="button" onClick={() => setEditing((value) => !value)}>{editing ? 'Cancel edit' : 'Edit organization'}</button><button className="staff-danger-button" type="button" disabled={isSaving(`organization:${organizationId}:archive`)} onClick={() => void archive()}>Archive organization</button></div></div>
    {editing && <form className="staff-form" onSubmit={(event) => void save(event)}><div className="staff-form-grid">
      <label>Name<input required value={name} onChange={(event) => setName(event.target.value)} /></label>
      <label>Type<select value={type} onChange={(event) => setType(event.target.value as OrganizationType)}>{types.map((value) => <option key={value} value={value}>{value.replaceAll('-', ' ')}</option>)}</select></label>
      <label>Status<select value={status} onChange={(event) => setStatus(event.target.value as OrganizationStatus)}>{statuses.map((value) => <option key={value} value={value}>{value.replaceAll('-', ' ')}</option>)}</select></label>
      <label>Website<input type="url" value={website} onChange={(event) => setWebsite(event.target.value)} /></label>
      <label>Address<input value={address} onChange={(event) => setAddress(event.target.value)} /></label>
      <label>Primary contact<input value={contact} onChange={(event) => setContact(event.target.value)} /></label>
      <label>Contact email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <label className="full-field">Next step<input value={nextStep} onChange={(event) => setNextStep(event.target.value)} /></label>
    </div><button className="staff-button" type="submit" disabled={isSaving(`organization:${organizationId}:edit`)}>{isSaving(`organization:${organizationId}:edit`) ? 'Saving…' : 'Save organization'}</button></form>}
  </section>;
}
