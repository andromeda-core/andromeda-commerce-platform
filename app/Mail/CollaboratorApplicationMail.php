<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CollaboratorApplicationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public array $data) {}

    public function build()
    {
        $country = $this->data['country'] ?? 'Unknown Country';
        $name = $this->data['full_name'] ?? 'Applicant';

        $mail = $this->subject("New Collaborator Application - {$country} - {$name}")
            ->view('emails.collaborator-application', ['data' => $this->data]);

        if (! empty($this->data['email'])) {
            $mail->replyTo($this->data['email'], $name);
        }

        return $mail;
    }
}
