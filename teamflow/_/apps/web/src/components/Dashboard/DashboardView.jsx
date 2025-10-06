import { ChevronRight } from "lucide-react";
import { KanbanBoard } from "./KanbanBoard";

export function DashboardView({ tasks, getTasksByStatus, moveTask, openTaskModal, addTask, error }) {
  return (
    <>
      <nav className="px-6 md:pl-24 pt-6 text-xs text-gray-400 space-x-2">
        <span>Dashboard</span>
        <ChevronRight className="inline h-3 w-3" />
        <span className="text-gray-500">Kanban Board</span>
      </nav>

      <h1 className="px-6 md:pl-24 pt-2 text-3xl font-semibold text-gray-700">
        Kanban Board
      </h1>

      {error && (
        <div className="px-6 md:pl-24 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      <KanbanBoard
        tasks={tasks}
        getTasksByStatus={getTasksByStatus}
        moveTask={moveTask}
        openTaskModal={openTaskModal}
        addTask={addTask}
      />
    </>
  );
}
