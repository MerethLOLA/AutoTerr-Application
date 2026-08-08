<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Reçu {{ $reference }}</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: DejaVu Sans, sans-serif; font-size: 10.5px; color: #1a2535; background: #fff; }

.page { padding: 30px 38px 30px; }

.top-stripe { background: #1a2e4a; height: 5px; margin: 0 0 0; }

.header { position: relative; display: table; width: 100%; margin-top: 18px; margin-bottom: 22px; }
.corner-accent { position: absolute; top: -30px; right: -38px; width: 0; height: 0;
                 border-top: 100px solid #16a34a; border-left: 100px solid transparent; }
.h-left  { display: table-cell; vertical-align: top; width: 58%; }
.h-right { display: table-cell; vertical-align: top; width: 42%; text-align: right; }

.brand-addr { margin-top: 5px; font-size: 9px; color: #546070; line-height: 1.75; }
.brand-legal{ font-size: 8px; color: #9baab8; margin-top: 2px; }

.inv-label { font-size: 26px; font-weight: 700; color: #1a2e4a; letter-spacing: -1px; }
.ref-box { display: inline-block; border: 1px solid #1a2e4a; border-radius: 4px;
           padding: 8px 14px; text-align: left; background: #fff; }
.ref-box .lbl { font-size: 7.5px; font-weight: 700; text-transform: uppercase;
                letter-spacing: .16em; color: #7b8fa6; }
.ref-box .val { font-size: 13px; font-weight: 700; color: #1a2e4a; margin-top: 2px; }
.inv-meta  { margin-top: 6px; font-size: 9px; color: #546070; line-height: 1.9; }
.inv-meta strong { color: #1a2535; }

.badge { display: inline-block; padding: 3px 10px; border-radius: 20px;
         font-size: 8.5px; font-weight: 700; text-transform: uppercase;
         letter-spacing: .1em; margin-top: 7px; background: #dcfce7; color: #166534; }

.divider-dark { border: none; border-top: 2.5px solid #1a2e4a; margin: 0 0 20px; }

.parties { display: table; width: 100%; margin-bottom: 20px; }
.party   { display: table-cell; width: 50%; vertical-align: top;
           padding: 14px 16px; border: 1px solid #e0e7ef; background: #f8fafc; }
.party-r { border-left: none; }
.p-label { font-size: 7.5px; font-weight: 700; text-transform: uppercase;
           letter-spacing: .18em; color: #9baab8; margin-bottom: 5px; }
.p-name  { font-size: 12.5px; font-weight: 700; color: #1a2535; }
.p-detail{ font-size: 9px; color: #546070; line-height: 1.75; margin-top: 3px; }

.section-lbl { font-size: 7.5px; font-weight: 700; text-transform: uppercase;
               letter-spacing: .18em; color: #9baab8; margin-bottom: 8px; }

table.info { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
table.info tr { border-bottom: 1px solid #e8edf3; }
table.info tr:last-child { border-bottom: none; }
table.info th { width: 34%; text-align: left; padding: 9px 12px; font-size: 9px;
                font-weight: 700; text-transform: uppercase; letter-spacing: .06em;
                color: #7b8fa6; background: #f8fafc; vertical-align: top; }
table.info td { padding: 9px 12px; font-size: 10.5px; color: #1a2535; vertical-align: top; }
table.info tr:nth-child(even) td, table.info tr:nth-child(even) th { background: #fafbfd; }

.amount-box { background: #166534; border-radius: 4px; padding: 16px 20px; margin-bottom: 6px; }
.amount-box .lbl { color: #bbf7d0; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .15em; }
.amount-box .val { color: #fff; font-size: 24px; font-weight: 700; margin-top: 4px; }
.amount-words { font-size: 9px; font-style: italic; color: #546070; margin-bottom: 18px; }

.t-reste { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 3px;
           padding: 9px 14px; margin-bottom: 18px; display: table; width: 100%; }
.t-reste .t-lbl { display: table-cell; color: #9a3412; font-size: 10px; font-weight: 700; }
.t-reste .t-val { display: table-cell; text-align: right; color: #9a3412; font-size: 12px; font-weight: 700; }

.sig-section { margin-top: 10px; }
.sig-title   { font-size: 7.5px; font-weight: 700; text-transform: uppercase;
               letter-spacing: .18em; color: #9baab8; margin-bottom: 12px;
               border-top: 1px solid #e0e7ef; padding-top: 12px; }
.sig-grid    { display: table; width: 100%; }
.sig-cell    { display: table-cell; width: 33.33%; vertical-align: top; padding: 0 10px; }
.sig-cell:first-child { padding-left: 0; }
.sig-cell:last-child  { padding-right: 0; }
.sig-lbl     { font-size: 8.5px; font-weight: 700; color: #546070; text-align: center; margin-bottom: 4px; }
.sig-sub     { font-size: 8px; color: #9baab8; text-align: center; margin-bottom: 8px; }
.sig-box     { border: 1.5px dashed #c8d4e6; border-radius: 4px; height: 64px; background: #f8fafc; }

.conditions { margin-top: 18px; font-size: 8px; color: #9baab8;
              line-height: 1.65; border-top: 1px solid #e8edf3; padding-top: 10px; }
.conditions strong { color: #7b8fa6; }

.footer { margin-top: 16px; padding-top: 10px; border-top: 1px solid #e8edf3;
          font-size: 8px; color: #9baab8; text-align: center; line-height: 1.7; }
.footer strong { color: #546070; }
</style>
</head>
<body>
<div class="top-stripe"></div>
<div class="page">

{{-- ── HEADER ──────────────────────────────────────────────────── --}}
<div class="header">
  <div class="corner-accent"></div>
  <div class="h-left">
    <div style="overflow:hidden; width:190px; height:58px;">
      <img src="{{ public_path('logo.png') }}" alt="AutoTerr"
           style="width:190px; height:auto; margin-top:-160px; display:block;">
    </div>
    <div class="brand-addr">
      Route de la Corniche Ouest, Dakar, Sénégal<br>
      Tél : +221 33 000 00 00 &nbsp;·&nbsp; contact@autoterr.sn
    </div>
    <div class="brand-legal">
      NINEA : {{ $entreprise['ninea'] }} &nbsp;|&nbsp; RCCM : {{ $entreprise['rccm'] }}
    </div>
  </div>
  <div class="h-right">
    <div class="inv-label">REÇU</div>
    <div class="ref-box">
      <div class="lbl">N° Reçu</div>
      <div class="val">{{ $reference }}</div>
    </div>
    <div class="inv-meta">
      <strong>Date d'émission :</strong> {{ now()->format('d/m/Y') }}<br>
      <strong>Date du paiement :</strong> {{ optional($paiement->date)->format('d/m/Y') ?? '—' }}
    </div>
    <span class="badge">Paiement reçu</span>
  </div>
</div>

<hr class="divider-dark">

{{-- ── PARTIES ──────────────────────────────────────────────────── --}}
<div class="parties">
  <div class="party">
    <div class="p-label">Émetteur</div>
    <div class="p-name">{{ $entreprise['nom'] }}</div>
    <div class="p-detail">
      {{ $entreprise['adresse'] }}<br>
      NINEA : {{ $entreprise['ninea'] }} &nbsp;|&nbsp; RCCM : {{ $entreprise['rccm'] }}
    </div>
  </div>
  <div class="party party-r">
    <div class="p-label">Reçu de</div>
    <div class="p-name">{{ $client?->nom_complet ?? '—' }}</div>
    <div class="p-detail">
      @if($client?->telephone) Tél : {{ $client->telephone }}<br>@endif
      @if($client?->email) {{ $client->email }}@endif
    </div>
  </div>
</div>

{{-- ── DÉTAILS DU PAIEMENT ──────────────────────────────────────── --}}
<div class="section-lbl">Détails du paiement</div>
<table class="info">
  <tbody>
    @foreach ($rows as $label => $value)
      <tr>
        <th>{{ $label }}</th>
        <td>{{ $value !== null && $value !== '' ? $value : '—' }}</td>
      </tr>
    @endforeach
  </tbody>
</table>

{{-- ── MONTANT ───────────────────────────────────────────────────── --}}
<div class="amount-box">
  <div class="lbl">Montant reçu</div>
  <div class="val">{{ number_format($paiement->montant, 0, ',', ' ') }} XOF</div>
</div>
<div class="amount-words">Arrêté le présent reçu à la somme de : {{ \App\Support\NombreEnLettres::montantXof($paiement->montant) }}.</div>

@if($resteAPayer > 0)
<div class="t-reste">
  <span class="t-lbl">RESTE À PAYER SUR LA FACTURE</span>
  <span class="t-val">{{ number_format($resteAPayer, 0, ',', ' ') }} XOF</span>
</div>
@endif

{{-- ── SIGNATURES ────────────────────────────────────────────────── --}}
<div class="sig-section">
  <div class="sig-title">Signatures &amp; Approbation</div>
  <div class="sig-grid">
    <div class="sig-cell">
      <div class="sig-lbl">Signature du client</div>
      <div class="sig-sub">Reçu ce montant</div>
      <div class="sig-box"></div>
    </div>
    <div class="sig-cell">
      <div class="sig-lbl">Encaissé par</div>
      <div class="sig-sub">AutoTerr Auto Services</div>
      <div class="sig-box"></div>
    </div>
    <div class="sig-cell">
      <div class="sig-lbl">Cachet de l'entreprise</div>
      <div class="sig-sub">{{ $entreprise['nom'] }}</div>
      <div class="sig-box"></div>
    </div>
  </div>
</div>

{{-- ── CONDITIONS ────────────────────────────────────────────────── --}}
<div class="conditions">
  <strong>Conditions générales :</strong>
  Ce reçu est émis par {{ $entreprise['nom'] }} et fait foi de paiement entre les parties.
  En cas de litige, le Tribunal de Commerce de Dakar est seul compétent.
</div>

{{-- ── FOOTER ────────────────────────────────────────────────────── --}}
<div class="footer">
  <strong>{{ $entreprise['nom'] }}</strong> — {{ $entreprise['adresse'] }} &nbsp;|&nbsp;
  NINEA : {{ $entreprise['ninea'] }} &nbsp;|&nbsp; RCCM : {{ $entreprise['rccm'] }}<br>
  Document généré automatiquement le {{ now()->format('d/m/Y à H:i') }} &nbsp;·&nbsp; Toute reproduction interdite sans autorisation.
</div>

</div>
</body>
</html>
