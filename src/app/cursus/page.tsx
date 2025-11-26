import { CursusOverzicht } from '@/components/cursus/CursusOverzicht';
import { IrisFloatingButton } from '@/components/iris/IrisFloatingButton';

export default function CursusPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Dating Cursussen
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Leer de psychologie van aantrekkelijke profielen, effectieve gesprekken en succesvolle dates.
            Van beginner naar dating expert.
          </p>
        </div>

        {/* Cursus Overzicht */}
        <CursusOverzicht />

        {/* Stats Section */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-pink-500 mb-2">500+</div>
              <div className="text-gray-600">Gebruikers volgden onze cursussen</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-500 mb-2">89%</div>
              <div className="text-gray-600">Meer matches na cursus</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-500 mb-2">4.8/5</div>
              <div className="text-gray-600">Gemiddelde beoordeling</div>
            </div>
          </div>
        </div>
      </div>

      {/* Iris Floating Button */}
      <IrisFloatingButton />
    </div>
  );
}