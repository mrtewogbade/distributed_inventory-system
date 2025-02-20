import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';

@Catch()
export class RpcExceptionFilter extends BaseRpcExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    console.error('Caught exception:', exception);

    // If it's already an RpcException (like UnauthorizedException), return it as-is
    if (exception instanceof RpcException) {
      return super.catch(exception, host);
    }

    // Wrap unknown errors in a generic RpcException
    return super.catch(new RpcException('An unexpected error occurred'), host);
  }
}
