import { KanbanColumn } from "./KanbanColumn";

export function KanbanBoard({ tasks, getTasksByStatus, moveTask, openTaskModal, addTask }) {
  const columns = [
    { title: "To Do", status: "todo" },
    { title: "In Progress", status: "in_progress" },
    { title: "Done", status: "done" },
  ];

  return (
    <section className="px-6 md:pl-24 pt-8 overflow-x-auto pb-8">
      <div className="flex flex-col md:flex-row gap-6 min-w-[800px]">
        {columns.map((col) => (
          <KanbanColumn
            key={col.status}
            title={col.title}
            status={col.status}
            tasks={getTasksByStatus(col.status)}
            onTaskDrop={moveTask}
            onTaskClick={openTaskModal}
            onAddTask={addTask}
          />
        ))}
      </div>
    </section>
  );
}
