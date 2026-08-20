# Testing

## Unit Tests

Run the stable, Firestore-free test suite:

```powershell
npm test
```

This is the default CI-friendly path and maps to `npm run test:unit`.

## Firestore Integration Tests

Run these only when a Firestore emulator is available.

With an already running emulator:

```powershell
$env:FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080'
$env:RUN_FIRESTORE_TESTS = '1'
npm run test:integration:firestore
```

Or let the Firebase CLI start and stop the emulator:

```powershell
npm run test:integration:firestore:emulator
```

The emulator path uses `firebase.json`, `firestore.rules`, and a local project id by default.
