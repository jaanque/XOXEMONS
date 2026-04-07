<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot; // ATENCIÓ: Canviem Model per Pivot

class UserXuxemon extends Pivot
{
    protected $table = 'user_xuxemons';

    protected $fillable = [
        'user_id',
        'xuxemon_id',
        'food_eaten',
        'disease'
    ];
}