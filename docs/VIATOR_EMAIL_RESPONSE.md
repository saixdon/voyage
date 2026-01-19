Subject: RE: Viator API Integration - Updated Endpoint Usage Plan (TripVega)

Hi Ewelina,

Thank you for the detailed feedback and for clarifying the distinction between the Ingestion and Search models.

Based on your guidelines, we have updated our endpoint usage plan to strictly follow the **Ingestion Model**. Here are the key updates we made:

1.  **Ingestion Model Confirmed**: We will strictly use `/products/modified-since` and `/availability/schedules/modified-since` for ingestion (running at least hourly).
2.  **No Real-time Content Calls**: We have removed all real-time calls to `/products/{product-code}` and `/availability/schedules/{product-code}`, as this data will be served from our local database.
3.  **No Bulk Ingestion**: We confirmed that `/products/bulk` will NOT be used for ingestion, but only reserved for rare edge cases as permitted.
4.  **Endpoint Cleanup**: We removed the `/bookings/modified-since/acknowledge` endpoint as it does not apply to us.
5.  **PCI Compliance**: We have confirmed that we will use Viator's hosted checkout solution, so Viator will handle all payment data handling.

Please find our updated answers in the attached document.

Best regards,
Mert
TripVega
