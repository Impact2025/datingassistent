"use client";

import { useState } from "react";
import { useUser } from "@/providers/user-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "../shared/loading-spinner";
import { Shield, Smartphone, CheckCircle, AlertTriangle } from "lucide-react";

export function Admin2FASetup() {
  const { user } = useUser();
  const { toast } = useToast();
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [step, setStep] = useState<'setup' | 'verify' | 'success'>('setup');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [token, setToken] = useState<string>('');

  const startSetup = async () => {
    if (!user?.id) return;

    setIsSettingUp(true);
    try {
      const response = await fetch('/api/admin/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to setup 2FA');
      }

      const data = await response.json();
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setStep('verify');

      toast({
        title: "2FA Setup Started",
        description: "Scan the QR code with your authenticator app",
      });
    } catch (error: any) {
      toast({
        title: "Setup Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSettingUp(false);
    }
  };

  const verifySetup = async () => {
    if (!user?.id || !token) return;

    setIsVerifying(true);
    try {
      const response = await fetch('/api/admin/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, token })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to verify 2FA');
      }

      setStep('success');
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been successfully enabled for your admin account",
      });

      // Refresh the page to update the admin status
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (step === 'success') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-green-700">
            <CheckCircle className="h-8 w-8" />
            <div>
              <h3 className="font-semibold">2FA Successfully Enabled!</h3>
              <p className="text-sm">Your admin account is now protected with two-factor authentication.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication (2FA)
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your admin account with 2FA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'setup' && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 border rounded-lg bg-blue-50">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Recommended for Admin Accounts</p>
                <p className="text-blue-700 mt-1">
                  2FA adds an extra layer of security by requiring a code from your authenticator app
                  in addition to your password when logging in.
                </p>
              </div>
            </div>

            <Button onClick={startSetup} disabled={isSettingUp} className="w-full">
              {isSettingUp && <LoadingSpinner className="mr-2" />}
              <Smartphone className="h-4 w-4 mr-2" />
              Enable 2FA
            </Button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
              {qrCode && (
                <div className="inline-block p-4 bg-white border rounded-lg">
                  <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Can't scan? Manual entry code: <code className="bg-gray-100 px-1 rounded">{secret}</code>
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Enter 6-digit code from your app:</label>
              <Input
                type="text"
                placeholder="000000"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-2xl tracking-widest"
                maxLength={6}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setStep('setup')}
                variant="outline"
                className="flex-1"
                disabled={isVerifying}
              >
                Back
              </Button>
              <Button
                onClick={verifySetup}
                disabled={isVerifying || token.length !== 6}
                className="flex-1"
              >
                {isVerifying && <LoadingSpinner className="mr-2" />}
                Verify & Enable
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}