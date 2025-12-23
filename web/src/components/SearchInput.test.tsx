import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchInput } from './SearchInput';

describe('SearchInput', () => {
  it('should render with placeholder', () => {
    const onChange = jest.fn();
    render(<SearchInput value="" onChange={onChange} placeholder="Search..." />);

    const input = screen.getByPlaceholderText('Search...');
    expect(input).toBeInTheDocument();
  });

  it('should call onChange when typing', async () => {
    const onChange = jest.fn();
    render(<SearchInput value="" onChange={onChange} />);

    const input = screen.getByPlaceholderText('Buscar...');
    await userEvent.type(input, 'test');

    expect(onChange).toHaveBeenCalledTimes(4);
    expect(onChange).toHaveBeenLastCalledWith('t');
  });

  it('should display clear button when value is not empty', () => {
    const onChange = jest.fn();
    render(<SearchInput value="test" onChange={onChange} />);

    const clearButton = screen.getByRole('button');
    expect(clearButton).toBeInTheDocument();
  });

  it('should not display clear button when value is empty', () => {
    const onChange = jest.fn();
    render(<SearchInput value="" onChange={onChange} />);

    const buttons = screen.queryAllByRole('button');
    expect(buttons.length).toBe(0);
  });

  it('should clear input when clear button is clicked', async () => {
    const onChange = jest.fn();
    render(<SearchInput value="test" onChange={onChange} />);

    const clearButton = screen.getByRole('button');
    await userEvent.click(clearButton);

    expect(onChange).toHaveBeenCalledWith('');
  });

  it('should display current value', () => {
    const onChange = jest.fn();
    render(<SearchInput value="current value" onChange={onChange} />);

    const input = screen.getByDisplayValue('current value');
    expect(input).toBeInTheDocument();
  });
});

