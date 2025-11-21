# Podcast Upload Systeem - Gebruikershandleiding

## Introductie

Dit document beschrijft hoe u podcasts kunt uploaden en beheren in het admin paneel van de DatingAssistent applicatie. Het systeem is ontworpen om professioneel klinkende M4A-bestanden te accepteren die zijn gemaakt met NotebookLM.

## Database Setup

Voordat u het podcast systeem kunt gebruiken, moet u ervoor zorgen dat de database correct is geconfigureerd:

1. Maak een `.env.local` bestand in de hoofdmap van het project
2. Voeg de volgende regel toe aan het bestand:
   ```
   POSTGRES_URL=your_postgres_connection_string_here
   ```
3. Voer het database initialisatiescript uit:
   ```bash
   npm run init-db
   ```

## Toegang tot het Podcast Systeem

1. Log in op het admin paneel: [http://localhost:9002/admin](http://localhost:9002/admin)
2. Gebruik een van de toegestane admin e-mailadressen:
   - v_mun@hotmail.com
   - v.munster@weareimpact.nl
3. Na inloggen ziet u de admin dashboard met verschillende beheeropties

## Podcast Uploaden

1. Klik op de "🎙️ Podcasts" kaart op het admin dashboard
2. Vul de volgende velden in:
   - **Titel**: Een duidelijke titel voor uw podcast
   - **Beschrijving**: Een beschrijving van de inhoud van de podcast
   - **Audio Bestand**: Selecteer uw M4A-bestand (maximaal 100MB)
3. Controleer het voorbeeld van de audio
4. Klik op "Uploaden" om de podcast op te slaan

## Podcast Beheren

1. Klik op de "📋 Beheer Podcasts" kaart op het admin dashboard
2. U ziet een lijst van alle geüploade podcasts
3. Voor elke podcast kunt u:
   - De publicatiestatus wijzigen met de schakelaar
   - De podcast bewerken (nog te implementeren)
   - De podcast verwijderen

## Technische Details

### Ondersteunde Bestanden
- Alleen M4A-bestanden worden ondersteund
- Maximale bestandsgrootte: 100MB

### Database Structuur
Podcasts worden opgeslagen in de `podcasts` tabel met de volgende velden:
- `id`: Unieke identifier
- `title`: Titel van de podcast
- `description`: Beschrijving van de inhoud
- `file_url`: Locatie van het audiobestand
- `file_size`: Grootte van het bestand in bytes
- `duration`: Duur van de podcast in seconden
- `published`: Publicatiestatus (true/false)
- `published_at`: Datum van publicatie
- `created_at`: Aanmaakdatum
- `updated_at`: Laatst bijgewerkt

### API Endpoints
- `GET /api/admin/podcasts` - Haal alle podcasts op
- `POST /api/admin/podcasts` - Maak een nieuwe podcast aan
- `GET /api/admin/podcasts/[id]` - Haal een specifieke podcast op
- `PUT /api/admin/podcasts/[id]` - Werk een podcast bij
- `DELETE /api/admin/podcasts/[id]` - Verwijder een podcast
- `POST /api/admin/podcasts/[id]/publish` - Publiceer/depublish een podcast

## Toekomstige Verbeteringen

1. Integratie met Firebase Storage voor echte bestandsuploads
2. Automatische audio validatie
3. Audio transcodierung voor verschillende formaten
4. Ondersteuning voor podcast cover afbeeldingen
5. RSS feed generatie voor publieke distributie

## Probleemoplossing

### Database Connection Error
Als u een "500 Internal Server Error" krijgt bij het openen van de podcast beheerpagina:
1. Controleer of de `POSTGRES_URL` environment variable is ingesteld in `.env.local`
2. Controleer of de database server actief is
3. Voer het database initialisatiescript uit

### Problemen met Bestandsgrootte
Als u een "Bestand te groot" foutmelding krijgt:
- Comprimeer uw audiobestand met een tool zoals Audacity
- Verwijder stiltes aan het begin en einde van de opname
- Streef naar een bestandsgrootte onder 50MB voor optimale prestaties

### Problemen met Bestandstype
Als u een "Ongeldig bestandstype" foutmelding krijgt:
- Controleer of uw bestand de extensie .m4a heeft
- Exporteer uw NotebookLM podcast opnieuw met de juiste instellingen
- Gebruik een audio conversie tool als nodig

### Andere Problemen
Voor andere problemen:
1. Controleer de browser console op foutmeldingen (F12)
2. Controleer de server logs
3. Neem contact op met de ontwikkelaar