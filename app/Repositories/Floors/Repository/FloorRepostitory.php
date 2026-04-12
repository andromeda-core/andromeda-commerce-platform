<?php

namespace App\Repositories\Floors\Repository;

use App\Models\Floor;
use App\Repositories\Floors\Interface\IFloorRepostitory;
use Exception;
use Illuminate\Http\Request;

class FloorRepostitory implements IFloorRepostitory
{
    public function __construct(
        private Floor $floor
    ) {}

    public function getAllFloors(Request $request)
    {
        $floors = $this->floor
            ->latest()
            ->when($request->filled('search'), function ($query) use ($request) {
                $query->where('name', 'like', '%'.$request->input('search').'%');
            })
            ->paginate(10)
            ->withQueryString();

        return $floors;
    }

    public function getSingleFloor(string $id)
    {
        $floor = $this->floor->find($id);

        return $floor;
    }

    public function storeFloor(Request $request)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:floors,name'],
        ]);

        try {
            $created = $this->floor->create($validated_req);
            if (empty($created)) {
                throw new Exception('Something Went Wrong While Creating Floor');
            }

            return [
                'status' => true,
                'message' => 'Floor Created Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function updateFloor(Request $request, string $id)
    {
        $validated_req = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:floors,name,'.$id],
        ]);

        try {
            $floor = $this->getSingleFloor($id);

            if (empty($floor)) {
                throw new Exception('Floor Not Found');
            }

            $updated = $floor->update($validated_req);

            if (! $updated) {
                throw new Exception('Something Went Wrong While Updating Floor');
            }

            return [
                'status' => true,
                'message' => 'Floor Updated Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }

    }

    public function destroyFloor(string $id)
    {
        try {
            $floor = $this->getSingleFloor($id);

            if (empty($floor)) {
                throw new Exception('Floor Not Found');
            }

            $deleted = $floor->delete();
            if (! $deleted) {
                throw new Exception('Something Went Wrong While Deleting Floor');
            }

            return [
                'status' => true,
                'message' => 'Floor Deleted Successfully',
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function destroyFloorBySelection(Request $request)
    {
        try {
            $ids = $request->array('ids');

            if (blank($ids)) {
                throw new Exception('Please Select Atleast One Floor');
            }

            $deleted = $this->floor->destroy($ids);

            if ($deleted !== count($ids)) {
                throw new Exception('Something Went Wrong While Deleting Floor');
            }

            return [
                'status' => true,
                'message' => 'Floor Deleted Successfully',
            ];

        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function getAllWithoutPaginateFloors()
    {
        $floors = $this->floor->all();

        return $floors;
    }

    public function getFloorsForSearch()
    {
        $from_floors = $this->floor->orderBy('id', 'asc')->get();
        $to_floors = $this->floor->orderBy('id', 'desc')->get();

        return [
            'from_floors' => $from_floors,
            'to_floors' => $to_floors,
        ];
    }
}
