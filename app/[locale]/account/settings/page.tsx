import React from "react";
import { createClient } from "@/lib/supabase/server";
import SettingsForm from "@/components/dashboard/SettingsForm";
import { updateProfileAction } from "@/app/actions/auth";

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const userData = {
        name: user?.user_metadata?.full_name || "",
        email: user?.email,
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your profile preferences.
                </p>
            </div>

            <div className="bg-surface border border-white/10 rounded-2xl p-6 sm:p-8">
                <h2 className="text-xl font-bold text-foreground mb-6">Profile Information</h2>
                <SettingsForm user={userData} updateAction={updateProfileAction} />
            </div>
        </div>
    );
}
