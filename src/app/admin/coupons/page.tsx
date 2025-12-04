"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Ticket,
  TrendingUp,
  Users,
  Calendar,
  Plus,
  Search,
  Download,
  Filter,
  Trash2
} from 'lucide-react';

// Types
type PackageType = 'sociaal' | 'core' | 'pro' | 'premium' | 'kickstart' | 'transformatie' | 'vip';
type DiscountType = 'percentage' | 'fixed';

interface Coupon {
  id: number;
  code: string;
  package_type: PackageType;
  discount_type: DiscountType;
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    package_type: 'core' as PackageType,
    discount_type: 'percentage' as DiscountType,
    discount_value: 10,
    max_uses: '',
    valid_until: '',
    is_active: true
  });

  // Fetch coupons
  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('Fetching coupons...');
      const response = await fetch('/api/admin/coupons');
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('Error data:', errorData);
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }
      
      const data = await response.json();
      console.log('Coupons data received:', data);
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setCoupons(data);
      } else {
        console.warn('Unexpected data format:', data);
        setCoupons([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      setError('Fout bij het ophalen van coupons: ' + (error as Error).message);
      setCoupons([]);
      setLoading(false);
    }
  };

  const checkCouponCodeExists = async (code: string): Promise<boolean> => {
    try {
      const existingCoupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
      return !!existingCoupon;
    } catch (error) {
      console.error('Error checking coupon code:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError(null);
      setSuccess(null);

      // Validate form data
      if (!formData.code.trim()) {
        throw new Error('Coupon code is verplicht');
      }

      // Check if coupon code already exists
      const codeExists = await checkCouponCodeExists(formData.code.trim());
      if (codeExists) {
        throw new Error('Deze coupon code bestaat al. Kies een unieke code.');
      }

      if (formData.discount_value <= 0) {
        throw new Error('Kortingswaarde moet groter zijn dan 0');
      }
      
      const response = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Fout bij het aanmaken van de coupon');
      }
      
      setSuccess('Coupon succesvol aangemaakt!');
      fetchCoupons();
      
      // Reset form
      setFormData({
        code: '',
        package_type: 'core',
        discount_type: 'percentage',
        discount_value: 10,
        max_uses: '',
        valid_until: '',
        is_active: true
      });
    } catch (error) {
      console.error('Error creating coupon:', error);
      setError('Fout bij het aanmaken van de coupon: ' + (error as Error).message);
    }
  };

  const toggleCouponStatus = async (id: number, currentStatus: boolean) => {
    try {
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Fout bij het bijwerken van de coupon');
      }

      setSuccess('Coupon status succesvol bijgewerkt!');
      fetchCoupons();
    } catch (error) {
      console.error('Error updating coupon:', error);
      setError('Fout bij het bijwerken van de coupon: ' + (error as Error).message);
    }
  };

  const deleteCoupon = async (id: number, code: string) => {
    if (!confirm(`Weet je zeker dat je coupon "${code}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`)) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Fout bij het verwijderen van de coupon');
      }

      setSuccess('Coupon succesvol verwijderd!');
      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      setError('Fout bij het verwijderen van de coupon: ' + (error as Error).message);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd MMM yyyy', { locale: nl });
  };

  // Calculate stats
  const stats = {
    totalCoupons: coupons.length,
    activeCoupons: coupons.filter(c => c.is_active).length,
    totalUsed: coupons.reduce((sum, c) => sum + c.used_count, 0),
    expiringThisMonth: coupons.filter(c => {
      if (!c.valid_until) return false;
      const expiry = new Date(c.valid_until);
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return expiry <= nextMonth && expiry >= now;
    }).length
  };

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Coupon Beheer
          </h1>
          <p className="text-gray-600 mt-2">Beheer kortingscodes en promoties voor je pakketten</p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => window.location.href = '/admin'}
        >
          ← Terug
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Totaal Coupons</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCoupons}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Ticket className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Actieve Coupons</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeCoupons}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Totaal Gebruikt</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsed}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verloopt Deze Maand</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.expiringThisMonth}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error and success messages */}
      {error && (
        <Alert variant="destructive" className="shadow-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-50 text-green-800 shadow-lg">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Coupon Form */}
        <Card className="lg:col-span-1 shadow-lg hover:shadow-xl transition-shadow border-t-4 border-t-blue-500">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nieuwe Coupon
            </CardTitle>
            <CardDescription>Maak een nieuwe kortingscode aan</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="code">Coupon Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => {
                    setFormData({...formData, code: e.target.value.toUpperCase()});
                    // Clear error when user starts typing
                    if (error && error.includes('coupon code bestaat al')) {
                      setError(null);
                    }
                  }}
                  onBlur={async (e) => {
                    const code = e.target.value.trim();
                    if (code) {
                      const exists = await checkCouponCodeExists(code);
                      if (exists) {
                        setError('Deze coupon code bestaat al. Kies een unieke code.');
                      } else {
                        setError(null);
                      }
                    }
                  }}
                  placeholder="Bijv. KORTING10"
                  required
                />
              </div>

              <div>
                <Label htmlFor="package_type">Pakket</Label>
                <Select
                  value={formData.package_type}
                  onValueChange={(value) => setFormData({...formData, package_type: value as PackageType})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sociaal">Sociaal (abonnement)</SelectItem>
                    <SelectItem value="core">Core (abonnement)</SelectItem>
                    <SelectItem value="pro">Pro (abonnement)</SelectItem>
                    <SelectItem value="premium">Premium (abonnement)</SelectItem>
                    <SelectItem value="kickstart">Kickstart (programma)</SelectItem>
                    <SelectItem value="transformatie">Transformatie (programma)</SelectItem>
                    <SelectItem value="vip">VIP Reis (programma)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount_type">Kortingstype</Label>
                  <Select 
                    value={formData.discount_type} 
                    onValueChange={(value) => setFormData({...formData, discount_type: value as DiscountType})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Vast Bedrag (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="discount_value">
                    {formData.discount_type === 'percentage' ? 'Percentage (%)' : 'Bedrag (€)'}
                  </Label>
                  <Input
                    id="discount_value"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({...formData, discount_value: parseFloat(e.target.value) || 0})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="max_uses">Max Gebruik (laat leeg voor onbeperkt)</Label>
                <Input
                  id="max_uses"
                  type="number"
                  min="1"
                  value={formData.max_uses}
                  onChange={(e) => setFormData({...formData, max_uses: e.target.value})}
                  placeholder="Bijv. 100"
                />
              </div>

              <div>
                <Label htmlFor="valid_until">Vervaldatum (optioneel)</Label>
                <Input
                  id="valid_until"
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label htmlFor="is_active">Actief</Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Coupon Aanmaken
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Coupons List */}
        <Card className="lg:col-span-2 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  Bestaande Coupons
                </CardTitle>
                <CardDescription>Overzicht van alle kortingscodes</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchCoupons}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Vernieuwen
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Laden...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchCoupons} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Opnieuw proberen
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Code</TableHead>
                      <TableHead className="font-semibold">Pakket</TableHead>
                      <TableHead className="font-semibold">Korting</TableHead>
                      <TableHead className="font-semibold">Gebruikt</TableHead>
                      <TableHead className="font-semibold">Geldig tot</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Acties</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coupons && coupons.length > 0 ? (
                      coupons.map((coupon) => (
                        <TableRow
                          key={coupon.id}
                          className="hover:bg-blue-50/50 transition-colors"
                        >
                          <TableCell className="font-mono font-semibold">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-blue-100 rounded">
                                <Ticket className="h-4 w-4 text-blue-600" />
                              </div>
                              {coupon.code}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`
                              inline-flex px-3 py-1 rounded-full text-xs font-medium
                              ${coupon.package_type === 'premium' ? 'bg-purple-100 text-purple-700' :
                                coupon.package_type === 'pro' ? 'bg-blue-100 text-blue-700' :
                                coupon.package_type === 'core' ? 'bg-green-100 text-green-700' :
                                coupon.package_type === 'sociaal' ? 'bg-orange-100 text-orange-700' :
                                coupon.package_type === 'kickstart' ? 'bg-red-100 text-red-700' :
                                coupon.package_type === 'transformatie' ? 'bg-pink-100 text-pink-700' :
                                coupon.package_type === 'vip' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'}
                            `}>
                              {coupon.package_type === 'sociaal' ? 'SOCIAAL' :
                               coupon.package_type === 'kickstart' ? 'KICKSTART' :
                               coupon.package_type === 'transformatie' ? 'TRANSFORMATIE' :
                               coupon.package_type === 'vip' ? 'VIP' :
                               coupon.package_type.toUpperCase()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                              {coupon.discount_type === 'percentage'
                                ? `${coupon.discount_value}%`
                                : `€${coupon.discount_value}`}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`
                                w-2 h-2 rounded-full
                                ${coupon.max_uses && coupon.used_count >= coupon.max_uses
                                  ? 'bg-red-500'
                                  : 'bg-green-500'}
                              `} />
                              <span className="font-medium">
                                {coupon.max_uses
                                  ? `${coupon.used_count}/${coupon.max_uses}`
                                  : `${coupon.used_count}/∞`}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {coupon.valid_until ? formatDate(coupon.valid_until) : 'Geen limiet'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={coupon.is_active}
                              onCheckedChange={() => toggleCouponStatus(coupon.id, coupon.is_active)}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteCoupon(coupon.id, coupon.code)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">Geen coupons gevonden</p>
                          <p className="text-sm text-gray-400 mt-2">Maak je eerste coupon aan om te beginnen</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}