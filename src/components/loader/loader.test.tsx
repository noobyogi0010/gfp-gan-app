import React from 'react';
import { render, screen } from '@testing-library/react';
import Loader from './loader';

test('renders learn react link', () => {
  render(<Loader />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
