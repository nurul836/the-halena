export class ApiError extends Error{constructor(public status:number,public code:string,message:string){super(message);}}
export function safeError(error:unknown){return error instanceof ApiError?error:new ApiError(503,'BACKEND_UNAVAILABLE','The service is temporarily unavailable. Check your recent requests before trying again.');}
