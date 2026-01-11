<?php

namespace App\Http\Controllers\Website;

use App\Helpers\Trans;
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
            'email' => ['required', 'string', 'email', 'max:255'],
            'phone' => ['required', 'regex:/^\+\d+$/', 'max:50'],
            'subject' => ['required', 'string', 'max:255', 'min:10'],
            'message' => ['required', 'string', 'max:255', 'min:30'],

        ], [
            'name.required' => Trans::get('Please enter your full name.'),
            'name.string' => Trans::Get('Name must be a valid text.'),
            'name.min' => Trans::get('Name must be at least 3 characters long.'),
            'name.max' => Trans::get('Name cannot exceed 255 characters.'),

            'email.required' => Trans::get('Please enter your email address.'),
            'email.string' => Trans::get('Email must be a valid text.'),
            'email.email' => Trans::get('Please enter a valid email address.'),
            'email.max' => Trans::get('Email address cannot exceed 255 characters.'),

            'phone.required' => Trans::get('Please enter your phone number.'),
            'phone.regex' => Trans::get('Phone number must include country code. Example: +8801XXXXXXXXX'),
            'phone.max' => Trans::get('Phone number cannot exceed 50 characters.'),

            'subject.required' => Trans::get('Please enter a subject.'),
            'subject.string' => Trans::get('Subject must be valid text.'),
            'subject.min' => Trans::get('Subject must be at least 10 characters long.'),
            'subject.max' => Trans::get('Subject cannot exceed 255 characters.'),

            'message.required' => Trans::get('Please enter your message.'),
            'message.string' => Trans::get('Message must be valid text.'),
            'message.min' => Trans::get('Message must be at least 30 characters long.'),
            'message.max' => Trans::get('Message cannot exceed 255 characters.'),
        ]);

        dispatch(new ContactFormSubmissionJob($validated_req));

        return back()->with('success', Trans::get('Message Sent Successfully'));
    }
}
