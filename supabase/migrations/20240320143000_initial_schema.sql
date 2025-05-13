-- Migration: Initial Schema Setup
-- Description: Creates the initial database schema for 10x-cards including:
-- - flashcards table
-- - generations table
-- - generation_error_logs table
-- - Enables RLS and sets up security policies
-- - Creates necessary triggers

-- Create tables
create table generations (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar(100) not null,
    generated_count int not null default 0,
    accepted_unedited_count int,
    accepted_edited_count int,
    source_text_hash varchar(64) not null,
    source_text_length int not null check (source_text_length between 1000 and 10000),
    generation_duration int not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table flashcards (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    generation_id bigint references generations(id) on delete cascade,
    front varchar(200) not null,
    back varchar(500) not null,
    source varchar(20) not null check (source in ('ai-full', 'ai-edited', 'manual')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table generation_error_logs (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar(100) not null,
    source_text_hash varchar(64) not null,
    source_text_length int not null check (source_text_length between 1000 and 10000),
    error_code varchar(20) not null,
    error_message text not null,
    created_at timestamptz not null default now()
);

-- Create updated_at trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger for flashcards
create trigger update_flashcards_updated_at
    before update on flashcards
    for each row
    execute function update_updated_at_column();

-- Enable Row Level Security
alter table flashcards enable row level security;
alter table generations enable row level security;
alter table generation_error_logs enable row level security;

-- Create RLS Policies for flashcards
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

-- Create RLS Policies for generations
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

-- Create RLS Policies for generation_error_logs
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