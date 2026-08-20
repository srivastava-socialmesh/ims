import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { orgId, userType } = await req.json()

    if (!orgId) {
      return new Response(
        JSON.stringify({ error: 'Organization ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch data
    const [items, movements, stock, orders] = await Promise.all([
      supabase.from('items').select('*').eq('organization_id', orgId),
      supabase.from('movements').select('*').eq('organization_id', orgId).limit(1000),
      supabase.from('stock').select('*').eq('organization_id', orgId),
      supabase.from('orders').select('*').eq('organization_id', orgId),
    ])

    // Generate insights
    const insights = generateInsights(
      items.data || [],
      movements.data || [],
      stock.data || [],
      orders.data || [],
      userType || 'admin'
    )

    // Store insights
    if (insights.length > 0) {
      await supabase
        .from('ai_insights')
        .insert(
          insights.map(insight => ({
            organization_id: orgId,
            insight_type: insight.type,
            title: insight.title,
            description: insight.description,
            data: insight.data,
            confidence_score: insight.confidence || 0.85,
            user_type: userType || 'admin',
          }))
        )
    }

    return new Response(
      JSON.stringify({ success: true, insights, count: insights.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function generateInsights(items: any[], movements: any[], stock: any[], orders: any[], userType: string) {
  const insights: any[] = []

  // Reorder suggestions (admin/manager)
  if (userType === 'admin' || userType === 'manager') {
    const reorderItems = stock
      .filter(s => {
        const item = items.find(i => i.id === s.item_id)
        return item && s.quantity < item.reorder_level * 1.5
      })
      .map(s => {
        const item = items.find(i => i.id === s.item_id)
        return {
          item_name: item?.name || 'Unknown',
          current_stock: s.quantity,
          reorder_level: item?.reorder_level || 0,
          suggested_qty: Math.max(item?.reorder_level * 2 - s.quantity, 0),
          urgency: s.quantity < item?.reorder_level ? 'critical' : 'high'
        }
      })

    if (reorderItems.length > 0) {
      insights.push({
        type: 'reorder',
        title: `Reorder Suggestions (${reorderItems.length} items)`,
        description: `${reorderItems.length} items need restocking`,
        data: reorderItems,
        confidence: 0.90
      })
    }
  }

  // Movement trends (all users)
  const movementCounts = movements.reduce((acc, m) => {
    const date = new Date(m.created_at).toDateString()
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const dates = Object.keys(movementCounts).slice(0, 7)
  if (dates.length > 0) {
    insights.push({
      type: 'trend',
      title: 'Recent Movement Activity',
      description: 'Weekly trend of inventory movements',
      data: dates.map(d => ({ date: d, count: movementCounts[d] })),
      confidence: 0.85
    })
  }

  // Anomaly detection (admin/manager)
  if (userType === 'admin' || userType === 'manager') {
    const avgMovements = Math.max(movements.length / 30, 1)
    const recentCount = movements.filter(
      m => new Date(m.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length

    if (recentCount > avgMovements * 2) {
      insights.push({
        type: 'anomaly',
        title: 'Unusual Activity Detected',
        description: `Movement volume is ${Math.round(recentCount / avgMovements * 100)}% above average`,
        data: {
          current: recentCount,
          average: Math.round(avgMovements),
          percentage: Math.round(recentCount / avgMovements * 100)
        },
        confidence: 0.75
      })
    }
  }

  return insights
}
