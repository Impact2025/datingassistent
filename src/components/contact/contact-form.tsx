'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NewsletterForm } from '@/components/newsletter/newsletter-form';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  Building,
  Calendar,
  ArrowRight,
  CheckCircle,
  Loader2
} from 'lucide-react';

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    privacy: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Er is een fout opgetreden');
      }

      setIsSubmitted(true);
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        privacy: false
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(error instanceof Error ? error.message : 'Er is een fout opgetreden. Probeer het opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: MessageCircle,
      title: "Live Chat Support",
      description: "Direct hulp via onze AI-chatbot",
      availability: "24/7 beschikbaar",
      action: "Start chat",
      href: "#chat",
      color: "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800"
    },
    {
      icon: Mail,
      title: "E-mail Support",
      description: "Stuur ons een bericht voor gedetailleerde hulp",
      availability: "Response < 24 uur",
      action: "E-mail sturen",
      href: "mailto:support@datingassistent.nl",
      color: "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800"
    }
  ];

  const businessInfo = {
    company: "WeAreImpact B.V.",
    address: "Heintje Hoeksteeg 11a",
    city: "1012 GR Amsterdam",
    country: "Nederland",
    kvk: "KVK: 70285888",
    btw: "BTW: NL858236369B01",
    email: "info@datingassistent.nl",
    phone: "+31 (0)6 - 144 709 77"
  };


  const offices = [
    {
      city: "Amsterdam",
      address: "Heintje Hoeksteeg 11a\n1012 GR Amsterdam",
      phone: "+31 (0)6 - 144 709 77",
      email: "info@datingassistent.nl"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Neem contact met ons op
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              We helpen je graag verder. Kies de manier die het beste bij je past.
            </p>

            {/* Quick Contact Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {contactMethods.map((method, index) => {
                const Icon = method.icon;
                return (
                  <Card key={index} className={`${method.color} border-2 hover:shadow-lg transition-all`}>
                    <CardContent className="p-6 text-center">
                      <Icon className="w-12 h-12 mx-auto mb-4 text-gray-700 dark:text-gray-300" />
                      <h3 className="font-semibold mb-2 dark:text-white">{method.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{method.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{method.availability}</p>
                      <Button
                        asChild
                        size="sm"
                        className="w-full"
                      >
                        <Link href={method.href}>
                          {method.action}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card className="p-8 dark:bg-gray-800">
                {isSubmitted ? (
                  <CardContent className="text-center py-12">
                    <CheckCircle className="w-16 h-16 mx-auto mb-6 text-green-500" />
                    <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Bedankt voor je bericht!</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      We hebben je bericht ontvangen en nemen zo snel mogelijk contact met je op.
                      Meestal reageren we binnen 24 uur.
                    </p>
                    <Button onClick={() => setIsSubmitted(false)} variant="outline">
                      Nog een bericht sturen
                    </Button>
                  </CardContent>
                ) : (
                  <>
                    <CardHeader>
                      <CardTitle className="text-2xl dark:text-white">Stuur ons een bericht</CardTitle>
                      <p className="text-gray-600 dark:text-gray-300">
                        Vul het formulier in en we nemen zo snel mogelijk contact met je op.
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Voornaam *</label>
                            <input
                              type="text"
                              name="firstName"
                              required
                              value={formData.firstName}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                              placeholder="Jouw voornaam"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Achternaam *</label>
                            <input
                              type="text"
                              name="lastName"
                              required
                              value={formData.lastName}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                              placeholder="Jouw achternaam"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 dark:text-gray-200">E-mailadres *</label>
                          <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                            placeholder="jouw@email.nl"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 dark:text-gray-200">Telefoonnummer</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                            placeholder="+31 6 1234 5678"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 dark:text-gray-200">Onderwerp *</label>
                          <select
                            name="subject"
                            required
                            value={formData.subject}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                          >
                            <option value="">Kies een onderwerp...</option>
                            <option value="support">Technische ondersteuning</option>
                            <option value="sales">Verkoop en abonnementen</option>
                            <option value="partnership">Partnership en samenwerkingen</option>
                            <option value="press">Pers en media</option>
                            <option value="feedback">Feedback en suggesties</option>
                            <option value="other">Anders</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 dark:text-gray-200">Bericht *</label>
                          <textarea
                            name="message"
                            rows={5}
                            required
                            value={formData.message}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
                            placeholder="Beschrijf je vraag of bericht zo gedetailleerd mogelijk..."
                          />
                        </div>

                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            id="privacy"
                            name="privacy"
                            required
                            checked={formData.privacy}
                            onChange={handleInputChange}
                            className="mt-1"
                          />
                          <label htmlFor="privacy" className="text-sm text-gray-600 dark:text-gray-300">
                            Ik accepteer de{' '}
                            <Link href="/privacyverklaring" className="text-blue-600 dark:text-blue-400 hover:underline">
                              privacyverklaring
                            </Link>
                            {' '}en ga akkoord met de verwerking van mijn gegevens.
                          </label>
                        </div>

                        <Button
                          type="submit"
                          className="w-full"
                          size="lg"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                              Bezig met verzenden...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 w-4 h-4" />
                              Bericht versturen
                            </>
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </>
                )}
              </Card>

              {/* Contact Information */}
              <div className="space-y-8">
                {/* Business Info */}
                <Card className="p-6 dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-white">
                      <Building className="w-5 h-5" />
                      Bedrijfsgegevens
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold dark:text-white">{businessInfo.company}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {businessInfo.address}<br />
                        {businessInfo.city}<br />
                        {businessInfo.country}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 text-sm dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span>{businessInfo.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span>{businessInfo.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">KVK:</span>
                        <span>{businessInfo.kvk}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">BTW:</span>
                        <span>{businessInfo.btw}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Office Locations */}
                <Card className="p-6 dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-white">
                      <MapPin className="w-5 h-5" />
                      Ons kantoor
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {offices.map((office, index) => (
                      <div key={index} className="space-y-3">
                        <div>
                          <h4 className="font-semibold dark:text-white">{office.city}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                            {office.address}
                          </p>
                        </div>

                        <div className="space-y-2 text-sm dark:text-gray-300">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span>{office.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span>{office.email}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Response Times */}
                <Card className="p-6 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 dark:text-blue-200">
                      <Clock className="w-5 h-5" />
                      Response tijden
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm dark:text-blue-100">Live Chat</span>
                      <span className="text-sm font-medium dark:text-blue-100">Direct</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm dark:text-blue-100">E-mail</span>
                      <span className="text-sm font-medium dark:text-blue-100">{"<"} 24 uur</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Newsletter & Social Proof */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Newsletter */}
              <Card className="p-6 dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">Blijf op de hoogte</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Ontvang updates over nieuwe features en dating tips
                  </p>
                </CardHeader>
                <CardContent>
                  <NewsletterForm source="contact-page" showIcon={true} />
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card className="p-6 dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">Snel naar hulp</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Vind snel wat je nodig hebt
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/help" className="flex items-center justify-between p-3 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-blue-600" />
                      <span className="text-sm dark:text-gray-200">Help Center</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Link>

                  <Link href="/faq" className="flex items-center justify-between p-3 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm dark:text-gray-200">Veelgestelde vragen</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Link>

                  <Link href="/status" className="flex items-center justify-between p-3 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <span className="text-sm dark:text-gray-200">Systeem status</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}