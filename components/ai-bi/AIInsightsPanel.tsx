'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Package, 
  Clock, 
  ArrowUpRight,
  Sparkles,
  Loader2,
  X
} from 'lucide-react';

interface Insight {
  id: string;
  insight_type: string;
  title: string;
  description: string;
  data: any;
  confidence_score: number;
  generated_at: string;
  is_read: boolean;
}

interface AIInsightsPanelProps {
  userType: 'admin' | 'manager' | 'worker';
}

export default function AIInsightsPanel({ userType }: AIInsightsPanelProps) {
  const supabase = createClient();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);

  useEffect(() => {
    fetchInsights();
  }, [userType]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_type', userType)
        .order('generated_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'forecast':
        return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'reorder':
        return <Package className="w-5 h-5 text-amber-500" />;
      case 'anomaly':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'suggestion':
        return <Sparkles className="w-5 h-5 text-purple-500" />;
      case 'trend':
        return <Clock className="w-5 h-5 text-emerald-500" />;
      default:
        return <Brain className="w-5 h-5 text-gray-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'forecast':
        return 'from-blue-500/20 to-blue-600/20 border-blue-500/30';
      case 'reorder':
        return 'from-amber-500/20 to-amber-600/20 border-amber-500/30';
      case 'anomaly':
        return 'from-red-500/20 to-red-600/20 border-red-500/30';
      case 'suggestion':
        return 'from-purple-500/20 to-purple-600/20 border-purple-500/30';
      case 'trend':
        return 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30';
      default:
        return 'from-gray-500/20 to-gray-600/20 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/30">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-3 text-gray-500">AI is thinking...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">AI Business Insights</h2>
              <p className="text-xs text-gray-500">Powered by machine learning</p>
            </div>
          </div>
          <button
            onClick={fetchInsights}
            className="px-3 py-1.5 text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>

        {insights.length === 0 ? (
          <div className="text-center py-12">
            <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No insights available yet</p>
            <p className="text-xs text-gray-400 mt-1">Data will appear as AI analyzes your inventory</p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight) => (
              <button
                key={insight.id}
                onClick={() => setSelectedInsight(insight)}
                className={`w-full text-left p-4 rounded-xl border bg-gradient-to-r ${getInsightColor(insight.insight_type)} hover:shadow-md transition-all duration-200 group`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white/50 backdrop-blur-sm">
                    {getInsightIcon(insight.insight_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-gray-800">
                        {insight.title}
                      </h3>
                      {insight.confidence_score && (
                        <span className="text-xs px-2 py-0.5 bg-white/50 rounded-full text-gray-600">
                          {Math.round(insight.confidence_score * 100)}% confidence
                        </span>
                      )}
                    </div>
                    {insight.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {insight.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-400">
                        {new Date(insight.generated_at).toLocaleDateString()}
                      </span>
                      {!insight.is_read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      )}
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedInsight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-white/30">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
                  {getInsightIcon(selectedInsight.insight_type)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{selectedInsight.title}</h3>
                  <p className="text-xs text-gray-500">
                    Generated {new Date(selectedInsight.generated_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInsight(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="prose prose-sm max-w-none">
              {selectedInsight.data && (
                <pre className="bg-gray-50 p-4 rounded-xl overflow-auto text-xs">
                  {JSON.stringify(selectedInsight.data, null, 2)}
                </pre>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSelectedInsight(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
