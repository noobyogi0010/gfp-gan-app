import React from 'react';
import { render, screen } from '@testing-library/react';
import FileUpload from './fileUpload';

test('renders learn react link', () => {
  render(<FileUpload />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
