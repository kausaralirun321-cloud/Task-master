
export interface Task {
  id: string;
  text: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  isCompleted: boolean;
  subtasks: Task[];
  notified: boolean;
}
