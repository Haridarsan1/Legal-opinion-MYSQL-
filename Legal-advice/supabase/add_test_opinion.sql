-- Add test opinion text to the "test" case
-- Run this in your Supabase SQL Editor

UPDATE legal_requests
SET 
    opinion_text = 'After careful review of the submitted documents and the matter at hand, I provide the following legal opinion:

BACKGROUND:
Based on the information provided and the documents reviewed, this matter pertains to [relevant legal area]. The key facts considered include the timeline of events, the parties involved, and the applicable legal framework.

LEGAL ANALYSIS:
1. Applicable Law: The primary statutes and regulations governing this matter are [relevant laws]. According to established legal precedent, [key legal principles].

2. Assessment of Rights and Obligations: Upon review, it is evident that [analysis of legal position]. The courts have consistently held that [relevant case law or precedents].

3. Risk Assessment: The potential legal risks include [identified risks]. However, these can be mitigated through [recommended actions].

CONCLUSION:
Based on the foregoing analysis and in consideration of all relevant factors, it is my professional opinion that [conclusion and recommendation].

RECOMMENDATIONS:
1. [First recommendation]
2. [Second recommendation]  
3. [Third recommendation]

This opinion is provided based on the information available as of ' || CURRENT_DATE || '. Should additional facts emerge, this opinion may need to be revisited.

Respectfully submitted,
[Lawyer Name]
Legal Consultant',
    opinion_submitted_at = NOW(),
    status = 'opinion_ready'
WHERE 
    title = 'test' 
    OR request_number LIKE '%test%'
    OR description LIKE '%test%';

-- Verify the update
SELECT 
    id,
    request_number,
    title,
    status,
    opinion_submitted_at,
    LENGTH(opinion_text) as opinion_text_length
FROM legal_requests
WHERE 
    title = 'test' 
    OR request_number LIKE '%test%'
    OR description LIKE '%test%';
