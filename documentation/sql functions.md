CREATE OR REPLACE FUNCTION get_revenue_over_time(
  period_type TEXT DEFAULT 'daily',
  days_limit INT DEFAULT 90
)
RETURNS TABLE(period_start date, one_time numeric, recurring numeric)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  IF period_type NOT IN ('daily', 'weekly', 'monthly') THEN
    RAISE EXCEPTION 'Invalid period_type. Must be one of ''daily'', ''weekly'', or ''monthly''.';
  END IF;

  RETURN QUERY
  SELECT
    DATE_TRUNC(
      CASE
        WHEN period_type = 'daily' THEN 'day'
        WHEN period_type = 'weekly' THEN 'week'
        WHEN period_type = 'monthly' THEN 'month'
      END,
      o.created_at
    )::date AS period_start,
    
    COALESCE(
      SUM(o.amount_paid) FILTER (WHERE p.type = 'one_time'),
      0
    )::numeric(10, 2) AS one_time,
    
    COALESCE(
      SUM(o.amount_paid) FILTER (WHERE p.type = 'recurring'),
      0
    )::numeric(10, 2) AS recurring
  FROM
    public.orders AS o
  JOIN
    public.plans AS p ON o.plan_id = p.id
  WHERE
    -- THIS IS THE CORRECTED LINE
    o.status = 'succeeded'::public.order_status AND
    o.created_at >= now() - (days_limit || ' days')::interval
  GROUP BY
    period_start
  ORDER BY
    period_start ASC;
END;
$$;


CREATE OR REPLACE FUNCTION get_plan_performance(
  days_limit INT DEFAULT 90
)
RETURNS TABLE(plan_name text, total_revenue numeric, purchase_count bigint)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.name AS plan_name,
    COALESCE(SUM(o.amount_paid), 0)::numeric(12, 2) AS total_revenue,
    COUNT(o.id) AS purchase_count
  FROM
    public.orders AS o
  JOIN
    public.plans AS p ON o.plan_id = p.id
  WHERE
    -- Only count successful orders
    o.status = 'succeeded'::public.order_status AND
    o.created_at >= now() - (days_limit || ' days')::interval
  GROUP BY
    p.name
  ORDER BY
    total_revenue DESC;
END;
$$;

CREATE OR REPLACE FUNCTION get_credit_economy_balance(
  days_limit INT DEFAULT 90
)
RETURNS TABLE(period_start date, purchased bigint, consumed bigint)
LANGUAGE plpgsql STABLE PARALLEL SAFE
-- Ensures the function runs with admin privileges to see all transactions
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE_TRUNC('day', ct.created_at)::date AS period_start,
    
    -- Sum of all credits coming IN (purchases + bonuses)
    COALESCE(
      SUM(ct.amount) FILTER (WHERE ct.transaction_type IN ('purchase', 'bonus')),
      0
    ) AS purchased,
    
    -- Sum of all credits going OUT (consumption)
    COALESCE(
      SUM(ct.amount) FILTER (WHERE ct.transaction_type = 'consumption'),
      0
    ) AS consumed
  FROM
    public.credit_transactions AS ct
  WHERE
    ct.created_at >= now() - (days_limit || ' days')::interval
  GROUP BY
    period_start
  ORDER BY
    period_start ASC;
END;
$$;