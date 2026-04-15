@extends('layouts.app')

@section('content')
<h1>Catalogue</h1>
@foreach($voitures as $voiture)
<div>{{ $voiture->marque }} {{ $voiture->modele }}</div>
@endforeach
@endsection
