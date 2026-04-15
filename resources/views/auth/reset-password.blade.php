@extends('layouts.app')

@section('content')
<h1>Reinitialiser le mot de passe</h1>
<p>{{ $request->route('token') ?? '' }}</p>
@endsection
