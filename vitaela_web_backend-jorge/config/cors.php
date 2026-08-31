<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | El frontend (Vite, SPA en React) vive en un dominio distinto al backend
    | (VitaElla backend vs localhost:5173), y la autenticación es por
    | Bearer token (Sanctum en modo token, no cookies de sesión), así que no
    | hace falta 'supports_credentials'.
    |
    */

    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:3000'),
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
