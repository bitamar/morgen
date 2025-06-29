import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChildManager from '../Components/ChildManager';
import { LanguageProvider } from '../Components/LanguageProvider';

// Test wrapper component that provides the LanguageProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

const mockChildren = [
  {
    id: 'child1',
    name: 'Alice',
    avatar: 'cat.png',
    wakeUpTime: '07:00',
    busTime: '08:00',
    tasks: [{ id: 'task1', title: 'Brush teeth', emoji: '🦷', done: false }],
  },
  {
    id: 'child2',
    name: 'Bob',
    avatar: 'dog.png',
    wakeUpTime: '07:30',
    busTime: '08:30',
    tasks: [],
  },
];

const mockOnSave = vi.fn();
const mockOnClose = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ChildManager', () => {
  it('renders children list correctly', () => {
    render(
      <TestWrapper>
        <ChildManager childList={mockChildren} onSave={mockOnSave} onClose={mockOnClose} />
      </TestWrapper>
    );

    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Bob')).toBeInTheDocument();
    expect(screen.getByDisplayValue('07:00')).toBeInTheDocument();
    expect(screen.getByDisplayValue('07:30')).toBeInTheDocument();
    expect(screen.getByDisplayValue('08:00')).toBeInTheDocument();
    expect(screen.getByDisplayValue('08:30')).toBeInTheDocument();
  });

  it('renders title and buttons', () => {
    render(
      <TestWrapper>
        <ChildManager childList={mockChildren} onSave={mockOnSave} onClose={mockOnClose} />
      </TestWrapper>
    );

    expect(screen.getByText('Manage Children')).toBeInTheDocument();
    expect(screen.getByText('Add Child')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', async () => {
    render(
      <TestWrapper>
        <ChildManager childList={mockChildren} onSave={mockOnSave} onClose={mockOnClose} />
      </TestWrapper>
    );

    const cancelButton = screen.getByText('Cancel');
    await userEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when X button is clicked', async () => {
    render(
      <TestWrapper>
        <ChildManager childList={mockChildren} onSave={mockOnSave} onClose={mockOnClose} />
      </TestWrapper>
    );

    const closeButtons = screen.getAllByRole('button');
    const xButton = closeButtons.find(button => button.querySelector('.lucide-x'));
    await userEvent.click(xButton!);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onSave with edited children when save button is clicked', async () => {
    render(
      <TestWrapper>
        <ChildManager childList={mockChildren} onSave={mockOnSave} onClose={mockOnClose} />
      </TestWrapper>
    );

    const saveButton = screen.getByText('Save Changes');
    await userEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith(mockChildren);
  });

  it('adds a new child when add button is clicked', async () => {
    render(
      <TestWrapper>
        <ChildManager childList={mockChildren} onSave={mockOnSave} onClose={mockOnClose} />
      </TestWrapper>
    );

    const addButton = screen.getByText('Add Child');
    await userEvent.click(addButton);

    // Should now have 3 name inputs (2 original + 1 new)
    const nameInputs = screen.getAllByPlaceholderText("Child's name");
    expect(nameInputs).toHaveLength(3);

    // New child should have default values
    expect(nameInputs[2]).toHaveValue('');

    // Check for default wake time (07:00) - should have 2 now since new child gets default
    const wakeTimeInputs = screen.getAllByDisplayValue('07:00');
    expect(wakeTimeInputs.length).toBeGreaterThanOrEqual(2);
  });

  it('removes a child when delete button is clicked', async () => {
    render(
      <TestWrapper>
        <ChildManager childList={mockChildren} onSave={mockOnSave} onClose={mockOnClose} />
      </TestWrapper>
    );

    // Initially should have 2 children
    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Bob')).toBeInTheDocument();

    // Find delete buttons (trash icons)
    const deleteButtons = screen
      .getAllByRole('button')
      .filter(button => button.querySelector('.lucide-trash2'));

    // Click the first delete button (should remove Alice)
    await userEvent.click(deleteButtons[0]);

    // Alice should be gone, Bob should remain
    expect(screen.queryByDisplayValue('Alice')).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('Bob')).toBeInTheDocument();
  });

  it('updates child name when input changes', async () => {
    render(
      <TestWrapper>
        <ChildManager childList={mockChildren} onSave={mockOnSave} onClose={mockOnClose} />
      </TestWrapper>
    );

    const nameInput = screen.getByDisplayValue('Alice');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Alicia');

    const saveButton = screen.getByText('Save Changes');
    await userEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'child1',
          name: 'Alicia',
        }),
      ])
    );
  });

  it('updates child wake up time when input changes', async () => {
    render(
      <TestWrapper>
        <ChildManager childList={mockChildren} onSave={mockOnSave} onClose={mockOnClose} />
      </TestWrapper>
    );

    const wakeTimeInputs = screen.getAllByDisplayValue('07:00');
    await userEvent.clear(wakeTimeInputs[0]);
    await userEvent.type(wakeTimeInputs[0], '06:30');

    const saveButton = screen.getByText('Save Changes');
    await userEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'child1',
          wakeUpTime: '06:30',
        }),
      ])
    );
  });

  it('updates child bus time when input changes', async () => {
    render(
      <TestWrapper>
        <ChildManager childList={mockChildren} onSave={mockOnSave} onClose={mockOnClose} />
      </TestWrapper>
    );

    const busTimeInput = screen.getByDisplayValue('08:00');
    await userEvent.clear(busTimeInput);
    await userEvent.type(busTimeInput, '08:15');

    const saveButton = screen.getByText('Save Changes');
    await userEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'child1',
          busTime: '08:15',
        }),
      ])
    );
  });

  it('handles empty children list', () => {
    render(
      <TestWrapper>
        <ChildManager childList={[]} onSave={mockOnSave} onClose={mockOnClose} />
      </TestWrapper>
    );

    expect(screen.getByText('Manage Children')).toBeInTheDocument();
    expect(screen.getByText('Add Child')).toBeInTheDocument();

    // No child inputs should be present
    const nameInputs = screen.queryAllByPlaceholderText("Child's name");
    expect(nameInputs).toHaveLength(0);
  });

  it('can add multiple children', async () => {
    render(
      <TestWrapper>
        <ChildManager childList={[]} onSave={mockOnSave} onClose={mockOnClose} />
      </TestWrapper>
    );

    const addButton = screen.getByText('Add Child');

    // Add first child
    await userEvent.click(addButton);
    expect(screen.getAllByPlaceholderText("Child's name")).toHaveLength(1);

    // Add second child
    await userEvent.click(addButton);
    expect(screen.getAllByPlaceholderText("Child's name")).toHaveLength(2);

    // Add third child
    await userEvent.click(addButton);
    expect(screen.getAllByPlaceholderText("Child's name")).toHaveLength(3);
  });

  it('preserves child tasks when updating other fields', async () => {
    render(
      <TestWrapper>
        <ChildManager childList={mockChildren} onSave={mockOnSave} onClose={mockOnClose} />
      </TestWrapper>
    );

    // Update Alice's name
    const nameInput = screen.getByDisplayValue('Alice');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Alicia');

    const saveButton = screen.getByText('Save Changes');
    await userEvent.click(saveButton);

    // Verify tasks are preserved
    expect(mockOnSave).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'child1',
          name: 'Alicia',
          tasks: [{ id: 'task1', title: 'Brush teeth', emoji: '🦷', done: false }],
        }),
      ])
    );
  });

  it('creates new child with unique ID', async () => {
    // Mock Date.now to ensure predictable ID
    const mockDate = 1234567890;
    vi.spyOn(Date, 'now').mockReturnValue(mockDate);

    render(
      <TestWrapper>
        <ChildManager childList={[]} onSave={mockOnSave} onClose={mockOnClose} />
      </TestWrapper>
    );

    const addButton = screen.getByText('Add Child');
    await userEvent.click(addButton);

    const saveButton = screen.getByText('Save Changes');
    await userEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith([
      expect.objectContaining({
        id: `child-${mockDate}`,
        name: '',
        avatar: 'dog.png',
        wakeUpTime: '07:00',
        busTime: '08:00',
        tasks: [],
      }),
    ]);
  });

  it('handles rapid add and remove operations', async () => {
    render(
      <TestWrapper>
        <ChildManager childList={mockChildren} onSave={mockOnSave} onClose={mockOnClose} />
      </TestWrapper>
    );

    const addButton = screen.getByText('Add Child');

    // Add a child
    await userEvent.click(addButton);
    expect(screen.getAllByPlaceholderText("Child's name")).toHaveLength(3);

    // Remove the first child (Alice)
    const deleteButtons = screen
      .getAllByRole('button')
      .filter(button => button.querySelector('.lucide-trash2'));
    await userEvent.click(deleteButtons[0]);

    // Should now have 2 children (Bob + new one)
    expect(screen.getAllByPlaceholderText("Child's name")).toHaveLength(2);
    expect(screen.queryByDisplayValue('Alice')).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('Bob')).toBeInTheDocument();
  });

  it('renders proper accessibility attributes', () => {
    render(
      <TestWrapper>
        <ChildManager childList={mockChildren} onSave={mockOnSave} onClose={mockOnClose} />
      </TestWrapper>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    const nameInputs = screen.getAllByPlaceholderText("Child's name");
    nameInputs.forEach(input => {
      expect(input).toHaveAttribute('type', 'text');
    });

    const timeInputs = screen.getAllByDisplayValue(/^\d{2}:\d{2}$/);
    timeInputs.forEach(input => {
      expect(input).toHaveAttribute('type', 'time');
    });
  });
});
