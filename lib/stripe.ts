import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // apiVersion omitted to use the latest compatible with installed @stripe/stripe package
  typescript: true,
})

export const getStripePublishableKey = () => process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY! 

// Price IDs - create these in your Stripe dashboard under Products
// For now we use dynamic amounts in checkout, but you can hardcode recurring prices.
export const PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID || '' // optional for subscriptions

export async function createCheckoutSession({
  userId,
  email,
  type,
  amountUSD,
  campaignTitle,
}: {
  userId: string
  email: string
  type: 'pro' | 'campaign_fund'
  amountUSD?: number
  campaignTitle?: string
}) {
  const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}&type=${type}`
  const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`

  let sessionConfig: Stripe.Checkout.SessionCreateParams

  if (type === 'pro') {
    // Recurring Pro subscription
    sessionConfig = {
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'EarnForge Pro',
              description: '1.5x points, instant small payouts, priority offers, no ads',
            },
            unit_amount: 999, // $9.99
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        type: 'pro',
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    }
  } else {
    // One-time campaign funding (advertiser)
    const usdCents = Math.round((amountUSD || 50) * 100)
    sessionConfig = {
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `EarnForge Campaign: ${campaignTitle || 'Paid Offers'}`,
              description: 'Fund to create high-value tasks that users complete. Platform fee applies.',
            },
            unit_amount: usdCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        type: 'campaign_fund',
        amountUSD: String(amountUSD || 50),
        campaignTitle: campaignTitle || 'Paid Offers',
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    }
  }

  const session = await stripe.checkout.sessions.create(sessionConfig)
  return session
}
