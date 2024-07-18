<?php

use Illuminate\Support\Facades\Route;

Route::get('lang/{locale}', function ($locale) {
    if (in_array($locale, ['en', 'pt'])) {
        session(['locale' => $locale]);
        app()->setLocale($locale);
    }
    return redirect()->back();
});

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
