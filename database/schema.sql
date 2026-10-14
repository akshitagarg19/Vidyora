-- 1. Enable the pgvector extension (agar pehle se enabled nahi hai)
create extension if not exists vector;

-- 2. Document Chunks Table (Vector embeddings aur metadata ke liye)
create table if not exists document_chunks (
  id bigserial primary key,
  content text,
  doc_id text,
  slide_no int,
  "timestamp" text,
  embedding vector(1536) -- Match the dimensions of your embedding model
);

-- 3. HNSW Index for fast similarity search
create index if not exists document_chunks_hnsw_idx 
on document_chunks 
using hnsw (embedding vector_cosine_ops);

-- 4. Match Chunks RPC Function (Hybrid / Vector similarity search ke liye)
create or replace function match_chunks (
  query_embedding vector,
  match_threshold float,
  match_count int,
  filter_doc_id text default null
)
returns table (
  id bigint,
  content text,
  doc_id text,
  slide_no int,
  "timestamp" text,
  similarity float
)
language sql stable
as $$
  select
    document_chunks.id,
    document_chunks.content,
    document_chunks.doc_id,
    document_chunks.slide_no,
    document_chunks."timestamp",
    1 - (document_chunks.embedding <=> query_embedding) as similarity
  from document_chunks
  where (filter_doc_id is null or document_chunks.doc_id = filter_doc_id)
    and 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
  order by document_chunks.embedding <=> query_embedding
  limit match_count;
$$;

-- 5. Topics Table (Courses aur concepts ke liye)
create table if not exists topics (
  id bigserial primary key,
  title text,
  course_id text,
  prerequisites jsonb
);

-- 6. Mastery History Table (Student tracking / BKT engine ke liye)
create table if not exists mastery_history (
  id bigserial primary key,
  user_id uuid references auth.users(id),
  topic_id bigint references topics(id),
  mastery_score float,
  updated_at timestamp default now()
);

-- 7. Quiz Logs Table (Adaptive assessment aur test attempts ke liye)
create table if not exists quiz_logs (
  id bigserial primary key,
  user_id uuid references auth.users(id),
  topic_id bigint references topics(id),
  score float,
  responses jsonb,
  created_at timestamp default now()
);