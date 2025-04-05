-- SensiAI Database Schema

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- =============================================
-- User Management
-- =============================================

CREATE TABLE users (
    user_id INTEGER PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    bio TEXT,
    location VARCHAR(100),
    occupation VARCHAR(100),
    profile_image_url VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

CREATE TABLE user_settings (
    setting_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    theme_mode VARCHAR(20) DEFAULT 'light',
    color_theme VARCHAR(20) DEFAULT 'yellow',
    font_size VARCHAR(20) DEFAULT 'medium',
    animation_level VARCHAR(20) DEFAULT 'standard',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    email_notifications_enabled BOOLEAN DEFAULT TRUE,
    learning_analytics_enabled BOOLEAN DEFAULT TRUE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE user_interests (
    interest_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    subject VARCHAR(50) NOT NULL,
    interest_level INTEGER DEFAULT 5, -- Scale 1-10
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE(user_id, subject)
);

CREATE TABLE user_learning_goals (
    goal_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    goal_type VARCHAR(50) NOT NULL, -- e.g., "Learn new skills", "Prepare for exams"
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- =============================================
-- Authentication & Security
-- =============================================

CREATE TABLE auth_tokens (
    token_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    token_type VARCHAR(20) NOT NULL, -- "refresh", "access", "reset", etc.
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_revoked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_auth_tokens_user_id ON auth_tokens(user_id);
CREATE INDEX idx_auth_tokens_token_hash ON auth_tokens(token_hash);

CREATE TABLE login_attempts (
    attempt_id INTEGER PRIMARY KEY,
    user_id INTEGER,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    attempted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- =============================================
-- Learning Content
-- =============================================

CREATE TABLE subjects (
    subject_id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_name VARCHAR(50),
    color_code VARCHAR(20),
    parent_subject_id INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_subject_id) REFERENCES subjects(subject_id) ON DELETE SET NULL
);

CREATE TABLE content_types (
    type_id INTEGER PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- Insert default content types
INSERT INTO content_types (name, description) VALUES
('Article', 'Text-based learning material'),
('Video', 'Video-based learning content'),
('Tutorial', 'Step-by-step instructional content'),
('Quiz', 'Assessment with questions and answers');

CREATE TABLE learning_content (
    content_id INTEGER PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content_type_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    difficulty_level VARCHAR(20) NOT NULL, -- "Beginner", "Intermediate", "Advanced"
    estimated_duration INTEGER, -- In minutes
    content_url VARCHAR(255),
    thumbnail_url VARCHAR(255),
    author_id INTEGER,
    is_premium BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (content_type_id) REFERENCES content_types(type_id),
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id),
    FOREIGN KEY (author_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX idx_learning_content_subject ON learning_content(subject_id);
CREATE INDEX idx_learning_content_type ON learning_content(content_type_id);
CREATE INDEX idx_learning_content_difficulty ON learning_content(difficulty_level);

CREATE TABLE content_tags (
    tag_id INTEGER PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    color_code VARCHAR(20)
);

CREATE TABLE content_tag_relations (
    relation_id INTEGER PRIMARY KEY,
    content_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    FOREIGN KEY (content_id) REFERENCES learning_content(content_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES content_tags(tag_id) ON DELETE CASCADE,
    UNIQUE(content_id, tag_id)
);

-- =============================================
-- Quizzes and Assessments
-- =============================================

CREATE TABLE quizzes (
    quiz_id INTEGER PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject_id INTEGER NOT NULL,
    difficulty_level VARCHAR(20) NOT NULL, -- "Beginner", "Intermediate", "Advanced"
    estimated_duration INTEGER, -- In minutes
    passing_score INTEGER DEFAULT 70, -- Percentage
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id)
);

CREATE TABLE question_types (
    type_id INTEGER PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- Insert default question types
INSERT INTO question_types (name, description) VALUES
('Multiple Choice', 'Question with multiple options and one correct answer'),
('True/False', 'Statement that is either true or false'),
('Fill in the Blank', 'Question where user must provide a specific answer'),
('Matching', 'Match items from two columns'),
('Essay', 'Open-ended question requiring a written response');

CREATE TABLE quiz_questions (
    question_id INTEGER PRIMARY KEY,
    quiz_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    question_type_id INTEGER NOT NULL,
    points INTEGER DEFAULT 1,
    explanation TEXT,
    order_index INTEGER NOT NULL,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
    FOREIGN KEY (question_type_id) REFERENCES question_types(type_id)
);

CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);

CREATE TABLE question_options (
    option_id INTEGER PRIMARY KEY,
    question_id INTEGER NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    order_index INTEGER NOT NULL,
    FOREIGN KEY (question_id) REFERENCES quiz_questions(question_id) ON DELETE CASCADE
);

CREATE TABLE quiz_attempts (
    attempt_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    quiz_id INTEGER NOT NULL,
    score INTEGER,
    percentage REAL,
    passed BOOLEAN,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id) ON DELETE CASCADE
);

CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);

CREATE TABLE question_responses (
    response_id INTEGER PRIMARY KEY,
    attempt_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    selected_option_id INTEGER,
    text_response TEXT,
    is_correct BOOLEAN,
    points_earned INTEGER DEFAULT 0,
    FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(attempt_id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES quiz_questions(question_id) ON DELETE CASCADE,
    FOREIGN KEY (selected_option_id) REFERENCES question_options(option_id) ON DELETE SET NULL
);

-- =============================================
-- Notes System (Notion-like Database)
-- =============================================

CREATE TABLE note_folders (
    folder_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    icon_name VARCHAR(50),
    parent_folder_id INTEGER,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_folder_id) REFERENCES note_folders(folder_id) ON DELETE SET NULL
);

CREATE INDEX idx_note_folders_user_id ON note_folders(user_id);

CREATE TABLE note_tags (
    tag_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(50) NOT NULL,
    color_code VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE(user_id, name)
);

CREATE INDEX idx_note_tags_user_id ON note_tags(user_id);

CREATE TABLE notes (
    note_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    folder_id INTEGER,
    is_favorite BOOLEAN DEFAULT FALSE,
    is_trashed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (folder_id) REFERENCES note_folders(folder_id) ON DELETE SET NULL
);

CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_folder_id ON notes(folder_id);
CREATE INDEX idx_notes_is_favorite ON notes(is_favorite);
CREATE INDEX idx_notes_is_trashed ON notes(is_trashed);
CREATE INDEX idx_notes_updated_at ON notes(updated_at);

CREATE TABLE note_tag_relations (
    relation_id INTEGER PRIMARY KEY,
    note_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    FOREIGN KEY (note_id) REFERENCES notes(note_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES note_tags(tag_id) ON DELETE CASCADE,
    UNIQUE(note_id, tag_id)
);

CREATE TABLE note_versions (
    version_id INTEGER PRIMARY KEY,
    note_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (note_id) REFERENCES notes(note_id) ON DELETE CASCADE
);

CREATE INDEX idx_note_versions_note_id ON note_versions(note_id);

-- =============================================
-- Chat/AI Assistant
-- =============================================

CREATE TABLE chat_sessions (
    session_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_updated_at ON chat_sessions(updated_at);

CREATE TABLE chat_messages (
    message_id INTEGER PRIMARY KEY,
    session_id INTEGER NOT NULL,
    sender_type VARCHAR(10) NOT NULL, -- "user" or "ai"
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(session_id) ON DELETE CASCADE
);

CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);

CREATE TABLE message_feedback (
    feedback_id INTEGER PRIMARY KEY,
    message_id INTEGER NOT NULL,
    feedback_type VARCHAR(20) NOT NULL, -- "positive", "negative"
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES chat_messages(message_id) ON DELETE CASCADE,
    UNIQUE(message_id)
);

CREATE TABLE saved_responses (
    saved_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    message_id INTEGER NOT NULL,
    note_id INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (message_id) REFERENCES chat_messages(message_id) ON DELETE CASCADE,
    FOREIGN KEY (note_id) REFERENCES notes(note_id) ON DELETE SET NULL
);

CREATE INDEX idx_saved_responses_user_id ON saved_responses(user_id);

-- =============================================
-- Task & Calendar Organizer
-- =============================================

CREATE TABLE task_categories (
    category_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(50) NOT NULL,
    color_code VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE(user_id, name)
);

CREATE TABLE tasks (
    task_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INTEGER,
    due_date TIMESTAMP,
    is_completed BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'medium', -- "low", "medium", "high"
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES task_categories(category_id) ON DELETE SET NULL
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_is_completed ON tasks(is_completed);

CREATE TABLE calendar_events (
    event_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INTEGER,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    is_all_day BOOLEAN DEFAULT FALSE,
    location VARCHAR(255),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern VARCHAR(50), -- "daily", "weekly", "monthly", "yearly"
    recurrence_end_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES task_categories(category_id) ON DELETE SET NULL
);

CREATE INDEX idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX idx_calendar_events_end_time ON calendar_events(end_time);

CREATE TABLE task_event_relations (
    relation_id INTEGER PRIMARY KEY,
    task_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES calendar_events(event_id) ON DELETE CASCADE,
    UNIQUE(task_id, event_id)
);

-- =============================================
-- Progress Tracking
-- =============================================

CREATE TABLE learning_streaks (
    streak_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE(user_id)
);

CREATE TABLE daily_activities (
    activity_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    activity_date DATE NOT NULL,
    study_time_minutes INTEGER DEFAULT 0,
    content_viewed INTEGER DEFAULT 0,
    quizzes_completed INTEGER DEFAULT 0,
    notes_created INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE(user_id, activity_date)
);

CREATE INDEX idx_daily_activities_user_id ON daily_activities(user_id);
CREATE INDEX idx_daily_activities_activity_date ON daily_activities(activity_date);

CREATE TABLE achievement_types (
    type_id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_name VARCHAR(50),
    points INTEGER DEFAULT 10
);

-- Insert default achievement types
INSERT INTO achievement_types (name, description, icon_name, points) VALUES
('7-Day Streak', 'Study for 7 consecutive days', 'Calendar', 10),
('Quiz Master', 'Complete 5 quizzes with a score of 80% or higher', 'Award', 20),
('Fast Learner', 'Complete your first course in record time', 'Clock', 15),
('Knowledge Explorer', 'Study 3 different subjects', 'Compass', 15),
('Dedicated Learner', 'Study for a total of 20 hours', 'BookOpen', 25),
('Perfect Score', 'Get 100% on any quiz', 'Target', 30);

CREATE TABLE user_achievements (
    achievement_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    achievement_type_id INTEGER NOT NULL,
    progress INTEGER DEFAULT 0,
    max_progress INTEGER NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_type_id) REFERENCES achievement_types(type_id),
    UNIQUE(user_id, achievement_type_id)
);

CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_is_completed ON user_achievements(is_completed);

CREATE TABLE subject_progress (
    progress_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    subject_id INTEGER NOT NULL,
    progress_percentage INTEGER DEFAULT 0,
    time_spent_minutes INTEGER DEFAULT 0,
    content_completed INTEGER DEFAULT 0,
    quizzes_completed INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id),
    UNIQUE(user_id, subject_id)
);

CREATE INDEX idx_subject_progress_user_id ON subject_progress(user_id);

CREATE TABLE content_progress (
    progress_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    content_id INTEGER NOT NULL,
    progress_percentage INTEGER DEFAULT 0,
    last_position VARCHAR(50), -- For videos/articles, stores position
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (content_id) REFERENCES learning_content(content_id) ON DELETE CASCADE,
    UNIQUE(user_id, content_id)
);

CREATE INDEX idx_content_progress_user_id ON content_progress(user_id);
CREATE INDEX idx_content_progress_content_id ON content_progress(content_id);
CREATE INDEX idx_content_progress_completed ON content_progress(completed);

-- =============================================
-- File Management
-- =============================================

CREATE TABLE file_categories (
    category_id INTEGER PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- Insert default file categories
INSERT INTO file_categories (name, description) VALUES
('Documents', 'Text documents, PDFs, and other written materials'),
('Images', 'Photos, diagrams, and other visual content'),
('Audio', 'Sound recordings and audio files'),
('Video', 'Video recordings and visual content'),
('Archives', 'Compressed files and archives'),
('Other', 'Miscellaneous files');

CREATE TABLE user_files (
    file_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL, -- In bytes
    mime_type VARCHAR(100) NOT NULL,
    category_id INTEGER,
    is_public BOOLEAN DEFAULT FALSE,
    upload_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES file_categories(category_id)
);

CREATE INDEX idx_user_files_user_id ON user_files(user_id);
CREATE INDEX idx_user_files_category_id ON user_files(category_id);
CREATE INDEX idx_user_files_upload_date ON user_files(upload_date);

CREATE TABLE file_tags (
    tag_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(50) NOT NULL,
    color_code VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE(user_id, name)
);

CREATE TABLE file_tag_relations (
    relation_id INTEGER PRIMARY KEY,
    file_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    FOREIGN KEY (file_id) REFERENCES user_files(file_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES file_tags(tag_id) ON DELETE CASCADE,
    UNIQUE(file_id, tag_id)
);

-- =============================================
-- Recommendations & Personalization
-- =============================================

CREATE TABLE user_recommendations (
    recommendation_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    content_id INTEGER NOT NULL,
    recommendation_score REAL NOT NULL, -- Higher score = stronger recommendation
    reason VARCHAR(100), -- e.g., "Based on your interests", "Popular in your field"
    is_viewed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (content_id) REFERENCES learning_content(content_id) ON DELETE CASCADE
);

CREATE INDEX idx_user_recommendations_user_id ON user_recommendations(user_id);
CREATE INDEX idx_user_recommendations_is_viewed ON user_recommendations(is_viewed);

CREATE TABLE content_interactions (
    interaction_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    content_id INTEGER NOT NULL,
    interaction_type VARCHAR(50) NOT NULL, -- "view", "like", "bookmark", "share", "complete"
    interaction_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (content_id) REFERENCES learning_content(content_id) ON DELETE CASCADE
);

CREATE INDEX idx_content_interactions_user_id ON content_interactions(user_id);
CREATE INDEX idx_content_interactions_content_id ON content_interactions(content_id);
CREATE INDEX idx_content_interactions_type ON content_interactions(interaction_type);

-- =============================================
-- Notifications
-- =============================================

CREATE TABLE notification_types (
    type_id INTEGER PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    icon_name VARCHAR(50)
);

-- Insert default notification types
INSERT INTO notification_types (name, description, icon_name) VALUES
('New Content', 'Notification for new learning materials', 'FileText'),
('Quiz Reminder', 'Reminder to complete scheduled quizzes', 'AlertCircle'),
('Learning Streak', 'Updates about learning streak status', 'Calendar'),
('Achievement', 'Notification for unlocked achievements', 'Award'),
('System', 'System-related notifications', 'Bell');

CREATE TABLE user_notifications (
    notification_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    type_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (type_id) REFERENCES notification_types(type_id)
);

CREATE INDEX idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX idx_user_notifications_is_read ON user_notifications(is_read);
CREATE INDEX idx_user_notifications_created_at ON user_notifications(created_at);

CREATE TABLE notification_settings (
    setting_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    type_id INTEGER NOT NULL,
    email_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    in_app_enabled BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (type_id) REFERENCES notification_types(type_id),
    UNIQUE(user_id, type_id)
);

