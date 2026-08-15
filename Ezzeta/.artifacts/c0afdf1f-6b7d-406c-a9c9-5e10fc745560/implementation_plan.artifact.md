# Fix Build Error: Missing 'ubigeo' parameter in AddressBookScreen.kt

The project fails to build because the `MainViewModel.addAddress` function signature was recently updated to include `province` and `ubigeo` parameters, but the call in `AddressBookScreen.kt` was not updated. Additionally, the `AddAddressDialog` in that screen is currently using hardcoded, simplified data that lacks these new fields.

## Proposed Changes

### [UI Components]

#### [MODIFY] [AddressBookScreen.kt](file:///C:/Users/monit/Downloads/Ezzeta/app/src/main/java/com/example/ezzeta/ui/screens/AddressBookScreen.kt)

- Update `AddAddressDialog` to include `province` selection and handle `ubigeo` codes.
- It will now use the `ubigeoData` from `MainViewModel` instead of hardcoded lists, ensuring consistency with `CheckoutScreen.kt`.
- Update the `addAddress` call in `AddressBookScreen` to pass all required parameters: `context`, `address`, `dept`, `prov`, `dist`, `ubigeo`, and `name`.

## Verification Plan

### Automated Tests
- Run `./gradlew :app:compileDebugKotlin` to verify the build error is resolved.

### Manual Verification
- Deploy the app and navigate to the "Libreta de direcciones" screen.
- Verify that the "Nueva Dirección" dialog now allows selecting Department, Province, and District.
- Confirm that adding a new address works correctly and saves all fields.
