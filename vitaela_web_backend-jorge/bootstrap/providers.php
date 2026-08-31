<?php

use App\Modules\AccessControl\Providers\AccessControlServiceProvider;
use App\Modules\AccountVerification\Providers\AccountVerificationServiceProvider;
use App\Modules\Benefits\Providers\BenefitsServiceProvider;
use App\Modules\Categories\Providers\CategoriesServiceProvider;
use App\Modules\Characteristics\Providers\CharacteristicsServiceProvider;
use App\Modules\Genders\Providers\GendersServiceProvider;
use App\Modules\Marketing\Providers\MarketingServiceProvider;
use App\Modules\PricingRules\Providers\PricingRulesServiceProvider;
use App\Modules\Products\Providers\ProductsServiceProvider;
use App\Modules\Rrhh\Providers\RrhhServiceProvider;
use App\Modules\Shipping\Providers\ShippingServiceProvider;
use App\Modules\SocialNetworks\Providers\SocialNetworksServiceProvider;
use App\Modules\Subcategories\Providers\SubcategoriesServiceProvider;
use App\Providers\ApiRouteServiceProvider;
use App\Providers\AppServiceProvider;

return [
    AppServiceProvider::class,
    ApiRouteServiceProvider::class,
    AccessControlServiceProvider::class,
    AccountVerificationServiceProvider::class,
    BenefitsServiceProvider::class,
    CharacteristicsServiceProvider::class,
    PricingRulesServiceProvider::class,
    MarketingServiceProvider::class,
    CategoriesServiceProvider::class,
    GendersServiceProvider::class,
    SubcategoriesServiceProvider::class,
    ProductsServiceProvider::class,
    ShippingServiceProvider::class,
    SocialNetworksServiceProvider::class,
    RrhhServiceProvider::class,
];
