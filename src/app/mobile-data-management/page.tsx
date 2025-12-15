"use client";

import { Suspense } from 'react';



import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { useUser } from '@/providers/user-provider';
import {
  ArrowLeft,
  Shield,
  Download,
  Edit3,
  Trash2,
  AlertTriangle,
  CheckCircle,
  FileText,
  Eye,
  Lock
} from 'lucide-react';

function MobileDataManagementPageContent() {
  const router = useRouter();
  const { user, userProfile } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
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
        alert('Je data is succesvol gedownload!');
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
        router.push('/login');
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Data & Privacy</h1>
            <p className="text-sm text-gray-600">Beheer je gegevens</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex gap-1">
          {[
            { id: 'overview', label: 'Overzicht' },
            { id: 'export', label: 'Exporteren' },
            { id: 'modify', label: 'Wijzigen' },
            { id: 'delete', label: 'Verwijderen' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-pink-100 text-pink-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Personal Data Overview */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Eye className="w-5 h-5" />
                  Jouw Gegevens
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Naam:</span>
                  <span className="font-medium">{userProfile?.name || 'Niet ingesteld'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Leeftijd:</span>
                  <span className="font-medium">{userProfile?.age || 'Niet ingesteld'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-600">Locatie:</span>
                  <span className="font-medium">{userProfile?.location || 'Niet ingesteld'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Data Categories */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5" />
                  Data Categorieën
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  'Persoonlijke gegevens',
                  'AI context & voorkeuren',
                  'Gebruiksstatistieken',
                  'Communicatie logs'
                ].map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm">{category}</span>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'export' && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Download className="w-5 h-5" />
                Exporteer Jouw Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  Download al je persoonsgegevens in JSON formaat (GDPR Artikel 20).
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleDataExport}
                disabled={isLoading}
                className="w-full gap-2"
              >
                {isLoading ? <LoadingSpinner /> : <Download className="w-4 h-4" />}
                Exporteer Data (JSON)
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === 'modify' && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Edit3 className="w-5 h-5" />
                Wijzig Jouw Gegevens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Naam</Label>
                  <Input
                    id="name"
                    value={editData.name}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    disabled={!editMode}
                    className="mt-1"
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
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Locatie</Label>
                  <Input
                    id="location"
                    value={editData.location}
                    onChange={(e) => setEditData({...editData, location: e.target.value})}
                    disabled={!editMode}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                {!editMode ? (
                  <Button onClick={() => setEditMode(true)} className="flex-1 gap-2">
                    <Edit3 className="w-4 h-4" />
                    Bewerken
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => setEditMode(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Annuleren
                    </Button>
                    <Button
                      onClick={handleDataModification}
                      disabled={isLoading}
                      className="flex-1 gap-2"
                    >
                      {isLoading ? <LoadingSpinner /> : <CheckCircle className="w-4 h-4" />}
                      Opslaan
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'delete' && (
          <Card className="border-red-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 text-lg">
                <Trash2 className="w-5 h-5" />
                Account Verwijderen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Dit actie kan niet ongedaan gemaakt worden. Na 30 dagen wordt je account permanent verwijderd.
                </AlertDescription>
              </Alert>

              {!showDeleteConfirm ? (
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full gap-2 bg-red-500 hover:bg-red-600 text-white"
                >
                  <Trash2 className="w-4 h-4" />
                  Account Verwijderen Aanvragen
                </Button>
              ) : (
                <div className="space-y-4 p-4 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <Label htmlFor="confirmation">
                      Type <code className="bg-red-100 px-1 rounded">DELETE_MY_ACCOUNT</code> om te bevestigen:
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
                    <Input
                      id="reason"
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      placeholder="Waarom wil je je account verwijderen?"
                      className="mt-1"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowDeleteConfirm(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Annuleren
                    </Button>
                    <Button
                      onClick={handleAccountDeletion}
                      disabled={isLoading || deleteConfirmation !== 'DELETE_MY_ACCOUNT'}
                      className="flex-1 gap-2 bg-red-500 hover:bg-red-600 text-white disabled:bg-red-300"
                    >
                      {isLoading ? <LoadingSpinner /> : <Trash2 className="w-4 h-4" />}
                      Definitief Verwijderen
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
export default function MobileDataManagementPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
      </div>
    }>
      <MobileDataManagementPageContent />
    </Suspense>
  );
}
