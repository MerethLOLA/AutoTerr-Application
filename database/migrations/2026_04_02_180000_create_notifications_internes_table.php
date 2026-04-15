<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications_internes', function (Blueprint $table) {
            $table->id();
            $table->string('type')->index();
            $table->string('signature')->unique();
            $table->string('niveau', 30)->default('info')->index();
            $table->string('titre');
            $table->text('message');
            $table->string('url')->nullable();
            $table->timestamp('declenchee_at')->useCurrent()->index();
            $table->timestamp('lue_at')->nullable()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications_internes');
    }
};
