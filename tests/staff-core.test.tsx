import { cleanup, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { StaffHome } from '../components/staff/staff-home';
import { ProgramsView } from '../components/staff/programs-view';
import { ProgramDetail } from '../components/staff/program-detail';
import { OrganizationDetail } from '../components/staff/organization-detail';
import { ProjectDetail } from '../components/staff/project-detail';
import { renderWithDemo, renderWithOperations } from './test-utils';
import { DemoProvider, useDemo } from '../components/demo/demo-provider';

vi.mock('next/navigation', () => ({ usePathname: () => '/staff', useRouter: () => ({ replace: vi.fn(), push: vi.fn() }) }));

describe('staff core mock', () => {
  it('shows operational home selectors and program creation', async () => {
    const user = userEvent.setup();
    renderWithDemo(<StaffHome />);
    expect(screen.getByRole('heading', { name: /operations/i })).toBeInTheDocument();
    cleanup();
    const { repository } = renderWithOperations(<DemoProvider persistent><ProgramsView /></DemoProvider>);
    await user.click(screen.getByRole('button', { name: /create program/i }));
    await user.type(screen.getByLabelText(/program name/i), 'Demo Rally');
    await user.type(screen.getByLabelText(/venue/i), 'Demo Court');
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /^create program$/i }));
    expect(repository.createProgram).toHaveBeenCalledWith(expect.objectContaining({ name: 'Demo Rally', venue: 'Demo Court' }));
  });

  it('provides direct paths from the home screen to core daily work', () => {
    renderWithDemo(<StaffHome />);

    expect(screen.getByRole('link', { name: /open programs/i })).toHaveAttribute('href', '/staff/programs');
    expect(screen.getByRole('link', { name: /open registrations/i })).toHaveAttribute('href', '/staff/registrations');
    expect(screen.getByRole('link', { name: /open partners/i })).toHaveAttribute('href', '/staff/organizations');
    expect(screen.getByRole('link', { name: /open projects/i })).toHaveAttribute('href', '/staff/projects');
  });

  it('edits curriculum in place and removes the program files section', async () => {
    const user = userEvent.setup();
    function CurriculumProbe() {
      const { state } = useDemo();
      return <output data-testid="curriculum-probe">{state.sessions.find((session) => session.id === 'session-boys-sep-04')?.curriculum.objective}</output>;
    }

    renderWithDemo(<><ProgramDetail programId="program-boys-club" /><CurriculumProbe /></>);
    expect(screen.queryByRole('tab', { name: /^files$/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: /curriculum/i }));
    await user.selectOptions(screen.getByLabelText(/session to plan/i), 'session-boys-sep-04');
    const objective = screen.getByLabelText(/session objective/i);
    await user.clear(objective);
    await user.type(objective, 'Practice serving into open space');
    await user.click(screen.getByRole('button', { name: /save curriculum/i }));

    expect(screen.getByTestId('curriculum-probe')).toHaveTextContent('Practice serving into open space');
  });

  it('updates attendance, coach assignment, organization next step, and project tasks', async () => {
    const user = userEvent.setup();
    renderWithDemo(<ProgramDetail programId="program-boys-club" />);
    await user.click(screen.getByRole('tab', { name: /roster/i }));
    const attendanceSelect = screen.getByRole('combobox', { name: /sam.*sep 11/i });
    await user.selectOptions(attendanceSelect, 'parent-reported-absence');
    expect(attendanceSelect).toHaveValue('parent-reported-absence');
    cleanup();
    renderWithDemo(<OrganizationDetail organizationId="organization-white-oak" />);
    await user.click(screen.getByRole('button', { name: /edit next step/i }));
    const nextStepInput = within(screen.getByRole('dialog')).getByLabelText(/next step/i);
    await user.clear(nextStepInput);
    await user.type(nextStepInput, 'Send a fresh schedule');
    await user.click(screen.getByRole('button', { name: /save next step/i }));
    expect(screen.getByText(/send a fresh schedule/i)).toBeInTheDocument();
    cleanup();
    renderWithDemo(<ProjectDetail projectId="project-family-portal" />);
    const task = screen.getByRole('button', { name: /mark present proposal done/i });
    await user.click(task);
    expect(within(task.parentElement as HTMLElement).getByText(/^Done$/i, { selector: 'span.demo-status' })).toBeInTheDocument();
  });
});
