"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUser } from "@/providers/user-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from "@/lib/types";
import { GENDERS, SEEKING_GENDERS, RELATIONSHIP_TYPES, IDENTITY_GROUPS } from "@/lib/types";
import { useEffect } from "react";
import { useRecaptchaV3 } from "../shared/recaptcha";


const profileSchema = z.object({
    name: z.string().min(2, "Naam moet minimaal 2 karakters lang zijn."),
    age: z.coerce.number().min(18, "Je moet minimaal 18 jaar zijn.").max(99, "Leeftijd lijkt ongeldig."),
    gender: z.string({ required_error: "Selecteer een gender." }),
    location: z.string().min(2, "Locatie is vereist."),
    seekingGender: z.array(z.string()).refine((value) => value.some((item) => item), {
      message: "Je moet minimaal één optie selecteren.",
    }),
    seekingAgeMin: z.coerce.number().min(18, "Minimumleeftijd moet 18 zijn."),
    seekingAgeMax: z.coerce.number().max(99, "Maximumleeftijd lijkt ongeldig."),
    seekingType: z.string({ required_error: "Selecteer een relatietype." }),
    identityGroup: z.string().optional().default("algemeen"),
  }).refine((data) => data.seekingAgeMax >= data.seekingAgeMin, {
    message: "Maximumleeftijd moet hoger zijn dan minimumleeftijd.",
    path: ["seekingAgeMax"],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;

interface SettingsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ isOpen, onOpenChange }: SettingsModalProps) {
  const { userProfile, updateProfile } = useUser();
  const { toast } = useToast();

  // reCAPTCHA v3 hook
  const { execute: executeRecaptcha, isLoaded: isRecaptchaLoaded } = useRecaptchaV3(
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''
  );

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: userProfile || {},
  });
  
  useEffect(() => {
    if (isOpen && userProfile) {
      form.reset(userProfile);
    }
  }, [isOpen, userProfile, form]);

  async function onSubmit(data: ProfileFormValues) {
    // Verify reCAPTCHA
    if (!isRecaptchaLoaded) {
      toast({
        title: "Fout",
        description: "reCAPTCHA wordt nog geladen. Probeer het opnieuw.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Execute reCAPTCHA v3
      const recaptchaToken = await executeRecaptcha('update-profile');
      if (!recaptchaToken) {
        toast({
          title: "Fout",
          description: "reCAPTCHA verificatie mislukt. Probeer het opnieuw.",
          variant: "destructive",
        });
        return;
      }

      // Verify token on server
      const verifyResponse = await fetch('/api/recaptcha/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: recaptchaToken, action: 'update-profile' }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        toast({
          title: "Fout",
          description: errorData.error || "reCAPTCHA verificatie mislukt.",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ reCAPTCHA verification successful');

      // Update profile
      updateProfile(data as UserProfile);
      toast({
        title: "Success",
        description: "Je profiel is bijgewerkt.",
        variant: "default"
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het bijwerken van je profiel.",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Instellingen</DialogTitle>
          <DialogDescription>Pas hier je basisgegevens aan.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-6 py-4">
              <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Naam / Roepnaam</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Leeftijd</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Ik identificeer me als</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value || ''} className="flex flex-wrap gap-x-4 gap-y-2">
                          {GENDERS.map(g => (
                            <FormItem key={g} className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value={g} />
                              </FormControl>
                              <FormLabel className="font-normal">{g}</FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waar woon je (stad/regio)?</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="seekingGender"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Ik ben op zoek naar</FormLabel>
                      </div>
                      {SEEKING_GENDERS.map((item) => (
                        <FormField
                          key={item}
                          control={form.control}
                          name="seekingGender"
                          render={({ field }) => {
                            return (
                              <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0 mb-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), item])
                                        : field.onChange(field.value?.filter((value) => value !== item));
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">{item}</FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name="seekingAgeMin"
                    render={({ field }) => (
                      <FormItem className="w-1/2">
                        <FormLabel>Min. leeftijd</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="seekingAgeMax"
                    render={({ field }) => (
                      <FormItem className="w-1/2">
                        <FormLabel>Max. leeftijd</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <FormField
                  control={form.control}
                  name="seekingType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Type relatie</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value || ''} className="flex flex-wrap gap-x-4 gap-y-2">
                          {RELATIONSHIP_TYPES.map(g => (
                            <FormItem key={g} className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value={g} />
                              </FormControl>
                              <FormLabel className="font-normal capitalize">{g.replace('een ', '').replace('iets ', '')}</FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="identityGroup"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Doelgroep / Identiteit</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value || ''} className="flex flex-wrap gap-x-4 gap-y-2">
                          {IDENTITY_GROUPS.map(g => (
                            <FormItem key={g} className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value={g} />
                              </FormControl>
                              <FormLabel className="font-normal capitalize">{g === 'algemeen' ? 'Geen voorkeur' : g}</FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>
            <DialogFooter className="pt-6">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Annuleren
                </Button>
              </DialogClose>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">Wijzigingen Opslaan</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
