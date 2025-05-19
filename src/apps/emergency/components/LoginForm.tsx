// src/components/LoginForm.tsx

/**
 * LoginForm Component
 *
 * Renders a prebuilt login UI from Supabase with Tailwind styling.
 * Automatically handles email/password login and magic link.
 */

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../../../supabaseClient";

const LoginForm = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-md rounded p-6 w-full max-w-md">
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="default"
          providers={[]}
        />
      </div>
    </div>
  );
};

export default LoginForm;
