
import React from 'react';
import { Task } from '../types';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onAddTask: (text: string, dueDate: string, parentId: string) => void;
  onToggleNotifications: (id: string) => void;
  onEditTask: (id: string, text: string, dueDate: string) => void;
  now: Date;
  level?: number;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onToggleComplete, onDelete, onAddTask, onToggleNotifications, onEditTask, now, level = 0 }) => {
  if (tasks.length === 0 && level === 0) {
    return (
        <div className="text-center py-10 px-4 bg-secondary rounded-lg shadow-inner">
            <h2 className="text-xl font-semibold text-text-secondary">No tasks yet!</h2>
            <p className="text-text-secondary mt-2">Add a new task above to get started.</p>
        </div>
    );
  }

  return (
    <div className={`space-y-3 ${level > 0 ? 'ml-4 pl-4 border-l-2 border-accent' : ''}`}>
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onAddTask={onAddTask}
          onToggleNotifications={onToggleNotifications}
          onEditTask={onEditTask}
          now={now}
          level={level}
        />
      ))}
    </div>
  );
};

export default TaskList;
