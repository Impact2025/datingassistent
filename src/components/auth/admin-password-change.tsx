"use client";

import { useState } from "react";
import { useUser } from "@/providers/user-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "../shared/loading-spinner";
import { Lock, CheckCircle, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Huidig wachtwoord is vereist"),
  newPassword: z.string()
    .min(8, "Nieuw wachtwoord moet minimaal 8 karakters bevatten")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Wachtwoord moet minimaal 1 kleine letter, 1 hoofdletter en 1 cijfer bevatten"),
  confirmPassword: z.string().min(1, "Wachtwoord bevestiging is vereist"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Wachtwoorden komen niet overeen",
  path: ["confirmPassword"],
});

type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;

export function AdminPasswordChange() {
  const { user } = useUser();
  const { toast } = useToast();
  const [isChanging, setIsChanging] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: PasswordChangeFormValues) => {
    if (!user?.id) return;

    setIsChanging(true);
    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to change password');
      }

      const result = await response.json();

      // Clear form
      form.reset();

      // Show success message
      setShowSuccess(true);
      toast({
        title: "Wachtwoord Gewijzigd",
        description: "Uw admin wachtwoord is succesvol gewijzigd",
      });

      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);

    } catch (error: any) {
      toast({
        title: "Wachtwoord Wijzigen Mislukt",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsChanging(false);
    }
  };

  if (showSuccess) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-green-700">
            <CheckCircle className="h-8 w-8" />
            <div>
              <h3 className="font-semibold">Wachtwoord Gewijzigd!</h3>
              <p className="text-sm">Uw admin wachtwoord is succesvol bijgewerkt.</p>
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
          <Lock className="h-5 w-5" />
          Wachtwoord Wijzigen
        </CardTitle>
        <CardDescription>
          Wijzig uw admin wachtwoord voor betere beveiliging
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 border rounded-lg bg-blue-50">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Wachtwoord Vereisten:</p>
                <ul className="text-blue-700 mt-1 space-y-1">
                  <li>• Minimaal 8 karakters</li>
                  <li>• Minimaal 1 kleine letter</li>
                  <li>• Minimaal 1 hoofdletter</li>
                  <li>• Minimaal 1 cijfer</li>
                </ul>
              </div>
            </div>

            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Huidig Wachtwoord</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="********"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nieuw Wachtwoord</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="********"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wachtwoord Bevestigen</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="********"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isChanging}
              className="w-full"
            >
              {isChanging && <LoadingSpinner className="mr-2" />}
              Wachtwoord Wijzigen
            </Button>
          </CardContent>
        </form>
      </Form>
    </Card>
  );
}