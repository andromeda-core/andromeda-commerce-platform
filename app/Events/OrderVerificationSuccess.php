<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class OrderVerificationSuccess implements ShouldBroadcast
{
    public function __construct(
        public int $user_id,
        public string $code,
        public string $message
    ) {}

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel('user.'.$this->user_id);
    }

    public function broadcastAs(): string
    {
        return 'order-verification-success';
    }
}
