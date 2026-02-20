-- Auto-create role-specific records during auth signup
-- Prevents client-side RLS failures when email confirmation is enabled

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_role_text text;
  practice_areas_text text[];
BEGIN
  user_role_text := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), 'client');

  IF jsonb_typeof(NEW.raw_user_meta_data->'practice_areas') = 'array' THEN
    SELECT array_agg(value)
    INTO practice_areas_text
    FROM jsonb_array_elements_text(NEW.raw_user_meta_data->'practice_areas') AS value;
  END IF;

  INSERT INTO public.profiles (id, role, full_name, email, phone, organization, firm_id)
  VALUES (
    NEW.id,
    user_role_text::user_role,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), NEW.email, 'New User'),
    NEW.email,
    NULLIF(NEW.raw_user_meta_data->>'phone', ''),
    NULLIF(NEW.raw_user_meta_data->>'organization', ''),
    (NEW.raw_user_meta_data->>'firm_id')::uuid
  )
  ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        organization = EXCLUDED.organization,
        firm_id = COALESCE(EXCLUDED.firm_id, profiles.firm_id),
        updated_at = NOW();

  IF user_role_text = 'client' AND to_regclass('public.clients') IS NOT NULL THEN
    INSERT INTO public.clients (id)
    VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
  ELSIF user_role_text = 'lawyer'
    AND to_regclass('public.lawyers') IS NOT NULL
    AND COALESCE(NULLIF(NEW.raw_user_meta_data->>'bar_council_id', ''), '') <> ''
  THEN
    INSERT INTO public.lawyers (
      id,
      bar_council_id,
      year_of_enrollment,
      years_of_experience,
      practice_areas,
      jurisdiction
    )
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'bar_council_id',
      NULLIF(NEW.raw_user_meta_data->>'year_of_enrollment', '')::integer,
      NULLIF(NEW.raw_user_meta_data->>'years_of_experience', '')::integer,
      practice_areas_text,
      NULLIF(NEW.raw_user_meta_data->>'jurisdiction', '')
    )
    ON CONFLICT (id) DO UPDATE
      SET bar_council_id = EXCLUDED.bar_council_id,
          year_of_enrollment = EXCLUDED.year_of_enrollment,
          years_of_experience = EXCLUDED.years_of_experience,
          practice_areas = EXCLUDED.practice_areas,
          jurisdiction = EXCLUDED.jurisdiction,
          updated_at = NOW();
  ELSIF user_role_text = 'bank'
    AND to_regclass('public.banks') IS NOT NULL
    AND COALESCE(NULLIF(NEW.raw_user_meta_data->>'institution_name', ''), '') <> ''
    AND COALESCE(NULLIF(NEW.raw_user_meta_data->>'registration_number', ''), '') <> ''
  THEN
    INSERT INTO public.banks (
      id,
      institution_name,
      registration_number,
      authorized_person_name,
      authorized_person_department,
      authorized_person_phone
    )
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'institution_name',
      NEW.raw_user_meta_data->>'registration_number',
      NULLIF(NEW.raw_user_meta_data->>'authorized_person_name', ''),
      NULLIF(NEW.raw_user_meta_data->>'authorized_person_department', ''),
      NULLIF(NEW.raw_user_meta_data->>'authorized_person_phone', '')
    )
    ON CONFLICT (id) DO UPDATE
      SET institution_name = EXCLUDED.institution_name,
          registration_number = EXCLUDED.registration_number,
          authorized_person_name = EXCLUDED.authorized_person_name,
          authorized_person_department = EXCLUDED.authorized_person_department,
          authorized_person_phone = EXCLUDED.authorized_person_phone,
          updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$;
