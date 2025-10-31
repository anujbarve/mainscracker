This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


git push origin main:$branch --force


DECLARE
  v_user_id UUID;
  v_plan_record plans;
  v_new_order_id UUID;
  v_new_subscription_id UUID;
  v_profile_record profiles;
  existing_order_id UUID;
  result jsonb;
BEGIN
  -- Get the authenticated user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  RAISE NOTICE 'fn_purchase_plan called by user: % for plan: %', v_user_id, plan_id_in;

  -- Check for duplicate payment (idempotency)
  SELECT id INTO existing_order_id
  FROM public.orders
  WHERE payment_gateway_charge_id = payment_charge_id_in;

  IF existing_order_id IS NOT NULL THEN
    RAISE NOTICE 'Payment already processed: %. Order ID: %', payment_charge_id_in, existing_order_id;
    
    -- Return existing order info
    SELECT jsonb_build_object(
      'order_id', id,
      'subscription_id', (SELECT id FROM subscriptions WHERE user_id = v_user_id ORDER BY created_at DESC LIMIT 1),
      'message', 'Payment already processed'
    ) INTO result
    FROM orders
    WHERE id = existing_order_id;
    
    RETURN result;
  END IF;

  -- Get plan details
  SELECT * INTO v_plan_record
  FROM public.plans
  WHERE id = plan_id_in AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan not found or inactive: %', plan_id_in;
  END IF;

  RAISE NOTICE 'Processing plan: % (%)', v_plan_record.name, v_plan_record.type;

  -- Create order record
  INSERT INTO public.orders (
    user_id,
    plan_id,
    status,
    amount_paid,
    currency,
    payment_gateway_charge_id,
    payment_method,
    credits_granted_at
  )
  VALUES (
    v_user_id,
    plan_id_in,
    order_status_in,
    v_plan_record.price,
    v_plan_record.currency,
    payment_charge_id_in,
    payment_method_in,
    CASE WHEN order_status_in = 'succeeded' THEN NOW() ELSE NULL END
  )
  RETURNING id INTO v_new_order_id;

  RAISE NOTICE 'Created order: %', v_new_order_id;

    -- If payment succeeded, grant credits and handle subscription logic
  IF order_status_in = 'succeeded' THEN
    -- Update user credits
    UPDATE public.profiles
    SET
      gs_credit_balance = gs_credit_balance + v_plan_record.gs_credits_granted,
      specialized_credit_balance = specialized_credit_balance + v_plan_record.specialized_credits_granted,
      mentorship_credit_balance = mentorship_credit_balance + v_plan_record.mentorship_credits_granted,
      last_activity_at = NOW()
    WHERE id = v_user_id
    RETURNING * INTO v_profile_record;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Profile not found for user: %', v_user_id;
    END IF;

    RAISE NOTICE 'Updated credits for user: %. GS: %, Specialized: %, Mentorship: %',
      v_user_id,
      v_profile_record.gs_credit_balance,
      v_profile_record.specialized_credit_balance,
      v_profile_record.mentorship_credit_balance;

    -- Create credit transaction logs
    IF v_plan_record.gs_credits_granted > 0 THEN
      INSERT INTO public.credit_transactions (
        user_id, credit_type, amount, balance_after, 
        transaction_type, reference_id, reference_type, notes
      )
      VALUES (
        v_user_id, 'gs', v_plan_record.gs_credits_granted,
        v_profile_record.gs_credit_balance, 'purchase', 
        v_new_order_id, 'order', 'Plan purchase - ' || v_plan_record.name
      );
    END IF;

    IF v_plan_record.specialized_credits_granted > 0 THEN
      INSERT INTO public.credit_transactions (
        user_id, credit_type, amount, balance_after, 
        transaction_type, reference_id, reference_type, notes
      )
      VALUES (
        v_user_id, 'specialized', v_plan_record.specialized_credits_granted,
        v_profile_record.specialized_credit_balance, 'purchase', 
        v_new_order_id, 'order', 'Plan purchase - ' || v_plan_record.name
      );
    END IF;

    IF v_plan_record.mentorship_credits_granted > 0 THEN
      INSERT INTO public.credit_transactions (
        user_id, credit_type, amount, balance_after, 
        transaction_type, reference_id, reference_type, notes
      )
      VALUES (
        v_user_id, 'mentorship', v_plan_record.mentorship_credits_granted,
        v_profile_record.mentorship_credit_balance, 'purchase', 
        v_new_order_id, 'order', 'Plan purchase - ' || v_plan_record.name
      );
    END IF;

    -- If this is a recurring plan, create or update subscription
    IF v_plan_record.type = 'recurring' THEN
      -- Try to find existing subscription with this payment gateway ID
      SELECT id INTO v_new_subscription_id
      FROM public.subscriptions
      WHERE payment_gateway_subscription_id = payment_charge_id_in;

      -- If no subscription exists, create one
      IF v_new_subscription_id IS NULL THEN
        -- Calculate period dates
        DECLARE
          v_period_start TIMESTAMPTZ := NOW();
          v_period_end TIMESTAMPTZ;
        BEGIN
          -- Calculate end date based on interval
          CASE v_plan_record.interval
            WHEN 'day' THEN
              v_period_end := v_period_start + (v_plan_record.interval_count || ' days')::INTERVAL;
            WHEN 'week' THEN
              v_period_end := v_period_start + (v_plan_record.interval_count || ' weeks')::INTERVAL;
            WHEN 'month' THEN
              v_period_end := v_period_start + (v_plan_record.interval_count || ' months')::INTERVAL;
            WHEN 'year' THEN
              v_period_end := v_period_start + (v_plan_record.interval_count || ' years')::INTERVAL;
            ELSE
              RAISE EXCEPTION 'Invalid interval: %', v_plan_record.interval;
          END CASE;

          -- Create subscription
          INSERT INTO public.subscriptions (
            user_id,
            plan_id,
            status,
            current_period_start,
            current_period_end,
            payment_gateway_subscription_id,
            credits_granted_this_period
          )
          VALUES (
            v_user_id,
            plan_id_in,
            'active',
            v_period_start,
            v_period_end,
            payment_charge_id_in,
            true
          )
          RETURNING id INTO v_new_subscription_id;

          RAISE NOTICE 'Created subscription: % (period: % to %)', 
            v_new_subscription_id, 
            v_period_start, 
            v_period_end;
        END;
      ELSE
        RAISE NOTICE 'Subscription already exists: %', v_new_subscription_id;
      END IF;
    END IF;

    -- Update plan total purchases
    UPDATE public.plans
    SET total_purchases = total_purchases + 1
    WHERE id = plan_id_in;

    -- Send notification
    INSERT INTO public.notifications (
      user_id, type, title, message, data, is_read
    )
    VALUES (
      v_user_id,
      'purchase_successful',
      'Purchase Successful',
      format('You have successfully purchased %s. Credits have been added to your account.', v_plan_record.name),
      jsonb_build_object(
        'order_id', v_new_order_id,
        'plan_name', v_plan_record.name,
        'subscription_id', v_new_subscription_id,
        'credits_granted', jsonb_build_object(
          'gs', v_plan_record.gs_credits_granted,
          'specialized', v_plan_record.specialized_credits_granted,
          'mentorship', v_plan_record.mentorship_credits_granted
        )
      ),
      false
    );
  END IF;

  -- Build result
  result := jsonb_build_object(
    'order_id', v_new_order_id,
    'subscription_id', v_new_subscription_id,
    'plan_name', v_plan_record.name,
    'status', order_status_in
  );

  RAISE NOTICE 'Plan purchase completed successfully. Order: %, Subscription: %', 
    v_new_order_id, 
    v_new_subscription_id;

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in fn_purchase_plan: % %. SQLSTATE: %', 
      SQLERRM, 
      SQLSTATE,
      SQLSTATE;
    RAISE;
END;
