<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_xuxemons', function (Blueprint $table) {
            $table->integer('food_eaten')->default(0); // Comptador de xuxes
            $table->string('disease')->nullable();     // Per a la Fase 2 (Atracón, etc.)
        });
    }

    public function down(): void
    {
        Schema::table('user_xuxemons', function (Blueprint $table) {
            $table->dropColumn(['food_eaten', 'disease']);
        });
    }
};