import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    // const request = ctx.getRequest<Request>();

    const status = exception.statusCode || 500;
    const message = exception.message || 'Internal server error';

    response.status(status).json({
      statusCode: status,
      message,
      error: exception.error || 'Unknown error',
    });
  }
}
