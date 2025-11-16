
export interface Task {
  id: string;
  text: string;
  dueDate: string; // ISO string for easy serialization
  isCompleted: boolean;
  subtasks: Task[];
  notified: boolean;
}
