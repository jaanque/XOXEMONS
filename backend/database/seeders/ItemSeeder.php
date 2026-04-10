<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Item;

class ItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $items = [
            ['name' => 'Caramel de Maduixa', 'type' => 'xuxe', 'is_stackable' => true, 'image' => 'candy_strawberry.png'],
            ['name' => 'Caramel de Llimona', 'type' => 'xuxe', 'is_stackable' => true, 'image' => 'candy_lemon.png'],
            ['name' => 'Vacuna Antigripal', 'type' => 'vacuna', 'is_stackable' => false, 'image' => 'vaccine_flu.png'],
            ['name' => 'Vacuna PowerUp', 'type' => 'vacuna', 'is_stackable' => false, 'image' => 'vaccine_power.png'],
        ];

        foreach ($items as $item) {
            Item::updateOrCreate(['name' => $item['name']], $item);
        }
    }
}
