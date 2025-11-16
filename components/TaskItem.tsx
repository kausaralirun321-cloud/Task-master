import React, { useState } from 'react';
import { Task } from '../types';
import Timer from './Timer';
import TaskList from './TaskList';
import AddTaskForm from './AddTaskForm';
import { TrashIcon, CheckCircleIcon, CircleIcon, BellIcon, BellSlashIcon, PencilIcon } from './icons';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onAddTask: (text: string, dueDate: string, parentId: string) => void;
  onToggleNotifications: (id: string) => void;
  onEditTask: (id: string, text: string, dueDate: string) => void;
  now: Date;
  level: number;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleComplete, onDelete, onAddTask, onToggleNotifications, onEditTask, now, level }) => {
  const [showSubtaskForm, setShowSubtaskForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [editText, setEditText] = useState(task.text);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');

  const handleAddSubtask = (text: string, dueDate: string) => {
    onAddTask(text, dueDate, task.id);
    setShowSubtaskForm(false);
  };

  const handleEditClick = () => {
    setEditText(task.text);
    const dueDate = new Date(task.dueDate);
    setEditDate(dueDate.toISOString().split('T')[0]);
    const hours = dueDate.getHours().toString().padStart(2, '0');
    const minutes = dueDate.getMinutes().toString().padStart(2, '0');
    setEditTime(`${hours}:${minutes}`);
    setIsEditing(true);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    if (!editText.trim() || !editDate || !editTime) {
      alert('Please fill out all fields.');
      return;
    }
    const newDueDate = new Date(`${editDate}T${editTime}`);
    onEditTask(task.id, editText, newDueDate.toISOString());
    setIsEditing(false);
  };

  const notificationsActive = task.notificationsEnabled && !task.isCompleted;
  const taskTextClass = level === 0 ? 'font-bold' : 'text-sm';
  const inputClasses = "bg-primary border border-accent focus:border-highlight focus:ring-highlight focus:ring-1 rounded-md px-3 py-2 text-text-main outline-none transition-colors";

  if (isEditing) {
    return (
      <div className="bg-accent p-4 rounded-lg shadow-md animate-pulse-once">
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className={`${inputClasses} w-full`}
          />
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className={`${inputClasses} w-full`}
              min={new Date().toISOString().split('T')[0]}
            />
            <input
              type="time"
              value={editTime}
              onChange={(e) => setEditTime(e.target.value)}
              className={`${inputClasses} w-full`}
            />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button onClick={handleCancelEdit} className="bg-secondary hover:bg-primary text-text-secondary font-bold py-2 px-4 rounded-md transition-colors duration-300">
              Cancel
            </button>
            <button onClick={handleSaveEdit} className="bg-highlight hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300">
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-secondary p-4 rounded-lg shadow-md transition-all duration-300 ${task.isCompleted ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => onToggleNotifications(task.id)}
          disabled={task.isCompleted}
          className={`flex-shrink-0 transition-colors ${
            task.isCompleted 
              ? 'text-gray-600 cursor-not-allowed' 
              : notificationsActive
                ? 'text-yellow-400 hover:text-yellow-300' 
                : 'text-text-secondary hover:text-white'
          }`}
          title={
            task.isCompleted 
              ? "Notifications disabled for completed tasks" 
              : notificationsActive
                ? "Disable notifications" 
                : "Enable notifications"
          }
        >
          {notificationsActive ? <BellIcon /> : <BellSlashIcon />}
        </button>
        <button onClick={() => onToggleComplete(task.id)} className="flex-shrink-0 text-highlight">
          {task.isCompleted ? <CheckCircleIcon /> : <CircleIcon />}
        </button>
        <div className="flex-grow">
          <p className={`font-medium ${taskTextClass} ${task.isCompleted ? 'line-through text-text-secondary' : 'text-text-main'}`}>
            {task.text}
          </p>
          <p className="text-xs text-text-secondary">
            Due: {new Date(task.dueDate).toLocaleString()}
          </p>
        </div>
        <Timer dueDate={task.dueDate} isCompleted={task.isCompleted} now={now} />
        <div className="flex items-center gap-2">
           {!task.isCompleted && (
            <>
              <button
                onClick={handleEditClick}
                className="p-2 text-white hover:text-gray-300 transition-colors"
                title="Edit task"
              >
                <PencilIcon />
              </button>
              <button
                onClick={() => setShowSubtaskForm(!showSubtaskForm)}
                className="p-2 text-text-secondary hover:text-white transition-colors"
                title="Add subtask"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
                </svg>
              </button>
            </>
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
            onToggleNotifications={onToggleNotifications}
            onEditTask={onEditTask}
            now={now}
            level={level + 1}
          />
        </div>
      )}
    </div>
  );
};

export default TaskItem;