import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Page from './page';

describe('reviews Page', () => {
  it('should render without crashing', () => {
    const { container } = render(<Page />);
    expect(container).not.toBeEmptyDOMElement();
  });
});
