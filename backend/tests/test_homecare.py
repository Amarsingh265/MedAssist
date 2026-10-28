import unittest

from pydantic import ValidationError

from app.routers.chatbot import UserRateLimiter
from app.schemas import ChatRequest
from app.utils.homecare import CONTENT_STATUS, get_homecare_response


class HomecareResponseTests(unittest.TestCase):
    def test_supported_languages_return_localized_answers(self):
        for language, prompt in (
            ("en", "What helps a mild cough?"),
            ("hi", "हल्की खाँसी में क्या करें?"),
            ("kn", "ಸೌಮ್ಯ ಕೆಮ್ಮಿಗೆ ಏನು ಮಾಡಬಹುದು?"),
        ):
            with self.subTest(language=language):
                result = get_homecare_response(prompt, language)
                self.assertEqual(result["language"], language)
                self.assertTrue(result["reply"])
                self.assertEqual(result["content_status"], CONTENT_STATUS)

    def test_emergency_takes_precedence_over_ordinary_guidance(self):
        result = get_homecare_response("I have a cough and chest pain", "en")
        self.assertTrue(result["escalated"])
        self.assertIn("112", result["reply"])
        self.assertEqual(result["sources"][0]["review_status"], "official_service_link; educational_content_not_clinically_reviewed")
        self.assertNotIn("mild cough", result["reply"])

    def test_unsafe_remedy_escalates_and_rejects_it(self):
        result = get_homecare_response("Should I drink bleach?", "en")
        self.assertTrue(result["escalated"])
        self.assertIn("Do not drink", result["reply"])
        self.assertNotIn("review_date", result["sources"][0])

    def test_medicine_question_does_not_recommend_a_drug_or_dose(self):
        result = get_homecare_response("What antibiotic should I take?", "en")
        self.assertIn("a medicine or dose", result["reply"])
        self.assertIn("licensed clinician", result["reply"])

    def test_sensitive_audience_gets_extra_precaution(self):
        result = get_homecare_response("My baby has a cough", "en")
        self.assertTrue(any("child" in notice.lower() for notice in result["safety_notices"]))

    def test_unsupported_question_uses_honest_fallback(self):
        result = get_homecare_response("Can you interpret my blood test?", "en")
        self.assertIn("reliable, reviewed guidance", result["reply"])
        self.assertEqual(result["sources"], [])


class ChatRequestValidationTests(unittest.TestCase):
    def test_message_is_trimmed_and_language_defaults_to_english(self):
        request = ChatRequest(message="  sore throat  ")
        self.assertEqual(request.message, "sore throat")
        self.assertEqual(request.language, "en")

    def test_blank_oversized_and_unsupported_language_are_rejected(self):
        for values in (
            {"message": "   "},
            {"message": "x" * 1001},
            {"message": "cough", "language": "fr"},
        ):
            with self.subTest(values=values):
                with self.assertRaises(ValidationError):
                    ChatRequest(**values)


class UserRateLimiterTests(unittest.TestCase):
    def test_limit_applies_per_user_and_expires_after_the_window(self):
        limiter = UserRateLimiter(max_requests=2, window_seconds=60)
        self.assertTrue(limiter.allow(1, now=0))
        self.assertTrue(limiter.allow(1, now=1))
        self.assertFalse(limiter.allow(1, now=2))
        self.assertTrue(limiter.allow(2, now=2))
        self.assertTrue(limiter.allow(1, now=61))


if __name__ == "__main__":
    unittest.main()
