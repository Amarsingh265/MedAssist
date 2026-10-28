export const HOMECARE_TOPICS = {
  en: [
    { id: 'sore-throat', label: 'Sore throat', question: 'What can I do for a mild sore throat?' },
    { id: 'cough', label: 'Mild cough', question: 'What can help with a mild cough?' },
    { id: 'indigestion', label: 'Indigestion', question: 'What can I try for mild indigestion?' },
    { id: 'hydration', label: 'Hydration', question: 'How can I stay hydrated when unwell?' },
    { id: 'medicine-safety', label: 'Medicine safety', question: 'Is it safe to take an over-the-counter medicine?' },
    { id: 'prevention', label: 'Prevention', question: 'How can I help prevent common infections?' },
  ],
  hi: [
    { id: 'sore-throat', label: 'गले में खराश', question: 'हल्के गले की खराश में क्या कर सकते हैं?' },
    { id: 'cough', label: 'हल्की खाँसी', question: 'हल्की खाँसी में क्या मदद कर सकता है?' },
    { id: 'indigestion', label: 'अपच', question: 'हल्की अपच में क्या कर सकते हैं?' },
    { id: 'hydration', label: 'पानी और तरल', question: 'बीमार होने पर पर्याप्त तरल कैसे लें?' },
    { id: 'medicine-safety', label: 'दवा की सुरक्षा', question: 'क्या बिना पर्चे की दवा लेना सुरक्षित है?' },
    { id: 'prevention', label: 'बचाव', question: 'आम संक्रमणों से बचाव कैसे करें?' },
  ],
  kn: [
    { id: 'sore-throat', label: 'ಗಂಟಲು ನೋವು', question: 'ಸೌಮ್ಯ ಗಂಟಲು ನೋವಿಗೆ ಏನು ಮಾಡಬಹುದು?' },
    { id: 'cough', label: 'ಸೌಮ್ಯ ಕೆಮ್ಮು', question: 'ಸೌಮ್ಯ ಕೆಮ್ಮಿಗೆ ಏನು ಸಹಾಯ ಮಾಡಬಹುದು?' },
    { id: 'indigestion', label: 'ಅಜೀರ್ಣ', question: 'ಸೌಮ್ಯ ಅಜೀರ್ಣಕ್ಕೆ ಏನು ಮಾಡಬಹುದು?' },
    { id: 'hydration', label: 'ದ್ರವ ಸೇವನೆ', question: 'ಅಸ್ವಸ್ಥರಾಗಿರುವಾಗ ಸಾಕಷ್ಟು ದ್ರವವನ್ನು ಹೇಗೆ ಕುಡಿಯಬೇಕು?' },
    { id: 'medicine-safety', label: 'ಔಷಧಿ ಸುರಕ್ಷತೆ', question: 'ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಇಲ್ಲದ ಔಷಧಿ ತೆಗೆದುಕೊಳ್ಳುವುದು ಸುರಕ್ಷಿತವೇ?' },
    { id: 'prevention', label: 'ತಡೆಗಟ್ಟುವಿಕೆ', question: 'ಸಾಮಾನ್ಯ ಸೋಂಕುಗಳನ್ನು ತಡೆಯಲು ಏನು ಮಾಡಬಹುದು?' },
  ],
}

export const HOMECARE_COPY = {
  en: {
    title: 'HomeCare assistant',
    intro: 'Ask about everyday health and home care. This is general education, not a diagnosis or a substitute for a clinician.',
    language: 'Response language',
    search: 'Find a topic or question',
    placeholder: 'Type a health question…',
    send: 'Send',
    emergency: 'Emergency help',
    guide: 'Offline quick guide',
    guideNotice: 'This guide works without a connection. It is limited, static educational content—not a live response or a substitute for medical care.',
    service: 'Live assistant responses and hospital search need an internet connection. Your message is not saved to MedAssist chat history or sent to an external AI service.',
    sourceNote: 'Reference links are provided for further reading; these draft responses have not been clinically reviewed.',
    draft: 'Educational draft — needs clinical review',
    offline: 'Offline guide response',
    unavailable: 'The assistant could not connect. Try again when online, use an offline topic below, or contact a health professional.',
    retry: 'Retry',
    signIn: 'Your session expired. Sign in again to use live assistant responses.',
    mic: 'Voice recognition may be processed by your browser or its speech provider. Typing is available as an alternative.',
    notices: 'Safety notes',
    disclaimer: 'If symptoms are severe, worsening, or concerning, contact a qualified health professional. Do not delay urgent care for this chat.',
    sensitiveAudience: 'For a child, pregnancy, an older adult, allergies or a chronic condition, check with a clinician or pharmacist before trying remedies or medicines.',
    emergencyReply: 'This may be an emergency. Call 112 in India now or go to the nearest emergency department. Do not wait for a chat response. If you are elsewhere, use your local emergency number.',
  },
  hi: {
    title: 'होमकेयर सहायक',
    intro: 'रोज़मर्रा के स्वास्थ्य और घर पर देखभाल के बारे में पूछें। यह सामान्य जानकारी है, निदान या डॉक्टर की सलाह का विकल्प नहीं।',
    language: 'जवाब की भाषा',
    search: 'विषय या सवाल खोजें',
    placeholder: 'स्वास्थ्य से जुड़ा सवाल लिखें…',
    send: 'भेजें',
    emergency: 'आपातकालीन सहायता',
    guide: 'ऑफ़लाइन त्वरित मार्गदर्शिका',
    guideNotice: 'यह सीमित, स्थिर शैक्षिक जानकारी इंटरनेट के बिना उपलब्ध है। यह लाइव जवाब या चिकित्सा देखभाल का विकल्प नहीं है।',
    service: 'लाइव जवाब और अस्पताल खोजने के लिए इंटरनेट चाहिए। आपका संदेश MedAssist चैट इतिहास में सहेजा नहीं जाता और किसी बाहरी AI सेवा को नहीं भेजा जाता।',
    sourceNote: 'अधिक जानकारी के लिए संदर्भ लिंक दिए गए हैं; इन प्रारूपिक जवाबों की चिकित्सकीय समीक्षा नहीं हुई है।',
    draft: 'शैक्षिक प्रारूप — चिकित्सकीय समीक्षा आवश्यक',
    offline: 'ऑफ़लाइन मार्गदर्शिका का जवाब',
    unavailable: 'सहायक से संपर्क नहीं हो पाया। ऑनलाइन होने पर फिर कोशिश करें, नीचे ऑफ़लाइन विषय चुनें, या स्वास्थ्य पेशेवर से संपर्क करें।',
    retry: 'फिर कोशिश करें',
    signIn: 'आपका सत्र समाप्त हो गया। लाइव जवाबों के लिए फिर से साइन इन करें।',
    mic: 'आवाज़ की पहचान आपके ब्राउज़र या उसके सेवा प्रदाता द्वारा संसाधित हो सकती है। आप सवाल लिख भी सकते हैं।',
    notices: 'सुरक्षा संबंधी जानकारी',
    disclaimer: 'लक्षण गंभीर हों, बढ़ रहे हों या चिंता का कारण हों तो योग्य स्वास्थ्य पेशेवर से संपर्क करें। इस चैट के कारण ज़रूरी देखभाल में देरी न करें।',
    sensitiveAudience: 'बच्चे, गर्भावस्था, बुज़ुर्ग, एलर्जी या पुरानी बीमारी की स्थिति में उपाय या दवा आज़माने से पहले स्वास्थ्यकर्मी या फार्मासिस्ट से पूछें।',
    emergencyReply: 'यह आपातकाल हो सकता है। भारत में अभी 112 पर कॉल करें या निकटतम आपातकालीन विभाग जाएँ। चैट के जवाब की प्रतीक्षा न करें। अन्य स्थानों पर स्थानीय आपातकालीन नंबर पर कॉल करें।',
  },
  kn: {
    title: 'ಹೋಮ್‌ಕೇರ್ ಸಹಾಯಕ',
    intro: 'ದೈನಂದಿನ ಆರೋಗ್ಯ ಮತ್ತು ಮನೆಯ ಆರೈಕೆಯ ಬಗ್ಗೆ ಕೇಳಿ. ಇದು ಸಾಮಾನ್ಯ ಮಾಹಿತಿ ಮಾತ್ರ; ರೋಗನಿರ್ಣಯ ಅಥವಾ ವೈದ್ಯರ ಸಲಹೆಗೆ ಪರ್ಯಾಯವಲ್ಲ.',
    language: 'ಉತ್ತರದ ಭಾಷೆ',
    search: 'ವಿಷಯ ಅಥವಾ ಪ್ರಶ್ನೆ ಹುಡುಕಿ',
    placeholder: 'ಆರೋಗ್ಯದ ಪ್ರಶ್ನೆಯನ್ನು ಬರೆಯಿರಿ…',
    send: 'ಕಳುಹಿಸಿ',
    emergency: 'ತುರ್ತು ಸಹಾಯ',
    guide: 'ಆಫ್‌ಲೈನ್ ತ್ವರಿತ ಮಾರ್ಗದರ್ಶಿ',
    guideNotice: 'ಈ ಸೀಮಿತ ಸ್ಥಿರ ಶೈಕ್ಷಣಿಕ ಮಾಹಿತಿಯನ್ನು ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದೆಯೂ ಬಳಸಬಹುದು. ಇದು ಲೈವ್ ಉತ್ತರ ಅಥವಾ ವೈದ್ಯಕೀಯ ಆರೈಕೆಗೆ ಪರ್ಯಾಯವಲ್ಲ.',
    service: 'ಲೈವ್ ಉತ್ತರಗಳು ಮತ್ತು ಆಸ್ಪತ್ರೆ ಹುಡುಕಲು ಇಂಟರ್ನೆಟ್ ಅಗತ್ಯ. ನಿಮ್ಮ ಸಂದೇಶವನ್ನು MedAssist ಚಾಟ್ ಇತಿಹಾಸದಲ್ಲಿ ಉಳಿಸುವುದಿಲ್ಲ ಅಥವಾ ಹೊರಗಿನ AI ಸೇವೆಗೆ ಕಳುಹಿಸುವುದಿಲ್ಲ.',
    sourceNote: 'ಹೆಚ್ಚಿನ ಓದಿಗಾಗಿ ಉಲ್ಲೇಖ ಕೊಂಡಿಗಳಿವೆ; ಈ ಕರಡು ಉತ್ತರಗಳನ್ನು ವೈದ್ಯಕೀಯವಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿಲ್ಲ.',
    draft: 'ಶೈಕ್ಷಣಿಕ ಕರಡು — ವೈದ್ಯಕೀಯ ಪರಿಶೀಲನೆ ಅಗತ್ಯ',
    offline: 'ಆಫ್‌ಲೈನ್ ಮಾರ್ಗದರ್ಶಿ ಉತ್ತರ',
    unavailable: 'ಸಹಾಯಕವನ್ನು ಸಂಪರ್ಕಿಸಲಾಗಲಿಲ್ಲ. ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ, ಕೆಳಗಿನ ಆಫ್‌ಲೈನ್ ವಿಷಯ ಬಳಸಿ ಅಥವಾ ಆರೋಗ್ಯ ವೃತ್ತಿಪರರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    retry: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
    signIn: 'ನಿಮ್ಮ ಸೆಷನ್ ಮುಗಿದಿದೆ. ಲೈವ್ ಉತ್ತರಗಳಿಗಾಗಿ ಮತ್ತೆ ಸೈನ್ ಇನ್ ಮಾಡಿ.',
    mic: 'ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆಯನ್ನು ನಿಮ್ಮ ಬ್ರೌಸರ್ ಅಥವಾ ಅದರ ಸೇವಾ ಪೂರೈಕೆದಾರರು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಬಹುದು. ಬದಲಿಗೆ ಟೈಪ್ ಮಾಡಬಹುದು.',
    notices: 'ಸುರಕ್ಷತಾ ಸೂಚನೆಗಳು',
    disclaimer: 'ಲಕ್ಷಣಗಳು ತೀವ್ರವಾಗಿದ್ದರೆ, ಹೆಚ್ಚಾಗುತ್ತಿದ್ದರೆ ಅಥವಾ ಆತಂಕಕಾರಿಯಾಗಿದ್ದರೆ ಅರ್ಹ ಆರೋಗ್ಯ ವೃತ್ತಿಪರರನ್ನು ಸಂಪರ್ಕಿಸಿ. ಈ ಚಾಟ್‌ಗಾಗಿ ತುರ್ತು ಆರೈಕೆಯನ್ನು ವಿಳಂಬಿಸಬೇಡಿ.',
    sensitiveAudience: 'ಮಗು, ಗರ್ಭಧಾರಣೆ, ವಯೋವೃದ್ಧರು, ಅಲರ್ಜಿ ಅಥವಾ ದೀರ್ಘಕಾಲದ ಕಾಯಿಲೆ ಇದ್ದರೆ ಮನೆಮದ್ದು ಅಥವಾ ಔಷಧಿ ಬಳಸುವ ಮೊದಲು ವೈದ್ಯರು ಅಥವಾ ಔಷಧಗಾರರನ್ನು ಕೇಳಿ.',
    emergencyReply: 'ಇದು ತುರ್ತು ಪರಿಸ್ಥಿತಿಯಾಗಿರಬಹುದು. ಭಾರತದಲ್ಲಿ ಈಗಲೇ 112ಕ್ಕೆ ಕರೆ ಮಾಡಿ ಅಥವಾ ಹತ್ತಿರದ ತುರ್ತು ಚಿಕಿತ್ಸಾ ವಿಭಾಗಕ್ಕೆ ಹೋಗಿ. ಚಾಟ್ ಉತ್ತರಕ್ಕಾಗಿ ಕಾಯಬೇಡಿ. ಬೇರೆಡೆ ಇದ್ದರೆ ಸ್ಥಳೀಯ ತುರ್ತು ಸಂಖ್ಯೆಗೆ ಕರೆ ಮಾಡಿ.',
  },
}

const OFFLINE_ANSWERS = {
  'sore-throat': {
    en: 'For a mild sore throat, rest, drink fluids, and consider warm salt-water gargles if you can gargle safely. Seek medical advice if it is severe, worsening, lasts more than a few days, or you have trouble breathing or swallowing.',
    hi: 'हल्की गले की खराश में आराम करें और तरल पिएँ। यदि सुरक्षित रूप से गरारे कर सकते हैं, तो गुनगुने नमक-पानी से गरारे कर सकते हैं। दर्द गंभीर हो, बढ़े, कई दिनों तक रहे या साँस/निगलने में कठिनाई हो तो चिकित्सकीय सलाह लें।',
    kn: 'ಸೌಮ್ಯ ಗಂಟಲು ನೋವಿದ್ದರೆ ವಿಶ್ರಾಂತಿ ಮಾಡಿ ಮತ್ತು ದ್ರವಗಳನ್ನು ಕುಡಿಯಿರಿ. ಸುರಕ್ಷಿತವಾಗಿ ಮಾಡಬಹುದಾದರೆ ಬೆಚ್ಚಗಿನ ಉಪ್ಪು ನೀರಿನಿಂದ ಗಂಟಲು ಮುಕ್ಕಳಿಸಿ. ನೋವು ತೀವ್ರವಾಗಿದ್ದರೆ, ಹೆಚ್ಚಾದರೆ, ಕೆಲವು ದಿನಗಳಿಗಿಂತ ಹೆಚ್ಚು ಇದ್ದರೆ ಅಥವಾ ಉಸಿರಾಟ/ನುಂಗಲು ಕಷ್ಟವಾದರೆ ವೈದ್ಯಕೀಯ ಸಲಹೆ ಪಡೆಯಿರಿ.',
  },
  cough: {
    en: 'For a mild cough, rest and drink fluids. Honey may soothe a cough for people over 1 year old; never give honey to an infant under 1. Seek medical advice for breathing difficulty, chest pain, blood, worsening symptoms, or a cough that persists.',
    hi: 'हल्की खाँसी में आराम करें और तरल पिएँ। 1 वर्ष से अधिक उम्र के लोगों को शहद से राहत मिल सकती है; 1 वर्ष से छोटे बच्चे को शहद कभी न दें। साँस लेने में कठिनाई, सीने में दर्द, खून, बिगड़ते लक्षण या लगातार खाँसी होने पर चिकित्सकीय सलाह लें।',
    kn: 'ಸೌಮ್ಯ ಕೆಮ್ಮಿದ್ದರೆ ವಿಶ್ರಾಂತಿ ಮಾಡಿ ಮತ್ತು ದ್ರವಗಳನ್ನು ಕುಡಿಯಿರಿ. 1 ವರ್ಷಕ್ಕಿಂತ ಮೇಲ್ಪಟ್ಟವರಿಗೆ ಜೇನುತುಪ್ಪ ಕೆಮ್ಮನ್ನು ಶಮನಗೊಳಿಸಬಹುದು; 1 ವರ್ಷದೊಳಗಿನ ಮಗುವಿಗೆ ಎಂದಿಗೂ ಜೇನುತುಪ್ಪ ಕೊಡಬೇಡಿ. ಉಸಿರಾಟದ ತೊಂದರೆ, ಎದೆ ನೋವು, ರಕ್ತ, ಹೆಚ್ಚಾಗುವ ಲಕ್ಷಣಗಳು ಅಥವಾ ಮುಂದುವರಿಯುವ ಕೆಮ್ಮಿಗೆ ವೈದ್ಯಕೀಯ ಸಲಹೆ ಪಡೆಯಿರಿ.',
  },
  indigestion: {
    en: 'For mild indigestion, try smaller meals, eat slowly, and avoid foods or drinks that trigger symptoms. Seek medical advice if symptoms are severe or persistent, or if you have chest pain, repeated vomiting, or blood in vomit or stool.',
    hi: 'हल्की अपच में थोड़ा-थोड़ा भोजन करें, धीरे खाएँ और जिन खाद्य पदार्थों से परेशानी बढ़ती है उनसे बचें। लक्षण गंभीर या लगातार हों, सीने में दर्द हो, बार-बार उल्टी हो या उल्टी/मल में खून आए तो चिकित्सकीय सलाह लें।',
    kn: 'ಸೌಮ್ಯ ಅಜೀರ್ಣಕ್ಕೆ ಸ್ವಲ್ಪಸ್ವಲ್ಪವಾಗಿ ಊಟ ಮಾಡಿ, ನಿಧಾನವಾಗಿ ತಿನ್ನಿ ಮತ್ತು ತೊಂದರೆ ಹೆಚ್ಚಿಸುವ ಆಹಾರ/ಪಾನೀಯಗಳನ್ನು ತಪ್ಪಿಸಿ. ಲಕ್ಷಣಗಳು ತೀವ್ರವಾಗಿದ್ದರೆ ಅಥವಾ ಮುಂದುವರಿದರೆ, ಎದೆ ನೋವು, ಮರುಮರು ವಾಂತಿ ಅಥವಾ ವಾಂತಿ/ಮಲದಲ್ಲಿ ರಕ್ತವಿದ್ದರೆ ವೈದ್ಯಕೀಯ ಸಲಹೆ ಪಡೆಯಿರಿ.',
  },
  hydration: {
    en: 'Take frequent small sips of safe drinking water or other suitable fluids. If you cannot keep fluids down, urinate much less, feel faint or confused, seek medical help. Infants and people with serious illness need individualized advice.',
    hi: 'सुरक्षित पीने का पानी या अन्य उपयुक्त तरल थोड़ी-थोड़ी मात्रा में बार-बार लें। तरल न रुकें, पेशाब बहुत कम हो, चक्कर आए या भ्रम हो तो चिकित्सा सहायता लें। शिशुओं और गंभीर बीमारी वाले लोगों के लिए व्यक्तिगत सलाह ज़रूरी है।',
    kn: 'ಸುರಕ್ಷಿತ ಕುಡಿಯುವ ನೀರು ಅಥವಾ ಸೂಕ್ತ ದ್ರವಗಳನ್ನು ಆಗಾಗ್ಗೆ ಸ್ವಲ್ಪಸ್ವಲ್ಪವಾಗಿ ಕುಡಿಯಿರಿ. ದ್ರವ ಉಳಿಯದಿದ್ದರೆ, ಮೂತ್ರ ಬಹಳ ಕಡಿಮೆಯಾದರೆ, ಮೂರ್ಛೆ ಅಥವಾ ಗೊಂದಲವಿದ್ದರೆ ವೈದ್ಯಕೀಯ ಸಹಾಯ ಪಡೆಯಿರಿ. ಶಿಶುಗಳು ಮತ್ತು ಗಂಭೀರ ಅನಾರೋಗ್ಯವಿರುವವರಿಗೆ ವೈಯಕ್ತಿಕ ಸಲಹೆ ಅಗತ್ಯ.',
  },
  'medicine-safety': {
    en: 'I cannot recommend a medicine or dose. Check the package label and ask a pharmacist or clinician, especially for children, pregnancy, allergies, other medicines, or long-term conditions. Do not share prescription medicines or use antibiotics without a prescription.',
    hi: 'मैं किसी दवा या खुराक की सलाह नहीं दे सकता। पैकेट का लेबल पढ़ें और विशेषकर बच्चों, गर्भावस्था, एलर्जी, अन्य दवाओं या पुरानी बीमारी के मामले में फार्मासिस्ट/डॉक्टर से पूछें। प्रिस्क्रिप्शन की दवा साझा न करें और बिना पर्चे एंटीबायोटिक न लें।',
    kn: 'ನಾನು ಔಷಧಿ ಅಥವಾ ಪ್ರಮಾಣವನ್ನು ಶಿಫಾರಸು ಮಾಡಲು ಸಾಧ್ಯವಿಲ್ಲ. ಪ್ಯಾಕೆಟ್ ಲೇಬಲ್ ಓದಿ ಮತ್ತು ವಿಶೇಷವಾಗಿ ಮಕ್ಕಳು, ಗರ್ಭಧಾರಣೆ, ಅಲರ್ಜಿ, ಇತರ ಔಷಧಿಗಳು ಅಥವಾ ದೀರ್ಘಕಾಲದ ಕಾಯಿಲೆ ಇದ್ದರೆ ಔಷಧಿಕಾರ/ವೈದ್ಯರನ್ನು ಕೇಳಿ. ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಔಷಧಿ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ ಅಥವಾ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಇಲ್ಲದೆ ಆಂಟಿಬಯಾಟಿಕ್ ತೆಗೆದುಕೊಳ್ಳಬೇಡಿ.',
  },
  prevention: {
    en: 'Wash hands regularly, cover coughs and sneezes, avoid close contact when unwell, and keep recommended vaccinations up to date. Follow local public-health advice; these general steps do not prevent every infection.',
    hi: 'हाथ नियमित रूप से धोएँ, खाँसते/छींकते समय मुँह ढकें, बीमार होने पर नज़दीकी संपर्क से बचें और सुझाए गए टीके समय पर लगवाएँ। स्थानीय स्वास्थ्य निर्देश मानें; ये सामान्य उपाय हर संक्रमण को नहीं रोकते।',
    kn: 'ಕೈಗಳನ್ನು ನಿಯಮಿತವಾಗಿ ತೊಳೆಯಿರಿ, ಕೆಮ್ಮುವಾಗ/ಸೀನುವಾಗ ಬಾಯಿ ಮುಚ್ಚಿ, ಅನಾರೋಗ್ಯವಾಗಿದ್ದಾಗ ಹತ್ತಿರದ ಸಂಪರ್ಕ ತಪ್ಪಿಸಿ ಮತ್ತು ಶಿಫಾರಸು ಮಾಡಿದ ಲಸಿಕೆಗಳನ್ನು ಸಮಯಕ್ಕೆ ಪಡೆಯಿರಿ. ಸ್ಥಳೀಯ ಆರೋಗ್ಯ ಮಾರ್ಗದರ್ಶನ ಅನುಸರಿಸಿ; ಈ ಕ್ರಮಗಳು ಎಲ್ಲಾ ಸೋಂಕುಗಳನ್ನು ತಡೆಯುವುದಿಲ್ಲ.',
  },
}

const EMERGENCY_TERMS = [
  /chest pain|can't breathe|cannot breathe|difficulty breathing|severe bleeding|heavy bleeding|bleeding heavily|unconscious|not waking|stroke|overdose|poison|suicid|blue lips|choking/i,
  /सीने में दर्द|साँस नहीं|सांस नहीं|सांस लेने में कठिनाई|बहुत खून|बेहोश|स्ट्रोक|ज़हर|जहर|ओवरडोज़|आत्महत्या/i,
  /ಎದೆ ನೋವು|ಉಸಿರಾಡಲು ಆಗುತ್ತಿಲ್ಲ|ಉಸಿರಾಟದ ತೊಂದರೆ|ತೀವ್ರ ರಕ್ತಸ್ರಾವ|ಪ್ರಜ್ಞೆ ತಪ್ಪಿ|ಪಾರ್ಶ್ವವಾಯು|ವಿಷ|ಮಿತಿಮೀರಿದ ಔಷಧಿ|ಆತ್ಮಹತ್ಯೆ/i,
]

export function getOfflineReply(message, language) {
  const text = message.toLocaleLowerCase()
  const checks = [
    ['sore-throat', /sore throat|throat pain|गले में खराश|ಗಂಟಲು ನೋವು/],
    ['cough', /cough|खाँसी|खांसी|ಕೆಮ್ಮು/],
    ['indigestion', /indigestion|heartburn|अपच|ಅಜೀರ್ಣ/],
    ['hydration', /hydration|drink.*fluid|fluids|पानी|तरल|ದ್ರವ|ನೀರು/],
    ['medicine-safety', /medicine|medication|drug|antibiotic|दवा|औषधि|ಆಂಟಿಬಯಾಟಿಕ್|ಔಷಧಿ/],
    ['prevention', /prevent|prevention|infection|बचाव|संक्रमण|ತಡೆಗಟ್ಟುವಿಕೆ|ಸೋಂಕು/],
  ]
  for (const [id, pattern] of checks) {
    if (pattern.test(text)) {
      return { reply: OFFLINE_ANSWERS[id][language], topic: id }
    }
  }
  return null
}

export function isEmergencyMessage(message) {
  return EMERGENCY_TERMS.some((pattern) => pattern.test(message))
}

export function emergencyReplyFor(message, selectedLanguage) {
  const language = /[\u0900-\u097F]/u.test(message) ? 'hi' : /[\u0C80-\u0CFF]/u.test(message) ? 'kn' : selectedLanguage
  return HOMECARE_COPY[language].emergencyReply
}
