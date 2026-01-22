
# Viator Checkout Implementation Plan

**Goal**: Implement a seamless, secure, and premium checkout flow that integrates the Viator Payment iFrame while keeping the user within the TripVega app.

## User Reviews Required
> [!IMPORTANT]
> **Payment iFrame**: Using the Viator JS library requires loading external scripts (`https://viator.com/...`). We must ensure this is loaded only on the checkout page.

> [!WARNING]
> **Booking Flow**: The booking is a 2-step process: `Hold` -> `Book`. If the user abandons the checkout after Hold, the cart expires automatically after ~30 mins. We need to handle session expiration gracefully.

## Proposed Changes

### 1. New Checkout Page (`app/[locale]/checkout/page.tsx`)
- **Route**: `/checkout`
- **Query Params**: `?items=[...]` (JSON stringified) OR handle via Context/State.
  - *Better Approach*: URL encoded params for `productId`, `date`, `pax` (guests) to trigger the `Hold` immediately on load.
- **Layout**:
  - **Left**: Product Summary (Image, Title, Date, Guests, Price).
  - **Right**:
    - **Step 1**: Booker Information (Name, Email, Phone).
    - **Step 2**: Payment (Viator iFrame container).
  - **Styles**: Use `bg-surface` cards, `border-theme`, and `text-foreground`.

### 2. Integration with Viator Client
- Use `createViatorCartHold` on page load (or Step 1 submit) to get `cartRef`.
- Use `createViatorBooking` after payment token is received (if applicable) or directly if the iFrame handles the backend auth.
  - *Viator Flow*: The iFrame handles the credit card tokenization.
  - *Actually*: We need to consult the Payment iFrame documentation pattern.
  - *Assumption*: We get a `checkoutToken` from the Hold response, pass it to the iFrame. The iFrame returns a payment token/nonce on success. Then we call `book` with that token.

### 3. Payment iFrame Component (`components/checkout/ViatorPaymentForm.tsx`)
- Wrapper for the Viator Javascript SDK.
- Handles loading state.
- Emits "success" event with `paymentToken`.

### 4. Confirmation Page (`app/[locale]/checkout/confirmation/page.tsx`)
- **Route**: `/checkout/confirmation?bookingRef=...`
- **UI**: Success animation, Voucher download button, "Back to Home".

### 5. Update Activity Page (`app/[locale]/activities/[id]/page.tsx`)
- Change "Book Now" logic.
- Instead of `window.open` (Affiliate), navigate to:
  `/checkout?productId=...&date=...&pax=...`

## Component Structure

```tsx
// components/checkout/CheckoutSummary.tsx
// Displays the selected activity details (Image, Title, Price breakdown)

// components/checkout/BookerForm.tsx
// Input fields for First Name, Last Name, Email, Phone.
// Uses Design System inputs.

// components/checkout/PaymentSection.tsx
// Loads the script, renders the <div> for the iframe.
```

## Verification Plan

### Automated Tests
- Test the new `BookerForm` validation mechanics.
- Test the API interaction in `CheckoutPage` (mocking the Hooks).

### Manual Verification (E2E)
- **Flow**:
  1. Go to Activity Page.
  2. Select Date/Guests.
  3. Click "Book Now".
  4. Verify redirection to `/checkout`.
  5. Fill Booker Info.
  6. Verify iFrame loads (Sandbox mode).
  7. Complete Payment (Test Card).
  8. Verify Redirection to Summary.
