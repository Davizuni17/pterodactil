<?php

namespace Pterodactyl\Models;

use Illuminate\Database\Eloquent\Model;

class GlobalChatMessage extends Model
{
    protected $fillable = ['user_id', 'content', 'type', 'attachment_url'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
