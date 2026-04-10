<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\UserItem;
use App\Models\User;
use App\Models\Item;

class UserItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::where('role', 'player')->get();
        $items = Item::all();

        foreach ($users as $user) {
            foreach ($items as $item) {
                UserItem::create([
                    'user_id' => $user->id,
                    'item_id' => $item->id,
                    'quantity' => rand(1, 10),
                ]);
            }
        }
    }
}
