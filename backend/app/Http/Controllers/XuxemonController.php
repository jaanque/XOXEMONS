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
        
        // 1. Busquem l'enllaç entre l'usuari i el xuxemon mitjançant el pivot_id
        $userXuxemon = UserXuxemon::where('id', $pivot_id)
                        ->where('user_id', $user->id)
                        ->first();

        if (!$userXuxemon) {
            return response()->json(['message' => 'Xuxemon no trobat a la teva col·lecció'], 404);
        }

        // 2. Comprovem si l'usuari té la xuxe a l'inventari
        $itemId = $request->input('item_id');
        $userItem = $user->items()->where('item_id', $itemId)->first();

        if (!$userItem || $userItem->pivot->quantity < 1) {
            return response()->json(['message' => 'No tens suficients xuxes daquest tipus'], 400);
        }

        // 3. Restem 1 xuxe de l'inventari
        $user->items()->updateExistingPivot($itemId, [
            'quantity' => $userItem->pivot->quantity - 1
        ]);

        // 4. Sumem 1 al menjar del Xuxemon
        $userXuxemon->food_eaten += 1;

        // --- LÒGICA D'EVOLUCIÓ ---
        $currentXuxemon = Xuxemon::find($userXuxemon->xuxemon_id);
        $evolved = false;

        // De Petit a Mitjà (Requereix 3 xuxes)
        if ($currentXuxemon->size === 'Petit' && $userXuxemon->food_eaten >= 3) {
            // Busquem l'evolució (suposem que és la ID següent)
            $nextXuxemon = Xuxemon::find($currentXuxemon->id + 1); 
            if ($nextXuxemon && $nextXuxemon->size === 'Mitja') {
                $userXuxemon->xuxemon_id = $nextXuxemon->id;
                $userXuxemon->food_eaten = 0; // Reiniciem el comptador
                $evolved = true;
            }
        }
        // De Mitjà a Gran (Requereix 5 xuxes)
        elseif ($currentXuxemon->size === 'Mitja' && $userXuxemon->food_eaten >= 5) {
             $nextXuxemon = Xuxemon::find($currentXuxemon->id + 1);
             if ($nextXuxemon && $nextXuxemon->size === 'Gran') {
                 $userXuxemon->xuxemon_id = $nextXuxemon->id;
                 $userXuxemon->food_eaten = 0; // Reiniciem el comptador
                 $evolved = true;
             }
        }

        $userXuxemon->save();

        return response()->json([
            'message' => $evolved ? 'El teu Xuxemon ha evolucionat!' : 'Xuxemon alimentat correctament!',
            'food_eaten' => $userXuxemon->food_eaten,
            'evolved' => $evolved,
            'new_xuxemon' => $evolved ? Xuxemon::find($userXuxemon->xuxemon_id) : null
        ]);
    }
}