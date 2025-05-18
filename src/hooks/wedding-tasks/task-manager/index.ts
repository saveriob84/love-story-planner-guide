
import { useTaskQueries } from './useTaskQueries';
import { useTaskMutations } from './useTaskMutations';
import { WeddingTask } from '../types';

export function useTaskManager(userId: string | undefined) {
  const { getStoredTasks } = useTaskQueries(userId);
  const { updateTask, addTask, deleteTask, reorderTasks } = useTaskMutations(userId);

  return {
    getStoredTasks,
    updateTask,
    addTask,
    deleteTask,
    reorderTasks
  };
}
