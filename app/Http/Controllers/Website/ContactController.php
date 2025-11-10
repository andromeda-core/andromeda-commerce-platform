<?php

namespace App\Http\Controllers\Website;

use App\Http\Controllers\Controller;
use App\Jobs\ContactFormSubmissionJob;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactController extends Controller
{
    public function index()
    {
        return Inertia::render('Website/ContactUs/index');
    }

    public function store(Request $request)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'string', 'max:255', 'min:3'],
            'email' => ['required', 'email', 'max:255'],
            'subject' => ['required', 'string', 'max:255', 'min:10'],
            'message' => ['required', 'string', 'max:255', 'min:30'],
        ]);

        dispatch(new ContactFormSubmissionJob($validated_req));

        return back()->with('success', 'Message Sent Successfully');
    }
}
