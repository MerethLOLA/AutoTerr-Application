@extends('layouts.app')

@section('content')
<h1>{{ $voiture->marque }} {{ $voiture->modele }}</h1>
<p>{{ $voiture->annee ? $voiture->annee .' • ' : '' }}{{ $voiture->energie ?: 'Énergie non renseignée' }}</p>

@php
    $mainImage = $voiture->image_principale ?: optional($voiture->images->first())->chemin;
@endphp

@if($mainImage)
    <div style="max-width:900px; margin:1rem 0;">
        <img src="{{ asset('storage/'.$mainImage) }}" alt="{{ $voiture->marque }} {{ $voiture->modele }}" style="width:100%; max-height:520px; object-fit:cover; border-radius:12px;" />
    </div>
@endif

<div style="display:flex; flex-wrap:wrap; gap:1rem; margin-bottom:2rem;">
    <div style="flex:1 1 320px; min-width:280px; border:1px solid #ddd; border-radius:12px; padding:1rem; background:#fff;">
        <h2>Détails du véhicule</h2>
        <ul style="list-style:none; padding:0; margin:0;">
            <li><strong>Marque :</strong> {{ $voiture->marque }}</li>
            <li><strong>Modèle :</strong> {{ $voiture->modele }}</li>
            <li><strong>Année :</strong> {{ $voiture->annee ?: 'Non renseignée' }}</li>
            <li><strong>Énergie :</strong> {{ $voiture->energie ?: 'Non renseignée' }}</li>
            <li><strong>Prix :</strong> {{ number_format($voiture->prix, 0, ',', ' ') }} XOF</li>
            <li><strong>Kilométrage :</strong> {{ number_format($voiture->kilometrage ?? 0, 0, ',', ' ') }} km</li>
            <li><strong>Statut :</strong> {{ ucfirst($voiture->statut) }}</li>
        </ul>
    </div>

    <div style="flex:2 1 360px; min-width:280px; border:1px solid #ddd; border-radius:12px; padding:1rem; background:#fff;">
        <h2>Galerie</h2>
        @if($voiture->images->isEmpty())
            <p>Aucune image supplémentaire disponible.</p>
        @else
            <div style="display:flex; flex-wrap:wrap; gap:0.75rem;">
                @foreach($voiture->images as $image)
                    <div style="flex:1 1 calc(50% - 0.75rem); min-width:140px; overflow:hidden; border-radius:10px; background:#f7f7f7;">
                        <img src="{{ asset('storage/'.$image->chemin) }}" alt="{{ $image->description ?: $voiture->marque.' '.$voiture->modele }}" style="width:100%; height:180px; object-fit:cover; display:block;" />
                    </div>
                @endforeach
            </div>
        @endif
    </div>
</div>

<p><a href="{{ route('voitures.index') }}" style="color:#0d6efd; text-decoration:none;">Retour à la liste des véhicules</a></p>
@endsection
