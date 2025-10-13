<?php

namespace App\Providers;

use App\Repositories\Batches\Interface\IBatchRepository;
use App\Repositories\Batches\Repository\BatchRepository;
use App\Repositories\Bookmarks\Interface\IBookmarkRepository;
use App\Repositories\Bookmarks\Repository\BookmarkRepository;
use App\Repositories\Categories\Interface\ICategoryRepository;
use App\Repositories\Categories\Repository\CategoryRepository;
use App\Repositories\Collaborators\Interface\ICollaboratorRepository;
use App\Repositories\Collaborators\Repository\CollaboratorRepository;
use App\Repositories\Commissions\CollaboratorCommissions\Interface\ICollaboratorCommissionRepository;
use App\Repositories\Commissions\CollaboratorCommissions\Repository\CollaboratorCommissionRepository;
use App\Repositories\Commissions\DistributorCommissions\Interface\IDistributorCommissionRepository;
use App\Repositories\Commissions\DistributorCommissions\Repository\DistributorCommissionRepository;
use App\Repositories\Commissions\SupplierCommissions\Interface\ISupplierCommissionRepository;
use App\Repositories\Commissions\SupplierCommissions\Repository\SupplierCommissionRepository;
use App\Repositories\Customers\Interface\ICustomerRepository;
use App\Repositories\Customers\Repository\CustomerRepository;
use App\Repositories\Dashboard\Interface\IDashboardRepository;
use App\Repositories\Dashboard\Repositories\DashboardRepository;
use App\Repositories\Distributors\Interface\IDistributorRepository;
use App\Repositories\Distributors\Repository\DistributorRepository;
use App\Repositories\Floors\Interface\IFloorRepostitory;
use App\Repositories\Floors\Repository\FloorRepostitory;
use App\Repositories\GlobalSearch\Interface\IGlobalSearchRepository;
use App\Repositories\GlobalSearch\Repository\GlobalSearchRepository;
use App\Repositories\Inventories\Interface\IInventoryRepository;
use App\Repositories\Inventories\Repository\InventoryRepository;
use App\Repositories\Orders\Interface\IOrderRepository;
use App\Repositories\Orders\Repository\OrderRepository;
use App\Repositories\PackageRecordings\Interface\IPackageRecordingsRepository;
use App\Repositories\PackageRecordings\Repository\PackageRecordingsRepository;
use App\Repositories\Posts\Interface\IPostRepository;
use App\Repositories\Posts\Repository\PostRepository;
use App\Repositories\RewardPoints\Interface\IRewardPointRepository;
use App\Repositories\RewardPoints\Repository\RewardPointRepository;
use App\Repositories\SearchHistories\Interface\ISearchHistoryRepository;
use App\Repositories\SearchHistories\Repository\SearchHistoryRepository;
use App\Repositories\Settings\Interface\ISettingRepository;
use App\Repositories\Settings\Repository\SettingRepository;
use App\Repositories\SmartphoneForSales\Interface\ISmartphoneForSaleRepository;
use App\Repositories\SmartphoneForSales\Repository\SmartphoneForSaleRepository;
use App\Repositories\Smartphones\Interface\ISmartphoneRepository;
use App\Repositories\Smartphones\Repository\SmartphoneRepository;
use App\Repositories\Suppliers\Interface\ISupplierRepository;
use App\Repositories\Suppliers\Repository\SupplierRepository;
use App\Repositories\Users\Interface\IUserRepository;
use App\Repositories\Users\Repository\UserRepository;
use Illuminate\Support\ServiceProvider;

class BinderServerProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(IUserRepository::class, UserRepository::class);
        $this->app->bind(ISettingRepository::class, SettingRepository::class);
        $this->app->bind(IPostRepository::class, PostRepository::class);
        $this->app->bind(IFloorRepostitory::class, FloorRepostitory::class);
        $this->app->bind(IBookmarkRepository::class, BookmarkRepository::class);
        $this->app->bind(ISupplierRepository::class, SupplierRepository::class);
        $this->app->bind(ICollaboratorRepository::class, CollaboratorRepository::class);
        $this->app->bind(ISmartphoneRepository::class, SmartphoneRepository::class);
        $this->app->bind(IBatchRepository::class, BatchRepository::class);
        $this->app->bind(IInventoryRepository::class, InventoryRepository::class);
        $this->app->bind(ISmartphoneForSaleRepository::class, SmartphoneForSaleRepository::class);
        $this->app->bind(ICategoryRepository::class, CategoryRepository::class);
        $this->app->bind(IDistributorRepository::class, DistributorRepository::class);
        $this->app->bind(IRewardPointRepository::class, RewardPointRepository::class);
        $this->app->bind(ICustomerRepository::class, CustomerRepository::class);
        $this->app->bind(IOrderRepository::class, OrderRepository::class);
        $this->app->bind(IPackageRecordingsRepository::class, PackageRecordingsRepository::class);
        $this->app->bind(ISupplierCommissionRepository::class, SupplierCommissionRepository::class);
        $this->app->bind(ICollaboratorCommissionRepository::class, CollaboratorCommissionRepository::class);
        $this->app->bind(IDistributorCommissionRepository::class, DistributorCommissionRepository::class);
        $this->app->bind(IDashboardRepository::class, DashboardRepository::class);
        $this->app->bind(IGlobalSearchRepository::class, GlobalSearchRepository::class);
        $this->app->bind(ISearchHistoryRepository::class, SearchHistoryRepository::class);

    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
