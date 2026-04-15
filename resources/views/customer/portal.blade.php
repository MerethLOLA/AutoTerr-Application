@extends('layouts.app')

@section('content')
<h1>Espace client</h1>
@if($client)
<p>{{ $client->nom }}</p>
@endif
@foreach($voitures as $voiture)
<div>{{ $voiture->marque }} {{ $voiture->modele }}</div>
@endforeach
@endsection
