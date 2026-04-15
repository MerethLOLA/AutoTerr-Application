import SaleDetailPage from '@/components/SaleDetailPage';

interface PageProps {
  params: {
    id: string;
  };
}

export default function DetailVentePage({ params }: PageProps) {
  return <SaleDetailPage saleId={params.id} />;
}
