import sql from '@/app/api/utils/sql';

// GET /api/tasks/[id] - Get a single task
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const tasks = await sql`
      SELECT 
        t.id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.story_points,
        t.due_date,
        t.created_at,
        t.updated_at,
        u.username as assignee_username,
        u.email as assignee_email
      FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      WHERE t.id = ${id}
    `;

    if (tasks.length === 0) {
      return Response.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    const task = tasks[0];
    const transformedTask = {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      story_points: task.story_points,
      due_date: task.due_date,
      created_at: task.created_at,
      updated_at: task.updated_at,
      assignee: task.assignee_username ? {
        username: task.assignee_username,
        email: task.assignee_email,
        avatar: null
      } : null
    };

    return Response.json(transformedTask);
  } catch (error) {
    console.error('Failed to fetch task:', error);
    return Response.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[id] - Update a task
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, description, status, priority, story_points, assignee_id, due_date } = body;

    // First check if task exists
    const existingTask = await sql`
      SELECT * FROM tasks WHERE id = ${id}
    `;

    if (existingTask.length === 0) {
      return Response.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title.trim());
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (priority !== undefined) {
      updates.push(`priority = $${paramCount++}`);
      values.push(priority);
    }
    if (story_points !== undefined) {
      updates.push(`story_points = $${paramCount++}`);
      values.push(story_points);
    }
    if (assignee_id !== undefined) {
      updates.push(`assignee_id = $${paramCount++}`);
      values.push(assignee_id);
    }
    if (due_date !== undefined) {
      updates.push(`due_date = $${paramCount++}`);
      values.push(due_date);
    }

    if (updates.length === 0) {
      return Response.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Add updated_at and id to the query
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const updateQuery = `
      UPDATE tasks 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, title, description, status, priority, story_points, assignee_id, board_id, created_by, created_at, updated_at, due_date
    `;

    const result = await sql(updateQuery, values);
    const updatedTask = result[0];

    // Log activity for status changes
    if (status !== undefined && status !== existingTask[0].status) {
      await sql`
        INSERT INTO activities (action, entity_type, entity_id, user_id, details)
        VALUES ('updated', 'task', ${id}, ${1}, ${JSON.stringify({ 
          title: updatedTask.title, 
          from_status: existingTask[0].status, 
          to_status: status 
        })})
      `;
    } else if (updates.length > 1) { // Other updates (not just updated_at)
      await sql`
        INSERT INTO activities (action, entity_type, entity_id, user_id, details)
        VALUES ('updated', 'task', ${id}, ${1}, ${JSON.stringify({ title: updatedTask.title })})
      `;
    }

    // Get assignee info if assigned
    let assignee = null;
    if (updatedTask.assignee_id) {
      const assigneeResult = await sql`
        SELECT username, email FROM users WHERE id = ${updatedTask.assignee_id}
      `;
      if (assigneeResult.length > 0) {
        assignee = {
          username: assigneeResult[0].username,
          email: assigneeResult[0].email,
          avatar: null
        };
      }
    }

    const responseTask = {
      ...updatedTask,
      assignee
    };

    return Response.json(responseTask);
  } catch (error) {
    console.error('Failed to update task:', error);
    return Response.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // First check if task exists
    const existingTask = await sql`
      SELECT title FROM tasks WHERE id = ${id}
    `;

    if (existingTask.length === 0) {
      return Response.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Delete the task
    await sql`
      DELETE FROM tasks WHERE id = ${id}
    `;

    // Log activity
    await sql`
      INSERT INTO activities (action, entity_type, entity_id, user_id, details)
      VALUES ('deleted', 'task', ${id}, ${1}, ${JSON.stringify({ title: existingTask[0].title })})
    `;

    return Response.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Failed to delete task:', error);
    return Response.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}