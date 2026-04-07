<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\UserXuxemon;
use App\Models\Xuxemon;

class XuxemonController extends Controller {
    
    public function index() {
        // Retorna tots els xuxemons de l'usuari (afegim withPivot per portar el food_eaten)
        $xuxemons = Auth::user()->xuxemons()->withPivot('id', 'food_eaten', 'disease')->get();
        return response()->json($xuxemons);
    }

    public function feed(Request $request, $pivot_id)
        {
            $user = Auth::user();
            
            $userXuxemon = \App\Models\UserXuxemon::where('id', $pivot_id)
                            ->where('user_id', $user->id)
                            ->first();

            if (!$userXuxemon) {
                return response()->json(['message' => 'Xuxemon no trobat a la teva col·lecció'], 404);
            }

            // 1. COMPROVACIÓ DE MALALTIA: "Atracón"
            if ($userXuxemon->disease === 'Atracón') {
                return response()->json(['message' => 'Aquest Xuxemon té un Atracón i no pot menjar més fins que el vacunis!'], 400);
            }

            $itemId = $request->input('item_id');
            $userItem = $user->items()->where('item_id', $itemId)->first();

            if (!$userItem || $userItem->pivot->quantity < 1) {
                return response()->json(['message' => 'No tens suficients xuxes daquest tipus'], 400);
            }

            // Restem la xuxe
            $user->items()->updateExistingPivot($itemId, [
                'quantity' => $userItem->pivot->quantity - 1
            ]);

            // Sumem el menjar
            $userXuxemon->food_eaten += 1;

            // --- LÒGICA D'EVOLUCIÓ ---
            $currentXuxemon = \App\Models\Xuxemon::find($userXuxemon->xuxemon_id);
            $evolved = false;
            $nextSize = '';
            $requiredFood = 0;

            if ($currentXuxemon->size === 'Petit') {
                $nextSize = 'Mitja';
                $requiredFood = 3;
            } elseif ($currentXuxemon->size === 'Mitja') {
                $nextSize = 'Gran';
                $requiredFood = 5;
            }

            // 2. COMPROVACIÓ DE MALALTIA: "Bajón de azúcar" (+2 xuxes)
            if ($userXuxemon->disease === 'Bajón de azúcar') {
                $requiredFood += 2;
            }

            if ($nextSize !== '' && $userXuxemon->food_eaten >= $requiredFood) {
                $nextXuxemon = \App\Models\Xuxemon::where('type', $currentXuxemon->type)
                                    ->where('size', $nextSize)
                                    ->first();
                                    
                if ($nextXuxemon) {
                    $userXuxemon->xuxemon_id = $nextXuxemon->id;
                    $userXuxemon->food_eaten = 0;
                    $userXuxemon->disease = null; // Al evolucionar es cura!
                    $evolved = true;
                }
            }

            // 3. SISTEMA D'INFECCIÓ (només si no ha evolucionat)
            if (!$evolved) {
                $chance = rand(1, 100);
                
                if ($chance <= 15) {
                    $userXuxemon->disease = 'Atracón';
                } elseif ($chance <= 25) { // 15 + 10 = 25% (Sobredosis)
                    $userXuxemon->disease = 'Sobredosis de sucre';
                } elseif ($chance <= 30) { // 25 + 5 = 30% (Bajón)
                    $userXuxemon->disease = 'Bajón de azúcar';
                }
            }

            $userXuxemon->save();

            return response()->json([
                'message' => $evolved ? 'El teu Xuxemon ha evolucionat!' : 'Xuxemon alimentat correctament!',
                'food_eaten' => $userXuxemon->food_eaten,
                'evolved' => $evolved,
                'disease' => $userXuxemon->disease // Retornem la malaltia per al Frontend
            ]);
        }
}