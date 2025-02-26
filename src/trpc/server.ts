import "server-only";

import {
  createTRPCClient,
  loggerLink,
  TRPCClientError,
} from "@trpc/client";
import { observable } from "@trpc/server/observable";
import { type TRPCErrorResponse } from "@trpc/server/rpc";
import { headers } from "next/headers";
import { appRouter, type AppRouter } from "@/server/api/root";
import pc from "@/server/api/common/pc";
import { auth } from "@clerk/nextjs/server";
import { SuperJSON } from "superjson";
import { callProcedure } from "@trpc/server";
import { TRPCContext } from "@/server/api/trpc";
/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = async (): Promise<Partial<TRPCContext>> => {
  const heads = new Headers(await headers());
  heads.set("x-trpc-source", "rsc");
  const authData = await auth();
  return {
    headers: heads,
    auth: authData,
  };
};

export const api = createTRPCClient<AppRouter>({
  transformer: SuperJSON,
  links: [
    loggerLink({
      enabled: (op) =>
        process.env.NODE_ENV === "development" ||
        (op.direction === "down" && op.result instanceof Error),
      logger: (opts) => {
        if (opts.direction === "up") {
          console.log(pc.orange(`\n>> [tRPC ${opts.type}] ${opts.path}`));
        } else if (opts.direction === "down") {
          if (opts.result instanceof Error || "error" in opts.result.result) {
            console.log(
              pc.red(
                `<< [tRPC ${opts.path}] ${opts.elapsedMs.toFixed(
                  2
                )}ms ${JSON.stringify(opts.result)}`
              )
            );
          } else {
            console.log(
              pc.cyan(`<< [tRPC ${opts.path}] ${opts.elapsedMs.toFixed(2)}ms\n`)
            );
          }
        }
      },
    }),
    /**
     * Custom RSC link that lets us invoke procedures without using http requests. Since Server
     * Components always run on the server, we can just call the procedure as a function.
     */
    () =>
      ({ op }) =>
        observable((observer) => {
          void (async () => {
            const context = await createContext();
            callProcedure({
              procedures: appRouter._def.procedures,
              path: op.path,
              rawInput: op.input,
              ctx: context,
              type: op.type,
            })
              .then((data) => {
                observer.next({ result: { data } });
                observer.complete();
              })
              .catch((cause: TRPCErrorResponse) => {
                observer.error(TRPCClientError.from(cause));
              });
          })();
        }),
  ],
});
