'use client';

import ModulePage from '@/components/ModulePage';
import { modules } from '@/lib/modules';

export default function DocumentsPage() {
  return <ModulePage module={modules.documents} />;
}
