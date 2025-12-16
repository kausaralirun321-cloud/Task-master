import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Task } from './types';
import { usePersistentState } from './hooks/usePersistentState';
import TaskList from './components/TaskList';
import AddTaskForm from './components/AddTaskForm';
import { BellIcon, BellAlertIcon } from './components/icons';

const BELL_SOUND = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAA/4QxAAEAAAAAAAY8AANHQVRTVSBGUklORyBGT1IgVEFTSyBDT01QTEVUSU9OAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//tAwA/68Q0gAAAABkI0IAABuAAAAAANAQAAAAAAAAAAAEAAAABVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tAwA/98Q0gBEkAAQAB68AAAAAANAQAAAAAAAQAAAEAAAABVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tAwA/98Q0pBEYAAQAB68AAAAAANAQAAAAAAAQAAAEAAAABVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tAwA/98Q0pBEYAAQAB68AAAAAANAQAAAAAAAQAAAEAAAABVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tAwA/98Q0pBEYAAQAB68AAAAAANAQAAAAAAAQAAAEAAAABVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tAwA/98Q0pBEYAAQAB68AAAAAANAQAAAAAAAQAAAEAAAABVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tAwA/98Q0pBEYAAQAB68AAAAAANAQAAAAAAAQAAAEAAAABVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

const App: React.FC = () => {
  const [tasks, setTasks] = usePersistentState<Task[]>('tasks', []);
  const [now, setNow] = useState(new Date());
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const timerId = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications");
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === "granted") {
        new Notification("Notifications Enabled", { body: "You will now be notified when tasks start and end." });
    }
  };

  const handleNotifications = useCallback(() => {
    let changed = false;
    const checkAndNotify = (tasks: Task[]): Task[] => {
      return tasks.map(task => {
        let currentTask = task;
        let hasUpdate = false;
        const nowTime = now.getTime();
        const startTime = new Date(currentTask.startDate).getTime();
        const endTime = new Date(currentTask.endDate).getTime();

        // Check Start Notification
        if (!currentTask.isCompleted && !currentTask.startNotified && startTime <= nowTime) {
            changed = true;
            hasUpdate = true;
            currentTask = { ...currentTask, startNotified: true };
            if (Notification.permission === "granted") {
                new Notification(`🚀 Task Started: ${currentTask.text}`, {
                    body: `It's time to start working on this task!`,
                    icon: 'https://cdn-icons-png.flaticon.com/512/2693/2693507.png'
                });
            }
        }

        // Check End Notification
        if (!currentTask.isCompleted && !currentTask.notified && endTime <= nowTime) {
          changed = true;
          hasUpdate = true;
          currentTask = { ...currentTask, notified: true };
          if (Notification.permission === "granted") {
             new Notification(`⏰ Task Due: ${currentTask.text}`, {
                 body: `The deadline for this task has arrived.`,
             });
          }
        }

        // Check Subtasks
        if (currentTask.subtasks.length > 0) {
            const updatedSubtasks = checkAndNotify(currentTask.subtasks);
            // Since map returns new array, we just assign it. 
            // Ideally we check for changes inside subtasks too, but `changed` flag handles the save.
            currentTask = { ...currentTask, subtasks: updatedSubtasks };
        }
        
        return currentTask;
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
      startNotified: false,
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
                return { 
                  ...task, 
                  text: newText, 
                  startDate: newStartDate, 
                  endDate: newEndDate,
                  // Reset notifications if dates change to future
                  notified: new Date(newEndDate) > now ? false : task.notified,
                  startNotified: new Date(newStartDate) > now ? false : task.startNotified
                };
            }
            if (task.subtasks.length > 0) {
                return { ...task, subtasks: updateRecursively(task.subtasks) };
            }
            return task;
        });
    };
    setTasks(prevTasks => updateRecursively(prevTasks));
  }, [setTasks, now]);

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
        <header className="relative text-center mb-8 animate-fade-in">
            {notificationPermission !== 'granted' && (
              <button 
                onClick={requestNotificationPermission}
                className="absolute right-0 top-0 flex items-center gap-2 text-sm bg-secondary/80 hover:bg-highlight/20 text-text-secondary hover:text-highlight px-3 py-1.5 rounded-full transition-all"
                title="Enable Desktop Notifications"
              >
                <BellAlertIcon />
                <span className="hidden sm:inline">Enable Alerts</span>
              </button>
            )}
             {notificationPermission === 'granted' && (
              <div className="absolute right-0 top-0 flex items-center gap-2 text-sm text-success/70 px-3 py-1.5" title="Notifications Active">
                <BellIcon />
              </div>
            )}

            <h1 className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-highlight to-pink-500 tracking-tight">
              TaskMaster
            </h1>
            <p className="text-text-secondary mt-2 text-lg">Turn your to-dos into ta-das!</p>
        </header>
        
        <div className="relative overflow-hidden bg-secondary/60 backdrop-blur-lg border border-highlight/30 rounded-xl p-6 sm:p-8 shadow-2xl shadow-highlight/10 mb-12 animate-fade-in [animation-delay:0.2s]">
          <div className="absolute inset-0 z-0 opacity-10" style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=1000&auto=format&fit=crop')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'grayscale(100%)'
          }}></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-text-main">Add Your Next Goal</h2>
            </div>
            <AddTaskForm onAddTask={addTask} />
          </div>
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