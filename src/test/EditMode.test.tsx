import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditMode from '../Components/EditMode';
import { LanguageProvider } from '../Components/LanguageProvider';

// Test wrapper component that provides the LanguageProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

const mockChild = {
  id: 'test-child',
  name: 'Test Child',
  avatar: '👧',
  wakeUpTime: '07:00',
  busTime: '08:00',
  tasks: [
    { id: 'task1', title: 'Brush teeth', emoji: '🦷', done: false },
    { id: 'task2', title: 'Get dressed', emoji: '👕', done: false },
  ],
};

const mockOnSave = vi.fn();
const mockOnClose = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

describe('EditMode', () => {
  it('renders child information correctly', () => {
    render(
      <TestWrapper>
        <EditMode child={mockChild} onSave={mockOnSave} onClose={mockOnClose} />
      </TestWrapper>
    );

    expect(screen.getByDisplayValue('Test Child')).toBeInTheDocument();
    expect(screen.getByDisplayValue('07:00')).toBeInTheDocument();
    expect(screen.getByDisplayValue('08:00')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Brush teeth')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Get dressed')).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', async () => {
    render(
      <TestWrapper>
        <EditMode child={mockChild} onSave={mockOnSave} onClose={mockOnClose} />
      </TestWrapper>
    );

    const cancelButton = screen.getByText('Cancel');
    await userEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when X button is clicked', async () => {
    render(
      <TestWrapper>
        <EditMode child={mockChild} onSave={mockOnSave} onClose={mockOnClose} />
      </TestWrapper>
    );

    // Find the X button by its specific class/location in header
    const allButtons = screen.getAllByRole('button');
    const closeButton = allButtons.find(button => button.querySelector('.lucide-x'));
    await userEvent.click(closeButton!);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onSave when save button is clicked', async () => {
    render(
      <TestWrapper>
        <EditMode child={mockChild} onSave={mockOnSave} onClose={mockOnClose} />
      </TestWrapper>
    );

    const saveButton = screen.getByText('Save Changes');
    await userEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'test-child',
        name: 'Test Child',
        avatar: '👧',
        wakeUpTime: '07:00',
        busTime: '08:00',
      })
    );
  });

  it('updates child name when input changes', async () => {
    render(
      <TestWrapper>
        <EditMode child={mockChild} onSave={mockOnSave} onClose={mockOnClose} />
      </TestWrapper>
    );

    const nameInput = screen.getByDisplayValue('Test Child');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'New Name');

    const saveButton = screen.getByText('Save Changes');
    await userEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New Name',
      })
    );
  });

  it('updates wake up time when input changes', async () => {
    render(
      <TestWrapper>
        <EditMode child={mockChild} onSave={mockOnSave} onClose={mockOnClose} />
      </TestWrapper>
    );

    const wakeUpInput = screen.getByDisplayValue('07:00');
    await userEvent.clear(wakeUpInput);
    await userEvent.type(wakeUpInput, '06:30');

    const saveButton = screen.getByText('Save Changes');
    await userEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        wakeUpTime: '06:30',
      })
    );
  });

  it('updates bus time when input changes', async () => {
    render(
      <TestWrapper>
        <EditMode child={mockChild} onSave={mockOnSave} onClose={mockOnClose} />
      </TestWrapper>
    );

    const busTimeInput = screen.getByDisplayValue('08:00');
    await userEvent.clear(busTimeInput);
    await userEvent.type(busTimeInput, '08:30');

    const saveButton = screen.getByText('Save Changes');
    await userEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        busTime: '08:30',
      })
    );
  });

  it('changes avatar when avatar button is clicked', async () => {
    render(
      <TestWrapper>
        <EditMode child={mockChild} onSave={mockOnSave} onClose={mockOnClose} />
      </TestWrapper>
    );

    const newAvatarButton = screen.getByRole('button', { name: '👦' });
    await userEvent.click(newAvatarButton);

    const saveButton = screen.getByText('Save Changes');
    await userEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        avatar: '👦',
      })
    );
  });

  it('adds a new custom task when form is filled and submitted', async () => {
    render(
      <TestWrapper>
        <EditMode child={mockChild} onSave={mockOnSave} onClose={mockOnClose} />
      </TestWrapper>
    );

    const emojiInput = screen.getByDisplayValue('✅');
    const titleInput = screen.getByPlaceholderText('New task...');
    // Find the plus button specifically by looking for buttons with Plus icon
    const allButtons = screen.getAllByRole('button');
    const addButton = allButtons.find(button => button.querySelector('.lucide-plus'));

    await userEvent.clear(emojiInput);
    await userEvent.type(emojiInput, '🍎');
    await userEvent.type(titleInput, 'Eat apple');
    await userEvent.click(addButton!);

    // Check that the new task appears in the form
    expect(screen.getByDisplayValue('Eat apple')).toBeInTheDocument();
    expect(screen.getByDisplayValue('🍎')).toBeInTheDocument();
  });

  it('adds a preset task when preset button is clicked', async () => {
    render(
      <TestWrapper>
        <EditMode child={mockChild} onSave={mockOnSave} onClose={mockOnClose} />
      </TestWrapper>
    );

    const presetButton = screen.getByRole('button', { name: '🦷 Brush teeth' });
    await userEvent.click(presetButton);

    // Should add another "Brush teeth" task
    const brushTeethInputs = screen.getAllByDisplayValue('Brush teeth');
    expect(brushTeethInputs).toHaveLength(2); // Original + new one
  });

  it('removes a task when delete button is clicked', async () => {
    render(
      <TestWrapper>
        <EditMode child={mockChild} onSave={mockOnSave} onClose={mockOnClose} />
      </TestWrapper>
    );

    const deleteButtons = screen.getAllByRole('button').filter(button => {
      const svg = button.querySelector('svg');
      return svg && svg.classList.contains('lucide-trash-2');
    });

    expect(screen.getByDisplayValue('Brush teeth')).toBeInTheDocument();

    // Click the first delete button
    await userEvent.click(deleteButtons[0]);

    // Task should be removed
    expect(screen.queryByDisplayValue('Brush teeth')).not.toBeInTheDocument();
  });

  it('updates task title when input changes', async () => {
    render(
      <TestWrapper>
        <EditMode child={mockChild} onSave={mockOnSave} onClose={mockOnClose} />
      </TestWrapper>
    );

    const taskInput = screen.getByDisplayValue('Brush teeth');
    await userEvent.clear(taskInput);
    await userEvent.type(taskInput, 'Brush teeth thoroughly');

    const saveButton = screen.getByText('Save Changes');
    await userEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        tasks: expect.arrayContaining([
          expect.objectContaining({
            title: 'Brush teeth thoroughly',
          }),
        ]),
      })
    );
  });

  it('updates task emoji when input changes', async () => {
    render(
      <TestWrapper>
        <EditMode child={mockChild} onSave={mockOnSave} onClose={mockOnClose} />
      </TestWrapper>
    );

    const emojiInputs = screen.getAllByDisplayValue('🦷');
    await userEvent.clear(emojiInputs[0]);
    await userEvent.type(emojiInputs[0], '🪥');

    const saveButton = screen.getByText('Save Changes');
    await userEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        tasks: expect.arrayContaining([
          expect.objectContaining({
            emoji: '🪥',
          }),
        ]),
      })
    );
  });

  it('adds task when Enter key is pressed in title input', async () => {
    render(
      <TestWrapper>
        <EditMode child={mockChild} onSave={mockOnSave} onClose={mockOnClose} />
      </TestWrapper>
    );

    const titleInput = screen.getByPlaceholderText('New task...');
    await userEvent.type(titleInput, 'New task via Enter{enter}');

    // Check that the new task appears
    expect(screen.getByDisplayValue('New task via Enter')).toBeInTheDocument();
  });

  it('does not add empty task when add button is clicked', async () => {
    render(
      <TestWrapper>
        <EditMode child={mockChild} onSave={mockOnSave} onClose={mockOnClose} />
      </TestWrapper>
    );

    // Find the plus button specifically by looking for buttons with Plus icon
    const allButtons = screen.getAllByRole('button');
    const addButton = allButtons.find(button => button.querySelector('.lucide-plus'));
    const initialTaskInputs = screen.getAllByDisplayValue(/./); // All inputs with values

    await userEvent.click(addButton!);

    // Should not add new task (same number of inputs)
    const afterTaskInputs = screen.getAllByDisplayValue(/./);
    expect(afterTaskInputs).toHaveLength(initialTaskInputs.length);
  });

  it('handles child with minimal data', () => {
    const minimalChild = {
      id: 'minimal',
      name: '',
      avatar: '',
      wakeUpTime: '',
      busTime: '',
      tasks: [],
    };

    render(
      <TestWrapper>
        <EditMode child={minimalChild} onSave={mockOnSave} onClose={mockOnClose} />
      </TestWrapper>
    );

    // Should render with default values
    expect(screen.getByText('👦')).toBeInTheDocument(); // Default avatar button
    expect(screen.getByDisplayValue('07:00')).toBeInTheDocument(); // Default wake time
    expect(screen.getByDisplayValue('08:00')).toBeInTheDocument(); // Default bus time
  });
});
