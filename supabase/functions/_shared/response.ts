// Response Helper - Consistent API response format
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
}

export function successResponse<T>(data: T, message = 'Success', meta?: ApiResponse['meta']): Response {
    return new Response(JSON.stringify({ success: true, message, data, meta }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}

export function errorResponse(message: string, status = 400, error?: string): Response {
    return new Response(JSON.stringify({ success: false, message, error: error || message }), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
}

export function validationErrorResponse(errors: any): Response {
    return new Response(JSON.stringify({ 
        success: false, 
        message: 'Validation failed', 
        error: JSON.stringify(errors) 
    }), {
        status: 422,
        headers: { 'Content-Type': 'application/json' }
    });
}

export function notFoundResponse(resource = 'Resource'): Response {
    return errorResponse(`${resource} not found`, 404);
}

export function unauthorizedResponse(message = 'Unauthorized'): Response {
    return errorResponse(message, 401);
}

export function forbiddenResponse(message = 'Forbidden'): Response {
    return errorResponse(message, 403);
}

export function serverErrorResponse(message = 'Internal server error', error?: string): Response {
    return errorResponse(message, 500, error);
}