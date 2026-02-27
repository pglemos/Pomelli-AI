import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Loader2, 
  Sparkles, 
  X, 
  Instagram, 
  Copy, 
  Check, 
  CalendarClock, 
  TrendingUp, 
  Clock, 
  Calendar as CalendarIcon,
  Link as LinkIcon,
  Lightbulb,
  Layers,
  Camera,
  Edit,
  Eye,
  List,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { 
  analyzeReferences, 
  generateImage, 
  generateCaption, 
  analyzeTrends, 
  suggestBestPostTimes, 
  suggestContentIdeas,
  extractBusinessDNA,
  brainstormCampaigns,
  generateMultichannelCopy,
  editImage,
  editCopy,
  generateProductPhotoshoot,
  generateImageVariation,
  generateCaptionVariations
} from './services/geminiService';

import { BrandBuilderWorkflow } from './components/BrandBuilderWorkflow';

export default function App() {
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [context, setContext] = useState('');
  const [niche, setNiche] = useState('');
  const [tone, setTone] = useState('Descontraído e amigável');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedCaption, setGeneratedCaption] = useState<string | null>(null);
  const [captionVariations, setCaptionVariations] = useState<any[]>([]);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [copied, setCopied] = useState(false);
  
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [bestTimes, setBestTimes] = useState<string[]>([]);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);

  const [trends, setTrends] = useState<string | null>(null);
  const [isAnalyzingTrends, setIsAnalyzingTrends] = useState(false);
  const [isSuggestingIdeas, setIsSuggestingIdeas] = useState(false);
  
  const [brandLogo, setBrandLogo] = useState<string | null>(null);
  const [brandText, setBrandText] = useState('');
  const [brandDocs, setBrandDocs] = useState<{name: string, content: string}[]>([]);
  const [brandColors, setBrandColors] = useState('');
  const [brandFonts, setBrandFonts] = useState('');
  const [brandStyle, setBrandStyle] = useState('');
  
  const [postType, setPostType] = useState('Post de Feed (Imagem Única)');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  
  // New Feature States
  const [activeTab, setActiveTab] = useState<'dashboard' | 'dna' | 'studio' | 'photoshoot' | 'posts' | 'tracking' | 'settings'>('dashboard');
  
  // Posts State
  const [scheduledPosts, setScheduledPosts] = useState<any[]>([]);
  
  // DNA State
  const [brandUrl, setBrandUrl] = useState('');
  const [businessDNA, setBusinessDNA] = useState<any>(null);
  const [isExtractingDNA, setIsExtractingDNA] = useState(false);
  const [savedDNAs, setSavedDNAs] = useState<any[]>([]);

  // Load saved DNAs on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('pomelli_saved_dnas');
    if (saved) {
      try {
        setSavedDNAs(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved DNAs", e);
      }
    }
  }, []);

  const handleSaveDNA = () => {
    if (!businessDNA) return;
    const name = prompt("Dê um nome para este DNA:", businessDNA.niche || "Meu DNA");
    if (!name) return;

    const newDNA = { ...businessDNA, id: Date.now().toString(), savedName: name };
    const updated = [newDNA, ...savedDNAs];
    setSavedDNAs(updated);
    localStorage.setItem('pomelli_saved_dnas', JSON.stringify(updated));
    alert("DNA salvo com sucesso!");
  };

  const handleLoadDNA = (dna: any) => {
    setBusinessDNA(dna);
    setNiche(dna.niche || niche);
    setTone(dna.tone || tone);
    setBrandColors(dna.colors || brandColors);
    setBrandFonts(dna.fonts || brandFonts);
    setBrandStyle(dna.style || brandStyle);
    alert(`DNA "${dna.savedName}" carregado!`);
  };

  const handleDeleteDNA = (id: string) => {
    const updated = savedDNAs.filter(d => d.id !== id);
    setSavedDNAs(updated);
    localStorage.setItem('pomelli_saved_dnas', JSON.stringify(updated));
  };

  const handleExtractDNA = async () => {
    setIsExtractingDNA(true);
    try {
      const dna = await extractBusinessDNA(brandUrl, brandText, brandDocs, referenceImages);
      setBusinessDNA(dna);
      setNiche(dna.niche || niche);
      setTone(dna.tone || tone);
      setBrandColors(dna.colors || brandColors);
      setBrandFonts(dna.fonts || brandFonts);
      setBrandStyle(dna.style || brandStyle);
      setActiveTab('dna');
    } catch (e) {
      console.error(e);
      alert("Erro ao extrair DNA.");
    } finally {
      setIsExtractingDNA(false);
    }
  };
  
  // Ideation State
  const [campaignIdeas, setCampaignIdeas] = useState<any[]>([]);
  const [isBrainstorming, setIsBrainstorming] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  
  // Multichannel State
  const [multichannelCopy, setMultichannelCopy] = useState<any>(null);
  const [isGeneratingMultichannel, setIsGeneratingMultichannel] = useState(false);
  
  // Editing State
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [isGeneratingVariation, setIsGeneratingVariation] = useState(false);
  const [isEditingCopy, setIsEditingCopy] = useState(false);
  
  // Photoshoot State
  const [productImage, setProductImage] = useState<string | null>(null);
  const [photoshootScenario, setPhotoshootScenario] = useState('');
  const [photoshootResult, setPhotoshootResult] = useState<string | null>(null);
  const [isGeneratingPhotoshoot, setIsGeneratingPhotoshoot] = useState(false);
  const productInputRef = useRef<HTMLInputElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingProduct, setIsDraggingProduct] = useState(false);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [isDraggingDoc, setIsDraggingDoc] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    processFiles(files);
  };

  const processFiles = (files: FileList | File[]) => {
    Array.from(files).forEach((file: File) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleProductDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingProduct(true);
  };

  const handleProductDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingProduct(false);
  };

  const handleProductDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingProduct(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setProductImage(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleLogoDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingLogo(true);
  };

  const handleLogoDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingLogo(false);
  };

  const handleLogoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingLogo(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file && (file.type === 'image/png' || file.type === 'image/svg+xml')) {
        const reader = new FileReader();
        reader.onloadend = () => setBrandLogo(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        alert("Por favor, faça upload de um arquivo PNG ou SVG.");
      }
    }
  };

  const handleDocDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingDoc(true);
  };

  const handleDocDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingDoc(false);
  };

  const handleDocDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingDoc(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setBrandDocs(prev => [...prev, { name: file.name, content: reader.result as string }]);
      };
      reader.readAsText(file);
    }
  };

  const removeImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setBrandLogo(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBrandDocs(prev => [...prev, { name: file.name, content: reader.result as string }]);
      };
      reader.readAsText(file);
    });
    
    if (docInputRef.current) {
      docInputRef.current.value = '';
    }
  };

  const removeDoc = (index: number) => {
    setBrandDocs(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyzeTrends = async () => {
    if (!niche) {
      alert("Por favor, preencha o campo 'Nicho' primeiro.");
      return;
    }
    setIsAnalyzingTrends(true);
    try {
      const result = await analyzeTrends(niche);
      setTrends(result);
    } catch (error) {
      console.error("Error analyzing trends:", error);
      alert("Erro ao analisar tendências.");
    } finally {
      setIsAnalyzingTrends(false);
    }
  };

  const handleSuggestIdeas = async () => {
    if (referenceImages.length === 0) {
      alert("Por favor, adicione ao menos uma imagem de referência primeiro.");
      return;
    }
    if (!niche) {
      alert("Por favor, preencha o campo 'Nicho' primeiro.");
      return;
    }
    
    setIsSuggestingIdeas(true);
    try {
      const suggestion = await suggestContentIdeas(referenceImages, niche);
      setContext(suggestion);
    } catch (error) {
      console.error("Error suggesting ideas:", error);
      alert("Erro ao sugerir ideias.");
    } finally {
      setIsSuggestingIdeas(false);
    }
  };

  const handleGenerate = async () => {
    if (!context || referenceImages.length === 0 || !niche) {
      alert("Por favor, preencha todos os campos obrigatórios (Referências, Nicho e Contexto).");
      return;
    }
    
    setIsGenerating(true);
    setGeneratedImage(null);
    setGeneratedCaption(null);
    setCaptionVariations([]);
    setMultichannelCopy(null);
    setIsScheduled(false);
    
    try {
      setLoadingStep('Analisando o estilo das referências...');
      const combinedBrandText = [
        brandText,
        ...brandDocs.map(doc => `[Documento: ${doc.name}]\n${doc.content}`)
      ].filter(Boolean).join('\n\n');
      
      const imageGenerationPrompt = await analyzeReferences(
        referenceImages, 
        context, 
        niche, 
        tone, 
        combinedBrandText, 
        brandLogo,
        brandColors,
        brandFonts,
        postType,
        brandStyle
      );
      
      setLoadingStep('Criando sua nova imagem...');
      const newImageUrl = await generateImage(imageGenerationPrompt || context, referenceImages, brandLogo, aspectRatio);
      setGeneratedImage(newImageUrl);
      
      setLoadingStep('Escrevendo a legenda perfeita...');
      const caption = await generateCaption(context, imageGenerationPrompt, niche, tone, combinedBrandText, postType);
      setGeneratedCaption(caption);
      
      setLoadingStep('Gerando variações de legenda...');
      try {
        const variations = await generateCaptionVariations(context, imageGenerationPrompt, niche, tone, combinedBrandText, postType);
        setCaptionVariations(variations);
      } catch (e) {
        console.error("Caption variations failed", e);
      }
      
      setLoadingStep('Gerando copy multicanal...');
      try {
        const copy = await generateMultichannelCopy(
          { niche, tone, colors: brandColors, fonts: brandFonts, style: imageGenerationPrompt },
          context
        );
        setMultichannelCopy(copy);
      } catch (e) {
        console.error("Multichannel copy generation failed", e);
      }
      
    } catch (error) {
      console.error("Error generating content:", error);
      alert("Ocorreu um erro ao gerar o conteúdo. Verifique o console para mais detalhes.");
    } finally {
      setIsGenerating(false);
      setLoadingStep('');
    }
  };

  const copyCaption = () => {
    if (generatedCaption) {
      navigator.clipboard.writeText(generatedCaption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openScheduleModal = async () => {
    setShowScheduleModal(true);
    if (niche && bestTimes.length === 0) {
      setIsLoadingTimes(true);
      try {
        const times = await suggestBestPostTimes(niche);
        setBestTimes(times);
      } catch (error) {
        console.error("Error fetching best times", error);
      } finally {
        setIsLoadingTimes(false);
      }
    }
  };

  const handleSchedule = () => {
    if (!selectedDate || !selectedTime) {
      alert("Por favor, selecione uma data e horário.");
      return;
    }
    
    const newPost = {
      id: Date.now().toString(),
      image: generatedImage,
      caption: generatedCaption,
      multichannelCopy: multichannelCopy,
      date: selectedDate,
      time: selectedTime,
      status: 'scheduled'
    };
    
    setScheduledPosts(prev => [newPost, ...prev]);
    
    // Simulate scheduling
    setIsScheduled(true);
    setTimeout(() => {
      setShowScheduleModal(false);
      setIsScheduled(false);
      setSelectedDate('');
      setSelectedTime('');
    }, 1500);
  };
  
  const handleSaveDraft = () => {
    if (!generatedImage) return;
    
    const newDraft = {
      id: Date.now().toString(),
      image: generatedImage,
      caption: generatedCaption,
      multichannelCopy: multichannelCopy,
      date: '',
      time: '',
      status: 'draft'
    };
    
    setScheduledPosts(prev => [newDraft, ...prev]);
    alert("Rascunho salvo com sucesso!");
  };

  const deletePost = (id: string) => {
    setScheduledPosts(prev => prev.filter(post => post.id !== id));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background-light text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-72 sidebar-glass hidden md:flex flex-col z-50">
        <div className="p-8 flex items-center gap-3">
          <div className="size-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-2xl">rocket_launch</span>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase">Pomelli AI</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Edição Estúdio de Luxo</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 py-4">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'dashboard' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-sm">Central de Missões</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('dna')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'dna' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <span className="material-symbols-outlined">fingerprint</span>
            <span className="text-sm">DNA do Negócio</span>
          </button>

          <button 
            onClick={() => setActiveTab('studio')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'studio' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <span className="material-symbols-outlined">campaign</span>
            <span className="text-sm">Estúdio Criativo</span>
          </button>

          <button 
            onClick={() => setActiveTab('photoshoot')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'photoshoot' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <span className="material-symbols-outlined">auto_awesome_motion</span>
            <span className="text-sm">Ativos de IA</span>
          </button>

          <button 
            onClick={() => setActiveTab('posts')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'posts' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <span className="material-symbols-outlined">list</span>
            <span className="text-sm">Meus Posts</span>
          </button>

          <button 
            onClick={() => setActiveTab('tracking')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'tracking' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <span className="material-symbols-outlined">travel_explore</span>
            <span className="text-sm">O que estão fazendo</span>
          </button>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'settings' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <span className="material-symbols-outlined">settings</span>
              <span className="text-sm">Configurações</span>
            </button>
          </div>
        </nav>

        <div className="p-6">
          <button 
            onClick={handleExtractDNA}
            disabled={isExtractingDNA}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all"
          >
            <span className="material-symbols-outlined text-sm">sync</span>
            Sincronizar DNA
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-[#fcfcfd]">
        <header className="sticky top-0 z-40 px-8 py-6 flex items-center justify-between border-b border-slate-200/50 glass-card bg-white/70">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input 
                className="pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 w-64 md:w-96 transition-all" 
                placeholder="Pesquisar inteligência da missão..." 
                type="text"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="size-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button 
              onClick={() => setActiveTab('studio')}
              className="h-10 px-6 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/30 flex items-center gap-2 hover:opacity-90 transition-all"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Novo Projeto
            </button>
            <div className="size-10 rounded-full border-2 border-primary/20 p-0.5">
              <img 
                className="w-full h-full rounded-full bg-slate-200 object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsUeGEbOlX2-c1E3aFntu6g0dINI2W_lEgF7MA8sh1SLhB6AM0gANWDV0YvGBLOUU-U2jvbofoHVYQf6tbZmL3I2wisf1qubAYdkkBv1sMNtrxHdVc9W-SSdBFRUkgJZY3-DzdtuHspf7Et5BRm5oUSyKXb_rZBS7G8qz4NbKfgl6vilz8Qby5yiz4QAN8hAgTlFgXHRTZIi5x1azI2oXGrNjiWSSPeGsLoEdayQ2_q4nOm3fndnWzta2vsBy6_1j8iUGBpTGEBh60" 
                alt="Avatar"
              />
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <section>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div className="space-y-1">
                  <h2 className="text-4xl font-black tracking-tight text-slate-900">Central de Missões</h2>
                  <p className="text-slate-500 font-medium">Pulso do Sistema: <span className="text-emerald-500">Todos os módulos operacionais</span></p>
                </div>
                <div className="glass-card px-6 py-3 rounded-2xl flex items-center gap-4">
                  <div className="size-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Otimização em Tempo Real Ativa</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card p-8 rounded-2xl relative overflow-hidden group cursor-pointer" onClick={() => setActiveTab('dna')}>
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <span className="material-symbols-outlined text-[120px]">genetics</span>
                  </div>
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2">Extração de DNA do Negócio</h3>
                      <p className="text-slate-500 text-sm mb-8">Sincronizando essência da marca, padrões linguísticos e identidade visual.</p>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-black uppercase tracking-wider">
                          <span>Progresso da Extração</span>
                          <span className="text-primary">{businessDNA ? '100%' : '0%'}</span>
                        </div>
                        <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-primary to-orange-400 rounded-full transition-all duration-1000" style={{ width: businessDNA ? '100%' : '0%' }}></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-slate-100/50 border border-slate-200">
                          <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400 mb-1">Voz</p>
                          <p className="text-sm font-bold">{businessDNA?.tone || 'Pendente'}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-100/50 border border-slate-200">
                          <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400 mb-1">Cor</p>
                          <div className="flex gap-1 mt-1">
                            {businessDNA?.colors ? (
                              businessDNA.colors.split(',').slice(0, 3).map((c: string, i: number) => (
                                <div key={i} className="size-3 rounded-full" style={{ backgroundColor: c.trim() }}></div>
                              ))
                            ) : (
                              <div className="size-3 rounded-full bg-slate-300"></div>
                            )}
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-100/50 border border-slate-200">
                          <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400 mb-1">Tipo</p>
                          <p className="text-sm font-bold">{businessDNA?.style || 'Pendente'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-8 rounded-2xl flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold">Engajamento</h3>
                    <span className="material-symbols-outlined text-emerald-500">trending_up</span>
                  </div>
                  <div className="py-6 flex items-end gap-2 h-32">
                    <div className="w-full bg-primary/20 rounded-t-lg h-[40%]"></div>
                    <div className="w-full bg-primary/20 rounded-t-lg h-[60%]"></div>
                    <div className="w-full bg-primary/20 rounded-t-lg h-[35%]"></div>
                    <div className="w-full bg-primary/40 rounded-t-lg h-[80%]"></div>
                    <div className="w-full bg-primary rounded-t-lg h-[100%]"></div>
                    <div className="w-full bg-primary/30 rounded-t-lg h-[55%]"></div>
                    <div className="w-full bg-primary/20 rounded-t-lg h-[45%]"></div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-black tracking-tighter">+{scheduledPosts.length > 0 ? '12.4%' : '0%'}</p>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Vs Últimos 7 Dias</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-1 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black uppercase tracking-wider text-slate-900">Tendências Agora</h3>
                  <button onClick={handleAnalyzeTrends} className="text-primary text-xs font-bold uppercase tracking-widest">Ver Radar</button>
                </div>
                <div className="space-y-4">
                  <div className="glass-card p-5 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-primary/50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <span className="material-symbols-outlined">auto_graph</span>
                      </div>
                      <div>
                        <p className="font-bold">#AutomotivoDeLuxo</p>
                        <p className="text-xs text-slate-500 font-medium">+184% velocidade</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
                  </div>
                  <div className="glass-card p-5 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-primary/50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">electric_bolt</span>
                      </div>
                      <div>
                        <p className="font-bold">#MinimalismoTech</p>
                        <p className="text-xs text-slate-500 font-medium">+92% velocidade</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
                  </div>
                </div>
              </div>

              <div className="xl:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black uppercase tracking-wider text-slate-900">Campanhas Recentes</h3>
                  <button onClick={() => setActiveTab('posts')} className="text-primary text-xs font-bold uppercase tracking-widest">Ver Todas</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {scheduledPosts.slice(0, 2).map((post) => (
                    <div key={post.id} className="glass-card rounded-2xl overflow-hidden flex flex-col group cursor-pointer" onClick={() => setActiveTab('posts')}>
                      <div className="h-48 overflow-hidden relative">
                        <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={post.image} alt="Post" />
                        <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 rounded-full backdrop-blur-md">
                          <p className="text-[10px] font-black uppercase tracking-widest">{post.status === 'scheduled' ? 'Agendado' : 'Rascunho'}</p>
                        </div>
                      </div>
                      <div className="p-6 space-y-4">
                        <div>
                          <h4 className="font-bold text-lg leading-tight truncate">{post.caption?.slice(0, 40)}...</h4>
                          <p className="text-slate-500 text-xs font-medium">{post.date} • {post.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {scheduledPosts.length === 0 && (
                    <div className="col-span-2 glass-card p-12 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                      <span className="material-symbols-outlined text-4xl text-slate-300">campaign</span>
                      <p className="text-slate-500 font-medium">Nenhuma campanha ativa no momento.</p>
                      <button onClick={() => setActiveTab('studio')} className="px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold">Iniciar Missão</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'studio' && (
          <BrandBuilderWorkflow />
        )}
        
        {activeTab === 'dna' && (
          <div className="space-y-8">
            <div className="glass-card rounded-[2rem] p-10 transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black flex items-center gap-3 tracking-tighter uppercase text-slate-900">
                  <span className="material-symbols-outlined text-primary text-4xl">fingerprint</span> DNA do Negócio
                </h2>
                {savedDNAs.length > 0 && (
                  <div className="relative group">
                    <button className="flex items-center gap-2 px-6 py-3 bg-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                      <span className="material-symbols-outlined text-sm">database</span> Meus DNAs Salvos
                    </button>
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-[2rem] shadow-2xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30 p-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Perfis Identificados</h4>
                      <div className="space-y-2">
                        {savedDNAs.map((dna) => (
                          <div key={dna.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-all group/item">
                            <button 
                              onClick={() => handleLoadDNA(dna)}
                              className="flex-1 text-left text-sm font-bold text-slate-700 truncate"
                            >
                              {dna.savedName}
                            </button>
                            <button 
                              onClick={() => handleDeleteDNA(dna.id)}
                              className="text-slate-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-all"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-slate-500 mb-10 font-medium">Extraia automaticamente a identidade da sua marca a partir de um site, documentos ou imagens.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">URL do Ecossistema</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">language</span>
                    <input
                      type="url"
                      value={brandUrl}
                      onChange={(e) => setBrandUrl(e.target.value)}
                      placeholder="https://suamarca.com.br"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:border-primary outline-none transition-all font-bold text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Contexto Estratégico</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">description</span>
                    <input
                      type="text"
                      value={brandText}
                      onChange={(e) => setBrandText(e.target.value)}
                      placeholder="Descreva brevemente sua marca..."
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:border-primary outline-none transition-all font-bold text-sm"
                    />
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleExtractDNA}
                disabled={isExtractingDNA || (!brandUrl && !brandText && referenceImages.length === 0)}
                className="w-full py-5 rounded-2xl bg-primary text-white font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:opacity-90 disabled:opacity-50 transition-all shadow-xl shadow-primary/20 active:scale-[0.98]"
              >
                {isExtractingDNA ? <><Loader2 size={20} className="animate-spin" /> Mapeando DNA...</> : <><span className="material-symbols-outlined">biotech</span> Extrair Identidade da Marca</>}
              </button>
            </div>
            
            {businessDNA && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card rounded-[2rem] p-10 flex flex-col transition-all hover:shadow-md">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">DNA Extraído</h3>
                    <button 
                      onClick={handleSaveDNA}
                      className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">save</span> Salvar Perfil
                    </button>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nicho</span>
                      <span className="text-sm font-bold text-slate-700">{businessDNA.niche}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tom de Voz</span>
                      <span className="text-sm font-bold text-slate-700">{businessDNA.tone}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cores</span>
                      <div className="flex items-center gap-3">
                        {businessDNA.colors.split(',').map((color: string, i: number) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <div className="size-5 rounded-full border border-slate-200 shadow-sm" style={{ backgroundColor: color.trim().startsWith('#') ? color.trim() : `#${color.trim()}` }} />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">{color.trim()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fontes</span>
                      <span className="text-sm font-bold text-slate-700">{businessDNA.fonts}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estilo Visual</span>
                      <span className="text-sm font-bold text-slate-700">{businessDNA.style}</span>
                    </div>
                  </div>
                </div>
                
                <div className="glass-card rounded-[2rem] p-10 transition-all hover:shadow-md">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Ideação Estratégica</h3>
                  <p className="text-slate-500 mb-8 text-sm font-medium">Gere ideias de campanhas baseadas no seu DNA.</p>
                  <button
                    onClick={async () => {
                      setIsBrainstorming(true);
                      try {
                        const ideas = await brainstormCampaigns(businessDNA);
                        setCampaignIdeas(ideas);
                      } catch (e) {
                        console.error(e);
                      } finally {
                        setIsBrainstorming(false);
                      }
                    }}
                    disabled={isBrainstorming}
                    className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-all mb-8"
                  >
                    {isBrainstorming ? <><Loader2 size={16} className="animate-spin" /> Processando...</> : <><span className="material-symbols-outlined text-sm">lightbulb</span> Brainstorm de Campanhas</>}
                  </button>
                  
                  <div className="space-y-4">
                    {campaignIdeas.map((idea, idx) => (
                      <div key={idx} className="p-6 rounded-2xl border border-slate-200 bg-slate-50 hover:border-primary/30 transition-all group relative">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-black text-primary uppercase tracking-tight text-sm group-hover:translate-x-1 transition-transform">{idea.title}</h4>
                          <div className="flex gap-2">
                            <button 
                              onClick={async (e) => {
                                e.stopPropagation();
                                setIsGeneratingMultichannel(true);
                                try {
                                  const copy = await generateMultichannelCopy(businessDNA, idea.title + ": " + idea.description);
                                  setMultichannelCopy(copy);
                                  // We'll show this in a modal or similar, but for now let's just use the existing state
                                  alert("Copy Multicanal gerado com sucesso! Verifique no Estúdio.");
                                  setActiveTab('studio');
                                } catch (err) {
                                  console.error(err);
                                } finally {
                                  setIsGeneratingMultichannel(false);
                                }
                              }}
                              className="size-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 transition-all shadow-sm"
                              title="Gerar Copy Multicanal"
                            >
                              {isGeneratingMultichannel ? <Loader2 size={14} className="animate-spin" /> : <span className="material-symbols-outlined text-sm">description</span>}
                            </button>
                            <button 
                              onClick={() => {
                                setContext(idea.description);
                                setActiveTab('studio');
                              }}
                              className="size-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 transition-all shadow-sm"
                              title="Usar no Estúdio"
                            >
                              <span className="material-symbols-outlined text-sm">rocket_launch</span>
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">{idea.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
        
        {activeTab === 'photoshoot' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="glass-card rounded-[2.5rem] p-10 transition-all hover:shadow-md">
              <h2 className="text-2xl font-black mb-2 flex items-center gap-3 tracking-tighter uppercase text-slate-900">
                <span className="material-symbols-outlined text-primary text-4xl">auto_awesome_motion</span> Ativos de IA
              </h2>
              <p className="text-slate-500 mb-10 font-medium">Gere ativos visuais de alta performance para sua marca.</p>
              
              <div 
                className={`mb-10 p-4 rounded-[3rem] border-2 border-dashed transition-all ${isDraggingProduct ? 'border-primary bg-primary/5' : 'border-transparent'}`}
                onDragOver={handleProductDragOver}
                onDragLeave={handleProductDragLeave}
                onDrop={handleProductDrop}
              >
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-4">Foto do Produto (Fundo Transparente recomendado)</label>
                {productImage ? (
                  <div className="relative w-64 h-64 rounded-[2rem] border border-slate-200 bg-slate-50 flex items-center justify-center p-6 group mx-auto shadow-inner">
                    <img src={productImage} alt="Produto" className="max-w-full max-h-full object-contain" />
                    <button 
                      onClick={() => setProductImage(null)}
                      className="absolute -top-3 -right-3 bg-slate-900 text-white size-10 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 shadow-xl flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => productInputRef.current?.click()}
                    className={`w-full py-16 px-6 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all active:scale-[0.98] ${isDraggingProduct ? 'border-primary text-primary bg-white' : 'border-slate-200 text-slate-400 hover:bg-slate-50 hover:border-primary/30 hover:text-primary'}`}
                  >
                    <span className="material-symbols-outlined text-5xl">upload_file</span>
                    <span className="font-black uppercase tracking-widest text-xs">{isDraggingProduct ? 'Solte a Imagem Aqui' : 'Fazer upload do produto'}</span>
                  </button>
                )}
                <input 
                  type="file" 
                  ref={productInputRef} 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setProductImage(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              <div className="space-y-6 mb-10">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Cenário Desejado</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">landscape</span>
                    <input 
                      type="text"
                      value={photoshootScenario}
                      onChange={(e) => setPhotoshootScenario(e.target.value)}
                      placeholder="Ex: Em uma mesa de mármore com luz solar suave e plantas ao fundo..."
                      className="w-full pl-14 pr-6 py-5 rounded-2xl border border-slate-200 bg-slate-50 focus:border-primary outline-none transition-all font-bold text-sm"
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={async () => {
                  if (!productImage || !photoshootScenario) return;
                  setIsGeneratingPhotoshoot(true);
                  try {
                    const result = await generateProductPhotoshoot(productImage, photoshootScenario);
                    setPhotoshootResult(result);
                  } catch (e) {
                    console.error(e);
                    alert("Erro ao gerar photoshoot.");
                  } finally {
                    setIsGeneratingPhotoshoot(false);
                  }
                }}
                disabled={isGeneratingPhotoshoot || !productImage || !photoshootScenario}
                className="w-full py-5 rounded-2xl bg-primary text-white font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:opacity-90 disabled:opacity-50 transition-all shadow-xl shadow-primary/20 active:scale-[0.98]"
              >
                {isGeneratingPhotoshoot ? <><Loader2 size={20} className="animate-spin" /> Renderizando Ativo...</> : <><span className="material-symbols-outlined">camera</span> Gerar Ativo de IA</>}
              </button>
            </div>

            {photoshootResult && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-[2.5rem] p-10 transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Resultado do Photoshoot</h3>
                  <a 
                    href={photoshootResult} 
                    download="photoshoot-ia.png"
                    className="flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">download</span> Baixar Ativo
                  </a>
                </div>
                <div className="rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200 bg-slate-50 flex items-center justify-center min-h-[400px]">
                  <img src={photoshootResult} alt="Photoshoot Result" className="max-w-full max-h-[600px] object-contain" />
                </div>
              </motion.div>
            )}
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">grid_view</span>
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Meus Ativos</h2>
                  <p className="text-sm text-slate-500 font-medium">Gerencie sua biblioteca de missões concluídas.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">
                  {scheduledPosts.length} Itens
                </span>
              </div>
            </div>
            
            {scheduledPosts.length === 0 ? (
              <div className="glass-card rounded-[2.5rem] p-20 flex flex-col items-center justify-center text-center">
                <div className="size-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8 border border-slate-100">
                  <span className="material-symbols-outlined text-5xl text-slate-200">inventory_2</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-tight">Nenhum ativo encontrado</h3>
                <p className="text-slate-500 max-w-md font-medium leading-relaxed">Sua biblioteca de ativos está vazia. Comece uma nova missão no Estúdio Criativo para ver seus ativos aqui.</p>
                <button 
                  onClick={() => setActiveTab('studio')}
                  className="mt-10 px-10 py-4 bg-primary text-white font-black uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95"
                >
                  Iniciar Nova Missão
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {scheduledPosts.map((post) => (
                  <motion.div 
                    key={post.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-[2.5rem] overflow-hidden flex flex-col group transition-all hover:shadow-xl hover:border-primary/20 border border-slate-100"
                  >
                    <div className="aspect-square overflow-hidden relative">
                      <img src={post.image} alt="Post" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute top-6 left-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg border border-white/20 ${
                          post.status === 'scheduled' ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-white'
                        }`}>
                          {post.status === 'scheduled' ? 'Agendado' : 'Rascunho'}
                        </span>
                      </div>
                      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                        <button 
                          onClick={() => deletePost(post.id)}
                          className="size-10 bg-white/90 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white shadow-xl backdrop-blur-sm transition-all active:scale-90"
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </div>
                    <div className="p-8 space-y-6 flex-1 flex flex-col">
                      <div className="flex-1">
                        <p className="text-sm text-slate-700 line-clamp-3 font-bold leading-relaxed mb-6 italic">"{post.caption}"</p>
                        {post.date && (
                          <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="material-symbols-outlined text-sm text-primary">calendar_clock</span>
                            {post.date} às {post.time}
                          </div>
                        )}
                      </div>
                      <div className="pt-6 border-t border-slate-100 flex gap-3">
                        <button 
                          onClick={() => {
                            setGeneratedImage(post.image);
                            setGeneratedCaption(post.caption);
                            setMultichannelCopy(post.multichannelCopy);
                            setActiveTab('studio');
                          }}
                          className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/10"
                        >
                          Editar Missão
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'tracking' && (
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-4xl">travel_explore</span>
                  O que estão fazendo
                </h2>
                <p className="text-slate-500 font-medium mt-2">Rastreie contas do Instagram e Pinterest para puxar referências e gerar novos criativos.</p>
              </div>
              <button className="px-6 py-3 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-primary/20">
                <span className="material-symbols-outlined text-sm">add</span> Adicionar Conta
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Mocked Tracked Account 1 */}
              <div className="glass-card p-6 rounded-[2rem] transition-all hover:shadow-md group">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-inner">
                      <span className="material-symbols-outlined">photo_camera</span>
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">@concorrente_top</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Instagram</p>
                    </div>
                  </div>
                  <button className="text-slate-300 hover:text-red-500 transition-colors">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden">
                    <img src="https://picsum.photos/seed/1/200" alt="Post" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all" referrerPolicy="no-referrer" />
                  </div>
                  <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden">
                    <img src="https://picsum.photos/seed/2/200" alt="Post" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all" referrerPolicy="no-referrer" />
                  </div>
                  <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden">
                    <img src="https://picsum.photos/seed/3/200" alt="Post" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all" referrerPolicy="no-referrer" />
                  </div>
                </div>
                <button className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">sync</span> Sincronizar Posts
                </button>
              </div>

              {/* Mocked Tracked Account 2 */}
              <div className="glass-card p-6 rounded-[2rem] transition-all hover:shadow-md group">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-full bg-red-500 flex items-center justify-center text-white shadow-inner">
                      <span className="material-symbols-outlined">push_pin</span>
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">Inspiração Design</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pinterest</p>
                    </div>
                  </div>
                  <button className="text-slate-300 hover:text-red-500 transition-colors">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden">
                    <img src="https://picsum.photos/seed/4/200" alt="Post" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all" referrerPolicy="no-referrer" />
                  </div>
                  <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden">
                    <img src="https://picsum.photos/seed/5/200" alt="Post" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all" referrerPolicy="no-referrer" />
                  </div>
                  <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden">
                    <img src="https://picsum.photos/seed/6/200" alt="Post" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all" referrerPolicy="no-referrer" />
                  </div>
                </div>
                <button className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">sync</span> Sincronizar Posts
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-4xl">settings</span>
                Configurações
              </h2>
              <p className="text-slate-500 font-medium mt-2">Gerencie sua conta, integrações e preferências do sistema.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-4 space-y-2">
                <button className="w-full text-left px-6 py-4 rounded-2xl bg-primary/10 text-primary font-black uppercase tracking-widest text-xs flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg">person</span> Minha Conta
                </button>
                <button className="w-full text-left px-6 py-4 rounded-2xl hover:bg-slate-100 text-slate-600 font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all">
                  <span className="material-symbols-outlined text-lg">hub</span> Integrações
                </button>
                <button className="w-full text-left px-6 py-4 rounded-2xl hover:bg-slate-100 text-slate-600 font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all">
                  <span className="material-symbols-outlined text-lg">psychology</span> Preferências de IA
                </button>
                <button className="w-full text-left px-6 py-4 rounded-2xl hover:bg-slate-100 text-slate-600 font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all">
                  <span className="material-symbols-outlined text-lg">credit_card</span> Faturamento
                </button>
                <button className="w-full text-left px-6 py-4 rounded-2xl hover:bg-slate-100 text-slate-600 font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all">
                  <span className="material-symbols-outlined text-lg">notifications</span> Notificações
                </button>
              </div>

              <div className="md:col-span-8">
                <div className="glass-card p-8 rounded-[2rem]">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6">Minha Conta</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                      <div className="size-20 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 text-2xl font-black">
                        P
                      </div>
                      <div>
                        <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all mb-2">
                          Alterar Foto
                        </button>
                        <p className="text-xs text-slate-500 font-medium">JPG, GIF ou PNG. Máximo de 2MB.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome Completo</label>
                        <input type="text" defaultValue="Pomelli User" className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:border-primary outline-none transition-all font-bold text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail</label>
                        <input type="email" defaultValue="user@pomelli.ai" className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:border-primary outline-none transition-all font-bold text-sm" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Senha Atual</label>
                      <input type="password" placeholder="••••••••" className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:border-primary outline-none transition-all font-bold text-sm" />
                    </div>

                    <div className="pt-6 flex justify-end">
                      <button className="px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all shadow-xl shadow-primary/20">
                        Salvar Alterações
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>

    {/* Schedule Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2rem] p-10 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
              
              {isScheduled ? (
                <div className="text-center py-8">
                  <div className="size-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-4xl">check_circle</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Missão Agendada!</h3>
                  <p className="text-slate-500 font-medium">Seu ativo foi programado com sucesso para {selectedDate} às {selectedTime}.</p>
                  <button 
                    onClick={() => setShowScheduleModal(false)}
                    className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest hover:opacity-90 transition-all"
                  >
                    Entendido
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-8">
                    <div className="size-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl">schedule</span>
                    </div>
                    <button 
                      onClick={() => setShowScheduleModal(false)}
                      className="size-10 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                  
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Programar Ativo</h3>
                  <p className="text-slate-500 mb-8 font-medium">
                    Defina o cronograma preciso para a publicação deste ativo no sistema.
                  </p>
                  
                  <div className="space-y-6 mb-10">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Data da Missão</label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">calendar_today</span>
                          <input 
                            type="date" 
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:border-primary transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Horário de Disparo</label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">schedule</span>
                          <input 
                            type="time" 
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:border-primary transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Suggested Times */}
                    <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-xs">auto_awesome</span> Melhores Horários Sugeridos
                      </h4>
                      {isLoadingTimes ? (
                        <div className="flex items-center gap-2 text-sm text-primary font-bold">
                          <Loader2 size={14} className="animate-spin" /> Analisando seu nicho...
                        </div>
                      ) : bestTimes.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {bestTimes.map((time, i) => (
                            <span key={i} className="px-3 py-1.5 bg-white border border-primary/20 rounded-xl text-xs font-bold text-primary shadow-sm">
                              {time}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 font-medium italic">Preencha o nicho para ver sugestões.</p>
                      )}
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleSchedule}
                    className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-3"
                  >
                    <span className="material-symbols-outlined text-sm">rocket_launch</span>
                    Confirmar Agendamento
                  </button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreviewModal && generatedImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-5xl w-full shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row gap-10"
            >
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6 md:hidden">
                  <h3 className="text-xl font-black flex items-center gap-2 text-slate-900 uppercase tracking-tight">
                    <span className="material-symbols-outlined text-primary">visibility</span> Preview do Ativo
                  </h3>
                  <button onClick={() => setShowPreviewModal(false)} className="size-10 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all flex items-center justify-center">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                
                {/* Mock Instagram Post UI */}
                <div className="border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-xl max-w-md mx-auto w-full">
                  {/* Header */}
                  <div className="p-4 flex items-center gap-3 border-b border-slate-100">
                    <div className="size-10 rounded-full bg-gradient-to-tr from-primary to-orange-400 p-[2px]">
                      <div className="w-full h-full bg-white rounded-full border border-white flex items-center justify-center overflow-hidden">
                        {brandLogo ? <img src={brandLogo} alt="Logo" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-200" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold leading-tight text-slate-900">{niche || 'suamarca'}</div>
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Patrocinado</div>
                    </div>
                    <div className="flex gap-1">
                      <div className="size-1 bg-slate-300 rounded-full" />
                      <div className="size-1 bg-slate-300 rounded-full" />
                      <div className="size-1 bg-slate-300 rounded-full" />
                    </div>
                  </div>
                  
                  {/* Image */}
                  <div className="aspect-square bg-slate-100 relative">
                    <img src={generatedImage} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  
                  {/* Actions */}
                  <div className="p-4">
                    <div className="flex justify-between mb-3">
                      <div className="flex gap-4 text-slate-900">
                        <span className="material-symbols-outlined">favorite</span>
                        <span className="material-symbols-outlined">chat_bubble</span>
                        <span className="material-symbols-outlined">send</span>
                      </div>
                      <span className="material-symbols-outlined text-slate-900">bookmark</span>
                    </div>
                    
                    <div className="text-sm font-bold mb-1 text-slate-900">1.234 curtidas</div>
                    
                    <div className="text-sm leading-relaxed">
                      <span className="font-bold mr-2 text-slate-900">{niche || 'suamarca'}</span>
                      <span className="text-slate-700 whitespace-pre-wrap">{multichannelCopy?.instagram || generatedCaption}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col justify-center space-y-8">
                <div className="hidden md:flex items-center justify-between">
                  <h3 className="text-3xl font-black flex items-center gap-3 text-slate-900 uppercase tracking-tighter">
                    <span className="material-symbols-outlined text-primary text-4xl">visibility</span> Preview do Ativo
                  </h3>
                  <button onClick={() => setShowPreviewModal(false)} className="size-12 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all flex items-center justify-center">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                
                <div className="bg-primary/5 p-8 rounded-[2rem] border border-primary/10">
                  <h4 className="font-black text-primary mb-3 flex items-center gap-2 uppercase tracking-widest text-xs">
                    <span className="material-symbols-outlined text-sm">auto_awesome</span> Ativo Otimizado
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">
                    Seu ativo foi processado com a identidade visual da sua marca e a legenda otimizada para conversão. O sistema está pronto para o disparo.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <button 
                    onClick={() => {
                      setShowPreviewModal(false);
                      openScheduleModal();
                    }}
                    className="w-full py-5 rounded-2xl bg-primary text-white font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl shadow-primary/20"
                  >
                    <span className="material-symbols-outlined text-sm">rocket_launch</span>
                    Programar Missão
                  </button>
                  <button 
                    onClick={() => {
                      handleSaveDraft();
                      setShowPreviewModal(false);
                    }}
                    className="w-full py-5 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
                  >
                    <span className="material-symbols-outlined text-sm">inventory_2</span>
                    Salvar Rascunho
                  </button>
                  <a 
                    href={generatedImage} 
                    download="ativo-pomelli.png"
                    className="w-full py-5 rounded-2xl bg-white border-2 border-slate-200 text-slate-900 font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    Baixar Ativo
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
