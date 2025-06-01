import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';

import ChildView from "../Components/ChildView.tsx";
import React, {PropsWithChildren} from "react";

// Silence Framer Motion’s enter/exit animations by mocking both `motion.div`
// and `AnimatePresence` so they render instantly and remove instantly.
vi.mock('framer-motion', () => {
    return {
        motion: {
            div: ({ children }: PropsWithChildren<Record<string, unknown>>) => (
                <div>{children}</div>
            ),
        },
        AnimatePresence: ({ children }: { children: React.ReactNode }) => (
            <>{children}</>
        ),
    };
});


const mockDate = new Date('2025-06-01T08:00:00Z');

describe('ChildView animations', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        vi.setSystemTime(mockDate);
    });

    afterEach(() => {
        vi.clearAllTimers();
    });

    it('dismisses completion celebration after timeout', () => {
        const child = {
            id: '1',
            name: 'Alice',
            avatar: '',
            wakeUpTime: '',
            busTime: '',
            tasks: [{ id: 't1', title: 'Task 1', emoji: '🔔', done: true }],
        };
        const onUpdateChild = vi.fn();
        const onEditMode = vi.fn();

        render(
            <ChildView
                child={child}
                onUpdateChild={onUpdateChild}
                onEditMode={onEditMode}
            />
        );

        expect(screen.getByText('All Done, Alice!')).toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(3000);
        });

        expect(screen.queryByText('All Done, Alice!')).toBeNull();
    });
});


