import { checkApiLimit, incrementApiLimit } from "@/lib/api-limit";
import { checkSubscription } from "@/lib/subscription";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";
import Replicate from "replicate";

interface ProcessOptions<T> {
  body: T;
  openai: OpenAIApi; // Assuming this is the correct type for the openai instance
  replicate: Replicate; // Assuming this is the correct type for the replicate instance
}

export type ApiRequestHandler<T> = (
  options: ProcessOptions<T>
) => Promise<NextResponse>;

function handleError(message: string, status: number) {
  return new NextResponse(message, { status });
}

export async function handleApiRequest<T>(
  req: Request,
  processRequest: ApiRequestHandler<T>,
  validationFn?: (body: T) => NextResponse | null
) {
  try {
    const { userId } = auth();
    const body = (await req.json()) as T;

    if (!userId) {
      return handleError("Unauthorized", 401);
    }

    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN!,
    });

    const openai = new OpenAIApi(configuration);

    if (!configuration.apiKey) {
      return handleError("OpenAI API Key not configured.", 500);
    }

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro) {
      return handleError("Free trial has expired. Please upgrade to pro.", 403);
    }

    if (validationFn) {
      const validationResponse = validationFn(body);
      if (validationResponse) {
        return validationResponse;
      }
    }

    const response = await processRequest({ body, openai, replicate });

    if (!isPro) {
      await incrementApiLimit();
    }

    return response;
  } catch (error: any) {
    if (error.response) {
      const statusCode = error.response.status;
      const errorMessage =
        error.response.data?.error?.message || "Unknown error";

      console.error(
        `[API_ERROR] Status Code: ${statusCode} - Message: ${errorMessage}`
      );
      return handleError(errorMessage, statusCode);
    } else if (error.request) {
      console.error("[API_ERROR] No response received from the server");
    } else {
      console.error("[API_ERROR] Request setup error:", error.message);
    }

    return handleError("Internal Error", 500);
  }
}
