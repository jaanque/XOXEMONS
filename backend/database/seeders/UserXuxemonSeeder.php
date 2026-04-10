<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\UserXuxemon;
use App\Models\User;
use App\Models\Xuxemon;

class UserXuxemonSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::where('role', 'player')->get();
        $xuxemons = Xuxemon::all();

        foreach ($users as $user) {
            // Assign 2 random xuxemons to each player
            $randomXuxemons = $xuxemons->random(2);
            foreach ($randomXuxemons as $xuxemon) {
                UserXuxemon::create([
                    'user_id' => $user->id,
                    'xuxemon_id' => $xuxemon->id,
                    'food_eaten' => rand(0, 5),
                    'disease' => null,
                ]);
            }
        }
    }
}
