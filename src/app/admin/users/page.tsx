"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  MoreHorizontal,
  UserCheck,
  Crown,
  Calendar,
  Mail,
  Activity,
  TrendingUp,
  Users,
  UserPlus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  id: number;
  name: string;
  email: string;
  emailVerified: boolean;
  subscriptionStatus: 'free' | 'premium' | 'vip';
  createdAt: string;
  lastLogin: string | null;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  profileComplete: boolean;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  newUsersToday: number;
  churnRate: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(`/api/admin/users?${params}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Kon gebruikers niet laden');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/users/stats', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSubscription = subscriptionFilter === "all" || user.subscriptionStatus === subscriptionFilter;
    return matchesSubscription;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSubscriptionBadge = (type: string) => {
    switch (type) {
      case 'premium':
        return <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <Crown className="w-3 h-3" />
          Premium
        </Badge>;
      case 'vip':
        return <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
          <Crown className="w-3 h-3" />
          VIP
        </Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
        <p className="text-red-600">{error}</p>
        <Button onClick={() => fetchUsers()}>Opnieuw proberen</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">
            Manage user accounts, subscriptions, and activity
          </p>
        </div>
        <Button className="flex items-center space-x-2">
          <UserPlus className="w-4 h-4" />
          <span>Add User</span>
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Crown className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Premium Users</p>
                  <p className="text-2xl font-bold">{stats.premiumUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserPlus className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">New Today</p>
                  <p className="text-2xl font-bold">{stats.newUsersToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Churn Rate</p>
                  <p className="text-2xl font-bold">{stats.churnRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>

            <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by subscription" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subscriptions</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gebruiker</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Abonnement</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Aangemeld</TableHead>
                <TableHead>Laatst ingelogd</TableHead>
                <TableHead>Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Geen gebruikers gevonden
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : user.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name || 'Geen naam'}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>{getSubscriptionBadge(user.subscriptionStatus)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(user.createdAt).toLocaleDateString('nl-NL')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString('nl-NL')
                          : <span className="text-gray-400">Nooit</span>
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acties</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                            Bekijk details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Bewerk gebruiker
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            Blokkeer gebruiker
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Pagina {pagination.page} van {pagination.totalPages} ({pagination.total} gebruikers)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              Vorige
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === pagination.totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Volgende
            </Button>
          </div>
        </div>
      )}

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gebruiker Details</DialogTitle>
            <DialogDescription>
              Gedetailleerde informatie over {selectedUser?.name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {selectedUser.name
                      ? selectedUser.name.split(' ').map(n => n[0]).join('').toUpperCase()
                      : selectedUser.email[0].toUpperCase()
                    }
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.name || 'Geen naam'}</h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    {getStatusBadge(selectedUser.status)}
                    {getSubscriptionBadge(selectedUser.subscriptionStatus)}
                    <Badge variant="outline" className="capitalize">{selectedUser.role}</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Aangemeld: {new Date(selectedUser.createdAt).toLocaleDateString('nl-NL')}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Activity className="h-4 w-4 text-gray-400" />
                    <span>Laatst ingelogd: {selectedUser.lastLogin
                      ? new Date(selectedUser.lastLogin).toLocaleDateString('nl-NL')
                      : 'Nooit'
                    }</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>Email geverifieerd: {selectedUser.emailVerified ? 'Ja' : 'Nee'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <UserCheck className="h-4 w-4 text-gray-400" />
                    <span>Profiel compleet: {selectedUser.profileComplete ? 'Ja' : 'Nee'}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedUser(null)}>
                  Sluiten
                </Button>
                <Button>
                  Bewerken
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}