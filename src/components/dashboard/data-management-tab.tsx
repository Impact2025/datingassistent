"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  Trash2,
  Edit3,
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  Lock,
  Unlock
} from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { useUser } from '@/providers/user-provider';

interface DataRequest {
  id: string;
  type: 'export' | 'delete' | 'modify';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: string;
  completedAt?: string;
  data?: any;
}

export function DataManagementTab() {
  const { user, userProfile } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [requests, setRequests] = useState<DataRequest[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteReason, setDeleteReason] = useState('');

  // Edit profile state
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    age: '',
    email: '',
    location: ''
  });

  useEffect(() => {
    if (userProfile) {
      setEditData({
        name: userProfile.name || '',
        age: userProfile.age?.toString() || '',
        email: user?.email || '',
        location: userProfile.location || ''
      });
    }
  }, [userProfile, user]);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const token = localStorage.getItem('datespark_auth_token');
      const response = await fetch('/api/data/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Failed to load requests:', error);
    }
  };

  const handleDataExport = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('datespark_auth_token');
      const response = await fetch('/api/data/export', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `datingassistent-data-${user?.id}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Reload requests to show the export request
        loadRequests();
      } else {
        alert('Er ging iets mis bij het exporteren van je data.');
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Er ging iets mis bij het exporteren van je data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (deleteConfirmation !== 'DELETE_MY_ACCOUNT') {
      alert('Type "DELETE_MY_ACCOUNT" om door te gaan.');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('datespark_auth_token');
      const response = await fetch('/api/data/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reason: deleteReason,
          confirmation: deleteConfirmation
        })
      });

      if (response.ok) {
        alert('Je account verwijderingsverzoek is ingediend. Je ontvangt een bevestigingsmail.');
        setShowDeleteConfirm(false);
        loadRequests();
      } else {
        const error = await response.json();
        alert(error.message || 'Er ging iets mis.');
      }
    } catch (error) {
      console.error('Deletion request failed:', error);
      alert('Er ging iets mis bij het indienen van je verzoek.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataModification = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('datespark_auth_token');
      const response = await fetch('/api/data/modify', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editData.name,
          age: parseInt(editData.age) || null,
          location: editData.location
        })
      });

      if (response.ok) {
        alert('Je gegevens zijn bijgewerkt.');
        setEditMode(false);
        loadRequests();
        // Reload page to show updated data
        window.location.reload();
      } else {
        alert('Er ging iets mis bij het bijwerken van je gegevens.');
      }
    } catch (error) {
      console.error('Modification failed:', error);
      alert('Er ging iets mis bij het bijwerken van je gegevens.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />In behandeling</Badge>;
      case 'processing':
        return <Badge variant="default"><LoadingSpinner />Verwerken</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Voltooid</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Mislukt</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'export':
        return 'Data Export';
      case 'delete':
        return 'Account Verwijdering';
      case 'modify':
        return 'Gegevens Wijziging';
      default:
        return type;
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
          <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Data & Privacy Beheer</h2>
          <p className="text-muted-foreground">
            Hier kun je al je persoonsgegevens beheren, exporteren of je account verwijderen.
            We nemen je privacy serieus en volgen de GDPR richtlijnen.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overzicht</TabsTrigger>
          <TabsTrigger value="export">Exporteren</TabsTrigger>
          <TabsTrigger value="modify">Wijzigen</TabsTrigger>
          <TabsTrigger value="delete">Verwijderen</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">

            {/* Personal Data Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Jouw Gegevens
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Naam:</span>
                    <span className="font-medium">{userProfile?.name || 'Niet ingesteld'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Email:</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Leeftijd:</span>
                    <span className="font-medium">{userProfile?.age || 'Niet ingesteld'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Locatie:</span>
                    <span className="font-medium">{userProfile?.location || 'Niet ingesteld'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Data Categorieën
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-sm">Persoonlijke gegevens</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-sm">AI context & voorkeuren</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-sm">Gebruiksstatistieken</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-sm">Communicatie logs</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Requests */}
          {requests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recente Verzoeken</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {requests.slice(0, 5).map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{getTypeLabel(request.type)}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(request.requestedAt).toLocaleDateString('nl-NL')}
                        </div>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Exporteer Jouw Data
              </CardTitle>
              <p className="text-muted-foreground">
                Download al je persoonsgegevens in JSON formaat (GDPR Artikel 20).
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  De export bevat: persoonlijke gegevens, AI context, doelen, voortgang,
                  activiteit logs en communicatie geschiedenis.
                </AlertDescription>
              </Alert>

              <div className="flex gap-4">
                <Button
                  onClick={handleDataExport}
                  disabled={isLoading}
                  className="gap-2"
                >
                  {isLoading ? <LoadingSpinner /> : <Download className="w-4 h-4" />}
                  Exporteer Data (JSON)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Modify Tab */}
        <TabsContent value="modify" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                Wijzig Jouw Gegevens
              </CardTitle>
              <p className="text-muted-foreground">
                Corrigeer of update je persoonlijke informatie (GDPR Artikel 16).
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Naam</Label>
                  <Input
                    id="name"
                    value={editData.name}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    disabled={!editMode}
                  />
                </div>
                <div>
                  <Label htmlFor="age">Leeftijd</Label>
                  <Input
                    id="age"
                    type="number"
                    value={editData.age}
                    onChange={(e) => setEditData({...editData, age: e.target.value})}
                    disabled={!editMode}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="location">Locatie</Label>
                  <Input
                    id="location"
                    value={editData.location}
                    onChange={(e) => setEditData({...editData, location: e.target.value})}
                    disabled={!editMode}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                {!editMode ? (
                  <Button onClick={() => setEditMode(true)} className="gap-2">
                    <Edit3 className="w-4 h-4" />
                    Bewerken
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => setEditMode(false)}
                      variant="outline"
                    >
                      Annuleren
                    </Button>
                    <Button
                      onClick={handleDataModification}
                      disabled={isLoading}
                      className="gap-2"
                    >
                      {isLoading ? <LoadingSpinner /> : <CheckCircle className="w-4 h-4" />}
                      Opslaan
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delete Tab */}
        <TabsContent value="delete" className="space-y-6">
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <Trash2 className="w-5 h-5" />
                Account Verwijderen
              </CardTitle>
              <p className="text-muted-foreground">
                Permanent verwijderen van je account en alle gegevens (GDPR Artikel 17).
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  <strong>Let op:</strong> Dit actie kan niet ongedaan gemaakt worden.
                  Na 30 dagen wordt je account permanent verwijderd.
                </AlertDescription>
              </Alert>

              {!showDeleteConfirm ? (
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="destructive"
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Account Verwijderen Aanvragen
                </Button>
              ) : (
                <div className="space-y-4 p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/10">
                  <div>
                    <Label htmlFor="confirmation">
                      Type <code className="bg-red-100 dark:bg-red-900 px-1 rounded">DELETE_MY_ACCOUNT</code> om te bevestigen:
                    </Label>
                    <Input
                      id="confirmation"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder="DELETE_MY_ACCOUNT"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="reason">Reden (optioneel)</Label>
                    <Textarea
                      id="reason"
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      placeholder="Waarom wil je je account verwijderen?"
                      className="mt-1"
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => setShowDeleteConfirm(false)}
                      variant="outline"
                    >
                      Annuleren
                    </Button>
                    <Button
                      onClick={handleAccountDeletion}
                      disabled={isLoading || deleteConfirmation !== 'DELETE_MY_ACCOUNT'}
                      variant="destructive"
                      className="gap-2"
                    >
                      {isLoading ? <LoadingSpinner /> : <Trash2 className="w-4 h-4" />}
                      Definitief Verwijderen
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}