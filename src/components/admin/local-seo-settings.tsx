"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface LocalSEOSettings {
  businessName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  description: string;
  hours: BusinessHours[];
}

interface BusinessHours {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

export function LocalSEOSettings() {
  const [settings, setSettings] = useState<LocalSEOSettings>({
    businessName: "DatingAssistent",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
    email: "info@datingassistent.nl",
    description: "Jouw persoonlijke AI datingcoach die je helpt om sneller een echte match te vinden.",
    hours: [
      { day: "Maandag", open: "09:00", close: "17:00", closed: false },
      { day: "Dinsdag", open: "09:00", close: "17:00", closed: false },
      { day: "Woensdag", open: "09:00", close: "17:00", closed: false },
      { day: "Donderdag", open: "09:00", close: "17:00", closed: false },
      { day: "Vrijdag", open: "09:00", close: "17:00", closed: false },
      { day: "Zaterdag", open: "", close: "", closed: true },
      { day: "Zondag", open: "", close: "", closed: true },
    ]
  });

  const updateHours = (index: number, field: keyof BusinessHours, value: string | boolean) => {
    const newHours = [...settings.hours];
    newHours[index] = { ...newHours[index], [field]: value };
    setSettings({ ...settings, hours: newHours });
  };

  const saveSettings = () => {
    // In a real implementation, this would save to a database
    console.log("Saving local SEO settings:", settings);
    alert("Local SEO settings saved successfully!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Local SEO Settings</CardTitle>
        <CardDescription>
          Configure your business information for local search visibility
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              value={settings.businessName}
              onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
              placeholder="DatingAssistent"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              placeholder="+31 6 12345678"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              placeholder="info@datingassistent.nl"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input
              id="postalCode"
              value={settings.postalCode}
              onChange={(e) => setSettings({ ...settings, postalCode: e.target.value })}
              placeholder="1234 AB"
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              placeholder="Street name 123"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={settings.city}
              onChange={(e) => setSettings({ ...settings, city: e.target.value })}
              placeholder="Amsterdam"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Business Description</Label>
          <Textarea
            id="description"
            value={settings.description}
            onChange={(e) => setSettings({ ...settings, description: e.target.value })}
            placeholder="Describe your business for SEO purposes"
            rows={3}
          />
        </div>
        
        <div className="space-y-4">
          <Label>Business Hours</Label>
          <div className="space-y-3">
            {settings.hours.map((hour, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-24">
                  <span className="text-sm font-medium">{hour.day}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={hour.open}
                    onChange={(e) => updateHours(index, 'open', e.target.value)}
                    disabled={hour.closed}
                    className="w-24"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="time"
                    value={hour.close}
                    onChange={(e) => updateHours(index, 'close', e.target.value)}
                    disabled={hour.closed}
                    className="w-24"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`closed-${index}`}
                    checked={hour.closed}
                    onChange={(e) => updateHours(index, 'closed', e.target.checked)}
                    className="mr-2"
                  />
                  <Label htmlFor={`closed-${index}`} className="text-sm">
                    Closed
                  </Label>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <Button onClick={saveSettings}>Save Local SEO Settings</Button>
      </CardContent>
    </Card>
  );
}