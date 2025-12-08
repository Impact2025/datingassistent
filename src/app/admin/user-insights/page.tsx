"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Users,
  UserCheck,
  UserX,
  Mail,
  LogIn,
  CheckCircle,
  Crown,
  RefreshCw,
  Send,
  Link as LinkIcon,
  AlertTriangle,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserInsights {
  metrics: {
    totalUsers: number;
    users24h: number;
    users7d: number;
    users30d: number;
    verifiedUsers: number;
    unverifiedUsers: number;
    activeUsers: number;
    neverLoggedIn: number;
    completedOnboarding: number;
    sawOTO: number;
    paidUsers: number;
  };
  funnel: {
    registered: number;
    verifiedEmail: number;
    firstLogin: number;
    completedOnboarding: number;
    sawOTO: number;
    convertedPaid: number;
  };
  conversionRates: {
    registration_to_verification: number;
    verification_to_login: number;
    login_to_onboarding: number;
    onboarding_to_oto: number;
    oto_to_paid: number;
    overall: number;
  };
  dropOff: {
    atVerification: number;
    afterVerification: number;
    duringOnboarding: number;
    beforeOTO: number;
    afterOTO: number;
  };
  stuckUsers: Array<{
    id: number;
    name: string;
    email: string;
    createdAt: string;
    emailVerified: boolean;
    lastLogin: string | null;
    onboardingCompleted: boolean;
    stuckReason: string;
    hasExpiredCode: boolean;
  }>;
  trend: Array<{
    date: string;
    registrations: number;
    verifications: number;
    activations: number;
  }>;
  recentUsers: Array<any>;
  generatedAt: string;
}

export default function UserInsightsPage() {
  const { toast } = useToast();
  const [insights, setInsights] = useState<UserInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState('7');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchInsights();
  }, [days]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/user-insights?days=${days}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch insights');
      }

      const data = await response.json();
      setInsights(data);
    } catch (error) {
      console.error('Error fetching insights:', error);
      toast({
        title: "Error",
        description: "Kon user insights niet laden",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const performUserAction = async (action: string, userId: number) => {
    try {
      setActionLoading(action);

      const response = await fetch('/api/admin/user-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userId }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Action failed');
      }

      const result = await response.json();

      if (action === 'generate_login_link') {
        // Copy to clipboard
        await navigator.clipboard.writeText(result.loginLink);
        toast({
          title: "Succes!",
          description: "Login link gekopieerd naar clipboard"
        });
      } else {
        toast({
          title: "Succes!",
          description: result.message
        });
      }

      // Refresh insights
      fetchInsights();
    } catch (error) {
      console.error('Action error:', error);
      toast({
        title: "Error",
        description: "Actie mislukt",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStuckReasonBadge = (reason: string) => {
    switch (reason) {
      case 'verification_expired':
        return <Badge variant="destructive" className="gap-1">
          <AlertCircle className="w-3 h-3" />
          Verificatie verlopen
        </Badge>;
      case 'pending_verification':
        return <Badge variant="secondary" className="gap-1">
          <Mail className="w-3 h-3" />
          Wacht op verificatie
        </Badge>;
      case 'verified_not_logged_in':
        return <Badge className="bg-orange-100 text-orange-800 gap-1">
          <LogIn className="w-3 h-3" />
          Niet ingelogd
        </Badge>;
      case 'started_not_completed':
        return <Badge className="bg-yellow-100 text-yellow-800 gap-1">
          <Activity className="w-3 h-3" />
          Onboarding niet af
        </Badge>;
      default:
        return <Badge variant="outline">{reason}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
        <p className="text-red-600">Kon geen data laden</p>
        <Button onClick={fetchInsights}>Opnieuw proberen</Button>
      </div>
    );
  }

  const { metrics, funnel, conversionRates, dropOff, stuckUsers, trend } = insights;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Insights Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Wereldklasse analytics voor user management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Laatste 24 uur</SelectItem>
              <SelectItem value="7">Laatste 7 dagen</SelectItem>
              <SelectItem value="30">Laatste 30 dagen</SelectItem>
              <SelectItem value="90">Laatste 90 dagen</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchInsights} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nieuwe Registraties</p>
                <p className="text-3xl font-bold mt-2">{funnel.registered}</p>
                <p className="text-xs text-gray-500 mt-1">Laatste {days} dagen</p>
              </div>
              <Users className="h-10 w-10 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Email Geverifieerd</p>
                <p className="text-3xl font-bold mt-2">{funnel.verifiedEmail}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <p className="text-xs text-green-600 font-semibold">
                    {conversionRates.registration_to_verification}%
                  </p>
                </div>
              </div>
              <UserCheck className="h-10 w-10 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eerste Login</p>
                <p className="text-3xl font-bold mt-2">{funnel.firstLogin}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <p className="text-xs text-green-600 font-semibold">
                    {conversionRates.verification_to_login}%
                  </p>
                </div>
              </div>
              <LogIn className="h-10 w-10 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Betaalde Conversies</p>
                <p className="text-3xl font-bold mt-2">{funnel.convertedPaid}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Crown className="h-3 w-3 text-yellow-600" />
                  <p className="text-xs text-yellow-600 font-semibold">
                    {conversionRates.overall}% overall
                  </p>
                </div>
              </div>
              <Crown className="h-10 w-10 text-yellow-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stuck Users Alert */}
      {stuckUsers.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-900">
                {stuckUsers.length} Vastgelopen Gebruikers Gedetecteerd
              </CardTitle>
            </div>
            <CardDescription>
              Deze gebruikers zijn ergens in de flow vastgelopen en hebben mogelijk hulp nodig
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gebruiker</TableHead>
                  <TableHead>Aangemeld</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Probleem</TableHead>
                  <TableHead>Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stuckUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name || 'Geen naam'}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(user.createdAt).toLocaleDateString('nl-NL', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {user.emailVerified ? (
                          <Badge variant="outline" className="gap-1">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <AlertCircle className="w-3 h-3 text-red-600" />
                            Not verified
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStuckReasonBadge(user.stuckReason)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {!user.emailVerified && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => performUserAction('resend_verification', user.id)}
                            disabled={actionLoading === 'resend_verification'}
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Resend Code
                          </Button>
                        )}
                        {user.emailVerified && !user.lastLogin && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => performUserAction('generate_login_link', user.id)}
                            disabled={actionLoading === 'generate_login_link'}
                          >
                            <LinkIcon className="w-3 h-3 mr-1" />
                            Login Link
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedUser(user)}
                        >
                          Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>
            Zie waar gebruikers afhaken in de customer journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Funnel visualization */}
            <div className="space-y-3">
              <FunnelStep
                label="Registratie"
                count={funnel.registered}
                total={funnel.registered}
                percentage={100}
                icon={<Users className="w-4 h-4" />}
              />
              <FunnelStep
                label="Email Geverifieerd"
                count={funnel.verifiedEmail}
                total={funnel.registered}
                percentage={conversionRates.registration_to_verification}
                icon={<Mail className="w-4 h-4" />}
                dropOff={dropOff.atVerification}
              />
              <FunnelStep
                label="Eerste Login"
                count={funnel.firstLogin}
                total={funnel.registered}
                percentage={Math.round((funnel.firstLogin / funnel.registered) * 100)}
                icon={<LogIn className="w-4 h-4" />}
                dropOff={dropOff.afterVerification}
              />
              <FunnelStep
                label="Onboarding Compleet"
                count={funnel.completedOnboarding}
                total={funnel.registered}
                percentage={Math.round((funnel.completedOnboarding / funnel.registered) * 100)}
                icon={<CheckCircle className="w-4 h-4" />}
                dropOff={dropOff.duringOnboarding}
              />
              <FunnelStep
                label="OTO Gezien"
                count={funnel.sawOTO}
                total={funnel.registered}
                percentage={Math.round((funnel.sawOTO / funnel.registered) * 100)}
                icon={<Activity className="w-4 h-4" />}
                dropOff={dropOff.beforeOTO}
              />
              <FunnelStep
                label="Betaalde Conversie"
                count={funnel.convertedPaid}
                total={funnel.registered}
                percentage={conversionRates.overall}
                icon={<Crown className="w-4 h-4" />}
                dropOff={dropOff.afterOTO}
                isLast
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Drop-off Analyse</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Bij verificatie</span>
                <Badge variant="destructive">{dropOff.atVerification}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Na verificatie</span>
                <Badge variant="destructive">{dropOff.afterVerification}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tijdens onboarding</span>
                <Badge variant="destructive">{dropOff.duringOnboarding}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Voor OTO</span>
                <Badge variant="destructive">{dropOff.beforeOTO}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Na OTO</span>
                <Badge variant="destructive">{dropOff.afterOTO}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">User Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Totaal gebruikers</span>
                <Badge>{metrics.totalUsers}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Actieve gebruikers</span>
                <Badge className="bg-green-100 text-green-800">{metrics.activeUsers}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Nooit ingelogd</span>
                <Badge variant="secondary">{metrics.neverLoggedIn}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Geverifieerd</span>
                <Badge className="bg-blue-100 text-blue-800">{metrics.verifiedUsers}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Niet geverifieerd</span>
                <Badge variant="destructive">{metrics.unverifiedUsers}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Groei Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Laatste 24 uur</span>
                <Badge className="bg-purple-100 text-purple-800">{metrics.users24h}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Laatste 7 dagen</span>
                <Badge className="bg-purple-100 text-purple-800">{metrics.users7d}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Laatste 30 dagen</span>
                <Badge className="bg-purple-100 text-purple-800">{metrics.users30d}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Onboarding compleet</span>
                <Badge className="bg-green-100 text-green-800">{metrics.completedOnboarding}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Betaalde users</span>
                <Badge className="bg-yellow-100 text-yellow-800">{metrics.paidUsers}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Gedetailleerde informatie en quick actions
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedUser.name || 'Geen naam'}</h3>
                <p className="text-gray-600">{selectedUser.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Aangemeld</p>
                  <p className="font-medium">
                    {new Date(selectedUser.createdAt).toLocaleString('nl-NL')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email Verified</p>
                  <p className="font-medium">
                    {selectedUser.emailVerified ? '✅ Ja' : '❌ Nee'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Login</p>
                  <p className="font-medium">
                    {selectedUser.lastLogin
                      ? new Date(selectedUser.lastLogin).toLocaleString('nl-NL')
                      : 'Nooit'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Onboarding</p>
                  <p className="font-medium">
                    {selectedUser.onboardingCompleted ? '✅ Compleet' : '⏳ In progress'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => performUserAction('resend_verification', selectedUser.id)}
                  variant="outline"
                  disabled={selectedUser.emailVerified}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Resend Verification
                </Button>
                <Button
                  onClick={() => performUserAction('generate_login_link', selectedUser.id)}
                  variant="outline"
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Generate Login Link
                </Button>
                <Button
                  onClick={() => performUserAction('verify_email', selectedUser.id)}
                  variant="outline"
                  disabled={selectedUser.emailVerified}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify Email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Funnel Step Component
function FunnelStep({
  label,
  count,
  total,
  percentage,
  icon,
  dropOff,
  isLast = false
}: {
  label: string;
  count: number;
  total: number;
  percentage: number;
  icon: React.ReactNode;
  dropOff?: number;
  isLast?: boolean;
}) {
  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium">{label}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {count} / {total}
              </span>
              <Badge className="bg-blue-100 text-blue-800">
                {percentage}%
              </Badge>
              {dropOff !== undefined && dropOff > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <TrendingDown className="w-3 h-3" />
                  -{dropOff}
                </Badge>
              )}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
      {!isLast && (
        <div className="ml-5 h-4 w-0.5 bg-gray-200 my-1" />
      )}
    </div>
  );
}
