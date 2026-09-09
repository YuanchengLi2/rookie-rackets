import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { OperationsProvider } from '../components/data/operations-provider';
import { RegistrationsView } from '../components/staff/registrations-view';
import { emptyOperationsState, type OperationsState } from '../lib/data/types';
import { createRepositoryHarness } from './repository-harness';

function state(): OperationsState {
  const base = emptyOperationsState();
  base.programs = [{ id: '30000000-0000-4000-8000-000000000001', slug: 'fall', name: 'Fall Program', organizationId: null, type: 'camp', description: '', venue: 'Gym', skillLevel: 'mixed', eligibility: '', capacity: 20, leadCoachId: null, status: 'registration-open', visibility: 'public', priceCents: 0, registrationDeadline: '2026-12-01', whatToBring: [], equipmentProvided: true, image: '', contact: '', createdAt: '', updatedAt: '', archivedAt: null }];
  base.sessions = [{ id: '40000000-0000-4000-8000-000000000001', programId: base.programs[0].id, date: '2026-10-01', startTime: '16:00', endTime: '17:00', arrivalTime: '15:45', location: 'Gym', leadCoachId: null, curriculum: { objective: '', activities: [], coachNotes: '', updatedAt: null }, status: 'scheduled', notes: '', createdAt: '', updatedAt: '' }];
  base.registrations = [{ id: '60000000-0000-4000-8000-000000000001', publicReference: 'RR-ONLINE01', source: 'online', programId: base.programs[0].id, childFirstName: 'Jamie', childLastName: 'Lee', dateOfBirth: '2015-05-12', grade: '5th', skillLevel: 'beginner', guardianFirstName: 'Jordan', guardianLastName: 'Lee', guardianEmail: 'jordan@example.com', guardianPhone: '919-555-0110', emergencyName: 'Taylor', emergencyRelationship: 'Parent', emergencyPhone: '919-555-0111', supportNotes: '', internalNotes: '', needsRacket: true, parentOnsite: false, selectedSessionIds: [base.sessions[0].id], registrationStatus: 'confirmed', paymentStatus: 'waived', submittedAt: '2026-09-08T12:00:00Z', createdAt: '', updatedAt: '1', archivedAt: null }];
  return base;
}

describe('staff registration inbox', () => {
  it('shows online submissions with their reference and opens every field for staff review', async () => {
    const repository = createRepositoryHarness(state());
    render(<OperationsProvider repository={repository}><RegistrationsView /></OperationsProvider>);
    expect(await screen.findByText(/RR-ONLINE01/)).toBeInTheDocument();
    expect(screen.getByText('Online signup')).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: /jamie lee/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/internal staff notes/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/guardian email/i)).toHaveValue('jordan@example.com');
  });
});
