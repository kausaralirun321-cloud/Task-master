import React from 'react';
import { Task } from '../types';
import TaskItem from './TaskItem';

const EmptyStateIcon = () => (
    <svg className="mx-auto h-24 w-24 text-accent/50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.75 16.5V12.75M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9.75 9.75H14.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);


interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onAddTask: (text: string, startDate: string, endDate: string, parentId: string) => void;
  onUpdateTask: (id: string, text: string, startDate: string, endDate: string) => void;
  now: Date;
  level?: number;
  numberingPrefix?: string;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onToggleComplete, onDelete, onAddTask, onUpdateTask, now, level = 0, numberingPrefix = '' }) => {
  if (tasks.length === 0 && level === 0) {
    return (
        <div className="text-center py-16 px-4 bg-secondary/30 rounded-lg shadow-inner border border-accent/20 animate-fade-in">
            <EmptyStateIcon />
            <h2 className="text-2xl font-bold text-text-main mt-4">Ready to conquer your day?</h2>
            <p className="text-text-secondary mt-2 max-w-sm mx-auto">Add your first task using the form above. Break down big goals, set deadlines, and watch your progress unfold.</p>
        </div>
    );
  }

  return (
    <div className={`space-y-4 ${level > 0 ? 'ml-4 pl-4 border-l-2 border-accent/30' : ''}`}>
      {tasks.map((task, index) => {
        const taskNumber = numberingPrefix ? `${numberingPrefix}.${index + 1}` : `${index + 1}`;
        return (
          <TaskItem
            key={task.id}
            task={task}
            taskNumber={taskNumber}
            onToggleComplete={onToggleComplete}
            onDelete={onDelete}
            onAddTask={onAddTask}
            onUpdateTask={onUpdateTask}
            now={now}
            level={level}
          />
        );
      })}
    </div>
  );
};

export default TaskList;