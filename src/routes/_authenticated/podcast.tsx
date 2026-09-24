import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/_authenticated/podcast")({ beforeLoad:() => { throw redirect({ to:"/editorial/podcast", statusCode:301 }); } });
