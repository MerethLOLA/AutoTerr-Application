<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; color: #223554; font-size: 12px; }
        .page { border: 1px solid #d8e1ea; }
        .header { background: #132b4c; color: #fff; padding: 24px; }
        .eyebrow { color: #f3b06a; font-size: 11px; text-transform: uppercase; letter-spacing: .18em; margin: 0 0 8px; }
        h1 { margin: 0 0 10px; font-size: 24px; }
        .meta { font-size: 11px; line-height: 1.6; opacity: .95; }
        .content { padding: 24px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #d8e1ea; padding: 10px 12px; vertical-align: top; }
        th { width: 34%; text-align: left; background: #f8fafc; }
        .footer { margin-top: 16px; font-size: 10px; color: #718197; }
    </style>
</head>
<body>
    <div class="page">
        <div class="header">
            <table style="width:100%; border-collapse:collapse;">
                <tr>
                    <td style="width:200px; vertical-align:middle; border:none; padding:0;">
                        <div style="overflow:hidden; width:190px; height:56px;">
                            <img src="{{ public_path('logo.png') }}" alt="AutoTerr"
                                 style="width:190px; height:auto; margin-top:-160px; display:block;">
                        </div>
                    </td>
                    <td style="vertical-align:middle; text-align:right; border:none; padding:0; color:#fff;">
                        <p class="eyebrow" style="text-align:right; margin:0 0 4px;">Document export</p>
                        <p style="margin:0; font-size:18px; font-weight:bold;">{{ $title }}</p>
                    </td>
                </tr>
            </table>
            <div class="meta" style="margin-top:12px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.2);">
                {{ $entreprise['nom'] }} &nbsp;|&nbsp;
                {{ $entreprise['adresse'] }} &nbsp;|&nbsp;
                NINEA: {{ $entreprise['ninea'] }} &nbsp;|&nbsp; RCCM: {{ $entreprise['rccm'] }}
            </div>
        </div>

        <div class="content">
            <table>
                <tbody>
                    @foreach ($rows as $label => $value)
                        <tr>
                            <th>{{ $label }}</th>
                            <td>{{ $value ?: '-' }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>

            <p class="footer">Document genere depuis AutoTerr.</p>
        </div>
    </div>
</body>
</html>
