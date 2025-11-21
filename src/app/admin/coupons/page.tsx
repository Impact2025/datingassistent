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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

// Types
type PackageType = 'sociaal' | 'core' | 'pro' | 'premium';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError(null);
      setSuccess(null);
      
      // Validate form data
      if (!formData.code.trim()) {
        throw new Error('Coupon code is verplicht');
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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd MMM yyyy', { locale: nl });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Coupon Beheer</h1>
        <Button
          variant="outline"
          onClick={() => window.location.href = '/admin'}
        >
          ← Terug naar Admin
        </Button>
      </div>

      {/* Error and success messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="border-green-500 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Coupon Form */}
        <Card>
          <CardHeader>
            <CardTitle>Nieuwe Coupon Aanmaken</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="code">Coupon Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
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
                    <SelectItem value="sociaal">Sociaal</SelectItem>
                    <SelectItem value="core">Core</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
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

              <Button type="submit">Coupon Aanmaken</Button>
            </form>
          </CardContent>
        </Card>

        {/* Coupons List */}
        <Card>
          <CardHeader>
            <CardTitle>Bestaande Coupons</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Laden...</p>
            ) : error ? (
              <div className="text-center py-4">
                <p className="text-red-500">{error}</p>
                <Button onClick={fetchCoupons} className="mt-2">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Opnieuw proberen
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Pakket</TableHead>
                    <TableHead>Korting</TableHead>
                    <TableHead>Gebruikt</TableHead>
                    <TableHead>Geldig tot</TableHead>
                    <TableHead>Actief</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons && coupons.length > 0 ? (
                    coupons.map((coupon) => (
                      <TableRow key={coupon.id}>
                        <TableCell className="font-medium">{coupon.code}</TableCell>
                        <TableCell>
                          <span className="capitalize">{coupon.package_type}</span>
                        </TableCell>
                        <TableCell>
                          {coupon.discount_type === 'percentage' 
                            ? `${coupon.discount_value}%` 
                            : `€${coupon.discount_value}`}
                        </TableCell>
                        <TableCell>
                          {coupon.max_uses 
                            ? `${coupon.used_count}/${coupon.max_uses}` 
                            : `${coupon.used_count}/∞`}
                        </TableCell>
                        <TableCell>
                          {coupon.valid_until ? formatDate(coupon.valid_until) : 'Geen limiet'}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={coupon.is_active}
                            onCheckedChange={() => toggleCouponStatus(coupon.id, coupon.is_active)}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Geen coupons gevonden
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}