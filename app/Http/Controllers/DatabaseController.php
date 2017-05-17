<?php
namespace App\Http\Controllers;

use Illuminate\Support\Facades\Schema;

class DatabaseController extends Controller
{
    public function migrate()
    {
        Schema::connection('mysql')->create('sp_admins', function($table)
        {
            $table->increments('id');
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->tinyInteger('super_admin')->default(0);
            $table->tinyInteger('active')->default(1);

            $table->timestamps();
        });
    }
}