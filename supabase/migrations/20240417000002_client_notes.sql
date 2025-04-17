-- Clear existing client notes
DELETE FROM client_notes;

-- Insert multiple client notes with varying dates and interaction types
INSERT INTO client_notes (client_id, title, content, created_at, note_type)
SELECT 
    id,
    CASE 
        -- Active clients (70% of total)
        WHEN first_name IN ('Robert', 'Elizabeth', 'James', 'Patricia', 'Margaret', 'John', 'Mary', 'William', 'Jennifer', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Sarah', 'Charles', 'Karen', 'Thomas', 'Nancy', 'Christopher', 'Lisa', 'Daniel', 'Betty', 'Matthew', 'Dorothy', 'Anthony', 'Sandra', 'Mark', 'Donna', 'Steven', 'Carol', 'Paul', 'Rebecca', 'Kenneth', 'Sharon') THEN 
            CASE 
                WHEN note_number = 1 THEN 'Initial Consultation'
                WHEN note_number = 2 THEN 'Portfolio Review'
                WHEN note_number = 3 THEN 'Market Update'
                WHEN note_number = 4 THEN 'Strategy Review'
                WHEN note_number = 5 THEN 'Follow-up Call'
            END
        -- Less active clients (30% of total)
        ELSE 
            CASE 
                WHEN note_number = 1 THEN 'Initial Consultation'
                WHEN note_number = 2 THEN 'Annual Review'
            END
    END,
    CASE 
        -- Active clients
        WHEN first_name IN ('Robert', 'Elizabeth', 'James', 'Patricia', 'Margaret', 'John', 'Mary', 'William', 'Jennifer', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Sarah', 'Charles', 'Karen', 'Thomas', 'Nancy', 'Christopher', 'Lisa', 'Daniel', 'Betty', 'Matthew', 'Dorothy', 'Anthony', 'Sandra', 'Mark', 'Donna', 'Steven', 'Carol', 'Paul', 'Rebecca', 'Kenneth', 'Sharon') THEN 
            CASE 
                WHEN note_number = 1 THEN 'Initial consultation completed. Discussed investment objectives and risk tolerance. Scheduled follow-up review.'
                WHEN note_number = 2 THEN 'Regular portfolio review. Discussed performance and rebalancing needs. Client expressed satisfaction with current strategy.'
                WHEN note_number = 3 THEN 'Market update provided. Discussed recent volatility and its impact on portfolio. Reassured client about long-term strategy.'
                WHEN note_number = 4 THEN 'Strategy review completed. Discussed potential adjustments based on changing market conditions and client objectives.'
                WHEN note_number = 5 THEN 'Follow-up call to address client questions about recent market movements. Provided additional context and reassurance.'
            END
        -- Less active clients
        ELSE 
            CASE 
                WHEN note_number = 1 THEN 'Initial consultation completed. Basic investment strategy discussed.'
                WHEN note_number = 2 THEN 'Annual review completed. Portfolio performance discussed.'
            END
    END,
    CASE 
        -- Active clients
        WHEN first_name IN ('Robert', 'Elizabeth', 'James', 'Patricia', 'Margaret', 'John', 'Mary', 'William', 'Jennifer', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Sarah', 'Charles', 'Karen', 'Thomas', 'Nancy', 'Christopher', 'Lisa', 'Daniel', 'Betty', 'Matthew', 'Dorothy', 'Anthony', 'Sandra', 'Mark', 'Donna', 'Steven', 'Carol', 'Paul', 'Rebecca', 'Kenneth', 'Sharon') THEN 
            CASE 
                WHEN note_number = 1 THEN NOW() - INTERVAL '6 months'
                WHEN note_number = 2 THEN NOW() - INTERVAL '4 months'
                WHEN note_number = 3 THEN NOW() - INTERVAL '2 months'
                WHEN note_number = 4 THEN NOW() - INTERVAL '1 month'
                WHEN note_number = 5 THEN NOW() - INTERVAL '1 week'
            END
        -- Less active clients
        ELSE 
            CASE 
                WHEN note_number = 1 THEN NOW() - INTERVAL '6 months'
                WHEN note_number = 2 THEN NOW() - INTERVAL '3 months'
            END
    END,
    CASE 
        -- Active clients
        WHEN first_name IN ('Robert', 'Elizabeth', 'James', 'Patricia', 'Margaret', 'John', 'Mary', 'William', 'Jennifer', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Sarah', 'Charles', 'Karen', 'Thomas', 'Nancy', 'Christopher', 'Lisa', 'Daniel', 'Betty', 'Matthew', 'Dorothy', 'Anthony', 'Sandra', 'Mark', 'Donna', 'Steven', 'Carol', 'Paul', 'Rebecca', 'Kenneth', 'Sharon') THEN 
            CASE 
                WHEN note_number = 1 THEN 'meeting'
                WHEN note_number = 2 THEN 'review'
                WHEN note_number = 3 THEN 'email'
                WHEN note_number = 4 THEN 'review'
                WHEN note_number = 5 THEN 'call'
            END
        -- Less active clients
        ELSE 
            CASE 
                WHEN note_number = 1 THEN 'meeting'
                WHEN note_number = 2 THEN 'review'
            END
    END
FROM clients
CROSS JOIN generate_series(1, 
    CASE 
        WHEN first_name IN ('Robert', 'Elizabeth', 'James', 'Patricia', 'Margaret', 'John', 'Mary', 'William', 'Jennifer', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Sarah', 'Charles', 'Karen', 'Thomas', 'Nancy', 'Christopher', 'Lisa', 'Daniel', 'Betty', 'Matthew', 'Dorothy', 'Anthony', 'Sandra', 'Mark', 'Donna', 'Steven', 'Carol', 'Paul', 'Rebecca', 'Kenneth', 'Sharon') THEN 5
        ELSE 2
    END
) AS note_number; 