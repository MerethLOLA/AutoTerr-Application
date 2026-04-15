<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['username' => 'rebecca'],
            [
                'name' => 'Rebecca Admin',
                'email' => 'rebecca@sunupark.com',
                'password' => Hash::make('admin123'),
                'password_hash' => Hash::make('admin123'),
                'role' => 'admin',
                'statut' => 'actif',
            ]
        );
    }
}
