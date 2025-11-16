
import React, { useState } from 'react';
import { PlusIcon } from './icons';

interface AddTaskFormProps {
  onAddTask: (text: string, dueDate: string) => void;
  parentId?: string | null;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({ onAddTask, parentId = null }) => {
  const [text, setText] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !date || !time) {
        alert('Please fill out all fields.');
        return;
    };
    
    const dueDate = new Date(`${date}T${time}`);
    onAddTask(text, dueDate.toISOString());
    setText('');
    setDate('');
    setTime('');
  };

  const formClasses = parentId 
    ? "flex flex-col sm:flex-row gap-2 mt-2" 
    : "flex flex-col md:flex-row gap-3 p-4 bg-secondary rounded-lg shadow-lg mb-6";

  const inputClasses = "bg-primary border border-accent focus:border-highlight focus:ring-highlight focus:ring-1 rounded-md px-3 py-2 text-text-main outline-none transition-colors";

  return (
    <form onSubmit={handleSubmit} className={formClasses}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={parentId ? "New subtask..." : "Add a new task..."}
        className={`${inputClasses} flex-grow`}
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className={`${inputClasses} w-full sm:w-auto`}
        min={new Date().toISOString().split('T')[0]}
      />
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className={`${inputClasses} w-full sm:w-auto`}
      />
      <button
        type="submit"
        className="flex items-center justify-center gap-2 bg-highlight hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300"
      >
        <PlusIcon />
        <span>{parentId ? "Add Subtask" : "Add Task"}</span>
      </button>
    </form>
  );
};

export default AddTaskForm;
