-- TOXI EDU SYSTEM STABILIZATION SCRIPT
-- RUN THIS IN SUPABASE SQL EDITOR TO FIX MISSING TABLES

-- 1. XP Events (Tracking student effort)
CREATE TABLE IF NOT EXISTS public.xp_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.toxi_profiles(id) ON DELETE CASCADE NOT NULL,
    source TEXT NOT NULL, -- 'lesson', 'quiz', 'ai_practice', 'daily_login'
    amount INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Dictionary & Search History
CREATE TABLE IF NOT EXISTS public.dictionary_words (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keyword TEXT UNIQUE NOT NULL,
    pinyin TEXT,
    meaning TEXT,
    examples JSONB DEFAULT '[]',
    components JSONB DEFAULT '[]',
    grammar_note TEXT,
    source TEXT DEFAULT 'system',
    verified BOOLEAN DEFAULT false,
    lookup_count INTEGER DEFAULT 0,
    hsk_level TEXT,
    synonyms TEXT[],
    antonyms TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.toxi_profiles(id) ON DELETE CASCADE NOT NULL,
    keyword TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Flashcard System (Decks & Cards)
CREATE TABLE IF NOT EXISTS public.decks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.toxi_profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    level_id TEXT,
    topic_id TEXT,
    is_smart BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deck_id UUID REFERENCES public.decks(id) ON DELETE CASCADE NOT NULL,
    front TEXT NOT NULL,
    pinyin TEXT,
    meaning TEXT,
    hint TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.toxi_profiles(id) ON DELETE CASCADE NOT NULL,
    card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'new', -- 'new', 'learning', 'reviewing', 'mastered'
    next_review TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_reviewed TIMESTAMP WITH TIME ZONE,
    difficulty_factor DECIMAL DEFAULT 2.5,
    repetition_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, card_id)
);

CREATE TABLE IF NOT EXISTS public.saved_words (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.toxi_profiles(id) ON DELETE CASCADE NOT NULL,
    vocabulary_id UUID REFERENCES public.dictionary_words(id) ON DELETE SET NULL,
    keyword TEXT NOT NULL,
    deck_id UUID REFERENCES public.decks(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL, -- 'dictionary', 'immersion', 'exam'
    source_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, keyword, deck_id)
);

-- 4. Learning Diary & Community
CREATE TABLE IF NOT EXISTS public.learning_diary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.toxi_profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    mood TEXT,
    privacy TEXT DEFAULT 'private', -- 'private', 'public'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Immersion System
CREATE TABLE IF NOT EXISTS public.immersion_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content_cn TEXT NOT NULL,
    content_vi TEXT,
    type TEXT NOT NULL, -- 'reading', 'listening', 'video'
    level TEXT NOT NULL, -- 'HSK 1-2', 'HSK 3-4', 'HSK 5-6'
    thumbnail_url TEXT,
    audio_url TEXT,
    video_url TEXT,
    key_words_json JSONB DEFAULT '{}',
    published_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.immersion_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.toxi_profiles(id) ON DELETE CASCADE NOT NULL,
    material_id UUID REFERENCES public.immersion_materials(id) ON DELETE CASCADE NOT NULL,
    progress_percent DECIMAL DEFAULT 0,
    last_position TEXT,
    words_looked_up INTEGER DEFAULT 0,
    status TEXT DEFAULT 'reading', -- 'reading', 'completed'
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, material_id)
);

-- 6. AI & Memory System (Tongxiao Brain)
CREATE TABLE IF NOT EXISTS public.tongxiao_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.toxi_profiles(id) ON DELETE CASCADE NOT NULL,
    memory_key TEXT NOT NULL,
    memory_value JSONB NOT NULL,
    confidence_score DECIMAL DEFAULT 1.0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, memory_key)
);

CREATE TABLE IF NOT EXISTS public.tongxiao_wisdom_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.toxi_profiles(id) ON DELETE CASCADE NOT NULL,
    insight_type TEXT NOT NULL,
    insight_content TEXT NOT NULL,
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Exam Results Enhancements
CREATE TABLE IF NOT EXISTS public.edu_exam_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.toxi_profiles(id) ON DELETE CASCADE NOT NULL,
    exam_id UUID,
    score INTEGER NOT NULL,
    radar_stats JSONB DEFAULT '{"Listening": 0, "Reading": 0, "Speaking": 0, "Writing": 0, "Grammar": 0}',
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Extend Profiles with missing dashboard columns
ALTER TABLE public.toxi_profiles 
ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_access TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS target_exam TEXT DEFAULT 'HSK 5',
ADD COLUMN IF NOT EXISTS exam_date DATE,
ADD COLUMN IF NOT EXISTS target_score INTEGER,
ADD COLUMN IF NOT EXISTS total_days INTEGER DEFAULT 0;

-- 9. RLS Policies (Simplified for development)
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dictionary_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_diary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.immersion_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.immersion_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tongxiao_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tongxiao_wisdom_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edu_exam_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read dictionary" ON public.dictionary_words FOR SELECT USING (true);
CREATE POLICY "Users manage own xp" ON public.xp_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own search" ON public.search_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own decks" ON public.decks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own cards" ON public.cards FOR ALL USING (EXISTS (SELECT 1 FROM public.decks WHERE id = cards.deck_id AND user_id = auth.uid()));
CREATE POLICY "Users manage own progress" ON public.user_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own saved words" ON public.saved_words FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own diary" ON public.learning_diary FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public read immersion" ON public.immersion_materials FOR SELECT USING (true);
CREATE POLICY "Users manage own immersion progress" ON public.immersion_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own AI memory" ON public.tongxiao_memory FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own AI logs" ON public.tongxiao_wisdom_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own exam results" ON public.edu_exam_results FOR ALL USING (auth.uid() = user_id);

-- RPC for incrementing lookup count
CREATE OR REPLACE FUNCTION increment_lookup_count(word_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.dictionary_words
    SET lookup_count = lookup_count + 1
    WHERE id = word_id;
END;
$$ LANGUAGE plpgsql;

