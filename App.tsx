
import React, { useState, useEffect } from 'react';
import { GameState, UserProgress, NewsItem } from './types.ts';
import { Card, Badge } from './components/Card.tsx';
import { generateNewsItems } from './services/geminiService.ts';

const App: React.FC = () => {
  const [state, setState] = useState<GameState>(GameState.WELCOME);
  const [progress, setProgress] = useState<UserProgress>({ 
    score: 0, 
    categories: { logic: 0, aiAwareness: 0, biasResistance: 0, lateralReading: 0 },
    totalChallenges: 0 
  });
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ msg: string; correct: boolean } | null>(null);

  useEffect(() => {
    const init = async () => {
      const items = await generateNewsItems();
      setNewsItems(items);
      setLoading(false);
    };
    init();
  }, []);

  const handleNext = () => {
    setFeedback(null);
    const states = Object.values(GameState);
    const currentIndex = states.indexOf(state);
    if (currentIndex < states.length - 1) {
      setState(states[currentIndex + 1]);
    }
  };

  const updateProgress = (points: number, category: keyof UserProgress['categories'], explanation: string, isCorrect: boolean) => {
    setFeedback({ msg: explanation, correct: isCorrect });
    setProgress(prev => ({
      ...prev,
      score: prev.score + points,
      totalChallenges: prev.totalChallenges + 1,
      categories: { ...prev.categories, [category]: prev.categories[category] + points }
    }));
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="animate-pulse">Kalibrerar kognitiva försvar...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-blue-100">
      {/* Header - Hidden during print */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 py-3 px-6 sticky top-0 z-50 print:hidden">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <span className="text-xl">🧠</span>
            </div>
            <div>
              <h1 className="font-bold text-slate-800 leading-none">Källkollen</h1>
              <span className="text-[10px] text-slate-400 uppercase tracking-tighter">Digital Samtid Edition</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Poäng</p>
              <p className="text-xl font-black text-indigo-600 leading-none">{progress.score}</p>
            </div>
            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-indigo-600 transition-all duration-700 ease-out" 
                 style={{ width: `${(Object.values(GameState).indexOf(state) / (Object.values(GameState).length - 1)) * 100}%` }}
               />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-6 flex items-center justify-center print:p-0 print:block">
        <div className="max-w-2xl w-full print:max-w-none">
          {feedback ? (
            <FeedbackScreen 
              data={feedback} 
              onNext={handleNext} 
              isLast={state === GameState.TRUTH_EFFECT}
            />
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 print:hidden">
              {state === GameState.WELCOME && <WelcomeScreen onStart={handleNext} />}
              {state === GameState.SYSTEM1V2 && <SystemChallenge onComplete={updateProgress} />}
              {state === GameState.AI_DETECTION && <AIDetection news={newsItems[0]} onComplete={updateProgress} />}
              {state === GameState.CONFIRMATION_BIAS && <ConfirmationBias onComplete={updateProgress} />}
              {state === GameState.LATERAL_READING && <LateralReading news={newsItems[1]} onComplete={updateProgress} />}
              {state === GameState.TRUTH_EFFECT && <TruthEffect onComplete={updateProgress} />}
              {state === GameState.RESULTS && <ResultsScreen progress={progress} />}
            </div>
          )}
        </div>
      </main>
      
      {/* Hidden printable template */}
      <div className="hidden print:block">
         <DiplomaPrintable progress={progress} />
      </div>
    </div>
  );
};

// --- Sub-components ---

const FeedbackScreen: React.FC<{ data: { msg: string; correct: boolean }; onNext: () => void; isLast: boolean }> = ({ data, onNext, isLast }) => (
  <Card className={`p-8 border-t-8 ${data.correct ? 'border-green-500' : 'border-red-500'} print:hidden`}>
    <div className="flex items-center gap-4 mb-6">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${data.correct ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
        {data.correct ? '✓' : '×'}
      </div>
      <h3 className="text-2xl font-bold">{data.correct ? 'Rätt tänkt!' : 'Ajdå, hjärnan tog en genväg...'}</h3>
    </div>
    <p className="text-slate-600 text-lg leading-relaxed mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
      {data.msg}
    </p>
    <button onClick={onNext} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all">
      {isLast ? 'Se ditt resultat' : 'Nästa utmaning'}
    </button>
  </Card>
);

const WelcomeScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <Card className="p-10 text-center relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
    <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Haka av hjärnan! 🧠</h2>
    <p className="text-slate-500 text-lg mb-8">
      Vår hjärna är lat. Den älskar <strong>System 1</strong> – snabb, emotionell och slarvig. 
      I detta spel tränar vi <strong>System 2</strong> – den långsamma, kritiska tänkaren.
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
        <span className="text-xl mb-2 block">⚡️</span>
        <h4 className="font-bold text-blue-900">System 1</h4>
        <p className="text-xs text-blue-700">Magkänsla, snabba klick, bekräftelsejäv.</p>
      </div>
      <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
        <span className="text-xl mb-2 block">🐢</span>
        <h4 className="font-bold text-indigo-900">System 2</h4>
        <p className="text-xs text-indigo-700">Analys, källkoll, ifrågasättande.</p>
      </div>
    </div>
    <button onClick={onStart} className="w-full bg-indigo-600 py-4 text-white font-bold rounded-2xl text-xl shadow-xl hover:bg-indigo-700 transition-all active:scale-95">
      Aktivera System 2
    </button>
  </Card>
);

const SystemChallenge: React.FC<{ onComplete: (p: number, c: any, e: string, corr: boolean) => void }> = ({ onComplete }) => {
  const [active, setActive] = useState(false);
  
  useEffect(() => {
    const t = setTimeout(() => setActive(true), 6000);
    return () => clearTimeout(t);
  }, []);

  return (
    <Card className="p-8">
      <Badge text="Stress-test" />
      <h3 className="text-2xl font-bold mt-4 mb-6">Snabba nyheter!</h3>
      <div className="relative group cursor-pointer overflow-hidden rounded-2xl bg-red-600 p-8 text-white mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-800 opacity-90" />
        <div className="relative z-10 text-center">
          <span className="inline-block px-2 py-1 bg-white text-red-600 font-bold text-[10px] rounded mb-2">EXTRA: JUST NU</span>
          <h4 className="text-2xl font-black italic">"NY LAG: Alla mobiler beslagtas i skolan dygnet runt – även hemma!"</h4>
        </div>
      </div>
      
      <p className="text-slate-600 mb-8 text-center italic">Tryck på knappen om du tror detta är sant.</p>
      
      <div className="flex flex-col gap-4">
        {!active && <div className="text-center text-orange-500 font-bold animate-pulse">System 1 skriker: "REAGERA!"... Vänta...</div>}
        <button 
          onClick={() => onComplete(0, 'logic', 'Du föll för fällan! Din hjärna reagerade emotionellt (System 1) på en sensationell rubrik. Logiskt sett kan skolan inte beslagta din mobil i ditt hem.', false)}
          className="w-full py-4 bg-slate-200 text-slate-500 font-bold rounded-xl hover:bg-red-100 hover:text-red-700 transition-all"
        >
          Detta är sant! (Reagera nu)
        </button>
        {active && (
          <button 
            onClick={() => onComplete(10, 'logic', 'Snyggt! Du väntade ut din första impuls. Genom att pausa lät du System 2 analysera det orimliga i påståendet.', true)}
            className="w-full py-4 bg-green-600 text-white font-bold rounded-xl shadow-lg animate-bounce"
          >
            Vänta... detta är orimligt.
          </button>
        )}
      </div>
    </Card>
  );
};

const AIDetection: React.FC<{ news: NewsItem, onComplete: (p: number, c: any, e: string, corr: boolean) => void }> = ({ news, onComplete }) => (
  <Card className="p-8">
    <Badge text="AI-Detektiven" color="bg-purple-100 text-purple-700" />
    <h3 className="text-2xl font-bold mt-4 mb-4">Människa eller Maskin?</h3>
    <div className="bg-slate-50 border-2 border-indigo-100 p-6 rounded-2xl mb-8">
       <p className="text-lg text-slate-700 font-medium leading-relaxed">"{news.body}"</p>
       <span className="text-xs text-slate-400 block mt-4">— {news.source}</span>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <button onClick={() => onComplete(news.isTrue ? 10 : 0, 'aiAwareness', news.explanation, news.isTrue)} className="p-4 bg-white border-2 border-slate-100 rounded-xl hover:border-indigo-500 font-bold">Mänsklig källa</button>
      <button onClick={() => onComplete(!news.isTrue ? 10 : 0, 'aiAwareness', news.explanation, !news.isTrue)} className="p-4 bg-white border-2 border-slate-100 rounded-xl hover:border-indigo-500 font-bold">AI-genererat</button>
    </div>
  </Card>
);

const ConfirmationBias: React.FC<{ onComplete: (p: number, c: any, e: string, corr: boolean) => void }> = ({ onComplete }) => (
  <Card className="p-8">
    <Badge text="Spegelsalen" color="bg-orange-100 text-orange-700" />
    <h3 className="text-2xl font-bold mt-4 mb-4">Vems sida står du på?</h3>
    <p className="text-slate-600 mb-8">Vi har en tendens att lita mer på personer vi gillar eller identifierar oss med. Det kallas <strong>Halo-effekten</strong>.</p>
    
    <div className="grid grid-cols-1 gap-4">
      <button onClick={() => onComplete(0, 'biasResistance', 'Du litade på personen istället för faktan. Källkritik handlar om VAD som sägs, inte bara VEM som säger det.', false)} className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl hover:bg-blue-100 text-left border border-blue-100 group">
        <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center text-xl">👤</div>
        <div>
          <h4 className="font-bold text-blue-900">Din favorit-influencer</h4>
          <p className="text-xs text-blue-700 italic">"Lita på mig, den här nya dieten rensar kroppen på gifter på 2 dagar!"</p>
        </div>
      </button>
      
      <button onClick={() => onComplete(10, 'biasResistance', 'Rätt! Du genomskådade Halo-effekten. Även kändisar vi gillar kan ha fel eller vara köpta för att sprida pseudovetenskap.', true)} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 text-left border border-slate-200 group">
        <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-xl">🔬</div>
        <div>
          <h4 className="font-bold text-slate-900">En okänd forskare</h4>
          <p className="text-xs text-slate-700 italic">"Det finns inga vetenskapliga bevis för att 'detox' fungerar på det sättet."</p>
        </div>
      </button>
    </div>
  </Card>
);

const LateralReading: React.FC<{ news: NewsItem, onComplete: (p: number, c: any, e: string, corr: boolean) => void }> = ({ news, onComplete }) => {
  const [showClues, setShowClues] = useState(false);
  
  return (
    <Card className="p-8">
      <Badge text="Lateralt Läsande" color="bg-green-100 text-green-700" />
      <h3 className="text-2xl font-bold mt-4 mb-2">Läs inte bara källan – läs RUNT den.</h3>
      <p className="text-slate-500 mb-6 text-sm">Proffs kollar vad andra säger om källan istället för att bara stirra på sidan.</p>
      
      <div className="bg-white border-2 border-slate-200 p-6 rounded-2xl mb-6 shadow-inner">
        <h4 className="font-bold text-xl mb-2">{news.headline}</h4>
        <p className="text-slate-600">{news.body.substring(0, 100)}...</p>
      </div>

      <div className="space-y-4">
        {!showClues ? (
          <button onClick={() => setShowClues(true)} className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2">
            🔍 "Kolla runt" (Lateralt läsande)
          </button>
        ) : (
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 animate-in slide-in-from-top-2">
            <h5 className="font-bold text-yellow-800 text-xs uppercase mb-2">Sökresultat för "{news.source}":</h5>
            <ul className="text-sm text-yellow-700 space-y-1">
              {news.clues.map((c, i) => <li key={i}>• {c}</li>)}
            </ul>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => onComplete(news.isTrue ? 10 : 0, 'lateralReading', news.explanation, news.isTrue)} className="py-3 bg-green-50 text-green-700 border border-green-200 rounded-xl font-bold">Sant</button>
          <button onClick={() => onComplete(!news.isTrue ? 10 : 0, 'lateralReading', news.explanation, !news.isTrue)} className="py-3 bg-red-50 text-red-700 border border-red-200 rounded-xl font-bold">Falskt</button>
        </div>
      </div>
    </Card>
  );
};

const TruthEffect: React.FC<{ onComplete: (p: number, c: any, e: string, corr: boolean) => void }> = ({ onComplete }) => (
  <Card className="p-8">
    <Badge text="Sanningseffekten" color="bg-indigo-100 text-indigo-700" />
    <h3 className="text-2xl font-bold mt-4 mb-4">Känns det bekant?</h3>
    <div className="bg-indigo-900 p-6 rounded-2xl text-white mb-8">
      <p className="text-lg italic opacity-90">"Hjärnan tolkar 'bekant' som 'sant'."</p>
      <p className="mt-4 text-sm font-light">Om du har hört en lögn 10 gånger börjar System 1 tro på den, bara för att den inte längre kräver energi att processa.</p>
    </div>
    <p className="text-slate-600 mb-6 font-bold text-center">Hur skyddar du dig mot detta?</p>
    <div className="grid grid-cols-1 gap-3">
      <button onClick={() => onComplete(10, 'biasResistance', 'Precis! Att stanna upp och fråga "Varför tror jag detta?" bryter sanningseffekten.', true)} className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left hover:bg-indigo-50">A. Genom att medvetet ifrågasätta källan, även om det låter rimligt.</button>
      <button onClick={() => onComplete(0, 'biasResistance', 'Tyvärr inte. Att lita på magkänslan är precis det som gör oss sårbara för sanningseffekten.', false)} className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left hover:bg-indigo-50">B. Genom att lita på min magkänsla (System 1).</button>
    </div>
  </Card>
);

const ResultsScreen: React.FC<{ progress: UserProgress }> = ({ progress }) => {
  const [userName, setUserName] = useState(localStorage.getItem('kallkollen_name') || '');
  
  const handlePrint = () => {
    localStorage.setItem('kallkollen_name', userName);
    window.print();
  };

  const categories = [
    { label: 'Logik (System 2)', key: 'logic', emoji: '🐢' },
    { label: 'AI-Medvetenhet', key: 'aiAwareness', emoji: '🤖' },
    { label: 'Bias-Motstånd', key: 'biasResistance', emoji: '🛡️' },
    { label: 'Lateralt Läsande', key: 'lateralReading', emoji: '🔍' },
  ] as const;

  return (
    <Card className="p-10 text-center">
      <h2 className="text-4xl font-black text-slate-800 mb-2">Ditt Källkolls-Index</h2>
      <p className="text-slate-500 mb-8">Här är din kognitiva profil efter testet.</p>
      
      <div className="space-y-6 mb-10 text-left">
        {categories.map(cat => (
          <div key={cat.key}>
            <div className="flex justify-between text-sm font-bold mb-1 uppercase tracking-tighter text-slate-500">
              <span>{cat.emoji} {cat.label}</span>
              <span>{progress.categories[cat.key]} / 10</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div 
                className={`h-full bg-indigo-600 transition-all duration-1000`} 
                style={{ width: `${(progress.categories[cat.key] / 10) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-indigo-50 p-6 rounded-2xl mb-8 border border-indigo-100 text-left">
        <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2 text-xl">Slutsats:</h4>
        <p className="text-indigo-800 leading-relaxed italic">
          "{progress.score > 30 ? 'Du är en mästare på att koppla ur System 1! Du tar dig tid att undersöka och ifrågasätta även det som ser snyggt ut.' : 'Din hjärna är väldigt effektiv på att ta genvägar. Det är bra för att spara energi, men farligt i ett digitalt flöde av desinformation.'}"
        </p>
      </div>

      <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-tight">Skriv ditt namn för diplomet:</label>
        <input 
          type="text" 
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Ditt för- och efternamn"
          className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none text-center font-bold text-slate-800"
        />
        <button 
          onClick={handlePrint}
          disabled={!userName.trim()}
          className="mt-4 w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-lg flex items-center justify-center gap-2 transition-all"
        >
          🖨️ Skriv ut diplom
        </button>
      </div>

      <button onClick={() => window.location.reload()} className="w-full py-3 text-slate-500 hover:text-indigo-600 font-bold transition-colors">
        Spela igen
      </button>
    </Card>
  );
};

const DiplomaPrintable: React.FC<{ progress: UserProgress }> = ({ progress }) => {
  const name = localStorage.getItem('kallkollen_name') || 'Deltagare';
  const date = new Date().toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' });
  
  return (
    <div className="w-[210mm] h-[297mm] mx-auto bg-white p-12 border-[20px] border-double border-indigo-900 flex flex-col items-center justify-between text-slate-900 font-serif">
      <div className="w-full border-4 border-indigo-100 p-8 flex flex-col items-center flex-grow">
        <div className="text-6xl mb-8">🧠</div>
        <h1 className="text-5xl font-black uppercase tracking-widest text-indigo-900 mb-2">Diplom</h1>
        <p className="text-xl uppercase tracking-tighter font-sans text-slate-500 mb-12">I Källkritiskt Tänkande & Digital Medvetenhet</p>
        
        <p className="text-2xl mb-4 italic">Härmed intygas att</p>
        <p className="text-6xl font-black border-b-4 border-slate-800 px-12 pb-2 mb-12 font-sans">{name}</p>
        
        <p className="text-xl max-w-xl text-center leading-relaxed mb-12">
          Har framgångsrikt genomfört utmaningarna i <strong>"Källkollen: Digital Samtid"</strong> och uppvisat förmåga att aktivera System 2, identifiera kognitiva biaser och genomskåda desinformation i en digital miljö.
        </p>

        <div className="grid grid-cols-2 gap-12 w-full max-w-2xl mb-12 font-sans">
          <div className="text-center p-6 bg-slate-50 rounded-2xl">
            <p className="text-xs uppercase text-slate-400 font-bold mb-1">Totalpoäng</p>
            <p className="text-4xl font-black text-indigo-900">{progress.score}</p>
          </div>
          <div className="text-center p-6 bg-slate-50 rounded-2xl">
            <p className="text-xs uppercase text-slate-400 font-bold mb-1">Kognitiv Profil</p>
            <p className="text-4xl font-black text-indigo-900">{progress.score > 30 ? 'Expert' : 'Analytiker'}</p>
          </div>
        </div>

        <div className="flex justify-between w-full mt-auto pt-12 border-t border-slate-200 font-sans text-sm">
          <div>
            <p className="font-bold text-slate-400 uppercase tracking-widest mb-1">Datum</p>
            <p className="text-lg font-bold">{date}</p>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-3xl shadow-lg border-4 border-yellow-200 mb-2">🏅</div>
            <p className="font-bold text-slate-400 uppercase tracking-widest italic">Verifierad av Källkollen-AI</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
