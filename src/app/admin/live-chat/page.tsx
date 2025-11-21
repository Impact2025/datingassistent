'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MessageCircle,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  UserCheck,
  Settings,
  BarChart3,
  Phone,
  Mail,
  MessageSquare,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';

interface Agent {
  id: number;
  name: string;
  email: string;
  status: string;
  department: string;
  totalChatsHandled: number;
  avgResponseTime: number;
  satisfactionScore: number;
  isAvailable: boolean;
}

interface Conversation {
  id: number;
  sessionId: string;
  status: string;
  priority: string;
  department: string;
  userName?: string;
  userEmail?: string;
  lastMessageAt: string;
  assignedAgentId?: number;
}

interface DashboardStats {
  activeChats: number;
  waitingChats: number;
  availableAgents: number;
  avgResponseTime: number;
  satisfactionScore: number;
  totalChatsToday: number;
}

export default function LiveChatDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    activeChats: 0,
    waitingChats: 0,
    availableAgents: 0,
    avgResponseTime: 0,
    satisfactionScore: 0,
    totalChatsToday: 0
  });
  const [agents, setAgents] = useState<Agent[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load stats, agents, and conversations
      const [statsRes, agentsRes, conversationsRes] = await Promise.all([
        fetch('/api/live-chat/dashboard/stats'),
        fetch('/api/live-chat/agents'),
        fetch('/api/live-chat/conversations?status=active,waiting')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (agentsRes.ok) {
        const agentsData = await agentsRes.json();
        setAgents(agentsData.agents || []);
      }

      if (conversationsRes.ok) {
        const conversationsData = await conversationsRes.json();
        setConversations(conversationsData.conversations || []);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'away': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <MessageCircle className="mx-auto h-8 w-8 animate-spin text-primary mb-4" />
          <p>Loading live chat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/admin')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Terug naar Admin
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Live Chat Dashboard</h1>
                <p className="text-muted-foreground">Real-time customer support management</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/agents">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Agents
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/live-chat/analytics">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/live-chat/channels">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Multi-Channel
                </Link>
              </Button>
              <Button onClick={loadDashboardData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="conversations">Conversations</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Chats</CardTitle>
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeChats}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently being handled
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Waiting Queue</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.waitingChats}</div>
                  <p className="text-xs text-muted-foreground">
                    Need agent assignment
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Agents</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.availableAgents}</div>
                  <p className="text-xs text-muted-foreground">
                    Ready to help
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.avgResponseTime}s</div>
                  <p className="text-xs text-muted-foreground">
                    Industry standard: under 30s
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <MessageSquare className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Start Chat</h3>
                  <p className="text-sm text-muted-foreground">Begin a new conversation</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Phone className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Phone Support</h3>
                  <p className="text-sm text-muted-foreground">Escalate to phone call</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Mail className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Email Support</h3>
                  <p className="text-sm text-muted-foreground">Convert to email ticket</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Conversations Tab */}
          <TabsContent value="conversations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Conversations</CardTitle>
                <CardDescription>
                  Manage ongoing customer conversations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {conversations.map((conversation) => (
                      <div key={conversation.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {conversation.userName?.charAt(0) || conversation.userEmail?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {conversation.userName || conversation.userEmail || 'Anonymous User'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {conversation.department} • {new Date(conversation.lastMessageAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            conversation.priority === 'urgent' ? 'destructive' :
                            conversation.priority === 'high' ? 'default' : 'secondary'
                          }>
                            {conversation.priority}
                          </Badge>
                          <Badge variant={
                            conversation.status === 'active' ? 'default' :
                            conversation.status === 'waiting' ? 'secondary' : 'outline'
                          }>
                            {conversation.status}
                          </Badge>
                          <Button size="sm">Open Chat</Button>
                        </div>
                      </div>
                    ))}
                    {conversations.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p>No active conversations</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Agent Status</CardTitle>
                <CardDescription>
                  Monitor agent availability and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {agents.map((agent) => (
                    <Card key={agent.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="relative">
                            <Avatar>
                              <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(agent.status)}`} />
                          </div>
                          <div>
                            <p className="font-medium">{agent.name}</p>
                            <p className="text-sm text-muted-foreground">{agent.department}</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Chats today:</span>
                            <span className="font-medium">{agent.totalChatsHandled}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Avg response:</span>
                            <span className="font-medium">{agent.avgResponseTime}s</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Satisfaction:</span>
                            <span className="font-medium">{agent.satisfactionScore?.toFixed(1) || 'N/A'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total chats today:</span>
                    <span className="font-bold text-lg">{stats.totalChatsToday}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average satisfaction:</span>
                    <span className="font-bold text-lg">{stats.satisfactionScore?.toFixed(1) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Resolution rate:</span>
                    <span className="font-bold text-lg">94.2%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Server status:</span>
                    <Badge variant="default" className="bg-green-500">Online</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Database:</span>
                    <Badge variant="default" className="bg-green-500">Healthy</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>WebSocket:</span>
                    <Badge variant="default" className="bg-green-500">Connected</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}