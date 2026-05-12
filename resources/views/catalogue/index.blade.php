@extends('layouts.app')

@section('content')
<h1>Catalogue</h1>
<p>Découvrez nos véhicules disponibles et réservez le modèle qui vous convient.</p>

@if($voitures->isEmpty())
    <p>Aucun véhicule disponible pour le moment.</p>
@else
    <p><strong>{{ $voitures->total() }}</strong> véhicule(s) disponible(s)</p>

    <div style="display:flex; flex-wrap:wrap; gap:1rem;">
        @foreach($voitures as $voiture)
            @php
                $image = $voiture->image_principale ?: optional($voiture->images->first())->chemin;
            @endphp
            <article style="flex:1 1 320px; border:1px solid #ddd; border-radius:12px; overflow:hidden; background:#fff; display:flex; flex-direction:column;">
                @if($image)
                    <div style="height:220px; overflow:hidden; background:#f8f8f8;">
                        <img src="{{ asset('storage/'.$image) }}" alt="{{ $voiture->marque }} {{ $voiture->modele }}" style="width:100%; height:100%; object-fit:cover; display:block;" />
                    </div>
                @else
                    <div style="height:220px; display:flex; align-items:center; justify-content:center; background:#f0f0f0; color:#666; font-size:0.95rem;">
                        Image indisponible
                    </div>
                @endif

                <div style="padding:1rem; display:flex; flex-direction:column; flex:1;">
                    <div>
                        <h2 style="margin:0 0 0.5rem; font-size:1.2rem;">{{ $voiture->marque }} {{ $voiture->modele }}</h2>
                        <p style="margin:0 0 0.75rem; color:#555;">{{ $voiture->annee ?: 'Année non renseignée' }} • {{ $voiture->energie ?: 'Énergie non renseignée' }}</p>
                    </div>

                    <div style="margin-top:auto;">
                        <p style="margin:0 0 0.5rem;"><strong>Prix :</strong> {{ number_format($voiture->prix, 0, ',', ' ') }} XOF</p>
                        <p style="margin:0 0 0.5rem;"><strong>Kilométrage :</strong> {{ number_format($voiture->kilometrage ?? 0, 0, ',', ' ') }} km</p>
                        <p style="margin:0 0 1rem;"><strong>Statut :</strong> {{ ucfirst($voiture->statut) }}</p>
                        <a href="{{ route('voitures.show', $voiture) }}" style="display:inline-block; padding:0.75rem 1rem; background:#0d6efd; color:#fff; text-decoration:none; border-radius:10px;">Voir le véhicule</a>
                    </div>
                </div>
            </article>
        @endforeach
    </div>

    <div style="margin-top:1.5rem;">
        {{ $voitures->links() }}
    </div>
@endif
@endsection
