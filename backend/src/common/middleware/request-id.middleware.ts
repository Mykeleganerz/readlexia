import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

declare global {
    namespace Express {
        interface Request {
            id: string;
            userId?: number;
        }
    }
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
    private readonly logger = new Logger(RequestIdMiddleware.name);

    use(req: Request, res: Response, next: NextFunction) {
        // Generate unique request ID
        const requestId = uuidv4();
        req.id = requestId;

        // Add request ID to response headers
        res.setHeader('X-Request-ID', requestId);

        // Log incoming request
        this.logger.log(
            `[${requestId}] ${req.method} ${req.path} - User-Agent: ${req.get('user-agent')}`,
        );

        // Hook into response to log completion
        const originalJson = res.json;
        const logger = this.logger;
        const method = req.method;
        const path = req.path;

        res.json = function (data) {
            logger.log(
                `[${requestId}] Response: ${method} ${path} ${res.statusCode}`,
            );
            return originalJson.call(this, data);
        };

        next();
    }
}
