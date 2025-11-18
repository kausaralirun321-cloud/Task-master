import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Task } from './types';
import { usePersistentState } from './hooks/usePersistentState';
import TaskList from './components/TaskList';
import AddTaskForm from './components/AddTaskForm';

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
        if (!task.isCompleted && !task.notified && new Date(task.endDate) <= now) {
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


  const addTask = useCallback((text: string, startDate: string, endDate: string, parentId: string | null = null) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      text,
      startDate,
      endDate,
      isCompleted: false,
      subtasks: [],
      notified: false,
    };

    if (parentId === null) {
      setTasks(prevTasks => [...prevTasks, newTask].sort((a,b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime()));
    } else {
      const addSubtaskRecursively = (tasks: Task[]): Task[] => {
        return tasks.map(task => {
          if (task.id === parentId) {
            const newSubtasks = [...task.subtasks, newTask].sort((a,b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
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

  const updateTask = useCallback((taskId: string, newText: string, newStartDate: string, newEndDate: string) => {
    const updateRecursively = (tasks: Task[]): Task[] => {
        return tasks.map(task => {
            if (task.id === taskId) {
                return { ...task, text: newText, startDate: newStartDate, endDate: newEndDate };
            }
            if (task.subtasks.length > 0) {
                return { ...task, subtasks: updateRecursively(task.subtasks) };
            }
            return task;
        });
    };
    setTasks(prevTasks => updateRecursively(prevTasks));
  }, [setTasks]);

  const toggleComplete = useCallback((taskId: string) => {
    // Helper to recursively mark all descendants as completed
    const completeAllDescendants = (tasks: Task[]): Task[] => {
      return tasks.map(t => ({
        ...t,
        isCompleted: true,
        subtasks: completeAllDescendants(t.subtasks),
      }));
    };

    // Finds the path to a task, returning an array of tasks from root to target
    const findTaskPath = (currentTasks: Task[], id: string, path: Task[] = []): Task[] | null => {
        for (const task of currentTasks) {
            const newPath = [...path, task];
            if (task.id === id) {
                return newPath;
            }
            if (task.subtasks && task.subtasks.length > 0) {
                const foundPath = findTaskPath(task.subtasks, id, newPath);
                if (foundPath) return foundPath;
            }
        }
        return null;
    };

    setTasks(prevTasks => {
        const taskPath = findTaskPath(prevTasks, taskId);
        if (!taskPath) return prevTasks; // Task not found, return original state

        const targetTask = taskPath[taskPath.length - 1];
        const shouldComplete = !targetTask.isCompleted;

        if (shouldComplete) {
            // --- COMPLETING A TASK ---
            // Cascade completion down to all subtasks
            const updateRecursively = (currentTasks: Task[]): Task[] => {
                return currentTasks.map(task => {
                    if (task.id === taskId) {
                        return {
                            ...task,
                            isCompleted: true,
                            subtasks: completeAllDescendants(task.subtasks),
                        };
                    }
                    if (task.subtasks.length > 0) {
                        return { ...task, subtasks: updateRecursively(task.subtasks) };
                    }
                    return task;
                });
            };
            return updateRecursively(prevTasks);
        } else {
            // --- UN-COMPLETING A TASK ---
            // Cascade incompletion up to all parent tasks
            const idsToUncomplete = new Set(taskPath.map(p => p.id));
            
            const updateRecursively = (currentTasks: Task[]): Task[] => {
                return currentTasks.map(task => {
                    let newIsCompleted = task.isCompleted;
                    if (idsToUncomplete.has(task.id)) {
                        newIsCompleted = false;
                    }

                    if (task.subtasks.length > 0) {
                        return { ...task, isCompleted: newIsCompleted, subtasks: updateRecursively(task.subtasks) };
                    }

                    return { ...task, isCompleted: newIsCompleted };
                });
            };
            return updateRecursively(prevTasks);
        }
    });
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
  
  const taskStats = useMemo(() => {
    let total = 0;
    let completed = 0;
    const count = (tasks: Task[]) => {
      tasks.forEach(task => {
        total++;
        if (task.isCompleted) completed++;
        if (task.subtasks) count(task.subtasks);
      });
    };
    count(tasks);
    return { total, completed };
  }, [tasks]);

  return (
    <div className="min-h-screen bg-transparent font-sans">
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-8 animate-fade-in">
            <h1 className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-highlight to-pink-500 tracking-tight">
              TaskMaster
            </h1>
            <p className="text-text-secondary mt-2 text-lg">Turn your to-dos into ta-das!</p>
        </header>
        
        <div className="bg-secondary/60 backdrop-blur-lg border border-highlight/30 rounded-xl p-6 sm:p-8 shadow-2xl shadow-highlight/10 mb-12 animate-fade-in [animation-delay:0.2s]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-text-main">Add Your Next Goal</h2>
          </div>
          <AddTaskForm onAddTask={addTask} />
        </div>

        <div className="animate-fade-in [animation-delay:0.4s]">
          <div className="flex justify-between items-center mb-4 px-2">
            <h2 className="text-2xl font-bold">Your Tasks</h2>
            <div className="text-sm font-medium bg-accent/50 text-text-main px-3 py-1 rounded-full">
              {taskStats.completed} / {taskStats.total} Completed
            </div>
          </div>
          <TaskList
            tasks={tasks}
            onToggleComplete={toggleComplete}
            onDelete={deleteTask}
            onAddTask={addTask}
            onUpdateTask={updateTask}
            now={now}
          />
        </div>
        <audio ref={audioRef} src={BELL_SOUND} preload="auto" />
      </main>
    </div>
  );
};

export default App;
