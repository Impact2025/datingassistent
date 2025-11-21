'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  MessageSquare,
  Phone,
  Mail,
  MessageCircle,
  ArrowLeft,
  Search,
  Filter,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface MultiChannelConversation {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  channel: 'website' | 'whatsapp' | 'email';
  status: 'pending' | 'assigned' | 'active' | 'closed';
  priority: 'urgent' | 'high' | 'normal';
  department: string;
  lastMessage: string;
  lastMessageTime: string;
  assignedAgent?: string;
  unreadCount: number;
  waitingTime: number; // in minutes
}

interface ChannelStats {
  website: {
    active: number;
    pending: number;
    total: number;
  };
  whatsapp: {
    active: number;
    pending: number;
    total: number;
  };
  email: {
    active: number;
    pending: number;
    total: number;
  };
  total: {
    active: number;
    pending: number;
    total: number;
  };
}

export default function MultiChannelDashboardPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<MultiChannelConversation[]>([]);
  const [stats, setStats] = useState<ChannelStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChannel, setActiveChannel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadMultiChannelData();
    // Refresh every 30 seconds
    const interval = setInterval(loadMultiChannelData, 30000);
    return () => clearInterval(interval);
  }, [activeChannel]);

  const loadMultiChannelData = async () => {
    try {
      const response = await fetch(`/api/live-chat/channels?channel=${activeChannel}`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading multi-channel data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (conv.customerEmail && conv.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return <MessageCircle className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return 'bg-green-500';
      case 'email': return 'bg-blue-500';
      default: return 'bg-purple-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'assigned': return 'bg-blue-500';
      case 'active': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const formatWaitingTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <MessageSquare className="mx-auto h-8 w-8 animate-spin text-primary mb-4" />
          <p>Loading multi-channel dashboard...</p>
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
                onClick={() => router.push('/admin/live-chat')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Terug naar Live Chat
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Multi-Channel Support</h1>
                <p className="text-muted-foreground">Beheer gesprekken van alle kanalen op één plek</p>
              </div>
            </div>
            <Button onClick={loadMultiChannelData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Channel Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Website Chat</CardTitle>
                <MessageSquare className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.website.active}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.website.pending} wachtend
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">WhatsApp</CardTitle>
                <MessageCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.whatsapp.active}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.whatsapp.pending} wachtend
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Email</CardTitle>
                <Mail className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.email.active}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.email.pending} wachtend
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Totaal Actief</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total.active}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.total.pending} in wachtrij
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Zoek op naam, email of bericht..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={activeChannel} onValueChange={setActiveChannel}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Kanaal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle kanalen</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle statussen</SelectItem>
                  <SelectItem value="pending">Wachtend</SelectItem>
                  <SelectItem value="assigned">Toegewezen</SelectItem>
                  <SelectItem value="active">Actief</SelectItem>
                  <SelectItem value="closed">Gesloten</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Conversations List */}
        <Card>
          <CardHeader>
            <CardTitle>Gesprekken ({filteredConversations.length})</CardTitle>
            <CardDescription>
              Alle actieve gesprekken van alle kanalen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/admin/live-chat/conversation/${conversation.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Channel Icon */}
                      <div className={`p-2 rounded-full ${getChannelColor(conversation.channel)}`}>
                        {getChannelIcon(conversation.channel)}
                      </div>

                      {/* Customer Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{conversation.customerName}</h3>
                          {conversation.priority !== 'normal' && (
                            <Badge className={getPriorityColor(conversation.priority)}>
                              {conversation.priority.toUpperCase()}
                            </Badge>
                          )}
                          <Badge className={getStatusColor(conversation.status)}>
                            {conversation.status}
                          </Badge>
                        </div>

                        <div className="text-sm text-muted-foreground mb-2">
                          {conversation.customerEmail && (
                            <span className="mr-4">📧 {conversation.customerEmail}</span>
                          )}
                          {conversation.customerPhone && (
                            <span>📱 {conversation.customerPhone}</span>
                          )}
                        </div>

                        <p className="text-sm text-gray-700 line-clamp-2">
                          {conversation.lastMessage}
                        </p>
                      </div>
                    </div>

                    {/* Right Side */}
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {conversation.unreadCount} nieuw
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatWaitingTime(conversation.waitingTime)}
                        </span>
                      </div>

                      {conversation.assignedAgent && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="w-3 h-3" />
                          {conversation.assignedAgent}
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(conversation.lastMessageTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredConversations.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Geen gesprekken gevonden</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}