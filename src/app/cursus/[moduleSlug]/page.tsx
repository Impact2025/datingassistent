import { ModuleContainer } from '@/components/cursus/ModuleContainer';
import { IrisFloatingButton } from '@/components/iris/IrisFloatingButton';

interface ModulePageProps {
  params: Promise<{
    moduleSlug: string;
  }>;
}
export default async function ModulePage({ params }: ModulePageProps) {
  const { moduleSlug } = await params;

  return (
    <div className="min-h-screen bg-gray-50">
      <ModuleContainer moduleSlug={moduleSlug} />
      <IrisFloatingButton />
    </div>
  );
}