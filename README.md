# Meydan Mobile

React Native + Expo + TypeScript frontend for the Meydan Laravel API. The project uses one codebase for iOS and Android and preserves the original dark-premium prototype design.

## Connected flows

- Phone OTP send/verify with the real Laravel endpoints
- Email register/login fallback
- JWT persistence with Expo SecureStore on iOS/Android and localStorage on web, automatic refresh and logout
- Profile show/update and avatar URL update
- Teams list, mine, detail, create and join-by-code
- Public team lineup view for every authenticated user, with 5v5/6v6 pitch, player avatars, positions and bench
- Team lineup editing for owner, captain, co-captain and super admin, including drag-to-position and save
- Stadium list/detail and external map/contact actions
- Super-admin stadium create, photo URL add/delete and format add/delete
- Open/direct ranked match creation
- Match list, mine, detail, accept, reject and cancel
- Match roster list, player selection, draft save, submit and reopen
- Loading, validation, network, empty and retry states

## Configure Laravel URL

Copy the example environment file:

```bash
cp .env.example .env
```

Set your computer's LAN IP, not `127.0.0.1`, when testing on a real phone:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:8000/api
```

Common addresses:

- iOS simulator: `http://127.0.0.1:8000/api`
- Android emulator: `http://10.0.2.2:8000/api`
- Real phone: `http://YOUR_COMPUTER_LAN_IP:8000/api`

Laravel must be reachable from the device. Run it on all interfaces:

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

## Run

```bash
npm install
npm start
```

Quality checks:

```bash
npm run typecheck
npm run export:web
```

## Architecture

- `src/api/client.ts`: base URL, JSON requests, JWT header, timeout, refresh and API errors
- `src/api/endpoints.ts`: every Laravel route grouped by domain
- `src/api/mappers.ts`: Laravel Resource/pagination response normalization
- `src/auth/AuthProvider.tsx`: persistent session and current user
- `src/hooks/useAsyncData.ts`: loading/error/reload state
- `app/`: Expo Router screens

## Backend response requirements

`TeamController@show` should return active `memberships.user` serialized as `members`, plus team ratings. Match roster selection uses these members. Team lineup uses `GET /teams/{team}/lineup?format=5v5` and `PUT /teams/{team}/lineup`. The GET route must remain available to every authenticated user; the PUT route is restricted by the backend to owner, captain, co-captain and super admin. Stadium resources should return `photos` and `formats`. Collection endpoints may return either a plain array, Laravel Resource collection, or Laravel paginator; the frontend normalizes all three.

Google/GitHub redirect URLs are represented in the API service, but their mobile buttons are intentionally not enabled yet. The backend callback currently needs a documented mobile deep-link redirect contract such as `meydan://auth/callback?token=...`; without that callback contract a browser OAuth login cannot safely deliver the JWT back to the app.

GPS check-in, dynamic QR, result submission and rating recalculation screens remain disabled until their Laravel endpoints are implemented.
