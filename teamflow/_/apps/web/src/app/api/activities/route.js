import sql from '@/app/api/utils/sql';

// GET /api/activities - List all activities
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;
    const entityType = searchParams.get('entity_type');
    const entityId = searchParams.get('entity_id');

    let query = `
      SELECT 
        a.id,
        a.action,
        a.entity_type,
        a.entity_id,
        a.details,
        a.created_at,
        u.username,
        u.email
      FROM activities a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;

    if (entityType) {
      query += ` AND a.entity_type = $${paramCount++}`;
      params.push(entityType);
    }

    if (entityId) {
      query += ` AND a.entity_id = $${paramCount++}`;
      params.push(entityId);
    }

    query += ` ORDER BY a.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);

    const activities = await sql(query, params);

    // Transform the data to match frontend expectations
    const transformedActivities = activities.map(activity => ({
      id: activity.id,
      action: activity.action,
      entity_type: activity.entity_type,
      entity_id: activity.entity_id,
      details: activity.details,
      created_at: activity.created_at,
      user: activity.username ? {
        username: activity.username,
        email: activity.email,
        avatar: null
      } : null
    }));

    return Response.json(transformedActivities);
  } catch (error) {
    console.error('Failed to fetch activities:', error);
    return Response.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

// POST /api/activities - Create a new activity (for manual logging)
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, entity_type, entity_id, user_id = 1, details = {} } = body;

    if (!action || !entity_type || !entity_id) {
      return Response.json(
        { error: 'Action, entity_type, and entity_id are required' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO activities (action, entity_type, entity_id, user_id, details)
      VALUES (${action}, ${entity_type}, ${entity_id}, ${user_id}, ${JSON.stringify(details)})
      RETURNING id, action, entity_type, entity_id, user_id, details, created_at
    `;

    const newActivity = result[0];

    // Get user info
    const userResult = await sql`
      SELECT username, email FROM users WHERE id = ${newActivity.user_id}
    `;

    const responseActivity = {
      ...newActivity,
      user: userResult.length > 0 ? {
        username: userResult[0].username,
        email: userResult[0].email,
        avatar: null
      } : null
    };

    return Response.json(responseActivity, { status: 201 });
  } catch (error) {
    console.error('Failed to create activity:', error);
    return Response.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}