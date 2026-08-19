import express from 'express';
import Complaint from '../models/Complaint.js';

const router = express.Router();

// Helper to detect language of input message
const detectLanguage = (text) => {
  const t = text.toLowerCase();
  
  // Marathi specific alphabet check or key vocabulary
  if (t.includes('पाणी') || t.includes('तक्रार') || t.includes('नागरी') || t.includes('रस्त्यावरील') || t.includes('खड्ड्या') || t.includes('कुठे') || t.includes('माझी')) {
    return 'mr';
  }
  
  // Hindi specific
  if (t.includes('पानी') || t.includes('शिकायत') || t.includes('कहा') || t.includes('मेरी') || t.includes('कचरा') || t.includes('सड़क')) {
    // Check if written in Devanagari script
    const devanagariPattern = /[\u0900-\u097F]/;
    if (devanagariPattern.test(text)) {
      return 'hi';
    }
  }

  // Hinglish checks (Hindi keywords written in Latin script)
  if (t.includes('pani') || t.includes('kab') || t.includes('aayega') || t.includes('kachra') || t.includes('jama') || t.includes('khada') || t.includes('kharab') || t.includes('mera') || t.includes('meri') || t.includes('batao') || t.includes('nahi') || t.includes('hai')) {
    return 'hinglish';
  }

  return 'en';
};

// NLP Parser to extract category dispatches from text
const extractCategory = (text) => {
  const t = text.toLowerCase();
  if (t.includes('water') || t.includes('pani') || t.includes('leak') || t.includes('pipe')) return 'Water Supply';
  if (t.includes('road') || t.includes('pothole') || t.includes('khada') || t.includes('sadak') || t.includes('crack')) return 'Roads & Potholes';
  if (t.includes('garbage') || t.includes('kachra') || t.includes('waste') || t.includes('trash') || t.includes('dustbin')) return 'Garbage';
  if (t.includes('drain') || t.includes('gutter') || t.includes('sewer') || t.includes('clog')) return 'Drainage';
  if (t.includes('light') || t.includes('streetlight') || t.includes('bulb') || t.includes('andhera')) return 'Street Lights';
  if (t.includes('traffic') || t.includes('signal') || t.includes('jam')) return 'Traffic';
  if (t.includes('toilet') || t.includes('washroom') || t.includes('shouchalay')) return 'Public Toilets';
  if (t.includes('encroach') || t.includes('kabza') || t.includes('illegal')) return 'Encroachment';
  if (t.includes('pollution') || t.includes('hawa') || t.includes('air')) return 'Air Pollution';
  if (t.includes('tree') || t.includes('ped') || t.includes('green') || t.includes('garden')) return 'Tree / Green Issues';
  return null;
};

// Chatbot Response API
router.post('/', async (req, res) => {
  const { message, conversationId, userId } = req.body;
  const conversation = conversationId || 'conv-' + Date.now();

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const lang = detectLanguage(message);
    const category = extractCategory(message);
    let reply = '';
    let suggestedActions = [];

    // 1. Complaint ID Search (e.g. NGP-2026-00124)
    const idPattern = /NGP-2026-\d{5}/i;
    const match = message.match(idPattern);
    
    if (match) {
      const complaintId = match[0].toUpperCase();
      const complaint = await Complaint.findOne({ where: { id: complaintId } });
      
      if (complaint) {
        // Expose timeline status securely for the target ID
        const status = complaint.status;
        const reportedDate = complaint.reportedDate;
        
        if (lang === 'mr') {
          reply = `मला तुमची तक्रार ${complaintId} सापडली आहे. तिची सद्यस्थिती "${status}" आहे (नोंदणी तारीख: ${reportedDate}). तुम्ही अधिक माहितीसाठी 'माझ्या तक्रारी' विभागात पाहू शकता.`;
        } else if (lang === 'hi') {
          reply = `मुझे आपकी शिकायत ${complaintId} मिल गई है। इसकी वर्तमान स्थिति "${status}" है (पंजीकरण तिथि: ${reportedDate})।`;
        } else if (lang === 'hinglish') {
          reply = `Mujhe aapki complaint ${complaintId} mil gayi hai. Iska current status abhi "${status}" hai. Yeh complaint ${reportedDate} ko register hui thi.`;
        } else {
          reply = `I located your complaint ${complaintId}. Its current status is "${status}" (Reported on: ${reportedDate}). You can review details on your timeline panel.`;
        }
      } else {
        if (lang === 'mr') reply = `क्षमस्व, मला नागपूर मनपा डेटाबेसमध्ये ${complaintId} क्रमांकाची कोणतीही तक्रार सापडली नाही.`;
        else if (lang === 'hi') reply = `क्षमा करें, मुझे नागपुर मनपा डेटाबेस में ${complaintId} नंबर की कोई शिकायत नहीं मिली।`;
        else if (lang === 'hinglish') reply = `Sorry, mujhe Nagpur NMC database mein ${complaintId} number ki koi complaint nahi mili.`;
        else reply = `Sorry, I couldn't find any complaint with ID ${complaintId} in our Nagpur NMC database.`;
      }
    }
    // 2. Report triggers (Water, Garbage, Roads, Potholes, etc.)
    else if (category) {
      if (lang === 'mr') {
        reply = `मी तुमच्या भागात ${category} ची समस्या नोंदवण्यासाठी तुम्हाला मदत करू शकतो. खालील बटणावर क्लिक करून थेट तक्रार नोंदवा:`;
        suggestedActions = [
          { type: 'report', category, label: `नोंदवा: ${category}` },
          { type: 'location', label: 'स्थान शेअर करा' }
        ];
      } else if (lang === 'hi') {
        reply = `मैं आपके क्षेत्र में ${category} की शिकायत दर्ज करने में आपकी सहायता कर सकता हूँ। कृपया नीचे दिए गए विकल्प चुनें:`;
        suggestedActions = [
          { type: 'report', category, label: `दर्ज करें: ${category}` },
          { type: 'location', label: 'लोकेशन शेयर करें' }
        ];
      } else if (lang === 'hinglish') {
        reply = `Main aapke area mein ${category} ki complaint register karne mein help kar sakta hoon. Category pre-fill karne ke liye niche click karein:`;
        suggestedActions = [
          { type: 'report', category, label: `Report ${category} Issue` },
          { type: 'location', label: 'Share Location' }
        ];
      } else {
        reply = `I can help you report a ${category} issue in Nagpur. Click the button below to open the pre-filled complaint form:`;
        suggestedActions = [
          { type: 'report', category, label: `Report ${category} Issue` },
          { type: 'location', label: 'Share Location' }
        ];
      }
    }
    // 3. User requested nearby issues or info
    else if (message.toLowerCase().includes('nearby') || message.toLowerCase().includes('जवळ') || message.toLowerCase().includes('aas pass')) {
      if (lang === 'mr') {
        reply = `तुमच्या जवळील सक्रिय नागरी तक्रारी शोधण्यासाठी, कृपया नागपूर स्मार्ट मॅपवर जा किंवा 'माझ्या जवळील नागरी प्रश्न' निवडा.`;
      } else if (lang === 'hi') {
        reply = `आपके आस-पास की शिकायतों को देखने के लिए, कृपया नागरिक मानचित्र खोलें।`;
      } else if (lang === 'hinglish') {
        reply = `Aapke area ke aas pass ke issues check karne ke liye, Civic Map open karein ya 'Nearby Issues' select karein.`;
      } else {
        reply = `To inspect complaints reported around your location, please refer to the Nagpur Civic Map or click 'Nearby Issues' card.`;
      }
    }
    // 4. Default Greeting / Help responses
    else {
      if (lang === 'mr') {
        reply = `नमस्कार! मी नगरसाथी एआय नागरी सहाय्यक आहे. मी खालील गोष्टी करू शकतो:\n1. पाणी, कचरा किंवा खड्ड्यांची तक्रार नोंदवणे (उदा. "माझ्या भागात कचरा साचला आहे")\n2. तक्रार आयडी शोधणे (उदा. "माझी तक्रार NGP-2026-00124 कुठे पोहोचली?")\n3. नजीकचे नागरी प्रश्न दाखवणे.`;
      } else if (lang === 'hi') {
        reply = `नमस्ते! मैं नागर साथी एआई नागरिक सहायक हूँ। मैं शिकायतों को दर्ज करने और शिकायत आईडी का विवरण जांचने में मदद कर सकता हूँ।`;
      } else if (lang === 'hinglish') {
        reply = `Hello! Main Nagar Sathi AI Assistant hoon. Main aapki complaints register karne aur status check karne mein help kar sakta hoon. Mujhe likhein jaise "mere area me pani nahi aa raha" ya "NGP-2026-00124".`;
      } else {
        reply = `Hello! I am your Nagar Sathi AI Assistant. I can help you report issues (e.g. "garbage pile near Mahal"), track specific IDs (e.g. "NGP-2026-00124"), or check nearby Nagpur services. How can I help you?`;
      }
    }

    res.json({
      message: reply,
      language: lang,
      suggestedActions,
      conversationId: conversation
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error processing chatbot response.' });
  }
});

export default router;
