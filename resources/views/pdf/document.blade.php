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
            <p class="eyebrow">Document export</p>
            <h1>{{ $title }}</h1>
            <div class="meta">
                {{ $entreprise['nom'] }}<br>
                {{ $entreprise['adresse'] }}<br>
                NINEA: {{ $entreprise['ninea'] }} | RCCM: {{ $entreprise['rccm'] }}
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

            <p class="footer">Document genere depuis SunuPark.</p>
        </div>
    </div>
</body>
</html>
