Subject: RE: Viator API Integration - Switch to Iframe Solution (TripVega)

Hi Ewelina,

Thank you very much for pointing out the significant PCI compliance requirements for the API payments solution. We definitely want to avoid the full PCI DSS certification overhead at this stage.

Therefore, we have decided to **switch to the Iframe Solution** (instead of the direct API payments solution).

**Changes to our implementation plan:**
1.  **Iframe Implementation**: We will use the Viator Javascript Library / Iframe to handle payment input.
2.  **Endpoint Removed**: We have removed the `/v1/checkoutsessions/{sessionToken}/paymentaccounts` endpoint from our usage plan, as we will not collecting card data directly.
3.  **Compliance**: We understand that with the Iframe solution, we only need to complete the **SAQ A (Self-Assessment)**, which fits our setup perfectly.

Please find our updated endpoint usage plan attached, reflecting these changes.

Best regards,
Mert
TripVega
