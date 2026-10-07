import { render, screen, act } from '@testing-library/react';
import { useLocalStorage } from './use-local-storage';
import { describe, it, expect, beforeEach } from 'vitest';

// A simple test component to consume the hook
function TestComponent({ storageKey, initialValue }: { storageKey: string; initialValue: any }) {
  const [value, setValue] = useLocalStorage(storageKey, initialValue);

  return (
    <div>
      <span data-testid="value">{JSON.stringify(value)}</span>
      <button onClick={() => setValue('new_value')}>Update</button>
    </div>
  );
}

describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('initializes with the default value if localStorage is empty', () => {
    render(<TestComponent storageKey="test_key" initialValue="default_value" />);
    expect(screen.getByTestId('value')).toHaveTextContent('"default_value"');
  });

  it('initializes with the value from localStorage if it exists', () => {
    window.localStorage.setItem('test_key', JSON.stringify('stored_value'));
    render(<TestComponent storageKey="test_key" initialValue="default_value" />);
    expect(screen.getByTestId('value')).toHaveTextContent('"stored_value"');
  });

  it('updates the value in state and localStorage when setter is called', () => {
    render(<TestComponent storageKey="test_key" initialValue="default_value" />);
    
    act(() => {
      screen.getByText('Update').click();
    });

    expect(screen.getByTestId('value')).toHaveTextContent('"new_value"');
    expect(window.localStorage.getItem('test_key')).toBe(JSON.stringify('new_value'));
  });
});
