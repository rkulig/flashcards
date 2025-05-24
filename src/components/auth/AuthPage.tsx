import React, { useState } from "react";
import { AuthSwitcher } from "./AuthSwitcher";
import { AuthForm } from "./AuthForm";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");

  const handleModeChange = (newMode: "login" | "register") => {
    console.log("AuthPage: mode changing from", mode, "to", newMode);
    setMode(newMode);
  };

  const handleSuccess = () => {
    console.log("Authentication successful");
    // Additional success handling can be added here
  };

  const handleError = (errorMessage: string) => {
    console.error("Authentication error:", errorMessage);
    // Additional error handling can be added here
  };

  const handleRegisterSuccess = () => {
    console.log("Registration successful, switching to login mode");
    setMode("login");
  };

  return (
    <div className="w-full">
      <AuthSwitcher currentMode={mode} onModeChange={handleModeChange} />

      <AuthForm mode={mode} onSuccess={handleSuccess} onError={handleError} onRegisterSuccess={handleRegisterSuccess} />
    </div>
  );
}
