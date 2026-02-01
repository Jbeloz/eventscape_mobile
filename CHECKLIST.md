# Setup Checklist ✅

## Before Running App

- [ ] Run: `npx expo install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill`
- [ ] Verify `.env.local` has your credentials (should already be set)
- [ ] No need to create database schema (Supabase handles users automatically)

## Files Set Up

- [x] `src/lib/supabase.ts` - Official Supabase client
- [x] `src/app/auth/login.tsx` - Uses `signInWithPassword()`
- [x] `src/app/auth/register.tsx` - Uses `signUp()`
- [x] `.env.local` - Your credentials already set

## How to Use

### Install Packages
```bash
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill
```

### Run App
```bash
npx expo start
```

### Test Registration
1. Go to Register tab
2. Fill email + password  
3. Click "CREATE ACCOUNT"
4. Wait for confirmation (Supabase sends email by default)
5. Check your inbox for verification link
6. Click link to confirm

### Test Login
1. Go to Login tab
2. Enter same email + password
3. Click "SIGN IN"
4. Should redirect to customer_home

## Verify It Works

Go to your Supabase Dashboard:
1. Authentication → Users
2. Should see your test user there
3. Status shows "Verified" if email confirmed

## What Happens Behind Scenes

**Login:**
- Email + password sent to Supabase
- If valid → creates session
- Session stored in device (AsyncStorage)
- Token auto-refreshes in background

**Register:**
- Email + password sent to Supabase
- User created in database
- Verification email sent (configurable)
- Sessions auto-managed

## Important Settings (Optional)

To disable email verification:
1. Supabase Dashboard → Authentication
2. Settings → Email → Toggle off "Confirm email"
3. Users can login immediately after signup

To enable password recovery:
1. Already supported by Supabase SDK
2. Just need to build UI for it

---

## What's NOT Included (Yet)

These can be added later:
- Social login (Google, GitHub, etc.)
- Password reset flow
- MFA / 2FA
- Custom user metadata (first_name, last_name, etc.)

---

**Ready to test!** 🚀 Just install packages and run the app.
