
import { NextRequest, NextResponse } from 'next/server';
import { createViatorBooking } from '@/lib/api/viator-client';
import { sendEmail } from '@/lib/email';
import { BookingConfirmationEmail } from '@/emails/booking-confirmation-email';
import { BookingFailedEmail } from '@/emails/booking-failed-email';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { cartRef, booker, paymentToken, currency, items } = body;

        // Either cartRef OR items must be present (hold flow vs direct flow)
        // But for our flow we primarily use cartRef (hold first)
        if ((!cartRef && !items) || !booker) {
            return NextResponse.json(
                { error: 'Missing required parameters: cartRef (or items) and booker' },
                { status: 400 }
            );
        }

        const result = await createViatorBooking({
            cartRef,
            booker,
            paymentToken,
            currency,
            items
        });

        if (result.error) {
            // Send Failure Email if we have an email address
            if (booker?.email) {
                await sendEmail({
                    to: booker.email,
                    subject: "Action Required: Booking Issue ⚠️",
                    react: BookingFailedEmail({
                        activityName: "Your Activity" // We'd need to fetch activity details to be more specific
                    })
                });
            }
            return NextResponse.json(result, { status: 400 });
        }

        // Send Confirmation Email
        if (booker?.email) {
            // In a real scenario, we'd parse the result to get actual activity names and dates
            // For now we use the result bookingRef
            await sendEmail({
                to: booker.email,
                subject: "Booking Confirmed! ✅",
                react: BookingConfirmationEmail({
                    bookingRef: result.bookingRef,
                    // These would ideally come from the cart/items details
                    activityName: "Your TripVega Experience",
                    price: "Paid",
                    date: "Upcoming"
                })
            });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Booking Creation Error:', error);

        // Try to capture email from request body if check failed deeper
        try {
            const body = await request.clone().json();
            if (body?.booker?.email) {
                await sendEmail({
                    to: body.booker.email,
                    subject: "Something went wrong with your booking ⚠️",
                    react: BookingFailedEmail({})
                });
            }
        } catch (e) {
            // Ignore JSON parse error on clone, just fail
        }

        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
