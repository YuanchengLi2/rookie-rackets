import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DemoDrawer, DemoModal } from '../components/demo/overlay';

describe('demo overlays', () => {
  it('renders a real drawer in a document-level portal', () => {
    const { container } = render(<DemoDrawer open title="Coach details" onClose={vi.fn()}><p>Drawer content</p></DemoDrawer>);
    const dialog = screen.getByRole('dialog', { name: /coach details/i });

    expect(dialog).toHaveClass('demo-drawer');
    expect(container).toBeEmptyDOMElement();
    expect(dialog.parentElement).toHaveClass('demo-drawer-overlay');
  });

  it('traps keyboard focus and closes with Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<DemoModal open title="Edit program" onClose={onClose}><button type="button">First action</button><button type="button">Last action</button></DemoModal>);
    const close = screen.getByRole('button', { name: /close dialog/i });
    const last = screen.getByRole('button', { name: /last action/i });

    last.focus();
    await user.tab();
    expect(close).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
