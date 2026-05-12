@extends('layouts.app')

@section('content')
<h1>Dashboard</h1>
<p>Vue d'ensemble des indicateurs et des derniers véhicules ajoutés.</p>

<section style="margin-top:1.5rem;">
    <h2>Indicateurs clés</h2>
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:1rem; margin-top:1rem;">
        <div style="border:1px solid #ddd; border-radius:12px; padding:1rem; background:#fff;">
            <strong>Véhicules total</strong>
            <div style="font-size:1.75rem; margin-top:0.5rem;">{{ number_format($kpis['voitures_total']) }}</div>
        </div>
        <div style="border:1px solid #ddd; border-radius:12px; padding:1rem; background:#fff;">
            <strong>Disponibles</strong>
            <div style="font-size:1.75rem; margin-top:0.5rem;">{{ number_format($kpis['voitures_disponibles']) }}</div>
        </div>
        <div style="border:1px solid #ddd; border-radius:12px; padding:1rem; background:#fff;">
            <strong>Avec photos</strong>
            <div style="font-size:1.75rem; margin-top:0.5rem;">{{ number_format($kpis['voitures_avec_photos']) }}</div>
        </div>
        <div style="border:1px solid #ddd; border-radius:12px; padding:1rem; background:#fff;">
            <strong>Clients</strong>
            <div style="font-size:1.75rem; margin-top:0.5rem;">{{ number_format($kpis['clients_total']) }}</div>
        </div>
    </div>
</section>

<section style="margin-top:2rem;">
    <h2>Derniers véhicules</h2>
    @if($catalogueVoitures->isEmpty())
        <p>Aucun véhicule n'a encore été ajouté.</p>
    @else
        <div style="display:flex; flex-wrap:wrap; gap:1rem; margin-top:1rem;">
            @foreach($catalogueVoitures as $voiture)
                @php
                    $displayImage = $voiture->image_principale ?: optional($voiture->images->first())->chemin;
                @endphp
                <article style="flex:1 1 300px; border:1px solid #ddd; border-radius:12px; overflow:hidden; background:#fff; display:flex; flex-direction:column;">
                    @if($displayImage)
                        <div style="height:180px; overflow:hidden; background:#f8f8f8;">
                            <img src="{{ asset('storage/'.$displayImage) }}" alt="{{ $voiture->marque }} {{ $voiture->modele }}" style="width:100%; height:100%; object-fit:cover; display:block;" />
                        </div>
                    @else
                        <div style="height:180px; display:flex; align-items:center; justify-content:center; background:#f2f2f2; color:#666;">
                            Image indisponible
                        </div>
                    @endif
                    <div style="padding:1rem; display:flex; flex-direction:column; gap:0.5rem;">
                        <h3 style="margin:0;">{{ $voiture->marque }} {{ $voiture->modele }}</h3>
                        <p style="margin:0; color:#555;">{{ $voiture->annee ?: 'Année non renseignée' }} • {{ $voiture->energie ?: 'Énergie non renseignée' }}</p>
                        <p style="margin:0; font-weight:700;">{{ number_format($voiture->prix, 0, ',', ' ') }} XOF</p>
                        <p style="margin:0;">{{ number_format($voiture->kilometrage, 0, ',', ' ') }} km</p>
                        <a href="{{ route('voitures.show', $voiture) }}" style="margin-top:0.75rem; display:inline-block; padding:0.65rem 1rem; background:#0d6efd; color:#fff; text-decoration:none; border-radius:10px;">Voir le détail</a>
                    </div>
                </article>
            @endforeach
        </div>
    @endif
    <p style="margin-top:1.5rem;"><a href="{{ route('voitures.index') }}" style="color:#0d6efd; text-decoration:none;">Voir tous les véhicules</a></p>
</section>
@endsection
