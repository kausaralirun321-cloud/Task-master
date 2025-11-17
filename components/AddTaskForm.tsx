import React, { useState } from 'react';
import { PlusIcon } from './icons';

interface AddTaskFormProps {
  onAddTask: (text: string, startDate: string, endDate: string) => void;
  parentId?: string | null;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({ onAddTask, parentId = null }) => {
  const [text, setText] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !startDate || !startTime || !endDate || !endTime) {
        alert('Please fill out all fields.');
        return;
    };
    
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    if (startDateTime >= endDateTime) {
      alert('End date and time must be after the start date and time.');
      return;
    }

    onAddTask(text, startDateTime.toISOString(), endDateTime.toISOString());
    setText('');
    setStartDate('');
    setStartTime('');
    setEndDate('');
    setEndTime('');
  };
  
  const isSubtask = parentId !== null;

  const formClasses = isSubtask 
    ? "flex flex-col sm:flex-row gap-2 mt-2" 
    : "flex flex-col md:flex-row gap-3 items-center";

  const inputClasses = "bg-primary/50 border border-accent focus:border-highlight focus:ring-highlight focus:ring-1 rounded-md px-3 py-2 text-text-main outline-none transition-colors w-full";
  const dateInputWrapper = `flex gap-2 items-center p-2 rounded-lg bg-primary/30 border border-transparent ${isSubtask ? 'w-full sm:w-auto' : ''}`;

  return (
    <form onSubmit={handleSubmit} className={formClasses}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={isSubtask ? "Define subtask..." : "What's your task?"}
        className={`${inputClasses} flex-grow`}
        aria-label="Task description"
      />
      <div className={`flex flex-col sm:flex-row gap-2 ${isSubtask ? 'w-full' : ''}`}>
        <div className={dateInputWrapper}>
          <label htmlFor={parentId ? `start-date-${parentId}` : 'start-date'} className="text-sm text-text-secondary font-medium">Start:</label>
          <input
            id={parentId ? `start-date-${parentId}` : 'start-date'}
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-transparent text-text-main outline-none w-auto"
            min={new Date().toISOString().split('T')[0]}
            aria-label="Start Date"
          />
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="bg-transparent text-text-main outline-none w-auto"
            aria-label="Start Time"
          />
        </div>
        <div className={dateInputWrapper}>
          <label htmlFor={parentId ? `end-date-${parentId}` : 'end-date'} className="text-sm text-text-secondary font-medium">End:</label>
          <input
            id={parentId ? `end-date-${parentId}` : 'end-date'}
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-transparent text-text-main outline-none w-auto"
            min={startDate || new Date().toISOString().split('T')[0]}
            aria-label="End Date"
          />
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="bg-transparent text-text-main outline-none w-auto"
            aria-label="End Time"
          />
        </div>
      </div>
      <button
        type="submit"
        className="flex items-center justify-center gap-2 bg-gradient-to-r from-highlight to-pink-500 hover:from-pink-500 hover:to-highlight text-white font-bold py-2.5 px-5 rounded-lg shadow-lg hover:shadow-pink-500/50 transition-all duration-300 transform hover:scale-105"
      >
        <PlusIcon />
        {!isSubtask && <span>Add Task</span>}
      </button>
    </form>
  );
};

export default AddTaskForm;