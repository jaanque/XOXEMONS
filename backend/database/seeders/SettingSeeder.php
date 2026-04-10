<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            ['key' => 'probabilitat_caure', 'value' => 20],
            ['key' => 'probabilitat_malaltia', 'value' => 10],
            ['key' => 'probabilitat_atracament', 'value' => 5],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(['key' => $setting['key']], $setting);
        }
    }
}
