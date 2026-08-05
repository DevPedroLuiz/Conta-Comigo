CREATE OR REPLACE FUNCTION export_user_data()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_result json;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT json_build_object(
    'profile', (SELECT row_to_json(p) FROM profiles p WHERE p.id = v_uid),
    'settings', (SELECT row_to_json(s) FROM settings s WHERE s.user_id = v_uid),
    'accounts', (SELECT COALESCE(json_agg(a), '[]'::json) FROM accounts a WHERE a.user_id = v_uid),
    'categories', (SELECT COALESCE(json_agg(c), '[]'::json) FROM categories c WHERE c.user_id = v_uid),
    'transactions', (SELECT COALESCE(json_agg(t), '[]'::json) FROM transactions t WHERE t.user_id = v_uid),
    'credit_cards', (SELECT COALESCE(json_agg(cc), '[]'::json) FROM credit_cards cc WHERE cc.user_id = v_uid),
    'goals', (SELECT COALESCE(json_agg(g), '[]'::json) FROM goals g WHERE g.user_id = v_uid),
    'budgets', (SELECT COALESCE(json_agg(b), '[]'::json) FROM budgets b WHERE b.user_id = v_uid),
    'investments', (SELECT COALESCE(json_agg(i), '[]'::json) FROM investments i WHERE i.user_id = v_uid)
  ) INTO v_result;

  RETURN v_result;
END;
$$;
