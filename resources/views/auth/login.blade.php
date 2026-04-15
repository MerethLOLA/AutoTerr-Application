@extends('layouts.app')

@section('content')
<h1>Connexion</h1>
<p>Espace client</p>
<p>Espace employe</p>

@php
    $mode = $loginMode ?? 'general';
    $title = $mode === 'client' ? 'Connexion client' : ($mode === 'employee' ? 'Connexion employe' : 'Connexion generale');
@endphp

<h2>{{ $title }}</h2>

@if ($errors->any())
    <div>
        {{ $errors->first('login') ?: $errors->first('email') ?: $errors->first('password') }}
    </div>
@endif

@if (session('status'))
    <div>{{ session('status') }}</div>
@endif

<form method="POST" action="{{ route('login') }}">
    @csrf

    <input type="hidden" name="login_mode" value="{{ $mode }}">

    <div>
        <label for="login">Email ou nom d'utilisateur</label>
        <input
            id="login"
            name="login"
            type="text"
            value="{{ old('login', old('email')) }}"
            autocomplete="username"
        >
    </div>

    <div>
        <label for="password">Mot de passe</label>
        <input
            id="password"
            name="password"
            type="password"
            autocomplete="current-password"
        >
    </div>

    <div>
        <button type="submit">Se connecter</button>
    </div>
</form>

<p><a href="{{ route('password.request') }}">Mot de passe oublie</a></p>
<p><a href="{{ route('register') }}">Creer un compte</a></p>
@endsection
