<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Fiche de paie</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: DejaVu Sans, sans-serif; font-size: 10.5px; color: #1a2535; background: #fff; }

.page { padding: 30px 38px 30px; }

.top-stripe { background: #1a2e4a; height: 5px; margin: 0 0 0; }

.header { position: relative; display: table; width: 100%; margin-top: 18px; margin-bottom: 22px; }
.corner-accent { position: absolute; top: -30px; right: -38px; width: 0; height: 0;
                 border-top: 100px solid #185FA5; border-left: 100px solid transparent; }
.h-left  { display: table-cell; vertical-align: top; width: 58%; }
.h-right { display: table-cell; vertical-align: top; width: 42%; text-align: right; }

.brand-addr { margin-top: 5px; font-size: 9px; color: #546070; line-height: 1.75; }
.brand-legal{ font-size: 8px; color: #9baab8; margin-top: 2px; }

.doc-label { font-size: 22px; font-weight: 700; color: #1a2e4a; letter-spacing: -.6px; }
.ref-box { display: inline-block; border: 1px solid #1a2e4a; border-radius: 4px;
           padding: 8px 14px; text-align: left; background: #fff; }
.ref-box .lbl { font-size: 7.5px; font-weight: 700; text-transform: uppercase;
                letter-spacing: .16em; color: #7b8fa6; }
.ref-box .val { font-size: 13px; font-weight: 700; color: #1a2e4a; margin-top: 2px; }
.doc-meta  { margin-top: 6px; font-size: 9px; color: #546070; line-height: 1.9; }
.doc-meta strong { color: #1a2535; }

.divider-dark { border: none; border-top: 2.5px solid #1a2e4a; margin: 0 0 22px; }

.section-lbl { font-size: 7.5px; font-weight: 700; text-transform: uppercase;
               letter-spacing: .18em; color: #9baab8; margin-bottom: 8px; }

.emitter { border: 1px solid #e0e7ef; border-radius: 4px; background: #f8fafc;
           padding: 12px 16px; margin-bottom: 20px; display: table; width: 100%; }
.emitter-cell { display: table-cell; width: 50%; vertical-align: top; }
.p-label { font-size: 7.5px; font-weight: 700; text-transform: uppercase;
           letter-spacing: .18em; color: #9baab8; margin-bottom: 5px; }
.p-name  { font-size: 12.5px; font-weight: 700; color: #1a2535; }
.p-detail{ font-size: 9px; color: #546070; line-height: 1.75; margin-top: 3px; }

table.info { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
table.info tr { border-bottom: 1px solid #e8edf3; }
table.info tr:last-child { border-bottom: none; }
table.info th { width: 34%; text-align: left; padding: 9px 12px; font-size: 9px;
                font-weight: 700; text-transform: uppercase; letter-spacing: .06em;
                color: #7b8fa6; background: #f8fafc; vertical-align: top; }
table.info td { padding: 9px 12px; font-size: 10.5px; color: #1a2535; vertical-align: top; }
table.info tr:nth-child(even) td, table.info tr:nth-child(even) th { background: #fafbfd; }

table.rubriques { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
table.rubriques th { text-align: left; padding: 8px 12px; font-size: 8.5px; font-weight: 700;
                      text-transform: uppercase; letter-spacing: .08em; color: #fff;
                      background: #1a2e4a; }
table.rubriques th.num { text-align: right; }
table.rubriques td { padding: 9px 12px; font-size: 10.5px; border-bottom: 1px solid #e8edf3; }
table.rubriques td.num { text-align: right; font-variant-numeric: tabular-nums; }
table.rubriques tr.total td { border-top: 2px solid #1a2e4a; border-bottom: none;
                               font-weight: 700; font-size: 12px; color: #1a2e4a; padding-top: 12px; }

.sig-section { margin-top: 34px; }
.sig-title   { font-size: 7.5px; font-weight: 700; text-transform: uppercase;
               letter-spacing: .18em; color: #9baab8; margin-bottom: 12px;
               border-top: 1px solid #e0e7ef; padding-top: 12px; }
.sig-grid    { display: table; width: 100%; }
.sig-cell    { display: table-cell; width: 50%; vertical-align: top; padding: 0 10px; }
.sig-cell:first-child { padding-left: 0; }
.sig-cell:last-child  { padding-right: 0; }
.sig-lbl     { font-size: 8.5px; font-weight: 700; color: #546070; text-align: center; margin-bottom: 4px; }
.sig-sub     { font-size: 8px; color: #9baab8; text-align: center; margin-bottom: 8px; }
.sig-box     { border: 1.5px dashed #c8d4e6; border-radius: 4px; height: 72px; background: #f8fafc; }

.footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #e8edf3;
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
    <div class="doc-label">Fiche de paie</div>
    <div class="ref-box">
      <div class="lbl">Référence</div>
      <div class="val">{{ $reference }}</div>
    </div>
    <div class="doc-meta">
      <strong>Période :</strong> {{ $periode }}<br>
      <strong>Date d'émission :</strong> {{ now()->format('d/m/Y') }}
    </div>
  </div>
</div>

<hr class="divider-dark">

{{-- ── EMPLOYEUR / EMPLOYÉ ─────────────────────────────────────── --}}
<div class="emitter">
  <div class="emitter-cell">
    <div class="p-label">Employeur</div>
    <div class="p-name">{{ $entreprise['nom'] }}</div>
    <div class="p-detail">
      {{ $entreprise['adresse'] }}<br>
      NINEA : {{ $entreprise['ninea'] }} &nbsp;|&nbsp; RCCM : {{ $entreprise['rccm'] }}
    </div>
  </div>
  <div class="emitter-cell">
    <div class="p-label">Employé(e)</div>
    <div class="p-name">{{ $employe->nom_complet }}</div>
    <div class="p-detail">
      {{ $employe->poste }} &nbsp;·&nbsp; Contrat {{ $employe->contrat ?? '—' }}<br>
      Embauché(e) le {{ optional($employe->date_embauche)->format('d/m/Y') ?? '—' }}
    </div>
  </div>
</div>

{{-- ── IDENTITÉ ─────────────────────────────────────────────────── --}}
<div class="section-lbl">Identification</div>
<table class="info">
  <tbody>
    <tr><th>Poste</th><td>{{ $employe->poste ?? '—' }}</td></tr>
    <tr><th>Type de contrat</th><td>{{ $employe->contrat ?? '—' }}</td></tr>
    <tr><th>Statut</th><td>{{ ucfirst($employe->statut ?? '—') }}</td></tr>
    <tr><th>Téléphone</th><td>{{ $employe->telephone ?? '—' }}</td></tr>
    <tr><th>Email</th><td>{{ $employe->email ?? '—' }}</td></tr>
  </tbody>
</table>

{{-- ── RUBRIQUES DE PAIE ────────────────────────────────────────── --}}
<div class="section-lbl">Rubriques de paie — {{ $periode }}</div>
<table class="rubriques">
  <thead>
    <tr>
      <th>Libellé</th>
      <th class="num">Montant (XOF)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Salaire de base</td>
      <td class="num">{{ number_format($salaireFixe, 0, ',', ' ') }}</td>
    </tr>
    <tr>
      <td>
        Commission ({{ rtrim(rtrim(number_format($tauxCommission, 2, ',', ' '), '0'), ',') }}% de l'activité du mois —
        {{ number_format($totalActivite, 0, ',', ' ') }} XOF de ventes/locations)
      </td>
      <td class="num">{{ number_format($commission, 0, ',', ' ') }}</td>
    </tr>
    <tr class="total">
      <td>Total à payer</td>
      <td class="num">{{ number_format($salaireFixe + $commission, 0, ',', ' ') }}</td>
    </tr>
  </tbody>
</table>

{{-- ── SIGNATURES ────────────────────────────────────────────────── --}}
<div class="sig-section">
  <div class="sig-title">Signatures &amp; Approbation</div>
  <div class="sig-grid">
    <div class="sig-cell">
      <div class="sig-lbl">Signature de l'employé(e)</div>
      <div class="sig-sub">Reçu pour solde</div>
      <div class="sig-box"></div>
    </div>
    <div class="sig-cell">
      <div class="sig-lbl">Cachet de l'entreprise</div>
      <div class="sig-sub">{{ $entreprise['nom'] }}</div>
      <div class="sig-box"></div>
    </div>
  </div>
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
