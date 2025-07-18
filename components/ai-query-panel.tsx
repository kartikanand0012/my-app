'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Send, Clock, Database, Brain, History, Code } from 'lucide-react';
import { executeAIQuery } from '@/lib/api';

interface QueryResult {
  query: string;
  results: any[];
  row_count: number;
  execution_time: number;
  sql_query?: string;
  success: boolean;
}

interface QueryHistoryItem {
  id: number;
  query_text: string;
  response_text?: string;
  execution_time: number;
  success: boolean;
  created_at: string;
  query_type: string;
}

export function AIQueryPanel() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState('');
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const [fullQueryHistory, setFullQueryHistory] = useState<QueryHistoryItem[]>([]);
  const [useAIAgent, setUseAIAgent] = useState(true);
  const [activeTab, setActiveTab] = useState('query');

  const suggestedQueries = [
    "get me all failed calls on 13th April and list of users who made this call",
    "show me today's total calls",
    "what's the success rate for agent 107292?",
    "give me the top 5 error reasons",
    "show me language issues from this month",
    "get call volume by hour for yesterday"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await executeAIQuery(query, useAIAgent);
      if (data.success) {
        setResult(data.data);
        setQueryHistory(prev => [query, ...prev.slice(0, 9)]); // Keep last 10 queries
      } else {
        setError(data.message || 'Query execution failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Query execution failed');
    } finally {
      setIsLoading(false);
    }
  };

  const loadQueryHistory = async () => {
    try {
      const response = await fetch('/api/ai-agent/query/history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setFullQueryHistory(data.data.queries);
      }
    } catch (error) {
      console.error('Failed to load query history:', error);
    }
  };

  const handleSuggestedQuery = (suggestedQuery: string) => {
    setQuery(suggestedQuery);
  };

  const renderResults = () => {
    if (!result) return null;

    if (result.results.length === 0) {
      return (
        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            No results found for your query.
          </AlertDescription>
        </Alert>
      );
    }

    const columns = Object.keys(result.results[0]);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Database className="h-4 w-4" />
            <span>{result.row_count} rows</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{result.execution_time}ms</span>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column}>{column}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.results.slice(0, 50).map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column}>
                      {typeof row[column] === 'boolean' ? (
                        <Badge variant={row[column] ? 'default' : 'secondary'}>
                          {row[column] ? 'Yes' : 'No'}
                        </Badge>
                      ) : (
                        <span className="max-w-xs truncate block">
                          {row[column]?.toString() || 'N/A'}
                        </span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {result.results.length > 50 && (
          <p className="text-sm text-gray-600 text-center">
            Showing first 50 results of {result.row_count} total rows
          </p>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Enhanced AI Query Interface
        </CardTitle>
        <CardDescription>
          Ask questions about your call data in natural language with AI Agent support
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="query" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Query Interface
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Query History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="query" className="space-y-6">
            {/* AI Agent Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div className="space-y-1">
                <Label htmlFor="ai-agent-toggle" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Agent Mode
                </Label>
                <p className="text-sm text-gray-600">
                  {useAIAgent 
                    ? "AI will convert your natural language to SQL queries" 
                    : "Direct SQL query execution mode"}
                </p>
              </div>
              <Switch
                id="ai-agent-toggle"
                checked={useAIAgent}
                onCheckedChange={setUseAIAgent}
              />
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                placeholder={useAIAgent 
                  ? "e.g., get me all failed calls on 20th June and list of users who made this call"
                  : "SELECT * FROM quality_check_videos WHERE..."
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : useAIAgent ? (
                  <Brain className="h-4 w-4" />
                ) : (
                  <Code className="h-4 w-4" />
                )}
              </Button>
            </form>

        {/* Suggested Queries */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Suggested Queries:</h4>
          <div className="flex flex-wrap gap-2">
            {suggestedQueries.map((suggestedQuery, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestedQuery(suggestedQuery)}
                className="text-xs"
              >
                {suggestedQuery}
              </Button>
            ))}
          </div>
        </div>

        {/* Query History */}
        {queryHistory.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recent Queries:</h4>
            <div className="space-y-1">
              {queryHistory.slice(0, 5).map((historyQuery, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuery(historyQuery)}
                  className="text-xs text-left justify-start h-auto p-2 text-gray-600"
                >
                  {historyQuery}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

            {/* Results Display */}
            {renderResults()}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Query History</h4>
              <Button variant="outline" size="sm" onClick={loadQueryHistory}>
                <History className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
            
            {fullQueryHistory.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {fullQueryHistory.map((historyItem) => (
                  <div 
                    key={historyItem.id} 
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setQuery(historyItem.query_text);
                      setActiveTab('query');
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant={historyItem.success ? 'default' : 'destructive'}>
                        {historyItem.query_type}
                      </Badge>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {historyItem.execution_time}ms
                        <span>{new Date(historyItem.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 truncate">
                      {historyItem.query_text}
                    </p>
                    {historyItem.success && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ Query executed successfully
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No query history available</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={loadQueryHistory}
                  className="mt-2"
                >
                  Load History
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}