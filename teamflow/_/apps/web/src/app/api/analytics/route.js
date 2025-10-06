import sql from '@/app/api/utils/sql';

// GET /api/analytics - Get analytics data
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get('board_id') || 1;
    const sprintId = searchParams.get('sprint_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Basic task statistics
    const taskStats = await sql`
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'todo' THEN 1 END) as todo_count,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_count,
        COUNT(CASE WHEN status = 'done' THEN 1 END) as done_count,
        SUM(story_points) as total_story_points,
        SUM(CASE WHEN status = 'done' THEN story_points ELSE 0 END) as completed_story_points,
        AVG(story_points) as avg_story_points
      FROM tasks 
      WHERE board_id = ${boardId}
    `;

    // Task creation trend (last 30 days)
    const taskTrend = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as tasks_created,
        COUNT(CASE WHEN status = 'done' THEN 1 END) as tasks_completed
      FROM tasks 
      WHERE board_id = ${boardId} 
        AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    // Activity by user
    const userActivity = await sql`
      SELECT 
        u.username,
        COUNT(a.id) as activity_count,
        COUNT(CASE WHEN a.action = 'created' THEN 1 END) as tasks_created,
        COUNT(CASE WHEN a.action = 'updated' THEN 1 END) as tasks_updated
      FROM users u
      LEFT JOIN activities a ON u.id = a.user_id 
        AND a.entity_type = 'task'
        AND a.created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY u.id, u.username
      ORDER BY activity_count DESC
    `;

    // Priority distribution
    const priorityStats = await sql`
      SELECT 
        priority,
        COUNT(*) as count,
        COUNT(CASE WHEN status = 'done' THEN 1 END) as completed_count
      FROM tasks 
      WHERE board_id = ${boardId}
      GROUP BY priority
    `;

    // Recent activities
    const recentActivities = await sql`
      SELECT 
        a.id,
        a.action,
        a.entity_type,
        a.entity_id,
        a.details,
        a.created_at,
        u.username
      FROM activities a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 20
    `;

    // Sprint-specific analytics if sprint_id is provided
    let sprintAnalytics = null;
    if (sprintId) {
      const sprintTasks = await sql`
        SELECT 
          COUNT(*) as total_tasks,
          COUNT(CASE WHEN status = 'done' THEN 1 END) as completed_tasks,
          SUM(story_points) as total_story_points,
          SUM(CASE WHEN status = 'done' THEN story_points ELSE 0 END) as completed_story_points
        FROM tasks t
        JOIN sprints s ON t.board_id = s.board_id
        WHERE s.id = ${sprintId}
          AND t.created_at >= s.start_date
          AND t.created_at <= s.end_date
      `;

      sprintAnalytics = sprintTasks[0];
    }

    // Calculate completion rate
    const stats = taskStats[0];
    const completionRate = stats.total_tasks > 0 
      ? Math.round((stats.done_count / stats.total_tasks) * 100) 
      : 0;

    const storyPointsCompletionRate = stats.total_story_points > 0
      ? Math.round((stats.completed_story_points / stats.total_story_points) * 100)
      : 0;

    const response = {
      overview: {
        total_tasks: parseInt(stats.total_tasks),
        todo_tasks: parseInt(stats.todo_count),
        in_progress_tasks: parseInt(stats.in_progress_count),
        completed_tasks: parseInt(stats.done_count),
        completion_rate: completionRate,
        total_story_points: parseInt(stats.total_story_points || 0),
        completed_story_points: parseInt(stats.completed_story_points || 0),
        story_points_completion_rate: storyPointsCompletionRate,
        avg_story_points: parseFloat(stats.avg_story_points || 0).toFixed(1)
      },
      task_trend: taskTrend.map(item => ({
        date: item.date,
        tasks_created: parseInt(item.tasks_created),
        tasks_completed: parseInt(item.tasks_completed)
      })),
      user_activity: userActivity.map(item => ({
        username: item.username,
        activity_count: parseInt(item.activity_count),
        tasks_created: parseInt(item.tasks_created),
        tasks_updated: parseInt(item.tasks_updated)
      })),
      priority_distribution: priorityStats.map(item => ({
        priority: item.priority,
        count: parseInt(item.count),
        completed_count: parseInt(item.completed_count),
        completion_rate: item.count > 0 ? Math.round((item.completed_count / item.count) * 100) : 0
      })),
      recent_activities: recentActivities.map(activity => ({
        id: activity.id,
        action: activity.action,
        entity_type: activity.entity_type,
        entity_id: activity.entity_id,
        details: activity.details,
        created_at: activity.created_at,
        user: activity.username ? { username: activity.username } : null
      })),
      sprint_analytics: sprintAnalytics
    };

    return Response.json(response);
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return Response.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}