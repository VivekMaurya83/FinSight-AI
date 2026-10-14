import re
from typing import Tuple, Optional
from app.core.config import settings

REFUSAL_MESSAGE = (
    "This topic is outside FinSight AI's current scope. "
    "I can help with budgeting, savings, basic investing concepts, "
    "loans & EMIs, credit scores, or financial terminology."
)

# Adversarial & Prompt Injection Patterns (Active in 'hardened' mode)
ADVERSARIAL_PATTERNS = [
    r"\bignore\s+(all\s+)?(prior|previous|above|existing)\s+(instructions|prompts|directions|rules|system)\b",
    r"\byou\s+are\s+now\s+(dan|unrestricted|evil|an\s+ai\s+without\s+rules|developer\s+mode)\b",
    r"\b(jailbreak|jailbroken|unfiltered\s+mode)\b",
    r"\b(hypothetical|fictional)\s+(scenario|story|script|novel|dialogue|exercise)\s+.*(loophole|evad|bypass|fraud|launder|exploit)\b",
    r"\b(bypass|circumvent|evade|exploit|cheat)\s+(compliance|regulat|guardrail|policy|law|kyc|aml|oversight)\b",
    r"\b(system\s*prompt|reveal\s+your\s+instructions|print\s+system\s+message)\b",
    r"\b(pretend\s+you\s+(have\s+no\s+rules|are\s+unrestricted|are\s+a\s+criminal))\b",
    r"\b(write\s+a\s+(story|script|dialogue)\s+about\s+(defrauding|laundering|evading|loopholes))\b",
]

# Explicit out-of-scope patterns (checked FIRST)
OUT_OF_SCOPE_PATTERNS = [
    # Taxes (filing, return, deduction, optimization, bracket)
    r"\b(tax|taxes|taxation|taxable|itr|1099|w2|w-2|irs|audit)\b",
    # Insurance (health, life, car, term, policy, premium, claim)
    r"\b(insurance|policy|premium|term\s*plan|annuity|claim)\b",
    # Crypto & Blockchain
    r"\b(crypto|cryptocurrency|bitcoin|btc|ethereum|eth|doge|solana|nft|altcoin|binance|coinbase|defi|web3|blockchain|token)\b",
    # Stock Picking / Buy / Sell / Day Trading
    r"\b(buy|sell|short|hold|target\s*price)\s+(stock|stocks|shares?|options?|call|put|ticker)\b",
    r"\b(stock\s*pick|stock\s*recommend|trading\s*strategy|day\s*trad\w*|swing\s*trad\w*|scalping|options\s*trad\w*|futures\s*trad\w*|technical\s*analysis|candlestick)\b",
    r"\b(should\s+i\s+(buy|sell|invest\s+in)\s+(apple|tesla|aapl|tsla|nvda|google|amzn|microsoft|msft|reliance|tcs|infosys))\b",
    r"\b(which\s+stock\s+to\s+buy|best\s+stock\s+to\s+buy|stocks?\s+to\s+invest\s+in\s+right\s+now)\b",
    # Forex Trading
    r"\b(forex|fx\s*trading|eur/usd|currency\s*trading|leverage\s*trading)\b",
    # Banking transactions / transfers / connections
    r"\b(transfer\s+(money|funds|dollars|rupees)|send\s+money|wire\s+transfer|process\s+payment|connect\s+(my\s+)?bank|bank\s+account\s+login|net\s*banking\s+password)\b",
    # Applications
    r"\b(apply\s+for\s+(a\s+)?(credit\s+card|loan|mortgage)|submit\s+(my\s+)?application)\b",
    # Legal / Regulated advice
    r"\b(legal\s+advice|sue\s+my\s+bank|file\s+a\s+lawsuit|bankruptcy\s+attorney|lawyer)\b",
]

# In-scope fintech educational topic keywords
IN_SCOPE_PATTERNS = [
    # 1. Budgeting
    r"\b(budget|budgeting|50/30/20|income|expense|expenses|fixed\s+expense|variable\s+expense|categoriz\w*|cash\s*flow)\b",
    # 2. Savings & Emergency funds
    r"\b(sav(e|ing|ings)|emergency\s+fund|saving\s+goal|liquid\s+savings|compound\s+interest|short-?term\s+savings|long-?term\s+savings)\b",
    # 3. Basic investing concepts (educational)
    r"\b(sip|systematic\s+investment\s+plan|mutual\s+funds?|index\s+funds?|invest(ing|ment|ments)?|diversif\w*|asset\s+allocation|compounding|risk\s+tolerance|market\s+risk|dollar\s*cost\s*averag\w*)\b",
    # 4. Loans & EMIs
    r"\b(loans?|emi|equated\s+monthly\s+installments?|principal|interest\s+rate|tenure|reducing\s+interest|flat\s+interest|amortiz\w*|repayment|mortgage\s+concept)\b",
    # 5. Credit Scores
    r"\b(credit\s*scores?|cibil|fico|credit\s*utilization|payment\s*history|credit\s*history|bureau|inquiry|credit\s*cards?(\s*usage)?|responsible\s*credit)\b",
    # 6. Financial Terminology
    r"\b(apr|apy|net\s*worth|liquidity|inflation|purchasing\s*power|asset|liability|debt|yield|capital\s*gains?|rule\s+of\s+72)\b",
]

class ScopeValidator:
    """
    Enforces strict guardrails ensuring FinSight AI only answers
    questions within the 6 defined financial education areas.
    """

    @classmethod
    def validate_query(cls, user_text: str, override_mode: Optional[str] = None) -> Tuple[bool, str]:
        """
        Validates user input.
        Returns (is_valid, message).
        If is_valid is False, message is the mandated refusal response.
        If is_valid is True, message is empty.
        """
        text = user_text.lower().strip()
        active_mode = override_mode or settings.GUARDRAIL_MODE

        # Step 0: In 'hardened' mode, detect adversarial and prompt injection attacks first
        if active_mode == "hardened":
            for pattern in ADVERSARIAL_PATTERNS:
                if re.search(pattern, text, re.IGNORECASE):
                    return False, REFUSAL_MESSAGE

        # Step 1: Check explicit out-of-scope triggers!
        for pattern in OUT_OF_SCOPE_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                return False, REFUSAL_MESSAGE

        # Step 2: If it's a polite greeting or inquiry about what FinSight AI does
        greeting_patterns = [
            r"^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening)|howdy|help|who\s+are\s+you|what\s+can\s+you\s+do)[\s!.]*$"
        ]
        for pattern in greeting_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return True, ""

        # Step 3: Check if the query touches any of the 6 educational domains
        for pattern in IN_SCOPE_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                return True, ""

        # Step 4: Unrelated query (out of scope)
        return False, REFUSAL_MESSAGE
