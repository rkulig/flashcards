import React, { useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AuthFormProps {
  mode: "login" | "register";
  onSuccess?: () => void;
  onError?: (errorMessage: string) => void;
  onRegisterSuccess?: () => void;
}

interface AuthFormState {
  email: string;
  password: string;
  confirmPassword: string;
}

export function AuthForm({ mode, onSuccess, onError, onRegisterSuccess }: AuthFormProps) {
  const [formState, setFormState] = useState<AuthFormState>({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleInputChange = (field: keyof AuthFormState) => (e: ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    // Clear messages when user starts typing
    if (errorMessage) {
      setErrorMessage("");
    }
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const validateForm = (): boolean => {
    // Email validation
    if (!formState.email || !formState.email.includes("@")) {
      setErrorMessage("Please enter a valid email address");
      return false;
    }

    // Password validation
    if (!formState.password || formState.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long");
      return false;
    }

    // Confirm password validation (only for register mode)
    if (mode === "register" && formState.password !== formState.confirmPassword) {
      setErrorMessage("Passwords must match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const requestBody = {
        email: formState.email,
        password: formState.password,
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (mode === "register") {
          // Registration success - show message and switch to login
          if (data.data.needsConfirmation) {
            setSuccessMessage(
              "Registration successful! Please check your email for confirmation, then you can sign in."
            );
          } else {
            setSuccessMessage("Registration completed successfully! You can now sign in.");
          }

          setFormState({
            email: formState.email, // Keep email for convenience
            password: "",
            confirmPassword: "",
          });

          // Call the register success callback to switch to login mode
          onRegisterSuccess?.();
        } else {
          // Login success - redirect
          onSuccess?.();

          // Redirect to flashcards page
          window.location.href = "/flashcards";
        }
      } else {
        const errorMsg = data.error || "An error occurred, please try again later";
        setErrorMessage(errorMsg);
        onError?.(errorMsg);
      }
    } catch {
      const errorMsg = "Connection error, please check your internet connection";
      setErrorMessage(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email Input */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={formState.email}
          onChange={handleInputChange("email")}
          placeholder="your@email.com"
          required
          disabled={isLoading}
        />
      </div>

      {/* Password Input */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <Input
          id="password"
          type="password"
          value={formState.password}
          onChange={handleInputChange("password")}
          placeholder="Minimum 6 characters"
          required
          disabled={isLoading}
        />
      </div>

      {/* Confirm Password Input - only for register mode */}
      {mode === "register" && (
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            value={formState.confirmPassword}
            onChange={handleInputChange("confirmPassword")}
            placeholder="Repeat password"
            required
            disabled={isLoading}
          />
        </div>
      )}

      {/* Success Message */}
      {successMessage && <div className="text-green-600 text-sm mt-2 p-2 bg-green-50 rounded-md">{successMessage}</div>}

      {/* Error Message */}
      {errorMessage && <div className="text-red-600 text-sm mt-2 p-2 bg-red-50 rounded-md">{errorMessage}</div>}

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Processing..." : mode === "login" ? "Sign In" : "Sign Up"}
      </Button>
    </form>
  );
}
