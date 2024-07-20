import { declineInvite } from '@src/data/pocketbase'

import type { APIRoute } from 'astro'

export const POST: APIRoute = async ({ params }) => {
  await declineInvite(params.invite_id!)

  return new Response(null, {
    status: 204,
    statusText: 'No Content',
    headers: {
      'HX-Redirect': '/app/dashboard',
    },
  })
}