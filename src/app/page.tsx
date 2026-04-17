"use client";

import React, { useEffect, useState } from "react";
import { 
  Book, 
  Search, 
  Bell, 
  User, 
  LayoutDashboard, 
  Library, 
  SquarePen, 
  Settings, 
  Trophy,
  ChevronRight,
  TrendingUp,
  X,
  Star,
  Edit2,
  Users,
  CheckCircle2,
  XCircle,
  Menu,
  Lock,
  Calendar
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { saveReadingReport, generateBookAIStuff, fetchReadingReports, searchAladinBooks, validatePassword, getRecommendedBooks, getAdultRecommendedBooks } from "./actions";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const READING_QUOTES = [
  "\"읽는 사람(Reader)은 내일의 리더(Leader)가 됩니다.\"",
  "\"책은 마음의 창입니다. 오늘 어떤 창을 열어볼까요?\"",
  "\"독서는 가장 싼 값으로 얻을 수 있는 가장 비싼 지혜입니다.\"",
  "\"오늘 무심코 읽은 한 줄이 내일의 나를 바꿉니다.\"",
  "\"책 한 권은 하나의 세계입니다. 오늘은 어떤 세계로 가볼까요?\"",
  "\"독서는 완성된 사람을 만들고, 글쓰기는 정확한 사람을 만듭니다.\"",
  "\"책 없는 방은 영혼 없는 몸과 같습니다.\"",
  "\"하루라도 책을 읽지 않으면 입안에 가시가 돋습니다.\"",
  "\"독서는 지식의 재료를 줄 뿐 아니라, 지혜의 길을 엽니다.\"",
  "\"좋은 책을 읽는 것은 과거의 가장 훌륭한 사람들과 대화하는 것이다.\""
];


// --- Components ---

const SidebarItem = ({ icon: Icon, label, active = false, onClick, mobile = false }: { icon: any, label: string, active?: boolean, onClick?: () => void, mobile?: boolean }) => (
  <div 
    onClick={onClick}
    className={cn(
        "flex flex-col lg:flex-row items-center gap-1 lg:gap-3 px-2 py-2 lg:px-4 lg:py-3 rounded-2xl lg:rounded-xl cursor-pointer transition-all duration-300 transform active:scale-95 group",
        active ? "bg-primary text-white shadow-lg lg:shadow-md font-bold" : "text-olive/70 hover:bg-olive/10",
        mobile && "flex-1"
    )}
  >
    <Icon size={mobile ? 22 : 20} className={cn("transition-transform group-hover:scale-110", active && "animate-bounce-short")} />
    <span className={cn("font-bold text-[10px] lg:text-sm lg:font-medium whitespace-nowrap")}>{label}</span>
  </div>
);

const Card = ({ children, className, onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={cn("bg-white rounded-[2rem] p-6 shadow-sm border border-olive/5", className)}
  >
    {children}
  </div>
);

const StatCard = ({ title, value, icon: Icon, color, onClick }: { title: string, value: string, icon: any, color: string, onClick?: () => void }) => (
  <Card 
    className={cn(
      "flex items-center gap-4 hover:shadow-xl transition-all duration-300",
      onClick && "cursor-pointer hover:scale-[1.03] active:scale-[0.97]"
    )}
    onClick={onClick}
  >
    <div className={cn("p-4 rounded-2xl text-white shadow-inner transform -rotate-3", color)}>
      <Icon size={24} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-olive/50 font-black uppercase tracking-widest mb-0.5 truncate">{title}</p>
      <p className="text-2xl font-black text-text-main leading-tight truncate">{value}</p>
    </div>
  </Card>
);

const BookCard = ({ title, author, progress, image }: { title: string, author: string, progress: number, image?: string }) => (
  <div className="flex flex-col gap-3 group cursor-pointer h-full">
    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-olive/10 shadow-sm group-hover:shadow-2xl transition-all duration-500 transform group-hover:-translate-y-2">
      {image ? (
          <img src={image} alt={title} className="object-cover w-full h-full scale-100 group-hover:scale-110 transition-transform duration-700" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-olive/30 bg-white/50">
          <Book size={48} />
        </div>
      )}
      <div className="absolute inset-x-4 bottom-4 h-1.5 bg-black/10 backdrop-blur-md rounded-full overflow-hidden">
        <div 
          className="h-full bg-accent transition-all duration-1500 ease-out" 
          style={{ width: `${progress}%` }} 
        />
      </div>
    </div>
    <div className="px-1">
      <h3 className="font-black text-text-main text-sm lg:text-base truncate leading-tight mb-0.5 lg:mb-1 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-xs lg:text-sm text-olive/60 font-medium truncate">{author}</p>
    </div>
  </div>
);

// --- Main Page ---

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [bookResults, setBookResults] = useState<any[]>([]);
  const [isSearchingBook, setIsSearchingBook] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiCoach, setAICoach] = useState<{ quizzes: any[], guides: string[] } | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [libraryData, setLibraryData] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [filterWriter, setFilterWriter] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState(false);
  const [recommendedBooks, setRecommendedBooks] = useState<any[]>([]);
  const [adultRecommendedBooks, setAdultRecommendedBooks] = useState<any[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<any>(null);
  const [currentQuote, setCurrentQuote] = useState(READING_QUOTES[0]);

  const toLocalISOString = (date?: Date | string | number) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const [formData, setFormData] = useState({
    date: toLocalISOString(),
    writer: "민준",
    title: "",
    author: "",
    thumbnail: "",
    content: "",
    rating: 5,
    summary: "",
    quote: "",
    quizScore: "",
    memo: "",
    originalTitle: "",
    originalWriter: "",
    bookDescription: ""
  });

  useEffect(() => {
    // Pick quote based on the week of the year
    const now = new Date();
    const oneJan = new Date(now.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((now.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
    const resultWeek = Math.ceil((now.getDay() + 1 + numberOfDays) / 7);
    setCurrentQuote(READING_QUOTES[resultWeek % READING_QUOTES.length]);
  }, []);

  // Calculate real-time stats
  const totalReportsCount = libraryData.length;
  const minjunCount = libraryData.filter(r => (r["작성자"] || "").includes("민준")).length;
  const yujunCount = libraryData.filter(r => (r["작성자"] || "").includes("유준")).length;

  const filteredLibraryData = (filterWriter 
    ? libraryData.filter(r => (r["작성자"] || "").includes(filterWriter))
    : [...libraryData]).sort((a, b) => {
      const dateA = new Date(a["날짜"]).getTime();
      const dateB = new Date(b["날짜"]).getTime();
      return dateB - dateA;
    });

  useEffect(() => {
    const auth = localStorage.getItem('reading_journal_auth');
    if (auth === 'true') {
      setIsAuthorized(true);
      loadData();
    } else {
      setIsAuthorized(false);
      setIsDataLoading(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(false);
    const res = await validatePassword(passwordInput);
    if (res.success) {
      localStorage.setItem('reading_journal_auth', 'true');
      setIsAuthorized(true);
      loadData();
    } else {
      setAuthError(true);
    }
    setIsLoading(false);
  };

  const loadData = async () => {
    setIsDataLoading(true);
    const res = await fetchReadingReports();
    if (res.success) {
      setLibraryData(res.data);
    }
    
    // Also fetch recommendations
    const recRes = await getRecommendedBooks();
    if (recRes.success) {
      setRecommendedBooks(recRes.items);
    }
    const adultRes = await getAdultRecommendedBooks();
    if (adultRes.success) {
      setAdultRecommendedBooks(adultRes.items);
    }
    setIsDataLoading(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setAICoach(null);
    setQuizAnswers([]);
    setBookResults([]);
    setFormData({
        date: toLocalISOString(),
        writer: "민준",
        title: "",
        author: "",
        thumbnail: "",
        content: "",
        rating: 5,
        summary: "",
        quote: "",
        quizScore: "",
        memo: "",
        originalTitle: "",
        originalWriter: "",
        bookDescription: ""
    });
  };

  const handleOpenLibrary = async (writer?: string) => {
     setFilterWriter(writer || null);
     setIsLibraryOpen(true);
     loadData();
  };

  const getReportVal = (report: any, searchKeys: string[], englishKey?: string) => {
    if (!report) return "";
    // 1. Try English key first if provided
    if (englishKey && report[englishKey]) return report[englishKey];
    // 2. Try exact match for any search key
    for (const sk of searchKeys) {
        if (report[sk]) return report[sk];
    }
    // 3. Try fuzzy match (includes)
    const actualKey = Object.keys(report).find(k => 
        searchKeys.some(sk => k.includes(sk))
    );
    return actualKey ? report[actualKey] : "";
  };

  const handleEditReport = (report: any) => {
     const title = getReportVal(report, ["제목"], "title") || "";
     const writer = getReportVal(report, ["작성자"], "writer") || "민준";
     const rawDate = getReportVal(report, ["날짜"], "date");

     let formattedDate = toLocalISOString(rawDate) || toLocalISOString();

     setFormData({
          date: formattedDate,
          writer: writer,
          title: title,
          author: getReportVal(report, ["작가", "저자"], "author") || "",
          thumbnail: getReportVal(report, ["표지", "이미지", "썸네일"], "thumbnail") || "",
          content: getReportVal(report, ["생각", "느낀점", "느낀 점", "내용"], "content") || "",
          rating: Number(getReportVal(report, ["별점", "평점"], "rating")) || 5,
          summary: getReportVal(report, ["한 줄", "한줄", "요약"], "summary") || "",
          quote: getReportVal(report, ["인상", "구절", "명언", "한 줄"], "quote") || "",
          quizScore: getReportVal(report, ["퀴즈 점수", "퀴즈점수", "점수"], "quizScore") || "",
          memo: getReportVal(report, ["기타", "메모"], "memo") || "",
          originalTitle: title,
          originalWriter: writer,
          bookDescription: ""
     });
     
     setSelectedReport(null);
     setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuizAnswerChange = (qIndex: number, oIndex: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[qIndex] = oIndex;
    setQuizAnswers(newAnswers);

    if (aiCoach && newAnswers.length === aiCoach.quizzes.length && !newAnswers.includes(-1)) {
      let correct = 0;
      aiCoach.quizzes.forEach((q, i) => {
        if (q.answer === newAnswers[i]) correct++;
      });
      const score = `${correct} / ${aiCoach.quizzes.length}`;
      setFormData(prev => ({ ...prev, quizScore: score }));
    }
  };

  const handleGenerateAICoach = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!formData.title) return alert("먼저 책 제목을 입력해주세요!");
    
    setIsGeneratingAI(true);
    try {
        const response = await generateBookAIStuff(formData.title, formData.author, formData.bookDescription);
        if (response.success) {
            setAICoach({ quizzes: response.quizzes, guides: response.guides });
            setQuizAnswers(new Array(response.quizzes.length).fill(-1));
        } else {
            alert("AI 생성 실패: " + response.error);
        }
    } catch (err) {
        alert("AI 정보를 불러오는 중 오류가 발생했습니다.");
    } finally {
        setIsGeneratingAI(false);
    }
  };

  const handleBookSearch = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!formData.title) return alert("먼저 책 제목을 입력해주세요!");
    
    setIsSearchingBook(true);
    setBookResults([]);
    try {
        const response = await searchAladinBooks(formData.title);
        if (response.success) {
            setBookResults(response.items || []);
        } else {
            alert("도서 검색 중 오류가 발생했습니다.");
        }
    } catch (err) {
        console.error("Book Search Error:", err);
    } finally {
        setIsSearchingBook(false);
    }
  };

  const selectThumbnail = (url: string, author: string = "", description: string = "") => {
    setFormData(prev => ({ 
        ...prev, 
        thumbnail: url, 
        author: author || prev.author,
        bookDescription: description || prev.bookDescription
    }));
    setBookResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const payload = {
        ...formData,
        quizzes: aiCoach?.quizzes || [],
        quizAnswers: quizAnswers
    };
    
    try {
        const response = await saveReadingReport(payload);
        if (response.success) {
            alert("✅ 소중한 감상문이 안전하게 보관되었습니다!");
            closeModal();
            loadData();
        } else {
            alert("❌ 저장 중 오류 발생: " + response.error);
        }
    } catch (err: any) {
        alert("❌ 네트워크 오류: " + err.message);
    } finally {
        setIsLoading(false);
    }
  };

  if (isAuthorized === null) return <div className="min-h-screen bg-background-warm flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background-warm flex items-center justify-center p-6 font-noto">
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-700">
           <Card className="p-10 md:p-12 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
              <div className="mb-8 p-6 bg-primary/10 text-primary w-24 h-24 rounded-[2rem] mx-auto flex items-center justify-center transform -rotate-6 shadow-inner">
                 <Lock size={48} strokeWidth={2.5} />
              </div>
              <h2 className="text-3xl font-black text-text-main mb-3 tracking-tighter">우리 식구만 들어와요!</h2>
              <p className="text-olive/60 font-medium mb-10 leading-relaxed">민준이와 유준이네 보물 상자를 열려면<br/>비밀번호를 입력해주세요. 😊</p>
              
              <form onSubmit={handleLogin} className="space-y-4">
                 <div className="relative">
                    <input 
                       type="password" 
                       value={passwordInput}
                       onChange={(e) => setPasswordInput(e.target.value)}
                       placeholder="비밀번호를 입력하세요" 
                       className={cn(
                          "w-full px-6 py-4 bg-background-warm rounded-2xl border border-olive/5 text-center text-lg font-black focus:outline-none focus:ring-4 transition-all tracking-widest",
                          authError ? "ring-error/20 border-error/20 shake-horizontal" : "focus:ring-primary/10"
                       )}
                       autoFocus
                    />
                 </div>
                 {authError && <p className="text-error font-bold text-xs animate-in fade-in">앗! 비밀번호가 틀린 것 같아요. 다시 볼까?</p>}
                 <button 
                    disabled={isLoading}
                    className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:-translate-y-1 active:scale-95 transition-all text-lg mt-6"
                 >
                    {isLoading ? "열쇠 확인 중..." : "서재 문 열기 🔑"}
                 </button>
              </form>
           </Card>
           <p className="mt-8 text-center text-[10px] font-black text-olive/20 uppercase tracking-widest">Team MJ & YJ Family Reading Journal</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background-warm font-noto tracking-tight relative overflow-x-hidden">
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-sm h-18 bg-white/90 backdrop-blur-xl border border-olive/10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] z-50 flex items-center justify-around px-2 animate-in slide-in-from-bottom-10 duration-1000">
         <SidebarItem icon={LayoutDashboard} label="홈" active={!isLibraryOpen} onClick={() => { setIsLibraryOpen(false); setFilterWriter(null); }} mobile />
         <SidebarItem icon={Library} label="서재" active={isLibraryOpen} onClick={() => handleOpenLibrary()} mobile />
         <SidebarItem icon={SquarePen} label="기록" onClick={() => setIsModalOpen(true)} mobile />
         <SidebarItem icon={Settings} label="설정" mobile />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 fixed inset-y-0 left-0 flex-col p-6 bg-white border-r border-olive/10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-30">
        <div className="flex items-center gap-3 mb-10 pl-2">
          <div className="p-2 bg-primary rounded-xl text-white shadow-lg shadow-primary/20">
            <Book size={24} strokeWidth={3} />
          </div>
          <h1 className="text-xl font-black text-primary tracking-tighter">꿈꾸는 북카페</h1>
        </div>
        <nav className="flex-1 space-y-2">
          <SidebarItem icon={LayoutDashboard} label="홈 대시보드" active={!isLibraryOpen} onClick={() => { setIsLibraryOpen(false); setFilterWriter(null); }} />
          <SidebarItem icon={Library} label="나의 서재" active={isLibraryOpen} onClick={() => handleOpenLibrary()} />
          <SidebarItem icon={SquarePen} label="감상문 작성" onClick={() => setIsModalOpen(true)} />
          <SidebarItem icon={Trophy} label="독서 챌린지" />
          <SidebarItem icon={Settings} label="환경 설정" />
        </nav>
        <div className="mt-auto p-4 bg-primary/5 rounded-3xl border border-primary/10">
           <p className="text-[10px] font-black text-primary/40 uppercase mb-2">프리미엄 코칭</p>
           <p className="text-xs font-bold text-olive/70 leading-relaxed">매일 AI와 함께 책을 읽으면 더 똑똑해져요! 🚀</p>
        </div>
      </aside>

      <main className="flex-1 lg:ml-64 p-5 md:p-12 max-w-7xl mx-auto w-full pb-32 lg:pb-12 transition-all">
        {!isLibraryOpen ? (
          <>
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 md:mb-12">
              <div className="animate-in fade-in slide-in-from-left-4 duration-1000">
                <h2 className="text-2xl md:text-4xl font-black text-text-main mb-1 tracking-tighter">안녕!! 민준, 유준아! 👋</h2>
                <p className="text-sm md:text-base text-olive/60 font-medium font-noto">지혜가 차곡차곡 쌓이고 있어요!</p>
              </div>
              <div className="flex gap-2">
                 <button className="p-3 bg-white rounded-2xl border border-olive/10 shadow-sm text-olive hover:bg-white hover:shadow-md transition-all active:scale-95"><Bell size={20} /></button>
                 <button className="p-3 bg-white rounded-2xl border border-olive/10 shadow-sm text-olive hover:bg-white hover:shadow-md transition-all active:scale-95"><User size={20} /></button>
              </div>
            </header>

            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-10 md:mb-12">
              <div className="animate-in fade-in zoom-in duration-500 delay-100">
                <StatCard title="우리 집 전체 독서량" value={`${totalReportsCount}권`} icon={Book} color="bg-primary" onClick={() => handleOpenLibrary()} />
              </div>
              <div className="animate-in fade-in zoom-in duration-500 delay-200">
                <StatCard title="민준이의 기록" value={`${minjunCount}개`} icon={SquarePen} color="bg-olive" onClick={() => handleOpenLibrary("민준")} />
              </div>
              <div className="animate-in fade-in zoom-in duration-500 delay-300">
                <StatCard title="유준이의 기록" value={`${yujunCount}개`} icon={Users} color="bg-accent" onClick={() => handleOpenLibrary("유준")} />
              </div>
            </section>

            <Card className="mb-10 md:mb-14 bg-primary text-white relative overflow-hidden flex flex-col md:flex-row items-start md:items-center p-8 md:p-12 border-none shadow-2xl transform transition-all hover:shadow-primary/30 group">
              <div className="relative z-10 max-w-lg w-full">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 backdrop-blur-sm">오늘의 명언</div>
                <h3 className="text-2xl md:text-3xl font-black mb-6 leading-normal tracking-tighter" dangerouslySetInnerHTML={{ __html: `${currentQuote}<br/>오늘의 생각을 기록해볼까?` }}></h3>
                <button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto bg-accent hover:bg-white hover:text-accent transform hover:scale-105 active:scale-95 text-white px-10 py-4 rounded-[2rem] font-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-accent/20">기록 시작하기 <ChevronRight size={20} /></button>
              </div>
              <div className="absolute -right-16 -bottom-16 md:right-12 md:top-1/2 md:-translate-y-1/2 opacity-10 md:opacity-20 pointer-events-none transform rotate-12 md:rotate-0 transition-transform duration-1000 group-hover:rotate-6 group-hover:scale-110">
                 <Book size={280} />
              </div>
            </Card>

            <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl md:text-2xl font-black text-text-main tracking-tight">우리 서재의 보물들 💎</h3>
                <button onClick={() => handleOpenLibrary()} className="text-[10px] md:text-xs font-black text-primary hover:bg-primary/10 px-4 py-2 bg-primary/5 rounded-2xl flex items-center gap-1 transition-all">전체보기 <ChevronRight size={14} /></button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 lg:gap-8">
                  {filteredLibraryData.slice(0, 5).map((r, i) => (
                      <div key={i} onClick={() => setSelectedReport(r)} className="animate-in fade-in zoom-in duration-700" style={{ animationDelay: `${i * 100}ms` }}>
                        <BookCard title={getReportVal(r, ["제목"], "title")} author={getReportVal(r, ["작가", "저자"], "author")} progress={100} image={getReportVal(r, ["표지", "이미지", "썸네일"], "thumbnail")} />
                      </div>
                  ))}
                  {libraryData.length === 0 && !isDataLoading && (
                      <div className="col-span-full py-24 text-center bg-white/50 rounded-[3rem] border-2 border-dashed border-olive/10">
                        <div className="mb-4 text-olive/20 flex justify-center"><Book size={64} /></div>
                        <p className="text-olive/40 font-black">아직 기록이 없어요. 첫 번째 감상문을 써보세요!</p>
                      </div>
                  )}
              </div>
            </section>
            <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 mt-16 pb-12">
              <div className="flex flex-col mb-8">
                <h3 className="text-xl md:text-2xl font-black text-text-main tracking-tight flex items-center gap-2">청소년을 위한 추천 도서 ✨</h3>
                <p className="text-xs md:text-sm text-olive/50 font-medium">지혜로운 어른으로 성장하는 길잡이가 되어줄 베스트 도서들이에요.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 lg:gap-8">
                  {recommendedBooks.map((b, i) => (
                      <div key={i} onClick={() => setSelectedRecommendation(b)} className="animate-in fade-in zoom-in duration-700 cursor-pointer" style={{ animationDelay: `${i * 100}ms` }}>
                         <div className="flex flex-col gap-3 group h-full">
                            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-olive/10 shadow-sm transition-all duration-500 transform group-hover:scale-[1.03] group-hover:shadow-2xl">
                               <img src={b.thumbnail} alt={b.title} className="object-cover w-full h-full" />
                               <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                            </div>
                            <div className="px-1">
                               <h3 className="font-bold text-text-main text-xs lg:text-sm truncate leading-tight mb-0.5">{b.title}</h3>
                               <p className="text-[10px] lg:text-xs text-olive/60 truncate font-medium">{b.author}</p>
                            </div>
                         </div>
                      </div>
                  ))}
                  {isDataLoading && (
                      <p className="col-span-full text-center py-10 text-olive/30 font-bold animate-pulse">아이들을 위한 도서 목록을 불러오는 중입니다... ✨</p>
                  )}
                  {!isDataLoading && recommendedBooks.length === 0 && (
                      <p className="col-span-full text-center py-10 text-olive/20 font-bold">도서 목록을 가져오는 데 문제가 발생했습니다. 잠시 후 새로고침해 주세요.</p>
                  )}
              </div>
            </section>
            <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 mt-20 pb-24">
              <div className="flex flex-col mb-8">
                <h3 className="text-xl md:text-2xl font-black text-text-main tracking-tight flex items-center gap-2">부모님을 위한 오늘의 문학 ☕</h3>
                <p className="text-xs md:text-sm text-olive/50 font-medium">아이와 함께 읽으면 더 좋은, 어른들을 위한 한 모금의 지혜예요.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 lg:gap-8">
                  {adultRecommendedBooks.map((b, i) => (
                      <div key={i} onClick={() => setSelectedRecommendation(b)} className="animate-in fade-in zoom-in duration-700 cursor-pointer" style={{ animationDelay: `${i * 100}ms` }}>
                         <div className="flex flex-col gap-3 group h-full">
                            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-olive/10 shadow-sm transition-all duration-500 transform group-hover:scale-[1.03] group-hover:shadow-2xl">
                               <img src={b.thumbnail} alt={b.title} className="object-cover w-full h-full" />
                               <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                            </div>
                            <div className="px-1">
                               <h3 className="font-bold text-text-main text-xs lg:text-sm truncate leading-tight mb-0.5">{b.title}</h3>
                               <p className="text-[10px] lg:text-xs text-olive/60 truncate font-medium">{b.author}</p>
                            </div>
                         </div>
                      </div>
                  ))}
                  {isDataLoading && (
                      <p className="col-span-full text-center py-10 text-olive/30 font-bold animate-pulse">부모님을 위한 도서 목록을 불러오는 중입니다... ✨</p>
                  )}
                  {!isDataLoading && adultRecommendedBooks.length === 0 && (
                      <p className="col-span-full text-center py-10 text-olive/20 font-bold">도서 목록을 가져오는 데 문제가 발생했습니다. 잠시 후 새로고침해 주세요.</p>
                  )}
              </div>
            </section>
          </>
        ) : (
          <section className="animate-in fade-in slide-in-from-bottom-10 duration-700">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-white rounded-2xl text-primary shadow-sm"><Library size={28} /></div>
                   <h2 className="text-2xl md:text-4xl font-black text-text-main tracking-tighter">
                     {filterWriter ? `${filterWriter}의 비밀 서재 📚` : "우리 집 보물 상자 서재 📚"}
                   </h2>
                </div>
                <button onClick={() => { setIsLibraryOpen(false); setFilterWriter(null); }} className="w-full md:w-auto px-6 py-3 bg-white text-olive/70 font-bold rounded-2xl border border-olive/10 hover:bg-background-warm hover:text-primary flex items-center justify-center gap-2 transition-all"><X size={20} /> 서재 닫기</button>
             </div>
             
             <Card className="p-0 border-none shadow-2xl overflow-hidden font-noto bg-white rounded-[2.5rem]">
                 {/* Desktop List Table */}
                 <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest border-b border-primary/10">
                               <th className="px-10 py-6">날짜</th>
                               <th className="px-10 py-6">오늘의 지혜</th>
                               <th className="px-10 py-6">작가</th>
                               <th className="px-10 py-6">작성자</th>
                               <th className="px-10 py-6 text-right">기록보기</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-olive/5 text-sm">
                           {isDataLoading ? (
                               <tr><td colSpan={5} className="px-10 py-24 text-center text-olive/30 font-black animate-pulse">지혜를 불러오는 중입니다... ✨</td></tr>
                           ) : filteredLibraryData.length === 0 ? (
                               <tr><td colSpan={5} className="px-10 py-24 text-center text-olive/30 font-black">아직 보관된 기록이 없습니다.</td></tr>
                           ) : (
                               filteredLibraryData.map((row, idx) => (
                                   <tr key={idx} className="hover:bg-primary/5 transition-colors group cursor-pointer" onClick={() => setSelectedReport(row)}>
                                       <td className="px-10 py-6 text-olive/40 font-bold whitespace-nowrap">{toLocalISOString(getReportVal(row, ["날짜"], "date"))}</td>
                                       <td className="px-10 py-6">
                                          <div className="flex items-center gap-4">
                                             {getReportVal(row, ["표지", "이미지", "썸네일"], "thumbnail") && <img src={getReportVal(row, ["표지", "이미지", "썸네일"], "thumbnail")} className="w-10 h-14 object-cover rounded-lg shadow-md group-hover:scale-110 transition-transform" />}
                                             <span className="text-text-main font-black group-hover:text-primary transition-colors">{getReportVal(row, ["제목"], "title")}</span>
                                          </div>
                                       </td>
                                       <td className="px-10 py-6 text-olive/60 font-semibold truncate max-w-[150px]">{getReportVal(row, ["작가", "저자"], "author")}</td>
                                       <td className="px-10 py-6">
                                          <span className={cn(
                                             "px-4 py-1.5 rounded-full text-[10px] font-black tracking-tight",
                                             (getReportVal(row, ["작성자"], "writer") || "").includes("민준") ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                                          )}>{getReportVal(row, ["작성자"], "writer")}</span>
                                       </td>
                                       <td className="px-10 py-6 text-right"><div className="p-2 inline-flex bg-background-warm text-olive/20 group-hover:bg-primary group-hover:text-white rounded-xl transition-all"><ChevronRight size={18} /></div></td>
                                   </tr>
                               ))
                           )}
                        </tbody>
                    </table>
                 </div>

                 {/* Mobile Card List View */}
                 <div className="md:hidden divide-y divide-olive/5">
                    {isDataLoading && <div className="p-20 text-center text-olive/30 font-black animate-pulse">지혜를 불러오는 중... ✨</div>}
                    {!isDataLoading && filteredLibraryData.map((r, i) => (
                      <div key={i} className="p-5 active:bg-primary/5 transition-colors flex items-center gap-4" onClick={() => setSelectedReport(r)}>
                        {getReportVal(r, ["표지", "이미지", "썸네일"], "thumbnail") && <img src={getReportVal(r, ["표지", "이미지", "썸네일"], "thumbnail")} className="w-20 h-28 object-cover rounded-2xl shadow-lg border-2 border-white" />}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-olive/30">{toLocalISOString(getReportVal(r, ["날짜"], "date"))}</span>
                            <span className={cn(
                                    "px-2 py-0.5 rounded-full text-[9px] font-black",
                                    (getReportVal(r, ["작성자"], "writer") || "").includes("민준") ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                                  )}>{getReportVal(r, ["작성자"], "writer")}</span>
                          </div>
                          <h4 className="text-lg font-black text-text-main truncate mb-0.5">{getReportVal(r, ["제목"], "title")}</h4>
                          <p className="text-xs font-bold text-olive/50 truncate mb-3">{getReportVal(r, ["작가", "저자"], "author")}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex text-accent text-[10px]">{"★".repeat(Number(getReportVal(r, ["별점", "평점"], "rating")) || 0)}</div>
                            <span className="text-primary font-black text-[10px] flex items-center gap-0.5">자세히 보기 <ChevronRight size={12} /></span>
                          </div>
                        </div>
                      </div>
                    ))}
                 </div>
              </Card>
          </section>
        )}
      </main>

      {/* Record Detail Modal */}
      {selectedReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 bg-primary/40 backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-white w-full h-full md:h-auto md:max-w-3xl md:max-h-[90vh] md:rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col animate-in slide-in-from-bottom-10">
                  <button onClick={() => setSelectedReport(null)} className="absolute top-6 right-6 p-3 bg-white/80 backdrop-blur-md rounded-2xl text-olive/40 hover:text-primary transition-all z-20 active:scale-90"><X size={24} /></button>
                  <div className="flex-1 overflow-y-auto font-noto pb-24 md:pb-0">
                      <div className="h-64 md:h-80 bg-primary relative overflow-hidden shrink-0">
                          {getReportVal(selectedReport, ["표지", "이미지", "썸네일"], "thumbnail") ? (
                             <img src={getReportVal(selectedReport, ["표지", "이미지", "썸네일"], "thumbnail")} className="w-full h-full object-cover blur-3xl opacity-40 scale-150" />
                          ) : (
                             <div className="w-full h-full bg-primary" />
                          )}
                          <div className="absolute inset-0 flex items-center justify-center p-8 md:p-12">
                             <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10 w-full">
                                {getReportVal(selectedReport, ["표지", "이미지", "썸네일"], "thumbnail") && <img src={getReportVal(selectedReport, ["표지", "이미지", "썸네일"], "thumbnail")} className="w-32 h-44 md:w-44 md:h-64 object-cover rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] border-4 border-white/30 transform transition-hover hover:scale-105 duration-500" />}
                                <div className="text-center md:text-left text-white drop-shadow-lg">
                                   <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest mb-4">{toLocalISOString(getReportVal(selectedReport, ["날짜"], "date"))}</span>
                                   <h3 className="text-3xl md:text-5xl font-black mb-3 leading-tight tracking-tighter line-clamp-3">{getReportVal(selectedReport, ["제목"], "title")}</h3>
                                   <p className="text-lg md:text-xl font-bold opacity-80">{getReportVal(selectedReport, ["작가", "저자"], "author")} 저</p>
                                </div>
                             </div>
                          </div>
                      </div>
                      <div className="p-8 md:p-12 space-y-12">
                          <div className="grid grid-cols-2 gap-4 md:gap-8">
                             <div className="p-5 bg-background-warm rounded-[2rem] border border-olive/5 shadow-inner">
                                <span className="text-[10px] font-black text-olive/30 uppercase block mb-2 tracking-widest">나의 평점</span>
                                <div className="text-accent text-2xl drop-shadow-sm">{"★".repeat(Number(getReportVal(selectedReport, ["별점", "평점"], "rating")) || 0)}</div>
                             </div>
                             <div className="p-5 bg-background-warm rounded-[2rem] border border-olive/5 shadow-inner">
                                <span className="text-[10px] font-black text-olive/30 uppercase block mb-2 tracking-widest">기록한 사람</span>
                                <div className="font-extrabold text-primary text-2xl">{getReportVal(selectedReport, ["작성자"], "writer")}</div>
                             </div>
                          </div>
                          
                          <div className="space-y-6">
                              <h4 className="flex items-center gap-2 font-black text-text-main text-lg tracking-tight">
                                 <Star className="text-accent fill-accent" size={20} /> 인상 깊은 한 줄
                              </h4>
                              <div className="relative p-8 md:p-10 bg-accent/5 rounded-[2.5rem] border border-accent/10 border-l-8 border-l-accent overflow-hidden group">
                                 <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000"><Star size={120} /></div>
                                 <p className="relative z-10 text-lg md:text-2xl text-text-main leading-relaxed font-black italic">
                                    "{getReportVal(selectedReport, ["인상", "구절", "명언", "한 줄"], "quote") || "기록된 한 줄이 없어요."}"
                                 </p>
                              </div>
                          </div>

                          <div className="space-y-6">
                              <h4 className="flex items-center gap-2 font-black text-text-main text-lg tracking-tight">
                                 <SquarePen className="text-primary fill-primary/10" size={20} /> 나의 생각 주머니
                              </h4>
                              <div className="p-8 md:p-10 bg-white rounded-[2.5rem] border border-olive/10 shadow-xl shadow-olive/5 min-h-[150px]">
                                 <p className="text-base md:text-lg text-olive/80 leading-relaxed font-bold whitespace-pre-wrap">
                                     {getReportVal(selectedReport, ["생각", "느낀점", "내용"], "content") || "아무런 생각이 기록되지 않았네요! 다음에 더 자세히 써볼까요?"}
                                 </p>
                                 <div className="mt-8 flex justify-end gap-3">
                                    <span className="px-3 py-1 bg-olive/5 rounded-full text-[10px] font-black text-olive/40 uppercase tracking-widest">공백 포함: {(getReportVal(selectedReport, ["생각", "느낀점", "내용"], "content") || "").length}자</span>
                                    <span className="px-3 py-1 bg-olive/5 rounded-full text-[10px] font-black text-olive/40 uppercase tracking-widest">공백 제외: {(getReportVal(selectedReport, ["생각", "느낀점", "내용"], "content") || "").replace(/\s/g, "").length}자</span>
                                 </div>
                              </div>
                          </div>
                          
                          {getReportVal(selectedReport, ["퀴즈", "점수"], "quizScore") && (
                             <div className="p-8 bg-success/5 rounded-[2.5rem] border border-success/20 flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                   <div className="p-4 bg-white rounded-2xl shadow-sm text-success transform group-hover:rotate-12 transition-transform"><Trophy size={32} /></div>
                                   <div>
                                      <p className="text-xs font-black text-success/50 uppercase tracking-widest leading-none mb-1">독서 퀴즈 점수</p>
                                      <span className="text-sm font-bold text-success">책을 정말 꼼꼼히 읽었구나!</span>
                                   </div>
                                </div>
                                <span className="text-4xl font-black text-success tracking-tighter">{getReportVal(selectedReport, ["퀴즈", "점수"], "quizScore")}</span>
                             </div>
                          )}
                      </div>
                  </div>
                  <div className="p-6 md:p-10 bg-white border-t border-olive/5 flex gap-4 sticky md:relative bottom-0 z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] md:shadow-none">
                     <button onClick={() => { const r = selectedReport; setSelectedReport(null); handleEditReport(r); }} className="flex-1 py-4 md:py-5 bg-primary text-white font-black rounded-[2rem] shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transform active:scale-95 transition-all text-lg hover:shadow-primary/40"><Edit2 size={22} /> 수정하기</button>
                     <button onClick={() => setSelectedReport(null)} className="px-10 py-4 md:py-5 bg-background-warm text-olive/60 font-black rounded-[2rem] active:scale-95 transition-all">나가기</button>
                  </div>
              </div>
          </div>
      )}

      {/* Write/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 bg-primary/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-background-warm w-full h-full md:h-auto md:max-w-6xl md:max-h-[95vh] md:rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-500">
            <div className="px-6 py-4 md:px-12 md:py-4 border-b border-olive/5 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center gap-2">
                 <div className="p-1.5 bg-primary rounded-lg text-white"><SquarePen size={16} /></div>
                 <h2 className="text-lg md:text-xl font-black text-text-main tracking-tighter">{formData.originalTitle ? "기록 다듬기" : "새로운 시작하기"}</h2>
              </div>
              <button onClick={closeModal} className="p-2 bg-white/50 rounded-xl text-olive/40 hover:text-error hover:bg-error/5 transition-all active:scale-90"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
              {/* Sticky Top: Basic Book Info */}
               <div className="px-6 py-5 md:px-12 md:py-6 bg-white/70 backdrop-blur-xl border-b border-olive/5 z-20 shadow-sm transition-all duration-500">
                 <div className="max-w-5xl mx-auto w-full space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                     <div className="md:col-span-1 space-y-1">
                        <label className="text-[9px] font-black text-olive/30 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Calendar size={10} /> 날짜</label>
                        <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-background-warm rounded-xl border border-olive/5 text-[11px] font-bold text-text-main focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner" />
                     </div>
                     <div className="md:col-span-1 space-y-1">
                        <label className="text-[9px] font-black text-olive/30 uppercase tracking-widest ml-1 flex items-center gap-1.5"><User size={10} /> 이름</label>
                        <select name="writer" value={formData.writer} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-background-warm rounded-xl border border-olive/5 focus:outline-none text-[11px] font-black text-primary shadow-inner appearance-none"><option value="민준">민준</option><option value="유준">유준</option></select>
                     </div>
                     <div className="md:col-span-2 space-y-1">
                       <label className="text-[9px] font-black text-olive/30 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Book size={10} /> 어떤 책이니? ✨</label>
                       <div className="flex gap-2">
                         <input type="text" name="title" required placeholder="책 제목을 입력해줘" value={formData.title} onChange={handleInputChange} className="flex-1 px-4 py-2.5 bg-background-warm rounded-xl border border-olive/5 focus:outline-none text-[11px] font-black placeholder:text-olive/20 shadow-inner" />
                         <button type="button" onClick={handleBookSearch} disabled={isSearchingBook} className="px-4 py-2.5 bg-accent hover:bg-accent/80 text-white font-black rounded-xl text-[9px] transition-all active:scale-95 shadow-lg shadow-accent/20 flex items-center gap-1.5 shrink-0">{isSearchingBook ? <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <Search size={14} />} 찾기</button>
                       </div>
                     </div>
                     <div className="md:col-span-2 space-y-1">
                       <label className="text-[9px] font-black text-olive/40 uppercase tracking-widest ml-1">작가 이름</label>
                       <input type="text" name="author" placeholder="글을 쓴 작가님 성함" value={formData.author} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-background-warm/50 rounded-xl border border-olive/5 focus:outline-none text-[11px] font-bold shadow-inner" />
                     </div>
                   </div>

                   {bookResults.length > 0 && (
                     <div className="p-2 bg-accent/5 rounded-xl border border-accent/10 animate-in fade-in zoom-in duration-500 overflow-x-auto">
                        <div className="flex gap-2 min-w-max pb-1">
                          {bookResults.map((b:any, i:number) => (
                            <button 
                              key={i} 
                              type="button" 
                              onClick={() => selectThumbnail(b.thumbnail, b.author, b.description)} 
                              className="w-10 h-14 rounded-lg overflow-hidden border-2 border-transparent hover:border-accent transition-all shadow-md active:scale-95 shrink-0"
                            >
                              <img src={b.thumbnail} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                 </div>
               </div>

              {/* Scrollable Body: AI Coach & Report Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-12 pb-32 md:pb-12 scroll-smooth bg-background-warm/30">
                <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
                  {/* Left: AI Column */}
                  <div className="space-y-10">
                    {!aiCoach && !formData.originalTitle && (
                      <div className="p-8 bg-white rounded-[2.5rem] border border-olive/10 shadow-xl text-center space-y-6">
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-[1.5rem] flex items-center justify-center mx-auto transform -rotate-3"><Trophy size={32} /></div>
                        <h4 className="text-lg font-black text-text-main">심화 기록을 위해 AI 코칭을 시작해볼까?</h4>
                        <p className="text-xs font-bold text-olive/50 leading-relaxed">책 내용을 바탕으로 퀴즈도 풀고<br/>AI 친구와 함께 더 깊은 생각을 나눠봐요!</p>
                        <button 
                          type="button"
                          onClick={handleGenerateAICoach} 
                          disabled={isGeneratingAI} 
                          className="w-full py-5 bg-gradient-to-r from-primary to-olive text-white font-black rounded-[2rem] shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 hover:-translate-y-1 active:scale-95 transition-all text-base"
                        >
                          {isGeneratingAI ? "AI 코치가 책장을 넘겨보는 중..." : "AI 코칭 시작하기! ✨"}
                        </button>
                      </div>
                    )}

                    {aiCoach && (
                      <div className="space-y-10">
                        <section className="bg-white p-8 rounded-[2.5rem] border border-olive/10 shadow-xl shadow-olive/5 space-y-6">
                           <div className="flex items-center justify-between">
                              <h4 className="text-xs font-black text-accent uppercase tracking-widest flex items-center gap-2">
                                <Star fill="#FF8400" size={16} /> 독서 이해도 확인 퀴즈
                              </h4>
                              {formData.quizScore && <span className="px-3 py-1 bg-accent/10 text-accent font-black text-xs rounded-full">점수: {formData.quizScore}</span>}
                           </div>
                           <div className="space-y-8">
                             {aiCoach.quizzes.map((q, qIndex) => {
                               const isQuizCompleted = aiCoach && quizAnswers.length === aiCoach.quizzes.length && !quizAnswers.includes(-1);
                               return (
                                 <div key={qIndex} className="space-y-4">
                                   <p className="text-sm font-black text-text-main flex gap-2">
                                      <span className="text-accent">{qIndex + 1}.</span> {q.question}
                                   </p>
                                   <div className="grid grid-cols-1 gap-2.5">
                                     {q.options.map((opt: string, oIndex: number) => {
                                       const isSelected = quizAnswers[qIndex] === oIndex;
                                       const isCorrect = q.answer === oIndex;
                                       return (
                                         <button
                                           key={oIndex}
                                           type="button"
                                           disabled={isQuizCompleted}
                                           onClick={() => handleQuizAnswerChange(qIndex, oIndex)}
                                           className={cn(
                                             "w-full text-left px-5 py-3 rounded-2xl text-xs font-bold transition-all border-2 flex items-center justify-between min-h-[56px]",
                                             isQuizCompleted 
                                               ? (isCorrect ? "bg-success/5 text-success border-success/30" : (isSelected ? "bg-error/5 text-error border-error/30" : "bg-transparent text-olive/20 border-transparent"))
                                               : (isSelected ? "bg-accent text-white border-accent shadow-lg shadow-accent/20" : "bg-background-warm text-olive/70 hover:bg-white border-transparent")
                                           )}
                                         >
                                           <span className="leading-relaxed">{opt}</span>
                                           {isQuizCompleted && isCorrect && <CheckCircle2 size={16} className="text-success" />}
                                           {isQuizCompleted && isSelected && !isCorrect && <XCircle size={16} className="text-error" />}
                                         </button>
                                       );
                                     })}
                                   </div>
                                 </div>
                               );
                             })}
                           </div>
                        </section>

                        <section className="bg-primary p-8 rounded-[2.5rem] shadow-2xl shadow-primary/30 text-white relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform duration-1000 rotate-12"><TrendingUp size={160} /></div>
                           <h4 className="relative z-10 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-6 opacity-70">
                             <TrendingUp size={14} /> AI의 맞춤형 코칭 질문
                           </h4>
                           <div className="relative z-10 space-y-4">
                             {aiCoach.guides.map((g, i) => (
                               <div key={i} className="flex gap-3 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/5 hover:bg-white/20 transition-all font-bold text-sm leading-relaxed">
                                 <div className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />
                                 {g}
                               </div>
                             ))}
                           </div>
                        </section>
                      </div>
                    )}
                  </div>
                  
                  {/* Right: Write Column */}
                  <div className="space-y-10">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-olive/40 uppercase tracking-widest ml-1">내 평점</label>
                        <div className="flex gap-2 p-4 bg-white rounded-2xl border border-olive/5 shadow-inner w-max">
                           {[1,2,3,4,5].map(star => (
                              <button key={star} type="button" onClick={() => setFormData(prev => ({...prev, rating: star}))} className={cn("text-3xl transition-transform active:scale-75", formData.rating >= star ? "text-accent" : "text-olive/10 hover:text-accent/40")}>★</button>
                           ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black text-olive/40 uppercase tracking-widest ml-1 flex items-center gap-1.5"><Star size={12} className="text-accent" /> 가장 기억에 남는 한 줄 ✨</label>
                        <input type="text" name="quote" value={formData.quote} onChange={handleInputChange} placeholder="멋진 문장이나 한 줄 평을 적어줘" className="w-full px-6 py-5 bg-white rounded-2xl border border-olive/5 focus:outline-none text-sm font-bold shadow-inner" />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-black text-olive/40 uppercase tracking-widest ml-1 flex items-center justify-between gap-1.5">
                          <span className="flex items-center gap-1.5"><SquarePen size={12} className="text-primary" /> 나의 생각 주머니 🖋️</span>
                          <div className="flex gap-2">
                             <span className="text-[9px] font-black text-primary/40 bg-primary/5 px-2 py-0.5 rounded-full">공백 포함: {formData.content.length}자</span>
                             <span className="text-[9px] font-black text-olive/30 bg-olive/5 px-2 py-0.5 rounded-full">공백 제외: {formData.content.replace(/\s/g, "").length}자</span>
                          </div>
                        </label>
                        <textarea name="content" required value={formData.content} onChange={handleInputChange} placeholder="이 책을 읽고 어떤 생각이 들었니? 너의 마음을 솔직하게 적어봐!" className="w-full px-8 py-8 bg-white rounded-[2.5rem] border border-olive/5 focus:outline-none text-base font-bold placeholder:text-olive/20 shadow-xl shadow-olive/5 min-h-[350px] leading-relaxed" />
                      </div>
                      
                      <div className="pt-4">
                         <button type="submit" disabled={isLoading} className="w-full py-6 bg-primary text-white font-black rounded-[2.5rem] shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] transition-all text-xl">
                           {isLoading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : <><Book size={24} /> 소중한 기록 보관하기</>}
                         </button>
                      </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Recommendation Detail Modal */}
      {selectedRecommendation && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 md:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full h-full md:h-auto md:max-w-2xl md:max-h-[85vh] md:rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <button onClick={() => setSelectedRecommendation(null)} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white md:text-olive/20 md:hover:text-primary transition-all z-20"><X size={24} /></button>
            <div className="flex-1 overflow-y-auto">
              <div className="h-48 md:h-64 bg-primary relative overflow-hidden">
                 <img src={selectedRecommendation.thumbnail} className="w-full h-full object-cover blur-2xl opacity-30 scale-150" />
                 <div className="absolute inset-0 flex items-center justify-center p-6 mt-4">
                    <img src={selectedRecommendation.thumbnail} className="w-28 h-40 md:w-36 md:h-52 object-cover rounded-xl shadow-2xl border-4 border-white/20" />
                 </div>
              </div>
              <div className="p-8 md:p-10 space-y-6">
                <div className="text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl font-black text-text-main leading-tight mb-2">{selectedRecommendation.title}</h3>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm font-bold text-olive/50">
                    <span>{selectedRecommendation.author}</span>
                    <span className="w-1 h-1 rounded-full bg-olive/20" />
                    <span>{selectedRecommendation.publisher}</span>
                    {selectedRecommendation.pubDate && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-olive/20" />
                        <span>{selectedRecommendation.pubDate}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                   <h4 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                     <Book size={14} /> 책 소개
                   </h4>
                   <div className="p-6 md:p-8 bg-background-warm rounded-[2rem] border border-olive/5 shadow-inner">
                      <p className="text-sm md:text-base text-olive/70 leading-relaxed font-medium whitespace-pre-wrap">
                        {selectedRecommendation.description ? selectedRecommendation.description.replace(/<[^>]*>?/gm, "") : "상세 소개 기능 준비 중입니다."}
                      </p>
                   </div>
                </div>
              </div>
            </div>
            <div className="p-6 md:p-8 border-t border-olive/5 bg-white flex justify-end">
               <button onClick={() => setSelectedRecommendation(null)} className="px-8 py-3 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:scale-95 transition-all">확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

