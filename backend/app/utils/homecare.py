"""Controlled, source-linked educational replies for the HomeCare assistant.

This is a small educational catalogue, not a clinical decision system. Entries
are deliberately marked as awaiting qualified medical review.
"""
from __future__ import annotations

from typing import Any


CONTENT_STATUS = "educational_draft_needs_clinical_review"

SOURCES: dict[str, dict[str, str]] = {
    "sore_throat": {
        "title": "NHS: Sore throat",
        "url": "https://www.nhs.uk/conditions/sore-throat/",
        "applicable_audience": "General public; use extra caution for children and people with swallowing difficulty.",
        "precautions": "Do not gargle if unable to spit safely. Seek urgent help for breathing difficulty or inability to swallow.",
        "review_status": "source_linked_content_not_clinically_reviewed",
    },
    "cough": {
        "title": "NHS: Cough",
        "url": "https://www.nhs.uk/conditions/cough/",
        "applicable_audience": "General public.",
        "precautions": "Honey must not be given to a child under 1 year. Urgent breathing symptoms need emergency care.",
        "review_status": "source_linked_content_not_clinically_reviewed",
    },
    "indigestion": {
        "title": "NHS: Indigestion",
        "url": "https://www.nhs.uk/conditions/indigestion/",
        "applicable_audience": "General public.",
        "precautions": "Persistent, severe or unusual symptoms need a clinician; ask a pharmacist before using medicines.",
        "review_status": "source_linked_content_not_clinically_reviewed",
    },
    "hydration": {
        "title": "NHS: Dehydration",
        "url": "https://www.nhs.uk/conditions/dehydration/",
        "applicable_audience": "General public; seek advice for infants, older adults and ongoing fluid loss.",
        "precautions": "Use oral rehydration products only as directed on their packet. Severe confusion or fainting is urgent.",
        "review_status": "source_linked_content_not_clinically_reviewed",
    },
    "medicine": {
        "title": "NHS: Medicines",
        "url": "https://www.nhs.uk/medicines/",
        "applicable_audience": "General public.",
        "precautions": "Follow the exact product label and ask a pharmacist or clinician about interactions, pregnancy, children, or health conditions.",
        "review_status": "source_linked_content_not_clinically_reviewed",
    },
    "prevention": {
        "title": "WHO: Health topics",
        "url": "https://www.who.int/health-topics",
        "applicable_audience": "General public.",
        "precautions": "Use local public-health guidance for vaccination and disease-specific prevention.",
        "review_status": "source_linked_content_not_clinically_reviewed",
    },
    "emergency": {
        "title": "India Emergency Response Support System",
        "url": "https://112.gov.in/",
        "applicable_audience": "People in India; elsewhere use the applicable local emergency number.",
        "precautions": "This chatbot cannot dispatch emergency services or rule out an emergency.",
        "review_status": "official_service_link; educational_content_not_clinically_reviewed",
    },
}

_ANSWERS: dict[str, dict[str, dict[str, Any]]] = {
    "sore_throat": {
        "en": {
            "reply": "For a mild sore throat, try frequent fluids and rest. Adults and older children who can safely gargle and spit may find a warm salt-water gargle soothing; do not swallow it. These steps may ease discomfort but do not treat an underlying cause. Get medical advice if it is severe, worsening, persistent, or you have trouble swallowing.",
            "precautions": "Do not use gargles for a young child or anyone unable to spit safely.",
        },
        "hi": {
            "reply": "हल्के गले के दर्द में आराम करें और थोड़े-थोड़े समय पर तरल पिएँ। जो बड़े बच्चे और वयस्क सुरक्षित रूप से गरारा करके पानी थूक सकते हैं, वे गुनगुने नमक-पानी से गरारा कर सकते हैं; इसे निगलें नहीं। इससे केवल तकलीफ़ कम हो सकती है, बीमारी का इलाज नहीं होता। दर्द तेज़ हो, बढ़े, बना रहे या निगलने में परेशानी हो तो स्वास्थ्यकर्मी से सलाह लें।",
            "precautions": "छोटे बच्चे या जो व्यक्ति पानी सुरक्षित रूप से नहीं थूक सकता, उसे गरारा न कराएँ।",
        },
        "kn": {
            "reply": "ಸೌಮ್ಯವಾದ ಗಂಟಲು ನೋವಿದ್ದರೆ ವಿಶ್ರಾಂತಿ ಮಾಡಿ ಮತ್ತು ಆಗಾಗ ದ್ರವಗಳನ್ನು ಕುಡಿಯಿರಿ. ಸುರಕ್ಷಿತವಾಗಿ ಗಾರ್ಗಲ್ ಮಾಡಿ ಉಗುಳಬಲ್ಲ ವಯಸ್ಕರು ಮತ್ತು ದೊಡ್ಡ ಮಕ್ಕಳು ಬೆಚ್ಚಗಿನ ಉಪ್ಪುನೀರಿನಿಂದ ಗಾರ್ಗಲ್ ಮಾಡಬಹುದು; ನುಂಗಬೇಡಿ. ಇದು ಅಸ್ವಸ್ಥತೆಯನ್ನು ಮಾತ್ರ ಕಡಿಮೆ ಮಾಡಬಹುದು, ಮೂಲ ಕಾರಣಕ್ಕೆ ಚಿಕಿತ್ಸೆ ಅಲ್ಲ. ನೋವು ತೀವ್ರವಾಗಿದ್ದರೆ, ಹೆಚ್ಚಾದರೆ, ಮುಂದುವರಿದರೆ ಅಥವಾ ನುಂಗಲು ತೊಂದರೆ ಇದ್ದರೆ ಆರೋಗ್ಯ ವೃತ್ತಿಪರರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
            "precautions": "ಚಿಕ್ಕ ಮಕ್ಕಳಿಗೆ ಅಥವಾ ಸುರಕ್ಷಿತವಾಗಿ ಉಗುಳಲು ಸಾಧ್ಯವಿಲ್ಲದವರಿಗೆ ಗಾರ್ಗಲ್ ಮಾಡಿಸಬೇಡಿ.",
        },
    },
    "cough": {
        "en": {
            "reply": "For a mild cough, rest and drink fluids. A warm drink with honey may soothe a cough for people older than 1 year. This is symptom relief, not treatment of the cause. Ask a pharmacist or clinician before using cough medicines, especially for a child. Seek urgent help for breathing difficulty, blue lips, or severe chest pain.",
            "precautions": "Never give honey to a child under 1 year. Do not give a child cough or cold medicines without checking with a clinician or pharmacist.",
        },
        "hi": {
            "reply": "हल्की खाँसी में आराम करें और तरल पिएँ। 1 वर्ष से अधिक उम्र के व्यक्ति को शहद वाला गुनगुना पेय खाँसी में आराम दे सकता है। यह केवल लक्षणों में राहत है, कारण का इलाज नहीं। खाँसी की दवा लेने से पहले, खासकर बच्चे के लिए, फार्मासिस्ट या स्वास्थ्यकर्मी से पूछें। साँस लेने में परेशानी, होंठ नीले पड़ना या सीने में तेज़ दर्द हो तो तुरंत आपातकालीन सहायता लें।",
            "precautions": "1 वर्ष से कम उम्र के बच्चे को शहद बिल्कुल न दें। बच्चे को खाँसी-जुकाम की दवा देने से पहले स्वास्थ्यकर्मी या फार्मासिस्ट से पूछें।",
        },
        "kn": {
            "reply": "ಸೌಮ್ಯವಾದ ಕೆಮ್ಮಿಗೆ ವಿಶ್ರಾಂತಿ ಮಾಡಿ ಮತ್ತು ದ್ರವಗಳನ್ನು ಕುಡಿಯಿರಿ. 1 ವರ್ಷಕ್ಕಿಂತ ಮೇಲ್ಪಟ್ಟವರಿಗೆ ಜೇನುತುಪ್ಪದ ಬೆಚ್ಚಗಿನ ಪಾನೀಯ ಕೆಮ್ಮನ್ನು ಶಮನಗೊಳಿಸಬಹುದು. ಇದು ಲಕ್ಷಣಕ್ಕೆ ಮಾತ್ರ ಆರಾಮ, ಕಾರಣಕ್ಕೆ ಚಿಕಿತ್ಸೆ ಅಲ್ಲ. ಕೆಮ್ಮಿನ ಔಷಧಿ ಬಳಸುವ ಮೊದಲು, ವಿಶೇಷವಾಗಿ ಮಗುವಿಗೆ, ಔಷಧಗಾರ ಅಥವಾ ಆರೋಗ್ಯ ವೃತ್ತಿಪರರನ್ನು ಕೇಳಿ. ಉಸಿರಾಟದ ತೊಂದರೆ, ತುಟಿಗಳು ನೀಲಿಯಾಗುವುದು ಅಥವಾ ತೀವ್ರ ಎದೆನೋವಿದ್ದರೆ ತಕ್ಷಣ ತುರ್ತು ಸಹಾಯ ಪಡೆಯಿರಿ.",
            "precautions": "1 ವರ್ಷಕ್ಕಿಂತ ಕಡಿಮೆ ವಯಸ್ಸಿನ ಮಗುವಿಗೆ ಜೇನುತುಪ್ಪ ಕೊಡಬೇಡಿ. ಮಗುವಿಗೆ ಕೆಮ್ಮು/ಜಲದೋಷದ ಔಷಧಿ ಕೊಡುವ ಮೊದಲು ಆರೋಗ್ಯ ವೃತ್ತಿಪರರನ್ನು ಕೇಳಿ.",
        },
    },
    "indigestion": {
        "en": {
            "reply": "For mild indigestion, try smaller meals, notice whether particular foods trigger symptoms, and avoid lying down soon after eating. This may reduce discomfort but does not identify or treat its cause. Ask a pharmacist before trying an over-the-counter product. Seek medical advice for severe, persistent or unusual symptoms.",
            "precautions": "Do not start or combine medicines without checking the label and asking a pharmacist if you have other conditions or take other medicines.",
        },
        "hi": {
            "reply": "हल्की अपच में छोटे भोजन लें, ध्यान दें कि क्या किसी खास भोजन से तकलीफ़ होती है, और खाने के तुरंत बाद न लेटें। इससे असुविधा कम हो सकती है, लेकिन कारण का पता या इलाज नहीं होता। बिना पर्चे की दवा लेने से पहले फार्मासिस्ट से पूछें। लक्षण तेज़, बने रहने वाले या असामान्य हों तो स्वास्थ्यकर्मी से सलाह लें।",
            "precautions": "दवा का लेबल पढ़े बिना दवाएँ शुरू या साथ में न लें। अन्य बीमारी या दवा होने पर फार्मासिस्ट से पूछें।",
        },
        "kn": {
            "reply": "ಸೌಮ್ಯ ಅಜೀರ್ಣಕ್ಕೆ ಚಿಕ್ಕ ಪ್ರಮಾಣದ ಊಟ ಮಾಡಿ, ಯಾವ ಆಹಾರದಿಂದ ತೊಂದರೆ ಆಗುತ್ತದೆ ಗಮನಿಸಿ ಮತ್ತು ಊಟವಾದ ತಕ್ಷಣ ಮಲಗಬೇಡಿ. ಇದರಿಂದ ಅಸ್ವಸ್ಥತೆ ಕಡಿಮೆಯಾಗಬಹುದು; ಆದರೆ ಕಾರಣವನ್ನು ಪತ್ತೆಹಚ್ಚುವುದಿಲ್ಲ ಅಥವಾ ಚಿಕಿತ್ಸೆ ನೀಡುವುದಿಲ್ಲ. ಪ್ರತ್ಯಕ್ಷ ಮಾರಾಟದ ಔಷಧಿ ಬಳಸುವ ಮೊದಲು ಔಷಧಗಾರರನ್ನು ಕೇಳಿ. ಲಕ್ಷಣ ತೀವ್ರವಾಗಿದ್ದರೆ, ಮುಂದುವರಿದರೆ ಅಥವಾ ಅಸಾಮಾನ್ಯವಾಗಿದ್ದರೆ ಆರೋಗ್ಯ ವೃತ್ತಿಪರರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
            "precautions": "ಲೇಬಲ್ ಪರಿಶೀಲಿಸದೆ ಔಷಧಿಗಳನ್ನು ಆರಂಭಿಸಬೇಡಿ ಅಥವಾ ಒಟ್ಟಿಗೆ ತೆಗೆದುಕೊಳ್ಳಬೇಡಿ. ಇತರ ಕಾಯಿಲೆ ಅಥವಾ ಔಷಧಿಗಳಿದ್ದರೆ ಔಷಧಗಾರರನ್ನು ಕೇಳಿ.",
        },
    },
    "hydration": {
        "en": {
            "reply": "To help prevent mild dehydration, drink safe water regularly, especially in hot weather or during activity. If vomiting or diarrhoea is causing fluid loss, ask a health worker or pharmacist whether an oral rehydration product is appropriate and prepare it exactly as its packet says. Ongoing fluid loss, very little urine, marked dizziness, confusion or fainting needs prompt medical help.",
            "precautions": "Infants, older adults, and people with kidney or heart conditions may need individual fluid advice. Do not guess a homemade rehydration recipe.",
        },
        "hi": {
            "reply": "हल्के निर्जलीकरण से बचने के लिए, खासकर गर्मी या मेहनत के दौरान, सुरक्षित पानी नियमित रूप से पिएँ। उल्टी या दस्त से तरल की कमी हो रही हो तो स्वास्थ्यकर्मी या फार्मासिस्ट से पूछें कि ओआरएस उपयुक्त है या नहीं, और पैकेट पर दिए निर्देशों के अनुसार ही बनाएँ। तरल की कमी जारी रहे, पेशाब बहुत कम हो, तेज़ चक्कर, भ्रम या बेहोशी हो तो तुरंत चिकित्सा सहायता लें।",
            "precautions": "शिशुओं, बुज़ुर्गों और गुर्दे या हृदय की बीमारी वाले लोगों को तरल के बारे में व्यक्तिगत सलाह चाहिए हो सकती है। घर पर अंदाज़े से ओआरएस न बनाएँ।",
        },
        "kn": {
            "reply": "ಸೌಮ್ಯ ನಿರ್ಜಲೀಕರಣವನ್ನು ತಡೆಯಲು, ವಿಶೇಷವಾಗಿ ಬಿಸಿಲಿನಲ್ಲಿ ಅಥವಾ ಚಟುವಟಿಕೆಯ ಸಮಯದಲ್ಲಿ, ಸುರಕ್ಷಿತ ನೀರನ್ನು ನಿಯಮಿತವಾಗಿ ಕುಡಿಯಿರಿ. ವಾಂತಿ ಅಥವಾ ಅತಿಸಾರದಿಂದ ದ್ರವ ಕಳೆದುಕೊಳ್ಳುತ್ತಿದ್ದರೆ, ORS ಸೂಕ್ತವೇ ಎಂದು ಆರೋಗ್ಯ ಕಾರ್ಯಕರ್ತರು ಅಥವಾ ಔಷಧಗಾರರನ್ನು ಕೇಳಿ ಮತ್ತು ಪ್ಯಾಕೆಟ್ ಸೂಚನೆಯಂತೆಯೇ ತಯಾರಿಸಿ. ದ್ರವ ನಷ್ಟ ಮುಂದುವರಿದರೆ, ಮೂತ್ರ ತುಂಬಾ ಕಡಿಮೆಯಾದರೆ, ತೀವ್ರ ತಲೆಸುತ್ತು, ಗೊಂದಲ ಅಥವಾ ಮೂರ್ಛೆ ಇದ್ದರೆ ತಕ್ಷಣ ವೈದ್ಯಕೀಯ ಸಹಾಯ ಪಡೆಯಿರಿ.",
            "precautions": "ಶಿಶುಗಳು, ವಯೋವೃದ್ಧರು ಮತ್ತು ಮೂತ್ರಪಿಂಡ/ಹೃದಯ ಸಮಸ್ಯೆಯವರಿಗೆ ವೈಯಕ್ತಿಕ ದ್ರವ ಸಲಹೆ ಅಗತ್ಯವಾಗಬಹುದು. ಅಂದಾಜಿನಿಂದ ಮನೆಯಲ್ಲಿ ORS ತಯಾರಿಸಬೇಡಿ.",
        },
    },
    "medicine": {
        "en": {
            "reply": "I can share general medicine-safety information, but I can’t choose a medicine or dose for you. Read the exact product label, check active ingredients to avoid accidental duplication, and ask a pharmacist about your other medicines, allergies, pregnancy, age, or health conditions. Do not combine products or stop a prescribed medicine based on chatbot advice. Antibiotics and prescription medicines require a licensed clinician.",
            "precautions": "For infants or children, pregnancy, complex health conditions, possible interactions or possible overdose, contact a pharmacist, clinician or emergency service rather than relying on chat.",
        },
        "hi": {
            "reply": "मैं दवाओं की सामान्य सुरक्षा बता सकता हूँ, लेकिन आपके लिए दवा या खुराक नहीं चुन सकता। उसी उत्पाद का लेबल पढ़ें, सक्रिय घटक देखें ताकि एक ही दवा अनजाने में दो बार न लें, और दूसरी दवाओं, एलर्जी, गर्भावस्था, उम्र या बीमारी के बारे में फार्मासिस्ट से पूछें। चैट की सलाह पर दवाएँ साथ न लें और निर्धारित दवा बंद न करें। एंटीबायोटिक और पर्चे वाली दवा के लिए लाइसेंस प्राप्त स्वास्थ्यकर्मी की सलाह ज़रूरी है।",
            "precautions": "शिशु/बच्चे, गर्भावस्था, जटिल बीमारी, दवाओं की परस्पर क्रिया या संभावित ओवरडोज़ में चैट के बजाय फार्मासिस्ट, स्वास्थ्यकर्मी या आपातकालीन सेवा से संपर्क करें।",
        },
        "kn": {
            "reply": "ನಾನು ಔಷಧಿಗಳ ಸಾಮಾನ್ಯ ಸುರಕ್ಷತೆ ಬಗ್ಗೆ ಹೇಳಬಹುದು, ಆದರೆ ನಿಮಗಾಗಿ ಔಷಧಿ ಅಥವಾ ಪ್ರಮಾಣವನ್ನು ಆಯ್ಕೆ ಮಾಡಲಾರೆ. ಅದೇ ಉತ್ಪನ್ನದ ಲೇಬಲ್ ಓದಿ, ಒಂದೇ ಸಕ್ರಿಯ ಪದಾರ್ಥವನ್ನು ತಪ್ಪಾಗಿ ಎರಡು ಬಾರಿ ತೆಗೆದುಕೊಳ್ಳುವುದನ್ನು ತಪ್ಪಿಸಿ, ಮತ್ತು ಇತರ ಔಷಧಿಗಳು, ಅಲರ್ಜಿ, ಗರ್ಭಧಾರಣೆ, ವಯಸ್ಸು ಅಥವಾ ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗಳ ಬಗ್ಗೆ ಔಷಧಗಾರರನ್ನು ಕೇಳಿ. ಚಾಟ್ ಸಲಹೆಯ ಆಧಾರದ ಮೇಲೆ ಔಷಧಿಗಳನ್ನು ಸೇರಿಸಬೇಡಿ ಅಥವಾ ವೈದ್ಯರು ನೀಡಿದ ಔಷಧಿಯನ್ನು ನಿಲ್ಲಿಸಬೇಡಿ. ಆಂಟಿಬಯೋಟಿಕ್ ಮತ್ತು ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಔಷಧಿಗೆ ಪರವಾನಗಿ ಪಡೆದ ವೈದ್ಯರ ಸಲಹೆ ಅಗತ್ಯ.",
            "precautions": "ಶಿಶುಗಳು/ಮಕ್ಕಳು, ಗರ್ಭಧಾರಣೆ, ಸಂಕೀರ್ಣ ಆರೋಗ್ಯ ಸಮಸ್ಯೆಗಳು, ಔಷಧಿ ಪರಸ್ಪರ ಕ್ರಿಯೆ ಅಥವಾ ಸಾಧ್ಯವಾದ ಓವರ್‌ಡೋಸ್ ಇದ್ದರೆ ಚಾಟ್ ಮೇಲೆ ಅವಲಂಬಿಸದೆ ಔಷಧಗಾರ, ವೈದ್ಯರು ಅಥವಾ ತುರ್ತು ಸೇವೆಯನ್ನು ಸಂಪರ್ಕಿಸಿ.",
        },
    },
    "prevention": {
        "en": {
            "reply": "For everyday prevention, wash hands with soap and safe water, use safe drinking water, and follow vaccination advice from your local health service. A local health worker can advise which steps fit your area and health needs. This chat cannot assess your personal risk.",
            "precautions": "Use current local public-health advice for outbreaks, vaccinations and community-specific risks.",
        },
        "hi": {
            "reply": "रोज़मर्रा की रोकथाम के लिए साबुन और सुरक्षित पानी से हाथ धोएँ, पीने का सुरक्षित पानी इस्तेमाल करें, और अपने स्थानीय स्वास्थ्य केंद्र की टीकाकरण सलाह मानें। आपके क्षेत्र और स्वास्थ्य के अनुसार सही जानकारी स्थानीय स्वास्थ्यकर्मी दे सकते हैं। यह चैट आपके व्यक्तिगत जोखिम का आकलन नहीं कर सकती।",
            "precautions": "बीमारी फैलने, टीकाकरण और स्थानीय जोखिमों के लिए मौजूदा स्थानीय जन-स्वास्थ्य सलाह लें।",
        },
        "kn": {
            "reply": "ದಿನನಿತ್ಯದ ತಡೆಗಟ್ಟುವಿಕೆಗೆ ಸಾಬೂನು ಮತ್ತು ಸುರಕ್ಷಿತ ನೀರಿನಿಂದ ಕೈ ತೊಳೆಯಿರಿ, ಸುರಕ್ಷಿತ ಕುಡಿಯುವ ನೀರು ಬಳಸಿ ಮತ್ತು ಸ್ಥಳೀಯ ಆರೋಗ್ಯ ಸೇವೆಯ ಲಸಿಕೆ ಸಲಹೆಯನ್ನು ಅನುಸರಿಸಿ. ನಿಮ್ಮ ಪ್ರದೇಶ ಮತ್ತು ಆರೋಗ್ಯಕ್ಕೆ ಸರಿಹೊಂದುವ ಕ್ರಮಗಳ ಬಗ್ಗೆ ಸ್ಥಳೀಯ ಆರೋಗ್ಯ ಕಾರ್ಯಕರ್ತರು ತಿಳಿಸಬಹುದು. ಈ ಚಾಟ್ ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಅಪಾಯವನ್ನು ಅಳೆಯಲಾರದು.",
            "precautions": "ರೋಗ ಹರಡುವಿಕೆ, ಲಸಿಕೆ ಮತ್ತು ಸ್ಥಳೀಯ ಅಪಾಯಗಳಿಗಾಗಿ ಪ್ರಸ್ತುತ ಸ್ಥಳೀಯ ಸಾರ್ವಜನಿಕ ಆರೋಗ್ಯ ಸಲಹೆ ಅನುಸರಿಸಿ.",
        },
    },
}

_EMERGENCY_TERMS = (
    "can't breathe", "cannot breathe", "difficulty breathing", "trouble breathing",
    "shortness of breath", "chest pain", "chest pressure", "face droop",
    "slurred speech", "one-sided weakness", "severe bleeding", "heavy bleeding",
    "bleeding heavily", "bleeding won't stop", "blue lips", "choking",
    "unconscious", "not waking", "poisoning", "swallowed poison", "overdose",
    "suicidal", "kill myself", "hurt myself", "end my life",
    "सांस लेने में दिक्कत", "साँस लेने में दिक्कत", "सांस नहीं", "सीने में दर्द",
    "चेहरा टेढ़ा", "बोलने में दिक्कत", "बेहोश", "खून बहना बंद नहीं",
    "जहर", "ज़हर", "ओवरडोज", "आत्महत्या", "खुदकुशी", "खुद को नुकसान",
    "ಉಸಿರಾಟ ತೊಂದರೆ", "ಉಸಿರಾಡಲು ಕಷ್ಟ", "ಎದೆ ನೋವು", "ಮುಖ ವಾಲು",
    "ಮಾತನಾಡಲು ತೊಂದರೆ", "ಪ್ರಜ್ಞೆ ತಪ್ಪು", "ರಕ್ತಸ್ರಾವ ನಿಲ್ಲುತ್ತಿಲ್ಲ",
    "ವಿಷ ಸೇವನೆ", "ವಿಷ ಕುಡಿದ", "ಓವರ್‌ಡೋಸ್", "ಆತ್ಮಹತ್ಯೆ", "ಸ್ವಯಂ ಹಾನಿ",
)

_EMERGENCY_REPLY = {
    "en": "This may be an emergency. Call 112 in India now, or your local emergency number if elsewhere. Do not wait for a chat reply. If safe, stay with the person and follow the emergency operator’s instructions. MedAssist cannot assess or rule out an emergency.",
    "hi": "यह आपातस्थिति हो सकती है। भारत में अभी 112 पर कॉल करें; अन्य जगह अपने स्थानीय आपातकालीन नंबर पर कॉल करें। चैट के जवाब का इंतज़ार न करें। सुरक्षित हो तो व्यक्ति के साथ रहें और आपातकालीन ऑपरेटर के निर्देश मानें। MedAssist आपातस्थिति की पुष्टि या उसे खारिज नहीं कर सकता।",
    "kn": "ಇದು ತುರ್ತು ಪರಿಸ್ಥಿತಿಯಾಗಿರಬಹುದು. ಭಾರತದಲ್ಲಿ ಈಗಲೇ 112 ಗೆ ಕರೆ ಮಾಡಿ; ಬೇರೆಡೆ ಸ್ಥಳೀಯ ತುರ್ತು ಸಂಖ್ಯೆಗೆ ಕರೆ ಮಾಡಿ. ಚಾಟ್ ಉತ್ತರಕ್ಕಾಗಿ ಕಾಯಬೇಡಿ. ಸುರಕ್ಷಿತವಾಗಿದ್ದರೆ ವ್ಯಕ್ತಿಯ ಜೊತೆಯಲ್ಲಿರಿ ಮತ್ತು ತುರ್ತು ಆಪರೇಟರ್ ಸೂಚನೆಗಳನ್ನು ಅನುಸರಿಸಿ. MedAssist ತುರ್ತುಸ್ಥಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಲು ಅಥವಾ ಇಲ್ಲವೆಂದು ಹೇಳಲು ಸಾಧ್ಯವಿಲ್ಲ.",
}

_GENERIC_NOTICES = {
    "en": "This is general educational information, not a diagnosis or a substitute for professional care.",
    "hi": "यह सामान्य शैक्षिक जानकारी है, निदान नहीं और पेशेवर चिकित्सा सलाह का विकल्प नहीं।",
    "kn": "ಇದು ಸಾಮಾನ್ಯ ಶೈಕ್ಷಣಿಕ ಮಾಹಿತಿ ಮಾತ್ರ; ರೋಗನಿರ್ಣಯವಲ್ಲ ಮತ್ತು ವೃತ್ತಿಪರ ವೈದ್ಯಕೀಯ ಆರೈಕೆಗೆ ಪರ್ಯಾಯವಲ್ಲ.",
}

_SENSITIVE_AUDIENCE = {
    "en": "For a child, pregnancy, an older adult, allergies or a chronic condition, check with a clinician or pharmacist before trying remedies or medicines.",
    "hi": "बच्चे, गर्भावस्था, बुज़ुर्ग, एलर्जी या पुरानी बीमारी की स्थिति में उपाय या दवा आज़माने से पहले स्वास्थ्यकर्मी या फार्मासिस्ट से पूछें।",
    "kn": "ಮಗು, ಗರ್ಭಧಾರಣೆ, ವಯೋವೃದ್ಧರು, ಅಲರ್ಜಿ ಅಥವಾ ದೀರ್ಘಕಾಲದ ಕಾಯಿಲೆ ಇದ್ದರೆ ಮನೆಮದ್ದು ಅಥವಾ ಔಷಧಿ ಬಳಸುವ ಮೊದಲು ವೈದ್ಯರು ಅಥವಾ ಔಷಧಗಾರರನ್ನು ಕೇಳಿ.",
}

_UNSAFE_TERMS = (
    "drink bleach", "bleach", "hydrogen peroxide", "kerosene", "industrial alcohol",
    "make myself vomit", "make them vomit", "essential oil drink", "poison remedy",
)
_PRESCRIPTION_TERMS = ("antibiotic", "antibiotics", "prescription medicine", "prescription drug", "एंटीबायोटिक", "ಆಂಟಿಬಯೋಟಿಕ್")
_MEDICINE_TERMS = ("medicine", "medication", "tablet", "pill", "drug", "otc", "painkiller", "दवा", "गोली", "औषधಿ", "ಮಾತ್ರೆ", "ಔಷಧಿ")
_PREVENTION_TERMS = ("prevent", "prevention", "preventive", "handwashing", "vaccination", "रोकथाम", "बचाव", "टीका", "ತಡೆಗಟ್ಟುವಿಕೆ", "ಲಸಿಕೆ")
_HYDRATION_TERMS = ("dehydrat", "rehydrat", "ors", "oral rehydration", "diarrhea", "diarrhoea", "vomiting", "पानी की कमी", "निर्जलीकरण", "ओआरएस", "अतिसार", "दस्त", "ನಿರ್ಜಲೀಕರಣ", "ಅತಿಸಾರ", "ವಾಂತಿ")
_INDIGESTION_TERMS = ("indigestion", "heartburn", "acidity", "stomach upset", "अपच", "सीने में जलन", "ಅಜೀರ್ಣ", "ಆಮ್ಲತೆ")
_COUGH_TERMS = ("cough", "खांसी", "खाँसी", "ಕೆಮ್ಮು")
_SORE_THROAT_TERMS = ("sore throat", "throat pain", "गले में दर्द", "गले की खराश", "ಗಂಟಲು ನೋವು", "ಗಂಟಲು ಕೆರೆತ")
_EMERGENCY_ACTION_TERMS = ("emergency", "urgent", "112", "आपातकाल", "तुरंत मदद", "ತುರ್ತು", "ತಕ್ಷಣ ಸಹಾಯ")
_HOSPITAL_TERMS = ("hospital", "clinic", "phc", "chc", "health centre", "health center", "nearby", "near me", "ಪಿಎಚ್‌ಸಿ", "ಆಸ್ಪತ್ರೆ", "ಆರೋಗ್ಯ ಕೇಂದ್ರ", "अस्पताल", "स्वास्थ्य केंद्र")
_APPOINTMENT_TERMS = ("appointment", "book doctor", "book an appointment", "अपॉइंटमेंट", "डॉक्टर की बुकिंग", "ನೇಮಕಾತಿ", "ವೈದ್ಯರನ್ನು ಬುಕ್")
_DIAGNOSIS_TERMS = ("diagnos", "what disease", "what do i have", "क्या बीमारी", "मुझे क्या हुआ", "ರೋಗನಿರ್ಣಯ", "ನನಗೆ ಏನಾಗಿದೆ")
_AUDIENCE_TERMS = (
    "child", "children", "baby", "infant", "pregnan", "pregnancy", "elderly", "older adult",
    "allergy", "allergies", "chronic condition",
    "बच्चा", "बच्चे", "शिशु", "गर्भवती", "गर्भावस्था", "बुज़ुर्ग",
    "ಮಗು", "ಮಕ್ಕಳು", "ಶಿಶು", "ಗರ್ಭಿಣಿ", "ಗರ್ಭಧಾರಣೆ", "ವಯೋವೃದ್ಧ",
)

_FALLBACK = {
    "en": "I don’t have reliable, reviewed guidance for that question in this small catalogue. Please ask a qualified health professional. I can help with mild sore throat, cough, indigestion, hydration, general OTC medicine safety, prevention, or finding care.",
    "hi": "इस छोटे संग्रह में इस सवाल के लिए भरोसेमंद, समीक्षा की हुई जानकारी उपलब्ध नहीं है। कृपया योग्य स्वास्थ्यकर्मी से पूछें। मैं हल्के गले के दर्द, खाँसी, अपच, पानी की कमी से बचाव, दवा की सामान्य सुरक्षा, रोकथाम या स्वास्थ्य केंद्र खोजने में मदद कर सकता हूँ।",
    "kn": "ಈ ಚಿಕ್ಕ ಮಾಹಿತಿಸಂಗ್ರಹದಲ್ಲಿ ಈ ಪ್ರಶ್ನೆಗೆ ವಿಶ್ವಾಸಾರ್ಹವಾಗಿ ಪರಿಶೀಲಿಸಿದ ಮಾರ್ಗದರ್ಶನ ಇಲ್ಲ. ದಯವಿಟ್ಟು ಅರ್ಹ ಆರೋಗ್ಯ ವೃತ್ತಿಪರರನ್ನು ಕೇಳಿ. ಸೌಮ್ಯ ಗಂಟಲು ನೋವು, ಕೆಮ್ಮು, ಅಜೀರ್ಣ, ನೀರಿನ ಕೊರತೆ, ಸಾಮಾನ್ಯ ಔಷಧಿ ಸುರಕ್ಷತೆ, ತಡೆಗಟ್ಟುವಿಕೆ ಅಥವಾ ಆರೈಕೆ ಸ್ಥಳ ಹುಡುಕಲು ನಾನು ಸಹಾಯ ಮಾಡಬಹುದು.",
}

_UNSAFE_REPLY = {
    "en": "Do not drink or apply bleach, kerosene, industrial chemicals or other toxic substances as a remedy, and do not induce vomiting. These can cause serious harm. If someone has swallowed or been exposed to a toxic substance, call emergency services or a poison centre now; in India call 112 for an emergency.",
    "hi": "ब्लीच, मिट्टी का तेल, औद्योगिक रसायन या अन्य ज़हरीले पदार्थ को उपाय के रूप में न पिएँ/लगाएँ और उल्टी कराने की कोशिश न करें। इससे गंभीर नुकसान हो सकता है। किसी ने ज़हरीला पदार्थ निगला या संपर्क में आया है तो अभी आपातकालीन सेवा या ज़हर नियंत्रण केंद्र को कॉल करें; भारत में आपातस्थिति के लिए 112 पर कॉल करें।",
    "kn": "ಬ್ಲೀಚ್, ಸೀಮೆಎಣ್ಣೆ, ಕೈಗಾರಿಕಾ ರಾಸಾಯನಿಕ ಅಥವಾ ಇತರ ವಿಷಕಾರಿ ವಸ್ತುಗಳನ್ನು ಮನೆಮದ್ದಾಗಿ ಕುಡಿಯಬೇಡಿ/ಹಚ್ಚಬೇಡಿ ಮತ್ತು ವಾಂತಿ ಮಾಡಿಸಲು ಪ್ರಯತ್ನಿಸಬೇಡಿ. ಇದರಿಂದ ಗಂಭೀರ ಹಾನಿಯಾಗಬಹುದು. ಯಾರಾದರೂ ವಿಷಕಾರಿ ವಸ್ತು ನುಂಗಿದ್ದರೆ ಅಥವಾ ಸಂಪರ್ಕಕ್ಕೆ ಬಂದಿದ್ದರೆ ಈಗಲೇ ತುರ್ತು ಸೇವೆ ಅಥವಾ ವಿಷ ನಿಯಂತ್ರಣ ಕೇಂದ್ರಕ್ಕೆ ಕರೆ ಮಾಡಿ; ಭಾರತದಲ್ಲಿ ತುರ್ತು ಪರಿಸ್ಥಿತಿಗೆ 112 ಕರೆ ಮಾಡಿ.",
}

def _has_term(text: str, terms: tuple[str, ...]) -> bool:
    return any(term in text for term in terms)


def get_homecare_response(message: str, language: str) -> dict[str, Any]:
    """Return a deterministic, localized response with no external AI call."""
    lang = language if language in {"en", "hi", "kn"} else "en"
    text = message.casefold()

    if _has_term(text, _EMERGENCY_TERMS):
        return {
            "reply": _EMERGENCY_REPLY[lang],
            "language": lang,
            "sources": [SOURCES["emergency"]],
            "safety_notices": [_GENERIC_NOTICES[lang]],
            "escalated": True,
            "content_status": CONTENT_STATUS,
        }

    if _has_term(text, _UNSAFE_TERMS):
        return {
            "reply": _UNSAFE_REPLY[lang],
            "language": lang,
            "sources": [SOURCES["emergency"]],
            "safety_notices": [_GENERIC_NOTICES[lang]],
            "escalated": True,
            "content_status": CONTENT_STATUS,
        }

    if _has_term(text, _PRESCRIPTION_TERMS) or _has_term(text, _MEDICINE_TERMS):
        entry = _ANSWERS["medicine"][lang]
        source_keys = ["medicine"]
    elif _has_term(text, _SORE_THROAT_TERMS):
        entry = _ANSWERS["sore_throat"][lang]
        source_keys = ["sore_throat"]
    elif _has_term(text, _COUGH_TERMS):
        entry = _ANSWERS["cough"][lang]
        source_keys = ["cough"]
    elif _has_term(text, _INDIGESTION_TERMS):
        entry = _ANSWERS["indigestion"][lang]
        source_keys = ["indigestion"]
    elif _has_term(text, _HYDRATION_TERMS):
        entry = _ANSWERS["hydration"][lang]
        source_keys = ["hydration"]
    elif _has_term(text, _PREVENTION_TERMS):
        entry = _ANSWERS["prevention"][lang]
        source_keys = ["prevention"]
    elif _has_term(text, _HOSPITAL_TERMS):
        entry = {
            "reply": {
                "en": "Use Hospitals to search the care locations currently listed in MedAssist. You can enter a village, town, district or PIN code manually; allow location access only if you want distance sorting. The directory may not include every PHC or CHC, and unlisted hours or services cannot be confirmed.",
                "hi": "MedAssist में सूचीबद्ध स्वास्थ्य केंद्र खोजने के लिए Hospitals पेज खोलें। गाँव, कस्बा, ज़िला या PIN कोड स्वयं लिखें; दूरी के अनुसार क्रम चाहिए तभी स्थान की अनुमति दें। सूची में हर PHC या CHC होना सुनिश्चित नहीं है, और जो समय या सेवाएँ दर्ज नहीं हैं उनकी पुष्टि नहीं की जा सकती।",
                "kn": "MedAssist ನಲ್ಲಿ ಈಗಿರುವ ಆರೈಕೆ ಕೇಂದ್ರಗಳನ್ನು ಹುಡುಕಲು Hospitals ಪುಟ ತೆರೆಯಿರಿ. ಗ್ರಾಮ, ಪಟ್ಟಣ, ಜಿಲ್ಲೆ ಅಥವಾ PIN ಕೋಡ್ ಅನ್ನು ನೀವೇ ನಮೂದಿಸಬಹುದು; ದೂರದ ಕ್ರಮ ಬೇಕಾದಾಗ ಮಾತ್ರ ಸ್ಥಳ ಅನುಮತಿ ನೀಡಿ. ಪಟ್ಟಿಯಲ್ಲಿ ಪ್ರತಿಯೊಂದು PHC ಅಥವಾ CHC ಇರಲೇಬೇಕು ಎಂಬ ಖಾತರಿ ಇಲ್ಲ; ನಮೂದಿಸದ ಸಮಯ ಅಥವಾ ಸೇವೆಗಳನ್ನು ದೃಢೀಕರಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.",
            }[lang],
            "precautions": "",
        }
        source_keys = []
    elif _has_term(text, _APPOINTMENT_TERMS):
        entry = {
            "reply": {
                "en": "You can request a visit from the Appointments page. Choose a doctor or hospital if available, then select a date and time. If your symptoms may be an emergency, call emergency services instead of waiting for an appointment.",
                "hi": "Appointments पेज से मुलाक़ात का अनुरोध कर सकते हैं। उपलब्ध होने पर डॉक्टर या अस्पताल चुनें, फिर तारीख और समय चुनें। लक्षण आपातकालीन हो सकते हैं तो अपॉइंटमेंट की प्रतीक्षा न करें—आपातकालीन सेवा को कॉल करें।",
                "kn": "Appointments ಪುಟದಿಂದ ಭೇಟಿಗೆ ವಿನಂತಿಸಬಹುದು. ಲಭ್ಯವಿದ್ದರೆ ವೈದ್ಯರು ಅಥವಾ ಆಸ್ಪತ್ರೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ, ನಂತರ ದಿನಾಂಕ ಮತ್ತು ಸಮಯ ಆರಿಸಿ. ಲಕ್ಷಣಗಳು ತುರ್ತು ಪರಿಸ್ಥಿತಿಯಾಗಿರಬಹುದಾದರೆ ಭೇಟಿಗಾಗಿ ಕಾಯದೆ ತುರ್ತು ಸೇವೆಗೆ ಕರೆ ಮಾಡಿ.",
            }[lang],
            "precautions": "",
        }
        source_keys = []
    elif _has_term(text, _DIAGNOSIS_TERMS) or "symptom" in text:
        entry = {
            "reply": {
                "en": "I can’t diagnose you in chat. The Symptom Checker offers a preliminary informational assessment, not a medical diagnosis. For concerning or persistent symptoms, contact a qualified clinician.",
                "hi": "मैं चैट में निदान नहीं कर सकता। Symptom Checker केवल शुरुआती जानकारी देता है, चिकित्सा निदान नहीं। चिंताजनक या लगातार बने रहने वाले लक्षणों के लिए योग्य स्वास्थ्यकर्मी से संपर्क करें।",
                "kn": "ಚಾಟ್‌ನಲ್ಲಿ ನಾನು ರೋಗನಿರ್ಣಯ ಮಾಡಲಾರೆ. Symptom Checker ಪ್ರಾಥಮಿಕ ಮಾಹಿತಿಯ ಮೌಲ್ಯಮಾಪನ ಮಾತ್ರ; ವೈದ್ಯಕೀಯ ರೋಗನಿರ್ಣಯವಲ್ಲ. ಚಿಂತಾಜನಕ ಅಥವಾ ಮುಂದುವರಿಯುವ ಲಕ್ಷಣಗಳಿಗೆ ಅರ್ಹ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
            }[lang],
            "precautions": "",
        }
        source_keys = []
    else:
        entry = {"reply": _FALLBACK[lang], "precautions": ""}
        source_keys = []

    notices = [_GENERIC_NOTICES[lang]]
    if entry.get("precautions"):
        notices.append(entry["precautions"])
    if _has_term(text, _AUDIENCE_TERMS):
        notices.append(_SENSITIVE_AUDIENCE[lang])

    return {
        "reply": entry["reply"],
        "language": lang,
        "sources": [SOURCES[key] for key in source_keys],
        "safety_notices": notices,
        "escalated": False,
        "content_status": CONTENT_STATUS,
    }
