<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Facture {{ $facture->numero_facture }}</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: DejaVu Sans, sans-serif; font-size: 10.5px; color: #1a2535; background: #fff; }

.page { padding: 30px 38px 30px; }

/* ── Bande haute ──────────────────────────────── */
.top-stripe { background: #1a2e4a; height: 5px; margin: 0 0 0; }

/* ── Header ──────────────────────────────────── */
.header { position: relative; display: table; width: 100%; margin-top: 18px; margin-bottom: 22px; }
.corner-accent { position: absolute; top: -30px; right: -38px; width: 0; height: 0;
                 border-top: 100px solid #185FA5; border-left: 100px solid transparent; }
.h-left  { display: table-cell; vertical-align: top; width: 58%; }
.h-right { display: table-cell; vertical-align: top; width: 42%; text-align: right; }
.ref-box { display: inline-block; border: 1px solid #1a2e4a; border-radius: 4px;
           padding: 8px 14px; text-align: left; background: #fff; }
.ref-box .lbl { font-size: 7.5px; font-weight: 700; text-transform: uppercase;
                letter-spacing: .16em; color: #7b8fa6; }
.ref-box .val { font-size: 13px; font-weight: 700; color: #1a2e4a; margin-top: 2px; }

.logo-box { display: table; margin-bottom: 8px; }
.logo-sq  { display: table-cell; vertical-align: middle; width: 44px; height: 44px;
            background: #1a2e4a; border-radius: 6px; text-align: center; }
.logo-sq span { display: block; color: #fff; font-size: 11px; font-weight: 700;
                line-height: 44px; letter-spacing: .5px; }
.logo-info { display: table-cell; vertical-align: middle; padding-left: 10px; }
.brand-name { font-size: 18px; font-weight: 700; color: #1a2e4a; letter-spacing: -.3px; }
.brand-tag  { font-size: 8px; color: #7b8fa6; text-transform: uppercase; letter-spacing: .15em; }
.brand-addr { margin-top: 5px; font-size: 9px; color: #546070; line-height: 1.75; }
.brand-legal{ font-size: 8px; color: #9baab8; margin-top: 2px; }

.inv-label { font-size: 26px; font-weight: 700; color: #1a2e4a; letter-spacing: -1px; }
.inv-num   { font-size: 12px; font-weight: 700; color: #1a2e4a; margin-top: 3px; }
.inv-meta  { margin-top: 6px; font-size: 9px; color: #546070; line-height: 1.9; }
.inv-meta strong { color: #1a2535; }

.badge { display: inline-block; padding: 3px 10px; border-radius: 20px;
         font-size: 8.5px; font-weight: 700; text-transform: uppercase;
         letter-spacing: .1em; margin-top: 7px; }
.badge-payee   { background: #dcfce7; color: #166534; }
.badge-impayee { background: #fee2e2; color: #991b1b; }
.badge-partiel { background: #fef9c3; color: #854d0e; }
.badge-retard  { background: #ffedd5; color: #9a3412; }

.divider-dark { border: none; border-top: 2.5px solid #1a2e4a; margin: 0 0 20px; }
.divider      { border: none; border-top: 1px solid #e0e7ef; margin: 18px 0; }

/* ── Parties ──────────────────────────────────── */
.parties { display: table; width: 100%; margin-bottom: 20px; }
.party   { display: table-cell; width: 50%; vertical-align: top;
           padding: 14px 16px; border: 1px solid #e0e7ef; background: #f8fafc; }
.party-r { border-left: none; }
.p-label { font-size: 7.5px; font-weight: 700; text-transform: uppercase;
           letter-spacing: .18em; color: #9baab8; margin-bottom: 5px; }
.p-name  { font-size: 12.5px; font-weight: 700; color: #1a2535; }
.p-detail{ font-size: 9px; color: #546070; line-height: 1.75; margin-top: 3px; }

/* ── Bloc vente + véhicule ────────────────────── */
.veh-block { border: 1px solid #d1dce9; border-radius: 4px;
             background: #f0f5fb; padding: 12px 16px; margin-bottom: 20px; }
.veh-header { display: table; width: 100%; margin-bottom: 8px; }
.veh-hcell  { display: table-cell; vertical-align: top; }
.veh-title  { font-size: 13.5px; font-weight: 700; color: #1a2e4a; }
.veh-sub    { font-size: 9px; color: #7b8fa6; margin-top: 2px; }
.veh-right  { text-align: right; }
.veh-ref    { font-size: 9px; font-weight: 700; color: #546070; }
.veh-ref span { color: #1a2535; }

.grid2 { display: table; width: 100%; }
.gcell { display: table-cell; width: 50%; font-size: 9px; color: #546070;
         padding: 1.5px 0; line-height: 1.6; }
.gcell strong { color: #1a2535; }

/* ── Tableau articles ─────────────────────────── */
.section-lbl { font-size: 7.5px; font-weight: 700; text-transform: uppercase;
               letter-spacing: .18em; color: #9baab8; margin-bottom: 8px; }

table.items { width: 100%; border-collapse: collapse; margin-bottom: 0; }
table.items thead tr { background: #1a2e4a; }
table.items th { padding: 8px 12px; font-size: 8.5px; font-weight: 700;
                 text-transform: uppercase; letter-spacing: .1em; color: #fff; text-align: left; }
table.items th.r { text-align: right; }
table.items td { padding: 9px 12px; font-size: 10px; border-bottom: 1px solid #e8edf3;
                 color: #1a2535; }
table.items td.r { text-align: right; font-weight: 600; }
table.items td.muted { color: #7b8fa6; font-size: 9px; }
table.items tbody tr:nth-child(even) td { background: #fafbfd; }
table.items tbody tr:last-child td { border-bottom: none; }

/* ── Totaux ───────────────────────────────────── */
.totals-wrap { display: table; width: 100%; margin-top: 16px; }
.totals-left  { display: table-cell; vertical-align: top; width: 55%; padding-right: 20px; }
.totals-right { display: table-cell; vertical-align: top; width: 45%; }

.mode-box { border: 1px solid #e0e7ef; border-radius: 4px;
            padding: 11px 14px; background: #f8fafc; font-size: 9px; color: #546070; }
.mode-box strong { display: block; font-size: 8px; text-transform: uppercase;
                   letter-spacing: .15em; color: #9baab8; margin-bottom: 5px; }

.pay-history { margin-top: 12px; }
.ph-lbl { font-size: 7.5px; font-weight: 700; text-transform: uppercase;
          letter-spacing: .15em; color: #9baab8; margin-bottom: 6px; }
.ph-row { display: table; width: 100%; padding: 5px 0;
          border-bottom: 1px solid #f0f3f7; font-size: 9px; }
.ph-row:last-child { border-bottom: none; }
.ph-cell { display: table-cell; color: #546070; }
.ph-cell.b { font-weight: 700; color: #1a2535; }
.ph-cell.r { text-align: right; }

.t-row  { display: table; width: 100%; padding: 5.5px 10px;
          border-bottom: 1px solid #e8edf3; }
.t-row:last-child { border-bottom: none; }
.t-lbl  { display: table-cell; font-size: 10px; color: #546070; }
.t-val  { display: table-cell; text-align: right; font-size: 10px;
          font-weight: 600; color: #1a2535; }

.t-total { background: #1a2e4a; border-radius: 3px; padding: 10px 12px; margin-top: 6px; }
.t-total .t-lbl { color: #a8c0d6; font-size: 10.5px; font-weight: 700; }
.t-total .t-val { color: #fff; font-size: 14px; font-weight: 700; }

.t-reste { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 3px;
           padding: 8px 12px; margin-top: 4px; }
.t-reste .t-lbl { color: #9a3412; font-size: 10px; font-weight: 700; }
.t-reste .t-val { color: #9a3412; font-size: 12px; font-weight: 700; }

.t-solde { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 3px;
           padding: 8px 12px; margin-top: 4px; }
.t-solde .t-lbl { color: #166534; font-size: 10px; font-weight: 700; }
.t-solde .t-val { color: #166534; font-size: 12px; font-weight: 700; }

/* ── Observations ─────────────────────────────── */
.obs-box { border-left: 3px solid #f59e0b; background: #fffbeb;
           padding: 9px 13px; margin-top: 18px; font-size: 9px;
           color: #78350f; line-height: 1.65; border-radius: 0 3px 3px 0; }

/* ── Signatures ───────────────────────────────── */
.sig-section { margin-top: 28px; }
.sig-title   { font-size: 7.5px; font-weight: 700; text-transform: uppercase;
               letter-spacing: .18em; color: #9baab8; margin-bottom: 12px;
               border-top: 1px solid #e0e7ef; padding-top: 12px; }
.sig-grid    { display: table; width: 100%; }
.sig-cell    { display: table-cell; width: 33.33%; vertical-align: top;
               padding: 0 10px; }
.sig-cell:first-child { padding-left: 0; }
.sig-cell:last-child  { padding-right: 0; }
.sig-lbl     { font-size: 8.5px; font-weight: 700; color: #546070;
               text-align: center; margin-bottom: 4px; }
.sig-sub     { font-size: 8px; color: #9baab8; text-align: center;
               margin-bottom: 8px; }
.sig-box     { border: 1.5px dashed #c8d4e6; border-radius: 4px;
               height: 72px; background: #f8fafc; }
.sig-name    { font-size: 8.5px; color: #546070; text-align: center;
               margin-top: 5px; font-style: italic; }

.cachet-box  { border: 1.5px dashed #c8d4e6; border-radius: 4px;
               height: 72px; background: #f8fafc;
               text-align: center; }
.cachet-inner{ padding-top: 18px; }
.cachet-circ { display: inline-block; width: 36px; height: 36px;
               border: 2px solid #d1dce9; border-radius: 50%;
               text-align: center; line-height: 32px;
               font-size: 7px; color: #c8d4e6; font-weight: 700;
               text-transform: uppercase; letter-spacing: .1em; }

/* ── Conditions bas ───────────────────────────── */
.conditions { margin-top: 18px; font-size: 8px; color: #9baab8;
              line-height: 1.65; border-top: 1px solid #e8edf3; padding-top: 10px; }
.conditions strong { color: #7b8fa6; }

/* ── Footer ───────────────────────────────────── */
.footer { margin-top: 16px; padding-top: 10px; border-top: 1px solid #e8edf3;
          font-size: 8px; color: #9baab8; text-align: center; line-height: 1.7; }
.footer strong { color: #546070; }
.page-num { text-align: right; font-size: 8px; color: #c8d4e6; margin-top: 6px; }
</style>
</head>
<body>
<div class="top-stripe"></div>
<div class="page">

{{-- ── HEADER ──────────────────────────────────────────────────── --}}
<div class="header">
  <div class="corner-accent"></div>
  <div class="h-left">
    <div class="logo-box">
      <div style="overflow:hidden; width:190px; height:58px;">
        <img src="{{ public_path('logo.png') }}" alt="AutoTerr"
             style="width:190px; height:auto; margin-top:-160px; display:block;">
      </div>
    </div>
    <div class="brand-addr">
      Route de la Corniche Ouest, Dakar, Sénégal<br>
      Tél : +221 33 000 00 00 &nbsp;·&nbsp; contact@autoterr.sn
    </div>
    <div class="brand-legal">
      NINEA : SN-DKR-2026-001 &nbsp;|&nbsp; RCCM : RCCM-SN-DKR-2026-A-001
    </div>
  </div>
  <div class="h-right">
    <div class="inv-label">FACTURE</div>
    <div class="ref-box">
      <div class="lbl">N° Facture</div>
      <div class="val">{{ $facture->numero_facture }}</div>
    </div>
    <div class="inv-meta">
      <strong>Date d'émission :</strong> {{ optional($facture->date_facture)->format('d/m/Y') ?? '—' }}<br>
      @if($facture->date_echeance)
      <strong>Date d'échéance :</strong> {{ $facture->date_echeance->format('d/m/Y') }}<br>
      @endif
      <strong>Réf. vente :</strong> {{ $facture->vente?->reference_vente ?? '—' }}
    </div>
    @php
      $badgeCls = match($facture->statut) {
        'payee'               => 'badge-payee',
        'impayee'             => 'badge-impayee',
        'partiellement_payee' => 'badge-partiel',
        'en_retard'           => 'badge-retard',
        default               => 'badge-impayee',
      };
      $badgeTxt = match($facture->statut) {
        'payee'               => 'Payée',
        'impayee'             => 'Impayée',
        'partiellement_payee' => 'Partiellement payée',
        'en_retard'           => 'En retard',
        default               => $facture->statut,
      };
    @endphp
    <span class="badge {{ $badgeCls }}">{{ $badgeTxt }}</span>
  </div>
</div>

<hr class="divider-dark">

{{-- ── PARTIES (ÉMETTEUR / CLIENT) ─────────────────────────────── --}}
@php $client = $facture->vente?->client; @endphp
<div class="parties">
  <div class="party">
    <div class="p-label">Émetteur</div>
    <div class="p-name">AutoTerr Auto Services</div>
    <div class="p-detail">
      Route de la Corniche Ouest, Dakar<br>
      Tél : +221 33 000 00 00<br>
      contact@autoterr.sn<br>
      NINEA : SN-DKR-2026-001
    </div>
  </div>
  <div class="party party-r">
    <div class="p-label">Facturé à</div>
    <div class="p-name">{{ $client?->nom_complet ?? '—' }}</div>
    <div class="p-detail">
      @if($client?->raison_sociale) {{ $client->raison_sociale }}<br>@endif
      @if($client?->telephone) Tél : {{ $client->telephone }}<br>@endif
      @if($client?->email) {{ $client->email }}<br>@endif
      @if($client?->adresse) {{ $client->adresse }}<br>@endif
      @if($client?->type_client) Client {{ $client->type_client }}@endif
    </div>
  </div>
</div>

{{-- ── DÉTAILS VÉHICULE + VENTE ─────────────────────────────────── --}}
@php
  $voiture = $facture->vente?->voiture;
  $vente   = $facture->vente;
  $employe = $vente?->employe;
@endphp
@if($voiture)
<div class="veh-block">
  <div class="veh-header">
    <div class="veh-hcell">
      <div class="veh-title">{{ $voiture->marque }} {{ $voiture->modele }}</div>
      <div class="veh-sub">
        @if($voiture->annee) {{ $voiture->annee }}@endif
        @if($voiture->energie) &nbsp;·&nbsp; {{ ucfirst($voiture->energie) }}@endif
        @if($voiture->couleur) &nbsp;·&nbsp; {{ $voiture->couleur }}@endif
        @if($voiture->type_vehicule) &nbsp;·&nbsp; {{ $voiture->type_vehicule }}@endif
      </div>
    </div>
    <div class="veh-hcell veh-right">
      <div class="veh-ref">
        Vente : <span>{{ $vente?->reference_vente ?? '—' }}</span><br>
        Date vente : <span>{{ optional($vente?->date_vente)->format('d/m/Y') ?? '—' }}</span>
      </div>
    </div>
  </div>
  <div class="grid2">
    @if($voiture->immatriculation)
    <div class="gcell"><strong>Immatriculation :</strong> {{ $voiture->immatriculation }}</div>
    @endif
    @if($voiture->numero_chassis)
    <div class="gcell"><strong>N° châssis :</strong> {{ $voiture->numero_chassis }}</div>
    @endif
    @if($voiture->kilometrage)
    <div class="gcell"><strong>Kilométrage :</strong> {{ number_format($voiture->kilometrage, 0, ',', ' ') }} km</div>
    @endif
    @if($employe)
    <div class="gcell"><strong>Vendeur :</strong> {{ trim(($employe->prenom ?? '').' '.($employe->nom ?? '')) }}</div>
    @endif
    @if($vente?->mode_paiement)
    <div class="gcell"><strong>Mode de paiement :</strong> {{ ucfirst(str_replace('_', ' ', $vente->mode_paiement)) }}</div>
    @endif
  </div>
</div>
@endif

{{-- ── TABLEAU ARTICLES ──────────────────────────────────────────── --}}
<div class="section-lbl">Détails de la facturation</div>
<table class="items">
  <thead>
    <tr>
      <th style="width:42%">Désignation</th>
      <th>Qté</th>
      <th class="r">Prix unitaire HT</th>
      <th class="r">Remise</th>
      <th class="r">Montant HT</th>
      <th class="r">TVA ({{ number_format($facture->taux_tva, 0) }}%)</th>
      <th class="r">Total TTC</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <strong>Vente de véhicule</strong><br>
        <span class="muted">{{ $voiture ? $voiture->marque.' '.$voiture->modele : '—' }}
          @if($voiture?->annee) – {{ $voiture->annee }}@endif
        </span>
      </td>
      <td>1</td>
      <td class="r">{{ number_format($facture->montant_ht, 0, ',', ' ') }} XOF</td>
      <td class="r">
        @if($facture->remise > 0)
          <span style="color:#dc2626">{{ number_format($facture->remise, 0, ',', ' ') }} XOF</span>
        @else
          <span style="color:#9baab8">—</span>
        @endif
      </td>
      <td class="r">{{ number_format($facture->montant_ht, 0, ',', ' ') }} XOF</td>
      <td class="r">{{ number_format($facture->montant_ttc - $facture->montant_ht, 0, ',', ' ') }} XOF</td>
      <td class="r" style="color:#1a2e4a;font-weight:700">{{ number_format($facture->montant_ttc, 0, ',', ' ') }} XOF</td>
    </tr>
  </tbody>
</table>

{{-- ── TOTAUX + MODE RÈGLEMENT ──────────────────────────────────── --}}
@php $resteAPayer = max($facture->reste_a_payer, 0); @endphp
<div class="totals-wrap">

  {{-- Colonne gauche : mode de règlement + historique paiements --}}
  <div class="totals-left">
    <div class="mode-box">
      <strong>Informations de règlement</strong>
      @if($vente?->mode_paiement)
      Mode de paiement : <strong style="color:#1a2535">{{ ucfirst(str_replace('_', ' ', $vente->mode_paiement)) }}</strong><br>
      @endif
      Banque : CBAO Groupe Attijariwafa Bank<br>
      IBAN : SN28 1234 5678 9012 3456 7890 123<br>
      Référence : <strong style="color:#1a2535">{{ $facture->numero_facture }}</strong>
    </div>

    @if($facture->paiements->count() > 0)
    <div class="pay-history">
      <div class="ph-lbl">Historique des paiements</div>
      @foreach($facture->paiements as $p)
      <div class="ph-row">
        <span class="ph-cell b" style="width:30%">{{ optional($p->date)->format('d/m/Y') ?? '—' }}</span>
        <span class="ph-cell" style="width:40%">{{ ucfirst(str_replace('_', ' ', $p->mode_paiement)) }}</span>
        <span class="ph-cell r b" style="width:30%">{{ number_format($p->montant, 0, ',', ' ') }} XOF</span>
      </div>
      @endforeach
    </div>
    @endif
  </div>

  {{-- Colonne droite : totaux --}}
  <div class="totals-right">
    <div class="t-row">
      <span class="t-lbl">Sous-total HT</span>
      <span class="t-val">{{ number_format($facture->montant_ht, 0, ',', ' ') }} XOF</span>
    </div>
    @if($facture->remise > 0)
    <div class="t-row">
      <span class="t-lbl" style="color:#dc2626">Remise accordée</span>
      <span class="t-val" style="color:#dc2626">- {{ number_format($facture->remise, 0, ',', ' ') }} XOF</span>
    </div>
    @endif
    <div class="t-row">
      <span class="t-lbl">TVA ({{ number_format($facture->taux_tva, 0) }}%)</span>
      <span class="t-val">{{ number_format($facture->montant_ttc - $facture->montant_ht, 0, ',', ' ') }} XOF</span>
    </div>
    <div class="t-row">
      <span class="t-lbl" style="color:#166534">Déjà réglé</span>
      <span class="t-val" style="color:#166534">{{ number_format($facture->montant_paye, 0, ',', ' ') }} XOF</span>
    </div>

    <div class="t-row t-total">
      <span class="t-lbl">TOTAL TTC</span>
      <span class="t-val">{{ number_format($facture->montant_ttc, 0, ',', ' ') }} XOF</span>
    </div>

    @if($resteAPayer > 0)
    <div class="t-row t-reste">
      <span class="t-lbl">RESTE À PAYER</span>
      <span class="t-val">{{ number_format($resteAPayer, 0, ',', ' ') }} XOF</span>
    </div>
    @else
    <div class="t-row t-solde">
      <span class="t-lbl">SOLDE</span>
      <span class="t-val">Payée intégralement</span>
    </div>
    @endif
  </div>

</div>

{{-- ── OBSERVATIONS ──────────────────────────────────────────────── --}}
@if($facture->observations)
<div class="obs-box">
  <strong>Observations :</strong> {{ $facture->observations }}
</div>
@endif

{{-- ── SIGNATURES ────────────────────────────────────────────────── --}}
<div class="sig-section">
  <div class="sig-title">Signatures &amp; Approbation</div>
  <div class="sig-grid">

    {{-- Signature client --}}
    <div class="sig-cell">
      <div class="sig-lbl">Signature du client</div>
      <div class="sig-sub">Lu et approuvé</div>
      <div class="sig-box"></div>
      <div class="sig-name">{{ $client?->nom_complet ?? '' }}</div>
    </div>

    {{-- Vendeur --}}
    <div class="sig-cell">
      <div class="sig-lbl">Signature du vendeur</div>
      @if($employe)
      <div class="sig-sub">{{ trim(($employe->prenom ?? '').' '.($employe->nom ?? '')) }}</div>
      @else
      <div class="sig-sub">Commercial AutoTerr</div>
      @endif
      <div class="sig-box"></div>
      <div class="sig-name">&nbsp;</div>
    </div>

    {{-- Cachet --}}
    <div class="sig-cell">
      <div class="sig-lbl">Cachet de l'entreprise</div>
      <div class="sig-sub">AutoTerr Auto Services</div>
      <div class="cachet-box">
        <div class="cachet-inner">
          <div class="cachet-circ">Cachet</div>
        </div>
      </div>
      <div class="sig-name">&nbsp;</div>
    </div>

  </div>
</div>

{{-- ── CONDITIONS GÉNÉRALES ─────────────────────────────────────── --}}
<div class="conditions">
  <strong>Conditions générales :</strong>
  Le véhicule reste la propriété de AutoTerr Auto Services jusqu'au règlement intégral du montant dû.
  Tout retard de paiement entraîne des pénalités au taux légal en vigueur au Sénégal.
  En cas de litige, le Tribunal de Commerce de Dakar est seul compétent.
  Ce document tient lieu de facture officielle conformément à la réglementation fiscale sénégalaise.
</div>

{{-- ── FOOTER ────────────────────────────────────────────────────── --}}
<div class="footer">
  <strong>AutoTerr Auto Services</strong> — Route de la Corniche Ouest, Dakar, Sénégal &nbsp;|&nbsp;
  NINEA : SN-DKR-2026-001 &nbsp;|&nbsp; RCCM : RCCM-SN-DKR-2026-A-001<br>
  Document généré automatiquement le {{ now()->format('d/m/Y à H:i') }} &nbsp;·&nbsp; Toute reproduction interdite sans autorisation.
</div>
<div class="page-num">Page 1 / 1</div>

</div>
</body>
</html>
