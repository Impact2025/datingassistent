import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Heart, MessageSquare, Shield, Users, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function CommunityGuidelines() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">Community Guidelines</h1>
        <p className="text-muted-foreground text-lg">
          Samen bouwen we aan een respectvolle en behulpzame dating community
        </p>
      </div>

      {/* Inleiding */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Welkom bij DatingAssistent Community
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Onze community is een veilige plek waar mensen met dating vragen terecht kunnen.
            We geloven dat iedereen recht heeft op liefde en verbinding, en helpen elkaar daarbij.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">Samen Sterk</h3>
              <p className="text-sm text-muted-foreground">Elkaar helpen groeien</p>
            </div>
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">Veilig & Vertrouwd</h3>
              <p className="text-sm text-muted-foreground">Respect voor iedereen</p>
            </div>
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <MessageSquare className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">Eerlijk & Open</h3>
              <p className="text-sm text-muted-foreground">Authentieke gesprekken</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gedrag Regels */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Doe Dit: Respectvol Gedrag
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold">Wees Respectvol</h4>
                <p className="text-muted-foreground">Behandel anderen zoals je zelf behandeld wilt worden. Respecteer ieders achtergrond, leeftijd, uiterlijk en ervaringen.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold">Deel Persoonlijke Ervaringen</h4>
                <p className="text-muted-foreground">Deel je eigen verhalen om anderen te helpen. Wees eerlijk over je ervaringen, zowel successen als uitdagingen.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold">Geef Constructieve Feedback</h4>
                <p className="text-muted-foreground">Als je advies geeft, doe dit op een behulpzame manier. Focus op oplossingen in plaats van problemen.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold">Wees Actief & Betrokken</h4>
                <p className="text-muted-foreground">Reageer op berichten, stel vragen en bouw mee aan discussies. Een levendige community helpt iedereen.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Niet Toegestaan */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            Niet Toegestaan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold">Discriminatie & Haat</h4>
                <p className="text-muted-foreground">Geen discriminatie op basis van ras, religie, leeftijd, uiterlijk, handicap, seksuele voorkeur of andere persoonlijke kenmerken.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold">Spam & Reclame</h4>
                <p className="text-muted-foreground">Geen ongewenste reclame, spam berichten of het delen van commerciële links zonder toestemming.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold">Ongepaste Inhoud</h4>
                <p className="text-muted-foreground">Geen expliciete inhoud, geweld, bedreigingen of ander materiaal dat als schadelijk wordt beschouwd.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold">Misleidende Informatie</h4>
                <p className="text-muted-foreground">Deel alleen accurate informatie. Als je onzeker bent over iets, geef dit aan.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold">Nep Accounts</h4>
                <p className="text-muted-foreground">Gebruik je echte naam en foto. Nep accounts worden verwijderd.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Moderatie */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Moderatie & Sanctions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              We handhaven deze regels actief om een veilige community te behouden.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">Eerste Overtreding</h4>
                <p className="text-sm text-orange-700 dark:text-orange-300">Privé waarschuwing met uitleg van de overtreding</p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Herhaalde Overtredingen</h4>
                <p className="text-sm text-red-700 dark:text-red-300">Tijdelijke ban of permanente verwijdering</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Report functie:</strong> Zie je iets dat niet klopt? Gebruik de report knop bij berichten.
                Moderators bekijken alle reports binnen 24 uur.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Specifieke Dating Adviezen */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Dating Specifieke Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Veilig Datenn</h4>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• Deel locatie pas bij eerste ontmoeting</li>
                <li>• Neem eigen vervoer naar dates</li>
                <li>• Vertel iemand waar je bent</li>
                <li>• Vertrouw op je gevoel</li>
              </ul>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Profiel Tips</h4>
              <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                <li>• Wees authentiek in je profiel</li>
                <li>• Gebruik recente, duidelijke foto's</li>
                <li>• Schrijf een persoonlijke bio</li>
                <li>• Wees specifiek over wat je zoekt</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Deze guidelines zorgen ervoor dat onze community een plek blijft waar iedereen zich veilig voelt om vragen te stellen en ervaringen te delen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/community/forum">
                <Badge variant="secondary" className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                  Naar Forum
                </Badge>
              </Link>
              <Link href="/contact">
                <Badge variant="outline" className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                  Contact Moderators
                </Badge>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}