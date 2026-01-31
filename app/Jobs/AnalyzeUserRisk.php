<?php

namespace App\Jobs;

use App\Models\AccountRiskSignal;
use App\Models\ActionLog;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class AnalyzeUserRisk implements ShouldQueue
{
    use Queueable;

    public function __construct(private string $user_id) {}

    public $uniqueFor = 300;

    public function uniqueId(): string
    {
        return 'risk-'.$this->user_id;
    }

    public function handle(): void
    {
        $user = User::find($this->user_id);
        if (! $user) {
            return;
        }
        $this->highFrequencyActions($user);
        $this->burstActions($user);
        $this->deviceHighFrequency($user);
        $this->rapidIpChange($user);
        $this->repeatedRiskOverTime($user);
    }

    /**
     * High frequency actions (global)
     * Any actions, any route
     */
    protected function highFrequencyActions(User $user): void
    {
        $count = ActionLog::where('user_id', $user->id)
            ->where('created_at', '>=', now()->subMinutes(5))
            ->count();

        if ($count >= 20) {
            $this->flag(
                $user,
                'high_frequency_actions',
                [
                    'count' => $count,
                    'window' => 'In last 5 minutes',
                ]
            );
        }
    }

    /**
     * Burst activity (very fast, bot-like)
     */
    protected function burstActions(User $user): void
    {
        $count = ActionLog::where('user_id', $user->id)
            ->where('created_at', '>=', now()->subSeconds(30))
            ->count();

        if ($count >= 10) {
            $this->flag(
                $user,
                'burst_activity',
                [
                    'count' => $count,
                    'window' => 'In last 30 seconds',
                ]
            );
        }
    }

    /**
     *  Same device, high frequency
     */
    protected function deviceHighFrequency(User $user): void
    {
        $fingerprint = ActionLog::where('user_id', $user->id)
            ->whereNotNull('device_fingerprint')
            ->latest()
            ->value('device_fingerprint');

        if (! $fingerprint) {
            return;
        }

        $count = ActionLog::where('user_id', $user->id)
            ->where('device_fingerprint', $fingerprint)
            ->where('created_at', '>=', now()->subMinutes(5))
            ->count();

        if ($count >= 20) {
            $this->flag(
                $user,
                'device_high_frequency',
                [
                    'device' => $fingerprint,
                    'count' => $count,
                    'window' => 'In last 5 minutes',
                ]
            );
        }
    }

    /**
     *  Rapid IP change (reference only)
     */
    protected function rapidIpChange(User $user): void
    {
        $ips = ActionLog::where('user_id', $user->id)
            ->where('created_at', '>=', now()->subMinutes(10))
            ->pluck('ip_address')
            ->unique();

        if ($ips->count() >= 3) {
            $this->flag(
                $user,
                'rapid_ip_change',
                [
                    'ips' => $ips->values(),
                    'window' => 'In last 10 minutes',
                ]
            );
        }
    }

    /**
     * Repeated risk over days
     */
    protected function repeatedRiskOverTime(User $user): void
    {
        $count = AccountRiskSignal::where('user_id', $user->id)
            ->where('status', 'open')
            ->where('signal_type', '!=', 'repeated_risk_pattern')
            ->where('updated_at', '>=', now()->subDays(7))
            ->count();

        if ($count >= 3) {
            $this->flag(
                $user,
                'repeated_risk_pattern',
                [
                    'count' => $count,
                    'window' => 'In last 7 days',
                ]
            );
        }
    }

    /**
     * Central risk writer
     */
    protected function flag(User $user, string $type, array $meta): void
    {
        $expiryMap = [
            'high_frequency_actions' => now()->addHours(24),
            'burst_activity' => now()->addHours(12),
            'device_high_frequency' => now()->addHours(24),
            'rapid_ip_change' => now()->addHour(),
            'repeated_risk_pattern' => now()->addDays(7),
        ];

        $signal = AccountRiskSignal::where('user_id', $user->id)
            ->where('signal_type', $type)
            ->where('status', 'open')
            ->first();

        if ($signal) {
            $signal->update([
                'meta' => array_merge($signal->meta ?? [], $meta),
                'expires_at' => $expiryMap[$type] ?? now()->addHours(24),
            ]);

            return;
        }

        try {
            AccountRiskSignal::create([
                'user_id' => $user->id,
                'signal_type' => $type,
                'context' => 'global_activity',
                'meta' => $meta,
                'status' => 'open',
                'expires_at' => $expiryMap[$type] ?? now()->addHours(24),
            ]);
        } catch (\Illuminate\Database\QueryException $e) {

        }
    }
}
