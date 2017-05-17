<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasTable('sp_course_users')) {
            Schema::create('sp_course_users', function (Blueprint $table) {
                $table->increments('ID')->unique()->primary()->index();
                $table->string('email')->unique();
                $table->string('password', 60);
                $table->string('first_name');
                $table->string('last_name');

                $table->integer('image')->nullable()->index();
                $table->string('city');
                $table->string('address');
                $table->text('description');
                $table->string('salt');
                $table->string('api_token');
                $table->dateTime('create_date');

                $table->rememberToken();
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('sp_course_users');
    }
}
