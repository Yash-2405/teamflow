import sql from '@/app/api/utils/sql';

// GET /api/boards - List all boards
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || 1; // Default to user 1

    const boards = await sql`
      SELECT 
        b.id,
        b.name,
        b.description,
        b.created_at,
        b.updated_at,
        u.username as created_by_username,
        COUNT(t.id) as task_count
      FROM boards b
      LEFT JOIN users u ON b.created_by = u.id
      LEFT JOIN tasks t ON b.id = t.board_id
      GROUP BY b.id, b.name, b.description, b.created_at, b.updated_at, u.username
      ORDER BY b.created_at DESC
    `;

    const transformedBoards = boards.map(board => ({
      id: board.id,
      name: board.name,
      description: board.description,
      created_at: board.created_at,
      updated_at: board.updated_at,
      created_by: {
        username: board.created_by_username
      },
      task_count: parseInt(board.task_count || 0)
    }));

    return Response.json(transformedBoards);
  } catch (error) {
    console.error('Failed to fetch boards:', error);
    return Response.json(
      { error: 'Failed to fetch boards' },
      { status: 500 }
    );
  }
}

// POST /api/boards - Create a new board
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description = '', created_by = 1 } = body;

    if (!name || !name.trim()) {
      return Response.json(
        { error: 'Board name is required' },
        { status: 400 }
      );
    }

    // Insert the new board
    const result = await sql`
      INSERT INTO boards (name, description, created_by)
      VALUES (${name.trim()}, ${description}, ${created_by})
      RETURNING id, name, description, created_by, created_at, updated_at
    `;

    const newBoard = result[0];

    // Log activity
    await sql`
      INSERT INTO activities (action, entity_type, entity_id, user_id, details)
      VALUES ('created', 'board', ${newBoard.id}, ${created_by}, ${JSON.stringify({ name: newBoard.name })})
    `;

    // Get creator info
    const creatorResult = await sql`
      SELECT username FROM users WHERE id = ${created_by}
    `;

    const responseBoard = {
      ...newBoard,
      created_by: {
        username: creatorResult[0]?.username || 'Unknown'
      },
      task_count: 0
    };

    return Response.json(responseBoard, { status: 201 });
  } catch (error) {
    console.error('Failed to create board:', error);
    return Response.json(
      { error: 'Failed to create board' },
      { status: 500 }
    );
  }
}