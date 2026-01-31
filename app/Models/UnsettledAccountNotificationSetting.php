<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UnsettledAccountNotificationSetting extends Model
{
    protected $fillable = [
        'reason',
        'delay',
        'channel',
        'is_active',
    ];
}
