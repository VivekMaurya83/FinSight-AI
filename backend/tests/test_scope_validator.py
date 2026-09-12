import pytest
from app.services.scope_validator import ScopeValidator, REFUSAL_MESSAGE

def test_scope_in_scope_domains():
    in_scope_queries = [
        "How should I structure a monthly budget using the 50/30/20 rule?",
        "What is the difference between fixed and variable expenses?",
        "How much should I keep in an emergency fund?",
        "Explain compound interest on savings accounts.",
        "What is a SIP and how does it work in mutual funds?",
        "How does asset allocation help manage investment risk?",
        "How is an EMI calculated on a personal loan?",
        "What is the difference between flat interest and reducing interest rate?",
        "What factors affect my credit score?",
        "How does credit card utilization affect credit history?",
        "What does APR stand for in finance?",
        "Define inflation, liquidity, and net worth."
    ]

    for q in in_scope_queries:
        is_valid, msg = ScopeValidator.validate_query(q)
        assert is_valid is True, f"Query '{q}' should be in-scope but was rejected."
        assert msg == ""

def test_scope_out_of_scope_queries():
    out_of_scope_queries = [
        "Which crypto coin or Bitcoin should I buy today?",
        "Should I buy Apple or Tesla stock right now?",
        "Give me a day trading strategy for options and futures.",
        "Can you help me file my income tax return (ITR)?",
        "Which health insurance policy should I buy?",
        "Transfer 500 dollars to my friend's bank account.",
        "What is the best forex trading platform with 100x leverage?",
        "Give me legal advice on how to sue my landlord.",
        "Write a poem about the sunset in Paris."
    ]

    for q in out_of_scope_queries:
        is_valid, msg = ScopeValidator.validate_query(q)
        assert is_valid is False, f"Query '{q}' should be out-of-scope but was allowed."
        assert msg == REFUSAL_MESSAGE, f"Expected exact refusal message for '{q}'"
