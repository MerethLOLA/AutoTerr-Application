<?php

namespace Tests;

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    public function createApplication()
    {
        $_ENV['APP_ENV'] = 'testing';
        $_SERVER['APP_ENV'] = 'testing';
        $_ENV['APP_KEY'] = '12345678901234567890123456789012';
        $_SERVER['APP_KEY'] = '12345678901234567890123456789012';
        $_ENV['APP_CIPHER'] = 'aes-256-cbc';
        $_SERVER['APP_CIPHER'] = 'aes-256-cbc';

        $app = require Application::inferBasePath().'/bootstrap/app.php';
        $app->make(Kernel::class)->bootstrap();

        return $app;
    }

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('app.key', '12345678901234567890123456789012');
        config()->set('app.cipher', 'aes-256-cbc');
    }
}
