
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Task } from './types';
import { usePersistentState } from './hooks/usePersistentState';
import TaskList from './components/TaskList';
import AddTaskForm from './components/AddTaskForm';

// A simple base64 encoded bell sound
const BELL_SOUND = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAA/4QxAAEAAAAAAAY8AANHQVRTVSBGUklORyBGT1IgVEFTSyBDT01QTEVUSU9OAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//tAwA/68Q0gAAAABkI0IAABuAAAAAANAQAAAAAAAAAAAEAAAABVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tAwA/98Q0gBEkAAQAB68AAAAAANAQAAAAAAAQAAAEAAAABVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tAwA/98Q0pBEYAAQAB68AAAAAANAQAAAAAAAQAAAEAAAABVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tAwA/98Q0pBEYAAQAB68AAAAAANAQAAAAAAAQAAAEAAAABVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tAwA/98Q0pBEYAAQAB68AAAAAANAQAAAAAAAQAAAEAAAABVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tAwA/98Q0pBEYAAQAB68AAAAAANAQAAAAAAAQAAAEAAAABVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tAwA/98Q0pBEYAAQAB68AAAAAANAQAAAAAAAQAAAEAAAABVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tAwA/98Q0pBEYAAQAB68AAAAAANAQAAAAAAAQAAAEAAAABVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tAwA/98Q0pBEYAAQAB68AAAAAANAQAAAAAAAQAAAEAAAABVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

const App: React.FC = () => {
  const [tasks, setTasks] = usePersistentState<Task[]>('tasks', []);
  const [now, setNow] = useState(new Date());
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const timerId = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const handleNotifications = useCallback(() => {
    let changed = false;
    const checkAndNotify = (tasks: Task[]): Task[] => {
      return tasks.map(task => {
        if (!task.isCompleted && !task.notified && new Date(task.dueDate) <= now) {
          changed = true;
          return { ...task, notified: true, subtasks: checkAndNotify(task.subtasks) };
        }
        if (task.subtasks.length > 0) {
            return { ...task, subtasks: checkAndNotify(task.subtasks) };
        }
        return task;
      });
    };

    const newTasks = checkAndNotify(tasks);
    if(changed) {
        audioRef.current?.play().catch(e => console.error("Audio playback failed", e));
        setTasks(newTasks);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, tasks]);

  useEffect(() => {
      handleNotifications();
  }, [handleNotifications]);


  const addTask = useCallback((text: string, dueDate: string, parentId: string | null = null) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      text,
      dueDate,
      isCompleted: false,
      subtasks: [],
      notified: false,
    };

    if (parentId === null) {
      setTasks(prevTasks => [...prevTasks, newTask].sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
    } else {
      const addSubtaskRecursively = (tasks: Task[]): Task[] => {
        return tasks.map(task => {
          if (task.id === parentId) {
            const newSubtasks = [...task.subtasks, newTask].sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
            return { ...task, subtasks: newSubtasks };
          }
          if (task.subtasks.length > 0) {
            return { ...task, subtasks: addSubtaskRecursively(task.subtasks) };
          }
          return task;
        });
      };
      setTasks(prevTasks => addSubtaskRecursively(prevTasks));
    }
  }, [setTasks]);

  const toggleComplete = useCallback((taskId: string) => {
    const toggleRecursively = (tasks: Task[]): Task[] => {
      return tasks.map(task => {
        if (task.id === taskId) {
          return { ...task, isCompleted: !task.isCompleted };
        }
        if (task.subtasks.length > 0) {
          return { ...task, subtasks: toggleRecursively(task.subtasks) };
        }
        return task;
      });
    };
    setTasks(prevTasks => toggleRecursively(prevTasks));
  }, [setTasks]);

  const deleteTask = useCallback((taskId: string) => {
    const deleteRecursively = (tasks: Task[]): Task[] => {
      return tasks.filter(task => task.id !== taskId).map(task => {
        if (task.subtasks.length > 0) {
          return { ...task, subtasks: deleteRecursively(task.subtasks) };
        }
        return task;
      });
    };
    setTasks(prevTasks => deleteRecursively(prevTasks));
  }, [setTasks]);
  
  return (
    <div className="min-h-screen bg-primary font-sans">
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-highlight tracking-wider">TaskMaster</h1>
            <p className="text-text-secondary mt-2">Your personal countdown task manager.</p>
        </header>
        <AddTaskForm onAddTask={addTask} />
        <TaskList
          tasks={tasks}
          onToggleComplete={toggleComplete}
          onDelete={deleteTask}
          onAddTask={addTask}
          now={now}
        />
        <audio ref={audioRef} src={BELL_SOUND} preload="auto" />
      </main>
    </div>
  );
};

export default App;
