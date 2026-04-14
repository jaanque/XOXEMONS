<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Friendship;
use Illuminate\Support\Facades\Auth;


class FriendController extends Controller
{
    // 1. Cercar usuaris per ID (mínim 3 caràcters es controla al front)
    public function searchUsers(Request $request) {
        $query = $request->query('q');
        $myId = Auth::id();

        // Busquem usuaris que coincideixin amb el custom_id (#NomXXXX) i que NO siguem nosaltres mateixos
        $users = User::where('custom_id', 'LIKE', "%{$query}%")
                     ->where('id', '!=', $myId)
                     ->select('id', 'name', 'custom_id')
                     ->get();

        return response()->json($users);
    }

    // 2. Enviar sol·licitud d'amistat
    public function sendRequest(Request $request) {
        $request->validate(['friend_id' => 'required|exists:users,id']);
        
        $userId = Auth::id();
        $friendId = $request->friend_id;

        if ($userId === $friendId) {
            return response()->json(['message' => 'No et pots afegir a tu mateix!'], 400);
        }

        // Comprovem si ja existeix una relació prèvia
        $existing = Friendship::where(function($q) use ($userId, $friendId) {
            $q->where('user_id', $userId)->where('friend_id', $friendId);
        })->orWhere(function($q) use ($userId, $friendId) {
            $q->where('user_id', $friendId)->where('friend_id', $userId);
        })->first();

        if ($existing) {
            return response()->json(['message' => 'Ja existeix una sol·licitud o amistat amb aquest usuari.'], 400);
        }

        Friendship::create([
            'user_id' => $userId,
            'friend_id' => $friendId,
            'status' => 'pending'
        ]);

        return response()->json(['message' => 'Sol·licitud enviada correctament!']);
    }

    // 3. Llistar sol·licituds rebudes pendents
    public function getPendingRequests() {
        $requests = Friendship::where('friend_id', Auth::id())
                              ->where('status', 'pending')
                              ->join('users', 'friendships.user_id', '=', 'users.id')
                              ->select('friendships.id as friendship_id', 'users.id as user_id', 'users.name', 'users.custom_id')
                              ->get();

        return response()->json($requests);
    }

    // 4. Acceptar sol·licitud
    public function acceptRequest($id) {
        $friendship = Friendship::where('id', $id)
                                ->where('friend_id', Auth::id())
                                ->firstOrFail();

        $friendship->status = 'accepted';
        $friendship->save();

        return response()->json(['message' => 'Sol·licitud acceptada! Ja sou amics.']);
    }

    // 5. Rebutjar sol·licitud
    public function rejectRequest($id) {
        $friendship = Friendship::where('id', $id)
                                ->where('friend_id', Auth::id())
                                ->firstOrFail();

        $friendship->delete();

        return response()->json(['message' => 'Sol·licitud rebutjada.']);
    }

    // 6. Llistar amics (bidireccional: on soc user_id O friend_id)
    public function getFriends() {
        $myId = Auth::id();

        $friends = Friendship::where('status', 'accepted')
            ->where(function($q) use ($myId) {
                $q->where('user_id', $myId)->orWhere('friend_id', $myId);
            })
            ->get()
            ->map(function($friendship) use ($myId) {
                // Retornem les dades de l'altre usuari, no les meves
                $otherUserId = ($friendship->user_id === $myId) ? $friendship->friend_id : $friendship->user_id;
                $friendData = User::find($otherUserId);
                
                return [
                    'friendship_id' => $friendship->id,
                    'user_id' => $friendData->id,
                    'name' => $friendData->name,
                    'custom_id' => $friendData->custom_id
                ];
            });

        return response()->json($friends);
    }

    // 7. Eliminar amic
    public function removeFriend($id) {
        $myId = Auth::id();
        
        $friendship = Friendship::where('id', $id)
            ->where(function($q) use ($myId) {
                $q->where('user_id', $myId)->orWhere('friend_id', $myId);
            })->firstOrFail();

        $friendship->delete();

        return response()->json(['message' => 'Amic eliminat correctament.']);
    }
}