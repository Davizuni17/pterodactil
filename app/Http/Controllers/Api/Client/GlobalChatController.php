<?php

namespace Pterodactyl\Http\Controllers\Api\Client;

use Pterodactyl\Models\GlobalChatMessage;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Pterodactyl\Http\Requests\Api\Client\ClientApiRequest;
use Illuminate\Http\Request;

class GlobalChatController extends ClientApiController
{
    public function index(ClientApiRequest $request)
    {
        return GlobalChatMessage::with('user')->latest()->take(50)->get()->reverse()->values();
    }

    public function store(ClientApiRequest $request)
    {
        $this->validate($request, [
            'content' => 'nullable|string|max:500',
            'type' => 'required|in:text,image,audio,share',
            'file' => 'nullable|file|max:5120', // 5MB max
        ]);

        $url = null;
        if ($request->hasFile('file')) {
            // Store in public disk
            $path = $request->file('file')->store('chat_attachments', 'public');
            $url = '/storage/' . $path;
        }

        $message = GlobalChatMessage::create([
            'user_id' => $request->user()->id,
            'content' => $request->input('content'),
            'type' => $request->input('type'),
            'attachment_url' => $url,
        ]);

        return $message->load('user');
    }
}
