<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin user
        User::updateOrCreate(
            ['email' => 'admin@xoxemons.com'],
            [
                'custom_id' => 'ADMIN001',
                'name' => 'Admin',
                'surnames' => 'System',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );

        // Player users
        User::updateOrCreate(
            ['email' => 'jan@example.com'],
            [
                'custom_id' => 'USER001',
                'name' => 'Jan',
                'surnames' => 'Test',
                'password' => Hash::make('password'),
                'role' => 'player',
            ]
        );

        User::updateOrCreate(
            ['email' => 'marc@example.com'],
            [
                'custom_id' => 'USER002',
                'name' => 'Marc',
                'surnames' => 'Frances',
                'password' => Hash::make('password'),
                'role' => 'player',
            ]
        );
    }
}
