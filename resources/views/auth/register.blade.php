@extends('layouts.app')

@section('content')
<h1>Inscription</h1>

@if ($errors->any())
    <div>{{ $errors->first() }}</div>
@endif

<form method="POST" action="{{ route('register') }}">
    @csrf

    <div>
        <label for="name">Nom</label>
        <input id="name" name="name" type="text" value="{{ old('name') }}">
    </div>

    <div>
        <label for="username">Nom d'utilisateur</label>
        <input id="username" name="username" type="text" value="{{ old('username') }}">
    </div>

    <div>
        <label for="email">Email</label>
        <input id="email" name="email" type="email" value="{{ old('email') }}">
    </div>

    <div>
        <label for="password">Mot de passe</label>
        <input id="password" name="password" type="password">
    </div>

    <div>
        <label for="password_confirmation">Confirmation</label>
        <input id="password_confirmation" name="password_confirmation" type="password">
    </div>

    <button type="submit">S'inscrire</button>
</form>
@endsection
