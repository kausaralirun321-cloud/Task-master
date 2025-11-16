import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Task } from './types';
import { usePersistentState } from './hooks/usePersistentState';
import TaskList from './components/TaskList';
import AddTaskForm from './components/AddTaskForm';

// A simple base64 encoded bell sound
const BELL_SOUND = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAA/4QxAAEAAAAAAAY8AANHQVRTVSBGUklORyBGUiIgVEFTSyBDT01QTEVUSU9OAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//tAwA/68Q0gAAAABkI0IAABuAAAAAANAQAAAAAAAAAAAEAAAABVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tAwA/98Q0gBEkAAQAB68AAAAAANAQAAAAAAAQAAAEAAAABVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tAwA/98Q0pBEYAAQAB68AAAAAANAQAAAAAAAQAAAEAAAABVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tAwA/98Q0pBEYAAQAB68AAAAAANAQAAAAAAAQAAAEAAAABVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tAwA/98Q0pBEYAAQAB68AAAAAANAQAAAAAAAQAAAEAAAABVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tAwA/98Q0pBEYAAQAB68AAAAAANAQAAAAAAAQAAAEAAAABVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tAwA/98Q0pBEYAAQAB68AAAAAANAQAAAAAAAQAAAEAAAABVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tAwA/98Q0pBEYAAQAB68AAAAAANAQAAAAAAAQAAAEAAAABVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tAwA/98Q0pBEYAAQAB68AAAAAANAQAAAAAAAQAAAEAAAABVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

const App: React.FC = () => {
  const [tasks, setTasks] = usePersistentState<Task[]>('tasks', []);
  const [now, setNow] = useState(new Date());
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const timerId = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    let soundShouldPlay = false;

    const checkAndNotify = (tasks: Task[]): Task[] => {
      return tasks.map(task => {
        // First, recursively check subtasks
        const updatedSubtasks = task.subtasks.length > 0 ? checkAndNotify(task.subtasks) : task.subtasks;

        let notified = task.notified;
        // Then, check the current task
        if (!task.isCompleted && !task.notified && task.notificationsEnabled && new Date(task.dueDate) <= now) {
          soundShouldPlay = true; // A task is due, we should play a sound
          notified = true; // Mark as notified
        }
        
        // If either the notified status or subtasks changed, return a new task object
        if (notified !== task.notified || updatedSubtasks !== task.subtasks) {
          return { ...task, notified, subtasks: updatedSubtasks };
        }

        // Otherwise, return the original task object to prevent unnecessary re-renders
        return task;
      });
    };

    const newTasks = checkAndNotify(tasks);

    if (soundShouldPlay) {
      audioRef.current?.play().catch(e => console.error("Audio playback failed. User interaction might be required.", e));
      // Using a functional update with a check to prevent loops if something goes wrong,
      // though the `soundShouldPlay` flag should already prevent this.
      setTasks(currentTasks => {
          // Only update state if the tasks have actually changed.
          if (JSON.stringify(currentTasks) !== JSON.stringify(newTasks)) {
              return newTasks;
          }
          return currentTasks;
      });
    }
  }, [now, tasks, setTasks]);


  const addTask = useCallback((text: string, dueDate: string, parentId: string | null = null) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      text,
      dueDate,
      isCompleted: false,
      subtasks: [],
      notified: false,
      notificationsEnabled: true,
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

  const editTask = useCallback((taskId: string, newText: string, newDueDate: string) => {
    const editRecursively = (tasks: Task[]): Task[] => {
      return tasks.map(task => {
        if (task.id === taskId) {
          // If the due date is moved to the future, reset the notified status.
          const newNotifiedStatus = new Date(newDueDate) > now ? false : task.notified;
          return { ...task, text: newText, dueDate: newDueDate, notified: newNotifiedStatus };
        }
        if (task.subtasks.length > 0) {
          const updatedSubtasks = editRecursively(task.subtasks);
          // After updating subtasks, re-sort them if they have changed
          if (updatedSubtasks !== task.subtasks) {
            return { ...task, subtasks: updatedSubtasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) };
          }
        }
        return task;
      });
    };

    setTasks(prevTasks => {
      const updatedTasks = editRecursively(prevTasks);
      // Re-sort top-level tasks as well
      return updatedTasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    });
  }, [setTasks, now]);

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
  
  const toggleNotifications = useCallback((taskId: string) => {
    const toggleRecursively = (tasks: Task[]): Task[] => {
      return tasks.map(task => {
        if (task.id === taskId) {
          return { ...task, notificationsEnabled: !task.notificationsEnabled };
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
          onToggleNotifications={toggleNotifications}
          onEditTask={editTask}
          now={now}
        />
        <audio ref={audioRef} src={BELL_SOUND} preload="auto" />
      </main>
    </div>
  );
};

export default App;
