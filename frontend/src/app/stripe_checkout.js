'use client';

import React, { useCallback, useState, useEffect } from "react";
import {loadStripe} from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
// This is your test publishable API key - replace with your actual publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const handleComplete = () => {
  console.log('Checkout completed');
}

const CheckoutForm = () => {
  const [error, setError] = useState(null);
  
  const fetchClientSecret = useCallback(() => {
    // Create a Checkout Session
    return fetch("http://localhost:4242/stripe/create-checkout-session", {
      method: "POST",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log('Client secret received:', data);
        return data.clientSecret;
      })
      .catch((err) => {
        console.error('Error fetching client secret:', err);
        setError(err.message);
        throw err;
      });
  }, []);

  const options = {fetchClientSecret};

  if (error) {
    return (
      <div id="checkout-error" style={{padding: '20px', border: '1px solid red', borderRadius: '5px'}}>
        <h3>Error loading checkout</h3>
        <p>Error: {error}</p>
        <p>Make sure your backend server is running on the correct port and CORS is configured properly.</p>
        <p>Check the browser console for more details.</p>
      </div>
    );
  }

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={options}
        onComplete={handleComplete}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}

export default CheckoutForm;
