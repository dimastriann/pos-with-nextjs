import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import POS from '../app/page';

describe('POS Page', () => {
  it('renders a heading', () => {
    render(<POS />);

    const heading = screen.getByRole('heading', { level: 1 });

    expect(heading).toBeInTheDocument();
  });
});
