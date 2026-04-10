<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Xuxemon;

class XuxemonSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $xuxemons = [
            ['name' => 'Aguamon', 'type' => 'Aigua', 'size' => 'Petit', 'image' => 'aguamon.png'],
            ['name' => 'Tierramon', 'type' => 'Terra', 'size' => 'Mitja', 'image' => 'tierramon.png'],
            ['name' => 'Airemon', 'type' => 'Aire', 'size' => 'Gran', 'image' => 'airemon.png'],
            ['name' => 'Burbujamon', 'type' => 'Aigua', 'size' => 'Mitja', 'image' => 'burbujamon.png'],
            ['name' => 'Rocamon', 'type' => 'Terra', 'size' => 'Gran', 'image' => 'rocamon.png'],
            ['name' => 'Nubemon', 'type' => 'Aire', 'size' => 'Petit', 'image' => 'nubemon.png'],
        ];

        foreach ($xuxemons as $xuxemon) {
            Xuxemon::updateOrCreate(['name' => $xuxemon['name']], $xuxemon);
        }
    }
}
