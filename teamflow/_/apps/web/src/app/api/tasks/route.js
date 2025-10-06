import sql from '@/app/api/utils/sql';

// GET /api/tasks - List all tasks with assignee info
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get('board_id') || 1; // Default to board 1
    const status = searchParams.get('status');

    let query = `
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
      WHERE t.board_id = $1
    `;
    
    const params = [boardId];
    
    if (status) {
      query += ' AND t.status = $2';
      params.push(status);
    }
    
    query += ' ORDER BY t.created_at DESC';

    const tasks = await sql(query, params);

    // Transform the data to match frontend expectations
    const transformedTasks = tasks.map(task => ({
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
        avatar: null // We'll add avatar support later
      } : null
    }));

    return Response.json(transformedTasks);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return Response.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, description, status = 'todo', priority = 'medium', story_points = 1, assignee_id, board_id = 1, created_by = 1 } = body;

    if (!title || !title.trim()) {
      return Response.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Insert the new task
    const result = await sql`
      INSERT INTO tasks (title, description, status, priority, story_points, assignee_id, board_id, created_by)
      VALUES (${title.trim()}, ${description || null}, ${status}, ${priority}, ${story_points}, ${assignee_id || null}, ${board_id}, ${created_by})
      RETURNING id, title, description, status, priority, story_points, assignee_id, board_id, created_by, created_at, updated_at
    `;

    const newTask = result[0];

    // Log activity
    await sql`
      INSERT INTO activities (action, entity_type, entity_id, user_id, details)
      VALUES ('created', 'task', ${newTask.id}, ${created_by}, ${JSON.stringify({ title: newTask.title })})
    `;

    // Get assignee info if assigned
    let assignee = null;
    if (newTask.assignee_id) {
      const assigneeResult = await sql`
        SELECT username, email FROM users WHERE id = ${newTask.assignee_id}
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
      ...newTask,
      assignee
    };

    return Response.json(responseTask, { status: 201 });
  } catch (error) {
    console.error('Failed to create task:', error);
    return Response.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}