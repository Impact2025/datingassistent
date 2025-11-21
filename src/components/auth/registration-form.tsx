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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GENDERS, SEEKING_GENDERS, RELATIONSHIP_TYPES, IDENTITY_GROUPS } from "@/lib/types";
import { LoadingSpinner } from "../shared/loading-spinner";

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

interface RegistrationFormProps {
  defaultName?: string;
  onComplete?: () => void;
}

export function RegistrationForm({ defaultName, onComplete }: RegistrationFormProps) {
  const { updateProfile, isUpdatingProfile } = useUser();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: defaultName || "",
      age: 18,
      gender: undefined,
      location: "",
      seekingGender: [],
      seekingAgeMin: 18,
      seekingAgeMax: 99,
      seekingType: undefined,
      identityGroup: "algemeen"
    },
  });

  function onSubmit(data: ProfileFormValues) {
    updateProfile(data);
    // Call onComplete callback if provided (for onboarding flow)
    if (onComplete) {
      onComplete();
    }
    // Note: UserProvider will still handle the redirect to /onboarding for non-onboarding flows
  }

  return (
    <Card className="w-full max-w-2xl bg-card/50 shadow-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Vertel iets over jezelf</CardTitle>
        <CardDescription className="text-sm">Deze gegevens gebruiken we alleen voor je coaching en om de AI direct relevant te maken.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="pt-0">
            <ScrollArea className="h-[45vh] pr-4">
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Naam / Roepnaam</FormLabel>
                      <FormControl>
                        <Input placeholder="Hoe wil je genoemd worden?" {...field} />
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
                      <FormLabel className="text-sm">Leeftijd</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="bv. 28" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm">Ik identificeer me als</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-wrap gap-x-3 gap-y-1">
                          {GENDERS.map(g => (
                            <FormItem key={g} className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value={g} />
                              </FormControl>
                              <FormLabel className="font-normal text-sm">{g}</FormLabel>
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
                      <FormLabel className="text-sm">Waar woon je (stad/regio)?</FormLabel>
                      <FormControl>
                        <Input placeholder="bv. Amsterdam" {...field} />
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
                      <div className="mb-3">
                        <FormLabel className="text-sm">Ik ben op zoek naar</FormLabel>
                      </div>
                      {SEEKING_GENDERS.map((item) => (
                        <FormField
                          key={item}
                          control={form.control}
                          name="seekingGender"
                          render={({ field }) => {
                            return (
                              <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0 mb-1">
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
                                <FormLabel className="font-normal text-sm">{item}</FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-end gap-2">
                  <FormField
                    control={form.control}
                    name="seekingAgeMin"
                    render={({ field }) => (
                      <FormItem className="w-1/2">
                        <FormLabel className="text-sm">Min. leeftijd</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="18" {...field} />
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
                        <FormLabel className="text-sm">Max. leeftijd</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="99" {...field} />
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
                     <FormItem className="space-y-2">
                       <FormLabel className="text-sm">Type relatie</FormLabel>
                       <FormControl>
                         <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-wrap gap-x-3 gap-y-1">
                           {RELATIONSHIP_TYPES.map(g => (
                             <FormItem key={g} className="flex items-center space-x-2 space-y-0">
                               <FormControl>
                                 <RadioGroupItem value={g} />
                               </FormControl>
                               <FormLabel className="font-normal text-sm capitalize">{g.replace('een ', '').replace('iets ', '')}</FormLabel>
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
                     <FormItem className="space-y-2">
                       <FormLabel className="text-sm">Doelgroep / Identiteit (optioneel)</FormLabel>
                       <FormControl>
                         <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-wrap gap-x-3 gap-y-1">
                           {IDENTITY_GROUPS.map(g => (
                             <FormItem key={g} className="flex items-center space-x-2 space-y-0">
                               <FormControl>
                                 <RadioGroupItem value={g} />
                               </FormControl>
                               <FormLabel className="font-normal text-sm capitalize">{g === 'algemeen' ? 'Geen voorkeur' : g}</FormLabel>
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
          </CardContent>
          <CardFooter>
            <Button type="submit" size="lg" className="w-full bg-green-600 hover:bg-green-700" disabled={isUpdatingProfile}>
              {isUpdatingProfile ? <LoadingSpinner /> : "Profiel Opslaan & Starten"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
