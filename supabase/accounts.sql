-- Tạo (hoặc đặt lại mật khẩu) 2 tài khoản cố định của app: dragon, mint.
-- Thay <mat-khau-dragon> / <mat-khau-mint> bên dưới bằng mật khẩu thật ngay
-- trong SQL Editor - KHÔNG commit mật khẩu thật vào git.
-- Chạy trong SQL Editor, SAU 0001_init.sql và TRƯỚC 0002_username_login.sql
-- (nếu đã chạy 0002 rồi thì chạy lại 0002 sau file này để gán username + couple).
--
-- Thay cho việc tạo tay qua Authentication > Users > Add user: file này ghi
-- thẳng vào auth.users (mật khẩu vẫn được hash bcrypt như Supabase làm) và
-- xác nhận email sẵn vì app dùng email giả.
--
-- Có thể chạy lại an toàn: user đã tồn tại thì chỉ đặt lại mật khẩu.

do $$
declare
  acc record;
  v_email text;
  v_user_id uuid;
begin
  for acc in
    select * from (values ('dragon', '<mat-khau-dragon>'), ('mint', '<mat-khau-mint>')) as t (username, password)
  loop
    if acc.password like '<%' then
      raise exception 'Chưa điền mật khẩu cho tài khoản %', acc.username;
    end if;

    v_email := acc.username || '@mint-dragon.local';
    select id into v_user_id from auth.users where email = v_email;

    if v_user_id is null then
      v_user_id := gen_random_uuid();
      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        -- Supabase Auth báo "Database error querying schema" khi đăng nhập nếu các cột token là NULL
        confirmation_token, recovery_token, email_change, email_change_token_new,
        email_change_token_current, reauthentication_token
      ) values (
        '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated',
        v_email, extensions.crypt(acc.password, extensions.gen_salt('bf')), now(),
        '{"provider": "email", "providers": ["email"]}', '{}', now(), now(),
        '', '', '', '', '', ''
      );
    else
      update auth.users
      set encrypted_password = extensions.crypt(acc.password, extensions.gen_salt('bf')),
          email_confirmed_at = coalesce(email_confirmed_at, now()),
          updated_at = now()
      where id = v_user_id;
    end if;

    insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
    values (
      gen_random_uuid(), v_user_id, v_user_id::text, 'email',
      jsonb_build_object('sub', v_user_id::text, 'email', v_email, 'email_verified', true),
      now(), now(), now()
    )
    on conflict (provider_id, provider) do nothing;
  end loop;
end $$;
