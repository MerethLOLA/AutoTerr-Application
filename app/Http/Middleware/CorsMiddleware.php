<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CorsMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $origin = $request->headers->get('Origin');
        $allowedOrigin = env('FRONTEND_URL', 'http://localhost:3000');

        if ($request->isMethod('OPTIONS')) {
            if ($origin !== $allowedOrigin) {
                return response('', Response::HTTP_NO_CONTENT);
            }

            return $this->applyHeaders(response('', Response::HTTP_NO_CONTENT), $origin);
        }

        $response = $next($request);

        if ($origin === $allowedOrigin) {
            $this->applyHeaders($response, $origin);
        }

        return $response;
    }

    private function applyHeaders(Response $response, string $allowOriginHeader): Response
    {
        $response->headers->set('Access-Control-Allow-Origin', $allowOriginHeader);
        $response->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        $response->header('Access-Control-Allow-Headers', 'Accept, Content-Type, Authorization, X-Requested-With, Origin');
        $response->header('Access-Control-Allow-Credentials', 'true');
        $response->header('Vary', 'Origin');

        return $response;
    }
}
