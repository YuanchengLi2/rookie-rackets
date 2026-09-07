import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { DemoProvider } from '../components/demo/demo-provider';

export function renderWithDemo(ui: ReactElement) {
  return render(<DemoProvider>{ui}</DemoProvider>);
}
