import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{
      user: { id: number; email: string; name: string; role: string };
    }>();
    const user = request.user;
    return data ? user?.[data as keyof typeof user] : user;
  },
);
