
import React, { useState } from 'react';
import { Task } from '../types';
import Timer from './Timer';
import TaskList from './TaskList';
import AddTaskForm from './AddTaskForm';
import { TrashIcon, CheckCircleIcon, CircleIcon } from './icons';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onAddTask: (text: string, dueDate: string, parentId: string) => void;
  now: Date;
  level: number;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleComplete, onDelete, onAddTask, now, level }) => {
  const [showSubtaskForm, setShowSubtaskForm] = useState(false);

  const handleAddSubtask = (text: string, dueDate: string) => {
    onAddTask(text, dueDate, task.id);
    setShowSubtaskForm(false);
  };

  return (
    <div className={`bg-secondary p-4 rounded-lg shadow-md transition-all duration-300 ${task.isCompleted ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-4">
        <button onClick={() => onToggleComplete(task.id)} className="flex-shrink-0 text-highlight">
          {task.isCompleted ? <CheckCircleIcon /> : <CircleIcon />}
        </button>
        <div className="flex-grow">
          <p className={`font-medium ${task.isCompleted ? 'line-through text-text-secondary' : 'text-text-main'}`}>
            {task.text}
          </p>
          <p className="text-xs text-text-secondary">
            Due: {new Date(task.dueDate).toLocaleString()}
          </p>
        </div>
        <Timer dueDate={task.dueDate} isCompleted={task.isCompleted} now={now} />
        <div className="flex items-center gap-2">
           {!task.isCompleted && (
            <button
              onClick={() => setShowSubtaskForm(!showSubtaskForm)}
              className="p-2 text-text-secondary hover:text-white transition-colors"
              title="Add subtask"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
              </svg>
            </button>
           )}
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 text-text-secondary hover:text-highlight transition-colors"
            title="Delete task"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
      
      {showSubtaskForm && (
        <div className="mt-3">
          <AddTaskForm onAddTask={handleAddSubtask} parentId={task.id} />
        </div>
      )}

      {task.subtasks && task.subtasks.length > 0 && (
        <div className="mt-4">
          <TaskList
            tasks={task.subtasks}
            onToggleComplete={onToggleComplete}
            onDelete={onDelete}
            onAddTask={onAddTask}
            now={now}
            level={level + 1}
          />
        </div>
      )}
    </div>
  );
};

export default TaskItem;
