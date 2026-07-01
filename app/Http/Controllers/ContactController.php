<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nom'       => 'required|string|max:100',
            'telephone' => 'nullable|string|max:20',
            'email'     => 'nullable|email|max:150',
            'message'   => 'required|string|max:1000',
        ]);

        ContactMessage::create($data);

        return response()->json(['message' => 'Message envoyé avec succès.'], 201);
    }

    public function index(): JsonResponse
    {
        $messages = ContactMessage::latest()->paginate(25);
        return response()->json($messages);
    }

    public function markRead(ContactMessage $contactMessage): JsonResponse
    {
        $contactMessage->update(['lu' => true]);
        return response()->json(['message' => 'Marqué comme lu.']);
    }
}
