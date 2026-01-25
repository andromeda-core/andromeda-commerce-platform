<?php

namespace App\Repositories\DataDeletionRequests\Repository;

use App\Helpers\Trans;
use App\Models\DataDeletionRequest;
use App\Repositories\DataDeletionRequests\Interface\IDataDeletionRequestRepository;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DataDeletionRequestRepository implements IDataDeletionRequestRepository
{
    public function __construct(
        private DataDeletionRequest $dataDeletionRequest,
        private Trans $trans,
    ) {}

    public function getAllDataDeletionRequests(Request $request)
    {
        return $this->dataDeletionRequest
            ->when(! empty($request->input('search')), function ($query) use ($request) {
                $query->where(function ($query) use ($request) {
                    $query->where('name', 'like', '%'.$request->input('search').'%')
                        ->orWhere('email', 'like', '%'.$request->input('search').'%')
                        ->orWhere('phone', 'like', '%'.$request->input('search').'%');
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();
    }

    public function storeRequestAndDestroyAccount(Request $request)
    {
        $validated_req = $request->validate([
            'reason' => ['required', 'max:255', 'min:20'],
            'password' => ['required', 'min:8'],
        ], [

            'reason.required' => $this->trans->get('Reason Must Not Be Empty'),
            'reason.min' => $this->trans->get('Reason Must Be At Least 20 Characters'),
            'reason.max' => $this->trans->get('Reason Must Be Less Than 255 Characters'),

            'password.required' => $this->trans->get('Password Must Not Be Empty'),
            'password.min' => $this->trans->get('Password Must Be At Least 8 Characters'),
        ]);

        DB::beginTransaction();
        try {

            $user = $request->user();

            if (empty($user) || ! Hash::check($validated_req['password'], $user->password)) {
                throw new Exception($this->trans->get('Please check your credentials again.'));
            }

            if (! $user->hasRole('Customer')) {
                throw new Exception($this->trans->get('Only Customers Can Delete Thier Account'));
            }
            $validated_req['name'] = $user->name;
            $validated_req['email'] = $user->email;
            $validated_req['phone'] = $user->phone;
            $validated_req['ip_address'] = $request->ip();

            unset($validated_req['password']);

            $this->dataDeletionRequest->create($validated_req);

            $user->delete();
            DB::commit();

            return [
                'status' => true,
                'message' => $this->trans->get('Account Deletion Successful'),
            ];

        } catch (Exception $e) {
            DB::rollBack();

            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }
}
