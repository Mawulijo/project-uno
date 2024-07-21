import Stripe from "stripe";
import type { APIRoute } from "astro";
import { updateTeam, getTeam, addActivity } from "@data/pocketbase";
import { TeamsStatusOptions } from "@data/pocketbase-types";
import { initStripe } from "@lib/stripe";
import { request } from "http";

export const POST: APIRoute = async ({ request }) => {
    const webhook_secret = import.meta.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET
    const stripe = initStripe()

    const signature = request.headers.get('stripe-signature')

    if (!signature) {
        throw new Error('No signature header provided.')
    }
    const raw_body = await request.text()

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            raw_body,
            signature,
            webhook_secret
        )
    } catch (err: any) {
        console.log(`Webhook signature verification failed: ${err.message}`
        )
        return new Response(`Webhook Error: ${err.message}`, {
            status: 400,
        })
    }

    if (event.type === 'customer.subscription.created') {
        const subscription = event.data.object
        const { metadata } = subscription
        const { team_id, team_page_url } = metadata
        const team = await getTeam(team_id)

        const portal_url = (
            await stripe.billingPortal.sessions.create({
                customer: subscription.customer as string,
                return_url: team_page_url
            })
        ).url

        await updateTeam(team_id, {
            status: TeamsStatusOptions.active,
            portal_url,
            stripe_subscription_id: subscription.id
        })

        await addActivity({
            team: team_id,
            project: '',
            text: `Team ${team.name} subscription created`,
            type: 'subscription_created'
        })

    }

    if (event.type === 'customer.subscription.deleted') {
        const { id: subscription_id, metadata } = event.data.object

        const { team_id } = metadata

        const team = await getTeam(team_id)

        if (!team) {
            throw new Error('Team not found')
        }

        const { stripe_subscription_id } = team

        if (stripe_subscription_id !== subscription_id) {
            throw new Error('Subscription ID mismatch')
        }

        await updateTeam(team_id, {
            status: TeamsStatusOptions.freezed,
        })

        await addActivity({
            team: team_id,
            project: '',
            text: `Team ${team.name} subscription deleted`,
            type: 'subscription_deleted'
        })
    }

    return new Response('Event received', { status: 200 })
}