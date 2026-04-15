import ModulePage from '@/components/ModulePage';
import { modules } from '@/lib/modules';

export default function DashboardPage() {
  return <ModulePage module={modules.dashboard} />;
}
