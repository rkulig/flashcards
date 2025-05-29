-- Migration: Restore RLS Policies
-- Description: Restores RLS policies for flashcards, generations, and generation_error_logs tables
-- This fixes the issue where policies were dropped but RLS remained enabled

-- Create RLS Policies for flashcards table
-- Policy for authenticated users to select their own flashcards
create policy "Users can view their own flashcards"
    on flashcards
    for select
    to authenticated
    using (auth.uid() = user_id);

-- Policy for authenticated users to insert their own flashcards
create policy "Users can insert their own flashcards"
    on flashcards
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Policy for authenticated users to update their own flashcards
create policy "Users can update their own flashcards"
    on flashcards
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Policy for authenticated users to delete their own flashcards
create policy "Users can delete their own flashcards"
    on flashcards
    for delete
    to authenticated
    using (auth.uid() = user_id);

-- Create RLS Policies for generations table
-- Policy for authenticated users to select their own generations
create policy "Users can view their own generations"
    on generations
    for select
    to authenticated
    using (auth.uid() = user_id);

-- Policy for authenticated users to insert their own generations
create policy "Users can insert their own generations"
    on generations
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Policy for authenticated users to update their own generations
create policy "Users can update their own generations"
    on generations
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Policy for authenticated users to delete their own generations
create policy "Users can delete their own generations"
    on generations
    for delete
    to authenticated
    using (auth.uid() = user_id);

-- Create RLS Policies for generation_error_logs table
-- Policy for authenticated users to select their own error logs
create policy "Users can view their own error logs"
    on generation_error_logs
    for select
    to authenticated
    using (auth.uid() = user_id);

-- Policy for authenticated users to insert their own error logs
create policy "Users can insert their own error logs"
    on generation_error_logs
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Note: No update/delete policies for error_logs as they should be immutable 