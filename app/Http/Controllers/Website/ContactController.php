<?php

namespace App\Http\Controllers\Website;

use App\Helpers\Trans;
use App\Http\Controllers\Controller;
use App\Jobs\ContactFormSubmissionJob;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactController extends Controller
{
    public function __construct(
        private Trans $trans
    ) {}

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
            'name.required' => $this->trans->get('Please enter your full name.'),
            'name.string' => $this->trans->Get('Name must be a valid text.'),
            'name.min' => $this->trans->get('Name must be at least 3 characters long.'),
            'name.max' => $this->trans->get('Name cannot exceed 255 characters.'),

            'email.required' => $this->trans->get('Please enter your email address.'),
            'email.string' => $this->trans->get('Email must be a valid text.'),
            'email.email' => $this->trans->get('Please enter a valid email address.'),
            'email.max' => $this->trans->get('Email address cannot exceed 255 characters.'),

            'phone.required' => $this->trans->get('Please enter your phone number.'),
            'phone.regex' => $this->trans->get('Phone number must include country code. Example: +8801XXXXXXXXX'),
            'phone.max' => $this->trans->get('Phone number cannot exceed 50 characters.'),

            'subject.required' => $this->trans->get('Please enter a subject.'),
            'subject.string' => $this->trans->get('Subject must be valid text.'),
            'subject.min' => $this->trans->get('Subject must be at least 10 characters long.'),
            'subject.max' => $this->trans->get('Subject cannot exceed 255 characters.'),

            'message.required' => $this->trans->get('Please enter your message.'),
            'message.string' => $this->trans->get('Message must be valid text.'),
            'message.min' => $this->trans->get('Message must be at least 30 characters long.'),
            'message.max' => $this->trans->get('Message cannot exceed 255 characters.'),
        ]);

        dispatch(new ContactFormSubmissionJob($validated_req));

        return back()->with('success', $this->trans->get('Message Sent Successfully'));
    }
}
