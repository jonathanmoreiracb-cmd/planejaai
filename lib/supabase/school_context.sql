-- Create school_context table
create table if not exists public.school_context (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  has_projector boolean default false not null,
  has_internet boolean default false not null,
  has_patio boolean default false not null,
  has_library boolean default false not null,
  students_count varchar(20) not null,
  average_age varchar(20) not null,
  has_special_needs boolean default false not null,
  class_characteristics text not null,
  literacy_level varchar(50) not null,
  knowledge_area varchar(50) not null,
  school_year varchar(50) not null,
  bncc_skills text[] not null default '{}',
  is_draft boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Unique constraint on user_id to support efficient upserts
  constraint school_context_user_id_key unique (user_id)
);

-- Enable Row Level Security (RLS)
alter table public.school_context enable row level security;

-- Policies for security isolation
create policy "Users can insert their own school context"
  on public.school_context for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own school context"
  on public.school_context for select
  using (auth.uid() = user_id);

create policy "Users can update their own school context"
  on public.school_context for update
  using (auth.uid() = user_id);

-- Performance Index to search contexts by user
create index if not exists school_context_user_id_idx on public.school_context (user_id);
