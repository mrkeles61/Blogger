-- Create FTS5 virtual table for full-text search
-- Note: FTS5 uses rowid internally, we'll store articleId as a separate column
CREATE VIRTUAL TABLE IF NOT EXISTS articles_fts USING fts5(
  title,
  summary,
  articleId UNINDEXED
);

-- Create triggers to keep FTS table in sync with articles table

-- Trigger for INSERT
CREATE TRIGGER IF NOT EXISTS articles_fts_insert AFTER INSERT ON articles BEGIN
  INSERT INTO articles_fts(rowid, title, summary, articleId)
  VALUES (new.id, new.title, new.summary, new.id);
END;

-- Trigger for UPDATE
CREATE TRIGGER IF NOT EXISTS articles_fts_update AFTER UPDATE ON articles BEGIN
  UPDATE articles_fts SET
    title = new.title,
    summary = new.summary
  WHERE rowid = new.id;
END;

-- Trigger for DELETE
CREATE TRIGGER IF NOT EXISTS articles_fts_delete AFTER DELETE ON articles BEGIN
  DELETE FROM articles_fts WHERE rowid = old.id;
END;

-- Populate FTS table with existing articles
INSERT INTO articles_fts(rowid, title, summary, articleId)
SELECT id, title, summary, id FROM articles;

