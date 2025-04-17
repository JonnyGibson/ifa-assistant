-- Update existing notes with note types
UPDATE client_notes
SET note_type = CASE 
    WHEN title LIKE '%Review%' THEN 'review'
    WHEN title LIKE '%Call%' THEN 'call'
    WHEN title LIKE '%Email%' THEN 'email'
    WHEN title LIKE '%Urgent%' THEN 'urgent'
    WHEN title LIKE '%Research%' THEN 'research'
    ELSE 'meeting'
END; 