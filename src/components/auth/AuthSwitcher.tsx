import React from "react";
import { Button } from "@/components/ui/button";
import { logger } from "../../lib/utils";

interface AuthSwitcherProps {
  currentMode: "login" | "register";
  onModeChange: (mode: "login" | "register") => void;
}

export function AuthSwitcher({ currentMode, onModeChange }: AuthSwitcherProps) {
  const handleModeClick = (mode: "login" | "register") => {
    logger.debug("Switching to mode:", mode);
    onModeChange(mode);
  };

  return (
    <div className="flex w-full mb-6">
      <Button
        type="button"
        variant={currentMode === "login" ? "default" : "outline"}
        className="flex-1 rounded-r-none"
        onClick={() => handleModeClick("login")}
      >
        Sign In
      </Button>
      <Button
        type="button"
        variant={currentMode === "register" ? "default" : "outline"}
        className="flex-1 rounded-l-none"
        onClick={() => handleModeClick("register")}
      >
        Sign Up
      </Button>
    </div>
  );
}
