<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Facture {{ $facture->numero_facture }}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #1a2535; background: #fff; }

  /* ── Layout ──────────────────────────────────────── */
  .page { padding: 36px 40px; min-height: 100vh; position: relative; }

  /* ── Header ──────────────────────────────────────── */
  .header { display: table; width: 100%; margin-bottom: 32px; }
  .header-left  { display: table-cell; vertical-align: top; width: 55%; }
  .header-right { display: table-cell; vertical-align: top; width: 45%; text-align: right; }

  .brand-name  { font-size: 22px; font-weight: 700; color: #2d1b3d; letter-spacing: -0.5px; }
  .brand-sub   { font-size: 9.5px; color: #7b8fa6; text-transform: uppercase; letter-spacing: .14em; margin-top: 2px; }
  .brand-addr  { margin-top: 8px; font-size: 9.5px; color: #546070; line-height: 1.7; }
  .brand-legal { margin-top: 4px; font-size: 8.5px; color: #8a9bb0; }

  .facture-label { font-size: 28px; font-weight: 700; color: #2d1b3d; line-height: 1; }
  .facture-num   { font-size: 13px; font-weight: 700; color: #2d1b3d; margin-top: 4px; }
  .facture-meta  { margin-top: 8px; font-size: 9.5px; color: #546070; line-height: 1.8; }
  .facture-meta strong { color: #1a2535; }

  /* ── Statut badge ─────────────────────────────────── */
  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 9px;
           font-weight: 700; text-transform: uppercase; letter-spacing: .1em; margin-top: 8px; }
  .badge-payee   { background: #dcfce7; color: #166534; }
  .badge-impayee { background: #fee2e2; color: #991b1b; }
  .badge-partiel { background: #fef9c3; color: #854d0e; }
  .badge-retard  { background: #ffedd5; color: #9a3412; }

  /* ── Separateur ──────────────────────────────────── */
  .divider { border: none; border-top: 1.5px solid #e8edf3; margin: 24px 0; }
  .divider-accent { border-color: #2d1b3d; border-top-width: 3px; margin: 0 0 24px; }

  /* ── Parties ─────────────────────────────────────── */
  .parties { display: table; width: 100%; margin-bottom: 28px; }
  .party   { display: table-cell; width: 50%; vertical-align: top; }
  .party-right { text-align: right; padding-left: 20px; }

  .party-label { font-size: 8px; font-weight: 700; text-transform: uppercase;
                 letter-spacing: .16em; color: #8a9bb0; margin-bottom: 6px; }
  .party-name  { font-size: 13px; font-weight: 700; color: #1a2535; }
  .party-detail { font-size: 9.5px; color: #546070; line-height: 1.75; margin-top: 3px; }

  /* ── Véhicule ────────────────────────────────────── */
  .vehicle-box { background: #f7f9fb; border: 1px solid #e0e7ef; border-radius: 6px;
                 padding: 14px 18px; margin-bottom: 24px; }
  .vehicle-title { font-size: 13px; font-weight: 700; color: #2d1b3d; }
  .vehicle-sub   { font-size: 9.5px; color: #7b8fa6; margin-top: 2px; }
  .vehicle-ref   { font-size: 9px; color: #8a9bb0; margin-top: 6px; }

  /* ── Tableau montants ────────────────────────────── */
  .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  .items-table thead tr { background: #2d1b3d; color: #fff; }
  .items-table th { padding: 9px 14px; text-align: left; font-size: 9px;
                    text-transform: uppercase; letter-spacing: .1em; font-weight: 700; }
  .items-table th.right { text-align: right; }
  .items-table td { padding: 10px 14px; font-size: 10.5px; border-bottom: 1px solid #e8edf3; }
  .items-table td.right { text-align: right; font-weight: 600; }
  .items-table tbody tr:last-child td { border-bottom: none; }
  .items-table tbody tr:nth-child(even) td { background: #fafbfd; }

  /* ── Totaux ──────────────────────────────────────── */
  .totals { width: 42%; margin-left: auto; }
  .total-row { display: table; width: 100%; padding: 5px 0;
               border-bottom: 1px solid #e8edf3; }
  .total-row:last-child { border-bottom: none; }
  .total-label { display: table-cell; font-size: 10px; color: #546070; }
  .total-value { display: table-cell; text-align: right; font-size: 10px;
                 font-weight: 600; color: #1a2535; }
  .total-row.ttc { background: #2d1b3d; border-radius: 4px; padding: 9px 12px;
                   margin-top: 6px; }
  .total-row.ttc .total-label { color: #c8d4e6; font-size: 10.5px; font-weight: 700; }
  .total-row.ttc .total-value { color: #fff; font-size: 13px; font-weight: 700; }

  /* ── Paiements ───────────────────────────────────── */
  .section-title { font-size: 9px; font-weight: 700; text-transform: uppercase;
                   letter-spacing: .15em; color: #8a9bb0; margin: 24px 0 10px; }
  .pay-row { display: table; width: 100%; padding: 6px 0; border-bottom: 1px solid #f0f3f7; font-size: 10px; }
  .pay-row:last-child { border-bottom: none; }
  .pay-cell { display: table-cell; color: #546070; }
  .pay-cell.bold { font-weight: 700; color: #1a2535; }
  .pay-cell.right { text-align: right; }

  /* ── Observations ────────────────────────────────── */
  .obs-box { background: #fffbeb; border-left: 3px solid #f59e0b; padding: 10px 14px;
             margin-top: 20px; font-size: 9.5px; color: #78350f; line-height: 1.6; border-radius: 0 4px 4px 0; }

  /* ── Footer ──────────────────────────────────────── */
  .footer { margin-top: 36px; padding-top: 14px; border-top: 1px solid #e8edf3;
            font-size: 8.5px; color: #9baab8; text-align: center; line-height: 1.7; }
  .footer strong { color: #546070; }
</style>
</head>
<body>
<div class="page">

  {{-- ── HEADER ──────────────────────────────────────── --}}
  <div class="header">
    <div class="header-left">
      <div class="brand-name">SunuPark</div>
      <div class="brand-sub">Parc Automobile</div>
      <div class="brand-addr">
        Dakar, Sénégal<br>
        Tél : +221 33 000 00 00 &nbsp;|&nbsp; contact@sunupark.sn
      </div>
      <div class="brand-legal">
        NINEA : SN-DKR-2026-001 &nbsp;|&nbsp; RCCM : RCCM-SN-DKR-2026-A-001
      </div>
    </div>
    <div class="header-right">
      <div class="facture-label">FACTURE</div>
      <div class="facture-num">{{ $facture->numero_facture }}</div>
      <div class="facture-meta">
        <strong>Date :</strong> {{ optional($facture->date_facture)->format('d/m/Y') ?? '—' }}<br>
        @if($facture->date_echeance)
        <strong>Échéance :</strong> {{ $facture->date_echeance->format('d/m/Y') }}<br>
        @endif
        <strong>Vente :</strong> {{ $facture->vente?->reference_vente ?? '—' }}
      </div>
      @php
        $badgeCls = match($facture->statut) {
          'payee'                => 'badge-payee',
          'impayee'              => 'badge-impayee',
          'partiellement_payee'  => 'badge-partiel',
          'en_retard'            => 'badge-retard',
          default                => 'badge-impayee',
        };
        $badgeTxt = match($facture->statut) {
          'payee'                => 'Payée',
          'impayee'              => 'Impayée',
          'partiellement_payee'  => 'Partiellement payée',
          'en_retard'            => 'En retard',
          default                => $facture->statut,
        };
      @endphp
      <div><span class="badge {{ $badgeCls }}">{{ $badgeTxt }}</span></div>
    </div>
  </div>

  <hr class="divider-accent">

  {{-- ── PARTIES ──────────────────────────────────────── --}}
  <div class="parties">
    <div class="party">
      <div class="party-label">Émetteur</div>
      <div class="party-name">SunuPark Auto Services</div>
      <div class="party-detail">
        Dakar, Sénégal<br>
        NINEA : SN-DKR-2026-001
      </div>
    </div>
    <div class="party party-right">
      <div class="party-label">Facturé à</div>
      @php $client = $facture->vente?->client; @endphp
      <div class="party-name">{{ $client?->nom_complet ?? '—' }}</div>
      <div class="party-detail">
        @if($client?->raison_sociale) {{ $client->raison_sociale }}<br>@endif
        @if($client?->telephone) Tél : {{ $client->telephone }}<br>@endif
        @if($client?->email) {{ $client->email }}<br>@endif
        @if($client?->adresse) {{ $client->adresse }}@endif
      </div>
    </div>
  </div>

  {{-- ── VÉHICULE ─────────────────────────────────────── --}}
  @php $voiture = $facture->vente?->voiture; @endphp
  @if($voiture)
  <div class="vehicle-box">
    <div class="vehicle-title">{{ $voiture->marque }} {{ $voiture->modele }}</div>
    <div class="vehicle-sub">
      @if($voiture->annee) {{ $voiture->annee }} · @endif
      @if($voiture->energie) {{ $voiture->energie }} · @endif
      @if($voiture->couleur) {{ $voiture->couleur }}@endif
    </div>
    @if($voiture->numero_chassis)
    <div class="vehicle-ref">N° chassis : {{ $voiture->numero_chassis }}</div>
    @endif
  </div>
  @endif

  {{-- ── TABLEAU MONTANTS ─────────────────────────────── --}}
  <table class="items-table">
    <thead>
      <tr>
        <th style="width:50%">Désignation</th>
        <th>Mode livraison</th>
        <th class="right">Montant HT</th>
        <th class="right">TVA ({{ number_format($facture->taux_tva, 0) }}%)</th>
        <th class="right">Montant TTC</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          Vente véhicule<br>
          <span style="font-size:9px;color:#7b8fa6;">
            {{ $voiture ? $voiture->marque.' '.$voiture->modele : '—' }}
          </span>
        </td>
        <td style="color:#546070">{{ $facture->mode_livraison ?? '—' }}</td>
        <td class="right">{{ number_format($facture->montant_ht, 0, ',', ' ') }} XOF</td>
        <td class="right">
          {{ number_format($facture->montant_ttc - $facture->montant_ht, 0, ',', ' ') }} XOF
        </td>
        <td class="right" style="color:#2d1b3d;font-weight:700">
          {{ number_format($facture->montant_ttc, 0, ',', ' ') }} XOF
        </td>
      </tr>
      @if($facture->remise > 0)
      <tr>
        <td colspan="4" style="color:#dc2626">Remise accordée</td>
        <td class="right" style="color:#dc2626">- {{ number_format($facture->remise, 0, ',', ' ') }} XOF</td>
      </tr>
      @endif
    </tbody>
  </table>

  {{-- ── TOTAUX ────────────────────────────────────────── --}}
  <div class="totals">
    <div class="total-row">
      <span class="total-label">Montant HT</span>
      <span class="total-value">{{ number_format($facture->montant_ht, 0, ',', ' ') }} XOF</span>
    </div>
    @if($facture->remise > 0)
    <div class="total-row">
      <span class="total-label">Remise</span>
      <span class="total-value" style="color:#dc2626">- {{ number_format($facture->remise, 0, ',', ' ') }} XOF</span>
    </div>
    @endif
    <div class="total-row">
      <span class="total-label">TVA ({{ number_format($facture->taux_tva, 0) }}%)</span>
      <span class="total-value">{{ number_format($facture->montant_ttc - $facture->montant_ht, 0, ',', ' ') }} XOF</span>
    </div>
    <div class="total-row">
      <span class="total-label">Montant payé</span>
      <span class="total-value" style="color:#166534">{{ number_format($facture->montant_paye, 0, ',', ' ') }} XOF</span>
    </div>
    <div class="total-row">
      <span class="total-label">Reste à payer</span>
      <span class="total-value" style="color:{{ $facture->reste_a_payer > 0 ? '#991b1b' : '#166534' }}">
        {{ number_format(max($facture->reste_a_payer, 0), 0, ',', ' ') }} XOF
      </span>
    </div>
    <div class="total-row ttc">
      <span class="total-label">TOTAL TTC</span>
      <span class="total-value">{{ number_format($facture->montant_ttc, 0, ',', ' ') }} XOF</span>
    </div>
  </div>

  {{-- ── HISTORIQUE PAIEMENTS ─────────────────────────── --}}
  @if($facture->paiements->count() > 0)
  <div class="section-title">Historique des paiements</div>
  @foreach($facture->paiements as $p)
  <div class="pay-row">
    <span class="pay-cell bold" style="width:30%">{{ optional($p->date)->format('d/m/Y') ?? '—' }}</span>
    <span class="pay-cell" style="width:40%">{{ ucfirst(str_replace('_', ' ', $p->mode_paiement)) }}</span>
    <span class="pay-cell right bold" style="width:30%">{{ number_format($p->montant, 0, ',', ' ') }} XOF</span>
  </div>
  @endforeach
  @endif

  {{-- ── OBSERVATIONS ─────────────────────────────────── --}}
  @if($facture->observations)
  <div class="obs-box">
    <strong>Observations :</strong> {{ $facture->observations }}
  </div>
  @endif

  {{-- ── FOOTER ──────────────────────────────────────────  --}}
  <div class="footer">
    <strong>SunuPark Auto Services</strong> — Dakar, Sénégal<br>
    NINEA : SN-DKR-2026-001 &nbsp;|&nbsp; RCCM : RCCM-SN-DKR-2026-A-001<br>
    Document généré le {{ now()->format('d/m/Y à H:i') }} depuis SunuPark &middot; Toute reproduction interdite.
  </div>

</div>
</body>
</html>
