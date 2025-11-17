import React, { useState, useMemo } from 'react';
import { Task } from '../types';
import Timer from './Timer';
import TaskList from './TaskList';
import AddTaskForm from './AddTaskForm';
import { TrashIcon, CheckCircleIcon, CircleIcon, PlusIcon, PencilIcon, CheckIcon, XIcon } from './icons';

interface TaskItemProps {
  task: Task;
  taskNumber: string;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onAddTask: (text: string, startDate: string, endDate: string, parentId: string) => void;
  onUpdateTask: (id: string, text: string, startDate: string, endDate: string) => void;
  now: Date;
  level: number;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, taskNumber, onToggleComplete, onDelete, onAddTask, onUpdateTask, now, level }) => {
  const [showSubtaskForm, setShowSubtaskForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [editText, setEditText] = useState(task.text);
  const [editStartDate, setEditStartDate] = useState(task.startDate.split('T')[0]);
  const [editStartTime, setEditStartTime] = useState(new Date(task.startDate).toTimeString().substring(0, 5));
  const [editEndDate, setEditEndDate] = useState(task.endDate.split('T')[0]);
  const [editEndTime, setEditEndTime] = useState(new Date(task.endDate).toTimeString().substring(0, 5));


  const handleAddSubtask = (text: string, startDate: string, endDate: string) => {
    onAddTask(text, startDate, endDate, task.id);
    setShowSubtaskForm(false);
  };

  const handleSave = () => {
    if (!editText.trim() || !editStartDate || !editStartTime || !editEndDate || !editEndTime) {
        alert('Please fill out all fields.');
        return;
    };
    
    const startDateTime = new Date(`${editStartDate}T${editStartTime}`);
    const endDateTime = new Date(`${editEndDate}T${editEndTime}`);

    if (startDateTime >= endDateTime) {
      alert('End date and time must be after the start date and time.');
      return;
    }

    onUpdateTask(task.id, editText, startDateTime.toISOString(), endDateTime.toISOString());
    setIsEditing(false);
  };

  const { progress, isStarted } = useMemo(() => {
    const start = new Date(task.startDate).getTime();
    const end = new Date(task.endDate).getTime();
    const nowTime = now.getTime();
    
    if (nowTime < start) {
      return { progress: 0, isStarted: false };
    }
    const totalDuration = end - start;
    const elapsed = nowTime - start;
    const progressPercentage = totalDuration > 0 ? (elapsed / totalDuration) * 100 : 100;

    return { progress: Math.min(100, Math.max(0, progressPercentage)), isStarted: true };
  }, [task.startDate, task.endDate, now]);

  const cardClasses = `
    bg-secondary/50 backdrop-blur-sm border border-accent/50 p-4 rounded-xl shadow-lg 
    transition-all duration-300
    ${isEditing ? 'border-highlight/50 scale-[1.02]' : 'animate-pop-in'}
    ${task.isCompleted ? 'opacity-50 saturate-50' : 'hover:border-highlight/50 hover:scale-[1.02]'}
  `;

  const inputClasses = "bg-primary/50 border border-accent focus:border-highlight focus:ring-highlight focus:ring-1 rounded-md px-3 py-2 text-text-main outline-none transition-colors w-full";
  const dateInputWrapper = `flex gap-2 items-center p-2 rounded-lg bg-primary/30 border border-transparent`;

  if (isEditing) {
    return (
      <div className={cardClasses}>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className={inputClasses}
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <div className={`${dateInputWrapper} flex-1`}>
              <label className="text-sm text-text-secondary font-medium">Start:</label>
              <input type="date" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} className="bg-transparent text-text-main outline-none w-full" />
              <input type="time" value={editStartTime} onChange={(e) => setEditStartTime(e.target.value)} className="bg-transparent text-text-main outline-none w-auto" />
            </div>
            <div className={`${dateInputWrapper} flex-1`}>
              <label className="text-sm text-text-secondary font-medium">End:</label>
              <input type="date" value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)} className="bg-transparent text-text-main outline-none w-full" min={editStartDate} />
              <input type="time" value={editEndTime} onChange={(e) => setEditEndTime(e.target.value)} className="bg-transparent text-text-main outline-none w-auto" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsEditing(false)} className="p-2 rounded-full text-text-secondary hover:bg-accent hover:text-white transition-colors" title="Cancel">
              <XIcon />
            </button>
            <button onClick={handleSave} className="p-2 rounded-full text-text-secondary hover:bg-success/20 hover:text-success transition-colors" title="Save">
              <CheckIcon />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cardClasses}>
      <div className="flex items-start gap-4">
        <button onClick={() => onToggleComplete(task.id)} className="flex-shrink-0 text-highlight mt-0.5" aria-label={task.isCompleted ? "Mark as not complete" : "Mark as complete"}>
          {task.isCompleted ? <CheckCircleIcon /> : <CircleIcon />}
        </button>
        <div className="flex-grow">
          <p className={`font-semibold text-lg ${task.isCompleted ? 'line-through text-text-secondary' : 'text-text-main'}`}>
            <span className="text-highlight/80 font-bold mr-2">{taskNumber}.</span>
            {task.text}
          </p>
          <p className="text-xs text-text-secondary mt-1">
            {new Date(task.startDate).toLocaleString()} → {new Date(task.endDate).toLocaleString()}
          </p>
          {!task.isCompleted && isStarted && (
             <div className="w-full bg-accent/30 rounded-full h-1.5 mt-3">
               <div className="bg-gradient-to-r from-blue-500 to-green-400 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
             </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <Timer startDate={task.startDate} endDate={task.endDate} isCompleted={task.isCompleted} now={now} />
            <div className="flex items-center gap-1">
               {!task.isCompleted && (
                <>
                  <button onClick={() => setIsEditing(true)} className="p-1.5 rounded-full text-text-secondary hover:bg-accent hover:text-white transition-colors" title="Edit task">
                    <PencilIcon />
                  </button>
                  <button
                    onClick={() => setShowSubtaskForm(!showSubtaskForm)}
                    className="p-1.5 rounded-full text-text-secondary hover:bg-accent hover:text-white transition-colors"
                    title="Add subtask"
                  >
                    <PlusIcon />
                  </button>
                </>
               )}
              <button
                onClick={() => onDelete(task.id)}
                className="p-1.5 rounded-full text-text-secondary hover:bg-highlight/20 hover:text-highlight transition-colors"
                title="Delete task"
              >
                <TrashIcon />
              </button>
            </div>
        </div>
      </div>
      
      {showSubtaskForm && (
        <div className="mt-3 pl-10">
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
            onUpdateTask={onUpdateTask}
            now={now}
            level={level + 1}
            numberingPrefix={taskNumber}
          />
        </div>
      )}
    </div>
  );
};

export default TaskItem;