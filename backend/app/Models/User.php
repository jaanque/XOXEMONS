<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject; //Implementem JWTSubject interface

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'custom_id',
        'name',
        'surnames',
        'email',
        'password',
        'role',
        'last_daily_reward',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'last_daily_reward' => 'datetime',
        ];
    }

    // Implementació dels mètodes de JWTSubject
    public function getJWTIdentifier()    {
        return $this->getKey(); // Retorna l'identificador únic de l'usuari, normalment l'id.
    }

    public function getJWTCustomClaims() {
        return [];
    }
    
    public function xuxemons()
    {
        return $this->belongsToMany(Xuxemon::class, 'user_xuxemons')
                    ->withPivot('id', 'food_eaten', 'disease') // necessari per accedir a aquests camps des del pivot
                    ->withTimestamps();
    }

    public function items() {
    return $this->belongsToMany(Item::class, 'user_items')->withPivot('quantity');
    }
    
}
