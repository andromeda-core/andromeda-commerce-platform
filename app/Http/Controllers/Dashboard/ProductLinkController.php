<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Repositories\Posts\Interface\IPostRepository;
use App\Repositories\ProductLink\Interface\IProductLinkRepository;
use App\Repositories\Smartphones\Interface\ISmartphoneRepository;
use App\Repositories\Users\Interface\IUserRepository;

use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class ProductLinkController extends Controller implements HasMiddleware
{

    public static function middleware()
    {
        return [
            new Middleware('permission:Attribution Links View', ['only' => 'index']),
            new Middleware('permission:Attribution Links Create', ['only' => 'create']),
            new Middleware('permission:Attribution Links Create', ['only' => 'store']),
            new Middleware('permission:Attribution Links Edit', ['only' => 'edit']),
            new Middleware('permission:Attribution Links Edit', ['only' => 'update']),
            new Middleware('permission:Attribution Links Delete', ['only' => 'destroy']),
            new Middleware('permission:Attribution Links Delete', ['only' => 'destroyBySelection']),
        ];
    }


    public function __construct(
        private IProductLinkRepository $productLink,
        private ISmartphoneRepository $smartphone,
        private IPostRepository $post,
        private IUserRepository $user
    ) {}

    public function index(Request $request)
    {
        $productLinks = $this->productLink->getAllProductLinks($request);
        return Inertia::render("Dashboard/Attributions/index", [
            'productLinks' => $productLinks,
        ]);
    }

    public function create()
    {
        $smartphones = $this->smartphone->getSmartphoneWithoutPagination();
        $posts = $this->post->getPosts();
        $users =  $this->user->getUsers();

        return Inertia::render("Dashboard/Attributions/create", [
            'smartphones' => $smartphones,
            'posts' => $posts,
            'users' => $users,
        ]);
    }


    public function store(Request $request)
    {
        $created = $this->productLink->storeProductLink($request);
        if ($created['status'] === false) {
            return back()->with('error', $created['message']);
        }
        return to_route('dashboard.attribution-links.index')->with('success', $created['message']);
    }

    public function show(string $id)
    {
        //
    }

    public function edit(string $id)
    {
        if (empty($id)) {
            return back()->with('error', 'Product link ID is required');
        }

        $productLink = $this->productLink->getSingleProductLink($id);

        if (empty($productLink)) {
            return back()->with('error', 'Product link not found');
        }

        $smartphones = $this->smartphone->getSmartphoneWithoutPagination();
        $posts = $this->post->getPosts();
        $users =  $this->user->getUsers();

        return Inertia::render("Dashboard/Attributions/edit", [
            'smartphones' => $smartphones,
            'posts' => $posts,
            'users' => $users,
            'productLink' => $productLink,
        ]);
    }

    public function update(Request $request, string $id)
    {
        if (empty($id)) {
            return back()->with('error', 'Product link ID is required');
        }

        $updated = $this->productLink->updateProductLink($request, $id);
        if ($updated['status'] === false) {
            return back()->with('error', $updated['message']);
        }
        return to_route('dashboard.attribution-links.index')->with('success', $updated['message']);
    }


    public function destroy(string $id)
    {
        if (empty($id)) {
            return back()->with('error', 'Product link ID is required');
        }

        $deleted = $this->productLink->destroyProductLink($id);
        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }
        return to_route('dashboard.attribution-links.index')->with('success', $deleted['message']);
    }


    public function destroyBySelection(Request $request)
    {
        $deleted = $this->productLink->destroyProductLinkBySelection($request);
        if ($deleted['status'] === false) {
            return back()->with('error', $deleted['message']);
        }
        return to_route('dashboard.attribution-links.index')->with('success', $deleted['message']);
    }
}
