import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { DemoProvider } from '../components/demo/demo-provider';
import { OperationsProvider } from '../components/data/operations-provider';
import { createRepositoryHarness, createTestOperationsState } from './repository-harness';

export function renderWithDemo(ui: ReactElement) {
  return render(<DemoProvider>{ui}</DemoProvider>);
}

export function renderWithOperations(ui: ReactElement) {
  const repository = createRepositoryHarness(createTestOperationsState());
  return { ...render(<OperationsProvider repository={repository}>{ui}</OperationsProvider>), repository };
}
