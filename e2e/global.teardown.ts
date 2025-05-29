import { test as teardown } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/db/database.types";

teardown("cleanup flashcards database", async () => {
  console.log("Starting database cleanup...");

  // Get environment variables from .env.test
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  const testUserId = process.env.E2E_USERNAME_ID;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing required environment variables: SUPABASE_URL or SUPABASE_KEY");
    throw new Error("Missing Supabase configuration in .env.test");
  }

  if (!testUserId) {
    console.error("Missing E2E_USERNAME_ID in .env.test");
    throw new Error("Missing test user ID configuration");
  }

  // Create Supabase client using test environment
  const supabase = createClient<Database>(supabaseUrl, supabaseKey);

  try {
    // Delete all flashcards created by the test user
    const { error: flashcardsError, count } = await supabase
      .from("flashcards")
      .delete({ count: "exact" })
      .eq("user_id", testUserId);

    if (flashcardsError) {
      console.error("Error deleting flashcards:", flashcardsError);
      throw flashcardsError;
    }

    console.log(`Successfully deleted ${count || 0} flashcards for test user ${testUserId}`);

    // Optionally, also clean up generations and generation_error_logs if they exist for the test user
    const { error: generationsError } = await supabase.from("generations").delete().eq("user_id", testUserId);

    if (generationsError) {
      console.warn("Warning: Could not delete generations:", generationsError.message);
    } else {
      console.log("Successfully deleted test generations");
    }

    const { error: errorLogsError } = await supabase.from("generation_error_logs").delete().eq("user_id", testUserId);

    if (errorLogsError) {
      console.warn("Warning: Could not delete generation error logs:", errorLogsError.message);
    } else {
      console.log("Successfully deleted test generation error logs");
    }

    console.log("Database cleanup completed successfully");
  } catch (error) {
    console.error("Failed to cleanup database:", error);
    throw error;
  }
});
