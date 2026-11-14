
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse();

    if (!(exception instanceof HttpException)) {
      this.logger.error(
        'Error no controlado',
        exception instanceof Error ? exception.stack : String(exception),
      );

      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: 500,
        message: 'Error interno del servidor',
        error: 'Internal Server Error',
      });
      return;
    }

    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const body =
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
        ? (exceptionResponse as {
            message?: string | string[];
            error?: string;
          })
        : {};

    const message =
      body.message ??
      (typeof exceptionResponse === 'string'
        ? exceptionResponse
        : exception.message);

    const error =
      body.error ??
      exception.name
        .replace(/Exception$/, '')
        .replace(/([a-z])([A-Z])/g, '$1 $2');

    response.status(statusCode).json({
      statusCode,
      message,
      error,
    });
  }
}
