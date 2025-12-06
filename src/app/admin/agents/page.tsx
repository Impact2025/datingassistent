'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  Clock,
  MessageCircle,
  Star,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';

interface Agent {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  status: string;
  department: string;
  skills: string[];
  languages: string[];
  maxConcurrentChats: number;
  totalChatsHandled: number;
  avgResponseTime: number;
  satisfactionScore: number;
  isAvailable: boolean;
  lastActivity: string;
  createdAt: string;
  roleName: string;
  roleDescription: string;
}

interface AgentRole {
  id: number;
  name: string;
  description: string;
  maxConcurrentChats: number;
  priority: number;
}

export default function AgentManagementPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [roles, setRoles] = useState<AgentRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [_selectedAgent, _setSelectedAgent] = useState<Agent | null>(null);

  // Form states
  const [newAgent, setNewAgent] = useState({
    name: '',
    email: '',
    password: '',
    roleId: '',
    department: 'general',
    skills: [] as string[],
    languages: ['nl'],
    maxConcurrentChats: 3
  });

  const [editAgent, setEditAgent] = useState({
    id: '',
    name: '',
    email: '',
    roleId: '',
    department: 'general',
    skills: [] as string[],
    languages: ['nl'],
    maxConcurrentChats: 3
  });

  useEffect(() => {
    loadAgents();
    loadRoles();
  }, []);

  const loadAgents = async () => {
    try {
      const response = await fetch('/api/live-chat/agents');
      if (response.ok) {
        const data = await response.json();
        setAgents(data.agents || []);
      }
    } catch (error) {
      console.error('Error loading agents:', error);
      toast.error('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await fetch('/api/live-chat/agents/roles');
      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles || []);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const handleCreateAgent = async () => {
    try {
      const response = await fetch('/api/live-chat/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAgent)
      });

      if (response.ok) {
        toast.success('Agent created successfully');
        setShowCreateDialog(false);
        setNewAgent({
          name: '',
          email: '',
          password: '',
          roleId: '',
          department: 'general',
          skills: [],
          languages: ['nl'],
          maxConcurrentChats: 3
        });
        loadAgents();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create agent');
      }
    } catch (error) {
      console.error('Create agent error:', error);
      toast.error('Failed to create agent');
    }
  };

  const handleUpdateAgent = async () => {
    try {
      const response = await fetch(`/api/live-chat/agents/${editAgent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editAgent)
      });

      if (response.ok) {
        toast.success('Agent updated successfully');
        setShowEditDialog(false);
        loadAgents();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update agent');
      }
    } catch (error) {
      console.error('Update agent error:', error);
      toast.error('Failed to update agent');
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    try {
      const response = await fetch(`/api/live-chat/agents/${agentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Agent deleted successfully');
        loadAgents();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete agent');
      }
    } catch (error) {
      console.error('Delete agent error:', error);
      toast.error('Failed to delete agent');
    }
  };

  const openEditDialog = (agent: Agent) => {
    setEditAgent({
      id: agent.id.toString(),
      name: agent.name,
      email: agent.email,
      roleId: roles.find(r => r.name === agent.roleName)?.id.toString() || '',
      department: agent.department,
      skills: agent.skills,
      languages: agent.languages,
      maxConcurrentChats: agent.maxConcurrentChats
    });
    setShowEditDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'away': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Users className="mx-auto h-8 w-8 animate-spin text-primary mb-4" />
          <p>Loading agent management...</p>
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
                <h1 className="text-3xl font-bold">Agent Management</h1>
                <p className="text-muted-foreground">Manage customer support agents and their permissions</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={loadAgents} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Agent
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Agent</DialogTitle>
                    <DialogDescription>
                      Add a new customer support agent to the system.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={newAgent.name}
                        onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newAgent.email}
                        onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                        placeholder="john@datingassistent.nl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newAgent.password}
                        onChange={(e) => setNewAgent({ ...newAgent, password: e.target.value })}
                        placeholder="Secure password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select value={newAgent.roleId} onValueChange={(value) => setNewAgent({ ...newAgent, roleId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id.toString()}>
                              {role.name} - {role.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Select value={newAgent.department} onValueChange={(value) => setNewAgent({ ...newAgent, department: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Support</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="technical">Technical Support</SelectItem>
                          <SelectItem value="billing">Billing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="maxChats">Max Concurrent Chats</Label>
                      <Input
                        id="maxChats"
                        type="number"
                        value={newAgent.maxConcurrentChats}
                        onChange={(e) => setNewAgent({ ...newAgent, maxConcurrentChats: parseInt(e.target.value) })}
                        min="1"
                        max="10"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateAgent}>Create Agent</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <Tabs defaultValue="agents" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
            <TabsTrigger value="analytics">Performance</TabsTrigger>
          </TabsList>

          {/* Agents Tab */}
          <TabsContent value="agents" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Support Agents</CardTitle>
                <CardDescription>
                  Manage all customer support agents and their assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agents.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar>
                                <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(agent.status)}`} />
                            </div>
                            <div>
                              <p className="font-medium">{agent.name}</p>
                              <p className="text-sm text-muted-foreground">{agent.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{agent.roleName}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{agent.department}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            agent.status === 'online' ? 'default' :
                            agent.status === 'busy' ? 'secondary' : 'outline'
                          }>
                            {agent.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              <span>{agent.totalChatsHandled} chats</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{agent.avgResponseTime}s avg</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              <span>{agent.satisfactionScore?.toFixed(1) || 'N/A'}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(agent)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAgent(agent.id.toString())}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Agent Roles & Permissions</CardTitle>
                <CardDescription>
                  Define roles and their capabilities in the support system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roles.map((role) => (
                    <Card key={role.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Shield className="h-5 w-5 text-primary" />
                          <div>
                            <h3 className="font-medium">{role.name}</h3>
                            <p className="text-sm text-muted-foreground">{role.description}</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Max concurrent chats:</span>
                            <span className="font-medium">{role.maxConcurrentChats}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Priority level:</span>
                            <span className="font-medium">{role.priority}</span>
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
                  <CardTitle>Agent Performance Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total agents:</span>
                    <span className="font-bold text-lg">{agents.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Online now:</span>
                    <span className="font-bold text-lg text-green-600">
                      {agents.filter(a => a.status === 'online').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average satisfaction:</span>
                    <span className="font-bold text-lg">
                      {(agents.reduce((sum, a) => sum + (a.satisfactionScore || 0), 0) / agents.length).toFixed(1)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {agents
                      .sort((a, b) => (b.satisfactionScore || 0) - (a.satisfactionScore || 0))
                      .slice(0, 5)
                      .map((agent, index) => (
                        <div key={agent.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">{agent.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{agent.name}</span>
                          </div>
                          <Badge variant="outline">{agent.satisfactionScore?.toFixed(1) || 'N/A'}</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Agent Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Agent</DialogTitle>
            <DialogDescription>
              Update agent information and permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={editAgent.name}
                onChange={(e) => setEditAgent({ ...editAgent, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editAgent.email}
                onChange={(e) => setEditAgent({ ...editAgent, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Role</Label>
              <Select value={editAgent.roleId} onValueChange={(value) => setEditAgent({ ...editAgent, roleId: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name} - {role.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-department">Department</Label>
              <Select value={editAgent.department} onValueChange={(value) => setEditAgent({ ...editAgent, department: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Support</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="technical">Technical Support</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-maxChats">Max Concurrent Chats</Label>
              <Input
                id="edit-maxChats"
                type="number"
                value={editAgent.maxConcurrentChats}
                onChange={(e) => setEditAgent({ ...editAgent, maxConcurrentChats: parseInt(e.target.value) })}
                min="1"
                max="10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAgent}>Update Agent</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}