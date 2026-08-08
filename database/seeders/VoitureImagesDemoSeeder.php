<?php

namespace Database\Seeders;

use App\Models\Voiture;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class VoitureImagesDemoSeeder extends Seeder
{
    public function run(): void
    {
        $vehicules = [
            [
                'marque' => 'Ford', 'modele' => 'Transit', 'annee' => 2024, 'couleur' => 'Blanc',
                'usage' => 'location', 'etat' => 'neuf', 'energie' => 'diesel', 'boite' => 'manuelle',
                'desc' => "Ford Transit utilitaire, grand volume de chargement, idéal transport de marchandises.",
                'images' => ['5Tw6fnzQEwLxHhWj1sEUeV0fInuCrZQPTlXTodXG.jpg', 'UVBJgla0xcPRvwHNbz6Qjo7bXhLL9LSdvZDYwY2b.jpg', 'aRPT7m5MnLLV0O55hfEQautKUQttq2OxpkwwU8P7.jpg'],
            ],
            [
                'marque' => 'Ford', 'modele' => 'Bronco', 'annee' => 2023, 'couleur' => 'Rouge',
                'usage' => 'vente', 'etat' => 'occasion', 'energie' => 'essence', 'boite' => 'automatique',
                'desc' => "Ford Bronco 4x4, look aventurier, parfait pour tout-terrain.",
                'images' => ['CvXhxzyXEkzutyfvOamtQuXFqrBrLvoCTb1XjLiE.jpg', 'Fc5otd1FJlzpmsdI7IqZIj5BErIQrboU5vD1t67C.jpg', 'wqREUdelpiMnOCfBugMSxPAupq4UYoHQYfLrhHZl.jpg', 'j92lWuujIuGTL9zogrQFC8xZZQsg2DZ4sMN8JSAK.jpg'],
            ],
            [
                'marque' => 'Volkswagen', 'modele' => 'T-Roc', 'annee' => 2022, 'couleur' => 'Blanc/Rouge',
                'usage' => 'vente', 'etat' => 'occasion', 'energie' => 'essence', 'boite' => 'automatique',
                'desc' => "VW T-Roc SUV compact, toit contrasté, intérieur sport rouge/noir.",
                'images' => ['2LEgOshd5RrhfkL8FIMY4s4I4Aqn8fkzOMSGoMb7.jpg', 'BoAXNb0AXpTJFZ594HHSc143El6fOp2kjR1FYcLM.jpg', 'rYXC8Tj5Vw9jj2f7annnLcMm0zdSqI2mfrHK3IkU.jpg', 'Q1F0ROViiYeGebw8LiiDb6HrTdkxSvplclBapVn0.jpg', 'hn4sO9gIrmyxLjgVQG3wYqh2pyxeLxDvv7WBV8o5.jpg'],
            ],
            [
                'marque' => 'Hyundai', 'modele' => 'i20', 'annee' => 2023, 'couleur' => 'Rouge',
                'usage' => 'location', 'etat' => 'occasion', 'energie' => 'essence', 'boite' => 'manuelle',
                'desc' => "Hyundai i20 citadine dynamique, faible consommation, entretien facile.",
                'images' => ['9SobX0iD4WPbkNrn9KrrdnF3uzj3VOQRoNEty7O5.webp', 'Ejhh8YdaySxBptXLRVzQi7AeBgh4iCseDXSyqDjn.webp', 'NGokiKU3A3CquV3HtIGL0qpNkolP23mrQ7wD7yVe.webp', '5gky10NH3lxcDGFfUt9GPx70JRXo6f21qEBDptb6.webp'],
            ],
            [
                'marque' => 'Suzuki', 'modele' => 'Across', 'annee' => 2024, 'couleur' => 'Gris',
                'usage' => 'vente', 'etat' => 'neuf', 'energie' => 'hybride', 'boite' => 'automatique',
                'desc' => "Suzuki Across hybride rechargeable, 7 places, technologie récente.",
                'images' => ['93MO6YvZFA6I4yeVpgkTeG2lHp5nSSrgnJ32uY0p.png', 'DPewmGvcMvdFdhEBtA5JviFmKb0vsMeAYKDJhOBi.png', 'ecT66E5rTfWuiKuUg2SK2p2SxQkkMHPPCjyS65lg.png', 'nmdQGu0kaRRBAPrWOV2Ltan6OXNkNhrrkhvLG42z.png'],
            ],
            [
                'marque' => 'Suzuki', 'modele' => 'Across', 'annee' => 2024, 'couleur' => 'Vert',
                'usage' => 'vente', 'etat' => 'neuf', 'energie' => 'hybride', 'boite' => 'automatique',
                'desc' => "Suzuki Across hybride, coloris vert kaki, finition haut de gamme.",
                'images' => ['Brd0Ose0uHz0h5eQZDW1yllgXbngPLDcxZUQPEac.png', 'aQTPDcLdZgkCGo4bvrOYVdJyLeTXWYDjFeRexv2R.png'],
            ],
            [
                'marque' => 'Toyota', 'modele' => 'Yaris Cross GR Sport', 'annee' => 2024, 'couleur' => 'Blanc',
                'usage' => 'vente', 'etat' => 'neuf', 'energie' => 'hybride', 'boite' => 'automatique',
                'desc' => "Toyota Yaris Cross GR Sport hybride, finition sportive, faible consommation.",
                'images' => ['DIcRzI6B8YWUbLyzzAXmH4g6EFVDmgKY8PCKvw0t.jpg', 'SSGy5BXhDeXxSGIubrPL0R0ysAVnWPnC0WlsFGGr.jpg', 'QJ167ihZiXNUwBEjzcBR4bCt4gpzvxuNuDunC0QW.jpg'],
            ],
            [
                'marque' => 'Toyota', 'modele' => 'Corolla Hybrid', 'annee' => 2023, 'couleur' => 'Argent',
                'usage' => 'vente', 'etat' => 'occasion', 'energie' => 'hybride', 'boite' => 'automatique',
                'desc' => "Toyota Corolla Hybrid, fiabilité reconnue, faible consommation en usage urbain.",
                'images' => ['Erb3Ddv4W4wb2JDZD68ozRziy85jhQEfoos81ZwL.webp', 'R5NPIZLs4jh1ffJtD6O0MfnDVzSrofxvo3Za5cga.webp', 'DwyjW2PSt3aBlgHS48LlgBwAjH4H8rh1ry7wxvMs.webp', '30RPa5xk3r03EpYyTFJnH4lpnIrtAUyeadr3eIRF.webp', 'uOSLCFpjx68YfAeJNW2Ep1Vn9CmqT5Ohjo4I10I1.jpg'],
            ],
            [
                'marque' => 'BMW', 'modele' => 'X3', 'annee' => 2024, 'couleur' => 'Gris',
                'usage' => 'vente', 'etat' => 'occasion', 'energie' => 'essence', 'boite' => 'automatique',
                'desc' => "BMW X3 M Sport, finition premium, jantes noires, intérieur cuir.",
                'images' => ['AgJfjzCSRMF3YoTIv0xuyar3hhlfiW4hVIysqKUx.jpg', 'ERcyY6PaA8hxiL74FROaEcOU4rHx7M8yQMcS1jHD.jpg', 'lE5RmISGUkjD9AV3htrqF4zU1spzmUPGllpXlTmt.jpg', 'yEUHgsLBiYpLGlciooxCzQMezcRjslb4BittsYSN.jpg'],
            ],
            [
                'marque' => 'BMW', 'modele' => 'X1', 'annee' => 2024, 'couleur' => 'Champagne',
                'usage' => 'vente', 'etat' => 'occasion', 'energie' => 'diesel', 'boite' => 'automatique',
                'desc' => "BMW X1, teinte champagne élégante, faible kilométrage.",
                'images' => ['WLFe1ZmN3A6kNQqVbuC1AliiNT6smUbpdYn540EJ.jpg', 'y3rQTjnmXBu1246kWUDad1rZ6zZBY3BFoRrAwy84.jpg', 'yIts7okOw8tgnsh9Z8ad7zDUEFyU3WRNSBNLPxa6.jpg'],
            ],
            [
                'marque' => 'Nissan', 'modele' => 'Almera', 'annee' => 2023, 'couleur' => 'Blanc',
                'usage' => 'vente', 'etat' => 'neuf', 'energie' => 'essence', 'boite' => 'manuelle',
                'desc' => "Nissan Almera berline familiale, spacieuse et économique.",
                'images' => ['0lgBJpf5JLRhT7ab8V45cY1TCOBCSBTw3Dvpf9zB.jpg', '565YYp9jP68XXj1jUQVanms1lUsVTrMlBxeFVGLw.jpg', 'WX9cVPMDu1i83MbjLESOYgOEIcARbqSxaw7cNaGI.png', 'njgNIRiZh3VfbY8sE1R46hWik7rngbawax9lB5Lm.png', 'jwJ8tpnGhbn4H572Qvd4KDFFATl5NjVCvTpOQBTc.webp', 'y08Iv3MUf87ZpZ1ig7j67ZImX3mZLzuz29ezPkmH.jpg'],
            ],
            [
                'marque' => 'Mitsubishi', 'modele' => 'Outlander Sport', 'annee' => 2024, 'couleur' => 'Orange',
                'usage' => 'vente', 'etat' => 'neuf', 'energie' => 'essence', 'boite' => 'automatique',
                'desc' => "Mitsubishi Outlander Sport, teinte orange dynamique, look urbain.",
                'images' => ['6XDxh6PtZAf3bk6kmCSzZEPoL0J6VBkFn87CTjWB.png', 'd1JMZUrsg35S5LCk3uKh3tilg10xMgXSorIKXgrL.jpg'],
            ],
            [
                'marque' => 'Mitsubishi', 'modele' => 'Eclipse Cross', 'annee' => 2024, 'couleur' => 'Gris',
                'usage' => 'vente', 'etat' => 'neuf', 'energie' => 'essence', 'boite' => 'automatique',
                'desc' => "Mitsubishi Eclipse Cross, robuste et polyvalent, 4x4 disponible.",
                'images' => ['ScZGolK1QjnGXvhl4XEPiW7G9pAULjauRGnbXxlr.png', 'VePrgc1fpcahoUutxQVDcV9n1UW1LXm3ve0Nmbjv.png', 'wVYNsTuYozmjZhDVEu5lxvhFDn70KJSwbs1s5phm.png'],
            ],
            [
                'marque' => 'Kia', 'modele' => 'Seltos', 'annee' => 2024, 'couleur' => 'Bleu-vert',
                'usage' => 'location', 'etat' => 'neuf', 'energie' => 'essence', 'boite' => 'automatique',
                'desc' => "Kia Seltos SUV moderne, coloris bleu-vert original, très demandé en location.",
                'images' => ['Xtvxn0oHiAKBTwZF02M9grNMKwzOXTJ4kH8tgMzv.png', 'fUWu0gqibjLrYDBIRPsKOpY4DBpW16hZyI8hXudQ.png', 'uaWLt8aGt8FkYUqclN7xld9XI4WuCiEMqDNknegt.png', 'Z5jJlQQZnHOTse30BpCNQVgT9OUolQwkELuqCORE.png'],
            ],
            [
                'marque' => 'Honda', 'modele' => 'Passport', 'annee' => 2024, 'couleur' => 'Beige',
                'usage' => 'vente', 'etat' => 'neuf', 'energie' => 'essence', 'boite' => 'automatique',
                'desc' => "Honda Passport SUV familial, intérieur cuir tan/noir, très bien équipé.",
                'images' => ['YbUWfA2PqK6v3TTa2ZEaweGGPktTCcKASFoPpvRP.png', 'aRS9nilH24a7rqEZQaHOgoh4CLShtyKO97ewkcuD.png', 'NiRsGN00nAra029qjEEZZGYEl0GaKew9IlqsJwVl.png', 'IUGhtojSOTXr04ZZDy2j6yjvt5cUJCWO99ORFnli.jpg'],
            ],
            [
                'marque' => 'Jeep', 'modele' => 'Grand Wagoneer', 'annee' => 2023, 'couleur' => 'Argent',
                'usage' => 'vente', 'etat' => 'occasion', 'energie' => 'essence', 'boite' => 'automatique',
                'desc' => "Jeep Grand Wagoneer, grand SUV premium, 4x4, très spacieux.",
                'images' => ['ImcbgXXzWrgYB5ykWmhwGsV28rZko2EwUW4VA7mJ.jpg', 'zJjMoxv6fOyAMiGdAw2eDu0DcLZel3AFT7dTJC9D.jpg'],
            ],
        ];

        $today = now();

        foreach ($vehicules as $v) {
            $km = $v['etat'] === 'neuf' ? rand(0, 4000) : rand(8000, 90000);
            $prix = null;
            $prixVente = null;
            if ($v['usage'] === 'location') {
                $prix = rand(14, 35) * 1000;
            } elseif ($v['usage'] === 'vente') {
                $prixVente = rand(9, 38) * 1000000;
            } else {
                $prix = rand(14, 35) * 1000;
                $prixVente = rand(9, 38) * 1000000;
            }

            $chassis = 'CHS-' . $today->format('ymd') . '-' . strtoupper(Str::random(8));

            $voiture = Voiture::create([
                'marque' => $v['marque'],
                'modele' => $v['modele'],
                'annee' => $v['annee'],
                'couleur' => $v['couleur'],
                'prix' => $prix,
                'prix_vente' => $prixVente,
                'kilometrage' => $km,
                'numero_chassis' => $chassis,
                'date_acquisition' => $today->copy()->subDays(rand(5, 200))->toDateString(),
                'statut' => 'disponible',
                'type_usage' => $v['usage'],
                'etat' => $v['etat'],
                'energie' => $v['energie'],
                'type_boite' => $v['boite'],
                'description' => $v['desc'],
                'image_principale' => 'voitures/' . $v['images'][0],
            ]);

            foreach ($v['images'] as $ordre => $img) {
                DB::table('image_voitures')->insert([
                    'id_voiture' => $voiture->id,
                    'chemin' => 'voitures/' . $img,
                    'legible' => 1,
                    'ordre' => $ordre,
                ]);
            }
        }

        $this->command->info('Véhicules démo créés: ' . count($vehicules));
    }
}
