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
    ? "flex flex-col gap-3 mt-3 p-4 bg-primary/40 rounded-xl border border-white/10 animate-fade-in shadow-lg" 
    : "flex flex-col gap-4"; 

  const inputClasses = isSubtask
    ? "bg-primary/90 border border-accent/80 focus:border-highlight focus:ring-highlight focus:ring-2 rounded-lg px-4 py-3 text-lg text-text-main placeholder-text-secondary/70 outline-none transition-all shadow-md w-full"
    : "bg-primary/80 border border-accent/60 focus:border-highlight focus:ring-highlight focus:ring-2 rounded-xl px-5 py-4 text-xl text-text-main placeholder-text-secondary/60 outline-none transition-all shadow-inner w-full";

  const dateInputWrapper = isSubtask
    ? "flex gap-2 items-center p-2.5 rounded-lg bg-primary/60 border border-accent/30 w-full sm:w-auto justify-between sm:justify-start"
    : "flex gap-3 items-center p-3 rounded-xl bg-primary/40 border border-accent/30 w-full md:w-auto justify-center md:justify-start";

  const buttonClasses = isSubtask
    ? "flex items-center justify-center gap-2 bg-gradient-to-r from-highlight to-pink-500 hover:from-pink-500 hover:to-highlight text-white font-bold py-2.5 px-6 rounded-lg shadow-lg hover:shadow-pink-500/50 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
    : "flex items-center justify-center gap-2 bg-gradient-to-r from-highlight to-pink-500 hover:from-pink-500 hover:to-highlight text-white text-lg font-bold py-3 px-8 rounded-xl shadow-xl hover:shadow-pink-500/50 transition-all duration-300 transform hover:scale-105 w-full md:w-auto mt-2 md:mt-0";

  return (
    <form onSubmit={handleSubmit} className={formClasses}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={isSubtask ? "Enter subtask details..." : "Write your task here..."}
        className={`${inputClasses} flex-grow`}
        aria-label="Task description"
      />
      <div className={`flex flex-col md:flex-row gap-3 ${!isSubtask ? 'justify-between items-stretch md:items-center' : ''} ${isSubtask ? 'w-full' : ''}`}>
        <div className={`flex flex-col sm:flex-row gap-3 ${isSubtask ? 'w-full' : 'flex-grow'}`}>
            <div className={dateInputWrapper}>
            <label htmlFor={parentId ? `start-date-${parentId}` : 'start-date'} className="text-sm text-text-secondary font-medium whitespace-nowrap">Start:</label>
            <input
                id={parentId ? `start-date-${parentId}` : 'start-date'}
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-text-main outline-none w-full sm:w-auto"
                min={new Date().toISOString().split('T')[0]}
                aria-label="Start Date"
            />
            <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-transparent text-text-main outline-none w-full sm:w-auto"
                aria-label="Start Time"
            />
            </div>
            <div className={dateInputWrapper}>
            <label htmlFor={parentId ? `end-date-${parentId}` : 'end-date'} className="text-sm text-text-secondary font-medium whitespace-nowrap">Due:</label>
            <input
                id={parentId ? `end-date-${parentId}` : 'end-date'}
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-text-main outline-none w-full sm:w-auto"
                min={startDate || new Date().toISOString().split('T')[0]}
                aria-label="End Date"
            />
            <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="bg-transparent text-text-main outline-none w-full sm:w-auto"
                aria-label="End Time"
            />
            </div>
        </div>
        <button
            type="submit"
            className={buttonClasses}
        >
            <PlusIcon />
            <span>{isSubtask ? 'Add Subtask' : 'Add Task'}</span>
        </button>
      </div>
    </form>
  );
};

export default AddTaskForm;