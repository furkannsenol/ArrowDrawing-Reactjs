import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const elements= screen.getByText(/çizgi/i)
  expect(elements).toBeInTheDocument()
});
