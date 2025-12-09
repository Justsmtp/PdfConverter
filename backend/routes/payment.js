const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// @desc    Create checkout session
// @route   POST /api/payment/create-checkout-session
// @access  Private
router.post('/create-checkout-session', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Create or retrieve Stripe customer
    let customerId = user.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user._id.toString()
        }
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'PDF Converter Premium',
              description: 'Unlimited conversions, priority support, and more',
            },
            unit_amount: 999, // $9.99
            recurring: {
              interval: 'month'
            }
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard?payment=cancelled`,
      metadata: {
        userId: user._id.toString()
      }
    });

    res.json({ success: true, sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating checkout session'
    });
  }
});

// @desc    Webhook for Stripe events
// @route   POST /api/payment/webhook
// @access  Public
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const userId = session.metadata.userId;
        
        const user = await User.findById(userId);
        if (user) {
          user.plan = 'premium';
          user.stripeSubscriptionId = session.subscription;
          await user.save();
        }
        break;

      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        const userToDowngrade = await User.findOne({
          stripeSubscriptionId: subscription.id
        });
        
        if (userToDowngrade) {
          userToDowngrade.plan = 'free';
          userToDowngrade.stripeSubscriptionId = null;
          await userToDowngrade.save();
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// @desc    Cancel subscription
// @route   POST /api/payment/cancel-subscription
// @access  Private
router.post('/cancel-subscription', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.stripeSubscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    await stripe.subscriptions.cancel(user.stripeSubscriptionId);

    user.plan = 'free';
    user.stripeSubscriptionId = null;
    await user.save();

    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling subscription'
    });
  }
});

module.exports = router;