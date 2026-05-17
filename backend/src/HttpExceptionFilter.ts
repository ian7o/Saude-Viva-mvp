import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
  HttpException,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  private sendError(host: ArgumentsHost, status: number, message: string) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private logError(host: ArgumentsHost, exception: unknown) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    this.logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : String(exception),
    );
  }

  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof HttpException) {
      this.logError(host, exception);
      this.sendError(host, exception.getStatus(), exception.message);
    } else {
      this.logError(host, exception);
      this.sendError(
        host,
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Internal server error",
      );
    }
  }
}
