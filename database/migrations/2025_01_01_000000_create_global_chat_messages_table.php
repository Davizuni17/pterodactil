<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateGlobalChatMessagesTable extends Migration
{
    public function up()
    {
        Schema::create('global_chat_messages', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('user_id');
            $table->text('content')->nullable();
            $table->string('type')->default('text'); // text, image, audio, share
            $table->string('attachment_url')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('global_chat_messages');
    }
}
