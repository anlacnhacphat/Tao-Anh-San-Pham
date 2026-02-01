
import React, { useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  Image as ImageIcon, 
  Settings, 
  Download, 
  Loader2, 
  AlertCircle,
  LayoutGrid,
  FileText,
  MousePointer2,
  Zap,
  User,
  Square,
  Flower2,
  Home,
  Trees,
  Box,
  Baby,
  UserRound
} from 'lucide-react';
import { AppState, ImageQuality } from './types';
import ImageUploader from './components/ImageUploader';
import { generateProductImage, checkApiKeySelection, openApiKeySelection } from './services/gemini';

const BACKGROUND_PRESETS = [
  { 
    label: 'Nền trắng', 
    icon: <Square size={14} />,
    value: 'Professional studio white background, pure white environment, clean minimalist aesthetic, high-end commercial photography, soft natural shadows beneath the product.' 
  },
  { 
    label: 'Xuân Tết', 
    icon: <Flower2 size={14} />,
    value: 'Traditional Vietnamese Lunar New Year (Tết) festive background, elegant red and gold color palette, decorated with peach blossoms (hoa đào) and apricot flowers (hoa mai), traditional motifs, soft warm bokeh lighting, premium commercial advertising style.' 
  },
  { 
    label: 'Phòng khách', 
    icon: <Home size={14} />,
    value: 'Modern luxury living room background, soft bokeh, warm interior lighting, high-end lifestyle setting.' 
  },
  { 
    label: 'Thiên nhiên', 
    icon: <Trees size={14} />,
    value: 'Natural outdoor setting, soft morning sunlight, blurred green forest background, organic aesthetic.' 
  },
  { 
    label: 'Gỗ mộc', 
    icon: <Box size={14} />,
    value: 'Rustic dark wood table surface, warm atmospheric lighting, cozy cafe mood, shallow depth of field.' 
  },
];

const MODEL_PRESETS = [
  { 
    label: 'Người mẫu Nam', 
    icon: <User size={14} />,
    value: 'A handsome, young, and attractive professional Asian male model posing naturally with the product, elegant attire, blurred studio background, high-end commercial fashion photography.' 
  },
  { 
    label: 'Người mẫu Nữ', 
    icon: <UserRound size={14} />,
    value: 'A beautiful, young, and attractive professional Asian female model holding the product, elegant attire, blurred background, high-end commercial lifestyle photography.' 
  },
  { 
    label: 'Bé Trai', 
    icon: <Baby size={14} />,
    value: 'A cute and professional young Asian boy model posing cheerfully with the product, stylish kids clothing, soft natural lighting, high-end commercial look.' 
  },
  { 
    label: 'Bé Gái', 
    icon: <Baby size={14} />,
    value: 'A beautiful and professional young Asian girl model posing elegantly with the product, stylish kids clothing, cheerful expression, soft natural lighting, high-end commercial aesthetic.' 
  },
];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    productImage: null,
    bgType: 'text',
    bgImage: null,
    bgDescription: BACKGROUND_PRESETS[0].value,
    quantity: 1,
    quality: 'Standard',
    isGenerating: false,
    generatedImages: [],
    error: null,
    progress: 0,
  });

  const handleGenerate = async () => {
    if (!state.productImage) {
      setState(prev => ({ ...prev, error: "Vui lòng tải lên hình ảnh sản phẩm." }));
      return;
    }

    if (state.bgType === 'text' && !state.bgDescription.trim()) {
      setState(prev => ({ ...prev, error: "Vui lòng nhập mô tả background." }));
      return;
    }

    if (state.bgType === 'upload' && !state.bgImage) {
      setState(prev => ({ ...prev, error: "Vui lòng tải lên hình ảnh background." }));
      return;
    }

    if (state.quality === 'Ultra') {
      const hasKey = await checkApiKeySelection();
      if (!hasKey) {
        await openApiKeySelection();
      }
    }

    setState(prev => ({ 
      ...prev, 
      isGenerating: true, 
      error: null, 
      generatedImages: [],
      progress: 0 
    }));

    try {
      const results: string[] = [];
      const bgInput = state.bgType === 'text' ? state.bgDescription : state.bgImage;

      for (let i = 0; i < state.quantity; i++) {
        const variedDescription = state.quantity > 1 && typeof bgInput === 'string'
          ? `${bgInput} - variation ${i + 1}, slight camera angle shift, natural lighting changes.`
          : bgInput;
        
        const resultUrl = await generateProductImage(
          state.productImage!,
          state.bgType,
          variedDescription as string,
          state.quality
        );
        results.push(resultUrl);
        setState(prev => ({ ...prev, progress: Math.round(((i + 1) / state.quantity) * 100) }));
      }

      setState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        generatedImages: results 
      }));
    } catch (err: any) {
      console.error(err);
      let errorMessage = "Đã xảy ra lỗi trong quá trình tạo ảnh.";
      if (err.message?.includes("Requested entity was not found")) {
        errorMessage = "API Key không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.";
        await openApiKeySelection();
      }
      setState(prev => ({ ...prev, isGenerating: false, error: errorMessage }));
    }
  };

  const downloadImage = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `product_ai_gen_${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const applyPreset = (val: string) => {
    setState(prev => ({ ...prev, bgDescription: val }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Sparkles className="text-white h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 uppercase">TẠO ẢNH SẢN PHẨM - TẠ THÚC TÀI</h1>
          </div>
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-500">
            <span className="hover:text-blue-600 transition-colors cursor-pointer">Tính năng</span>
            <span className="hover:text-blue-600 transition-colors cursor-pointer text-blue-600">v2.7</span>
          </div>
          <button 
            onClick={() => window.open('https://ai.google.dev/gemini-api/docs/billing', '_blank')}
            className="text-xs font-semibold px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors"
          >
            Billing Docs
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center space-x-2 mb-6">
                <ImageIcon className="text-blue-600 h-5 w-5" />
                <h2 className="font-semibold text-lg">Tải lên sản phẩm</h2>
              </div>
              
              <ImageUploader 
                label="Sản phẩm gốc (Bắt buộc)"
                image={state.productImage}
                onUpload={(img) => setState(prev => ({ ...prev, productImage: img }))}
                onClear={() => setState(prev => ({ ...prev, productImage: null }))}
              />
            </section>

            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center space-x-2 mb-6">
                <Layers className="text-blue-600 h-5 w-5" />
                <h2 className="font-semibold text-lg">Cấu hình Bối cảnh & Người mẫu</h2>
              </div>

              <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
                <button
                  onClick={() => setState(prev => ({ ...prev, bgType: 'text' }))}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 text-sm font-medium rounded-lg transition-all ${
                    state.bgType === 'text' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <FileText size={16} />
                  <span>Sử dụng AI</span>
                </button>
                <button
                  onClick={() => setState(prev => ({ ...prev, bgType: 'upload' }))}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 text-sm font-medium rounded-lg transition-all ${
                    state.bgType === 'upload' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <ImageIcon size={16} />
                  <span>Tải ảnh mẫu</span>
                </button>
              </div>

              {state.bgType === 'text' ? (
                <div className="space-y-6">
                  {/* Background Presets Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Background Presets</label>
                      <Zap size={12} className="text-blue-500" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {BACKGROUND_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => applyPreset(preset.value)}
                          className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all shadow-sm ${
                            state.bgDescription === preset.value 
                            ? 'border-blue-600 bg-blue-600 text-white' 
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-400 hover:bg-blue-50'
                          }`}
                        >
                          {preset.icon}
                          <span>{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Model Presets Section */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-indigo-500 uppercase tracking-wider flex items-center">
                        <User size={12} className="mr-1" /> Model Presets (Châu Á)
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {MODEL_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => applyPreset(preset.value)}
                          className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all shadow-sm ${
                            state.bgDescription === preset.value 
                            ? 'border-indigo-600 bg-indigo-600 text-white' 
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-400 hover:bg-indigo-50'
                          }`}
                        >
                          {preset.icon}
                          <span>{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Mô tả chi tiết</label>
                    <textarea
                      className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px] text-sm font-medium bg-slate-50/50"
                      placeholder="Mô tả bối cảnh hoặc người mẫu..."
                      value={state.bgDescription}
                      onChange={(e) => setState(prev => ({ ...prev, bgDescription: e.target.value }))}
                    />
                    <p className="text-[10px] text-slate-400 italic">
                      Gợi ý: Chọn các tùy chọn nhanh ở trên để AI tự động tối ưu hóa câu lệnh prompt.
                    </p>
                  </div>
                </div>
              ) : (
                <ImageUploader 
                  label="Ảnh mẫu background"
                  image={state.bgImage}
                  onUpload={(img) => setState(prev => ({ ...prev, bgImage: img }))}
                  onClear={() => setState(prev => ({ ...prev, bgImage: null }))}
                />
              )}
            </section>

            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center space-x-2 mb-6">
                <Settings className="text-blue-600 h-5 w-5" />
                <h2 className="font-semibold text-lg">Tùy chọn nâng cao</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Số lượng ảnh ({state.quantity})</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 4, 8].map(num => (
                      <button
                        key={num}
                        onClick={() => setState(prev => ({ ...prev, quantity: num }))}
                        className={`py-2 rounded-lg text-sm font-medium transition-all ${
                          state.quantity === num ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Chất lượng hình ảnh</label>
                  <div className="space-y-2">
                    {(['Standard', 'High', 'Ultra'] as ImageQuality[]).map(q => (
                      <button
                        key={q}
                        onClick={() => setState(prev => ({ ...prev, quality: q }))}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left border transition-all ${
                          state.quality === q ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600' : 'border-slate-200 bg-white hover:border-blue-300'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{q}</span>
                          <span className="text-xs text-slate-500">
                            {q === 'Standard' && '1K Resolution - Tốc độ nhanh'}
                            {q === 'High' && '1K High Detail - Ánh sáng tốt'}
                            {q === 'Ultra' && '4K Resolution - Ảnh quảng cáo'}
                          </span>
                        </div>
                        {state.quality === q && <MousePointer2 size={16} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <button
              onClick={handleGenerate}
              disabled={state.isGenerating}
              className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 shadow-lg transition-all ${
                state.isGenerating 
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:shadow-blue-200 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {state.isGenerating ? (
                <>
                  <Loader2 className="animate-spin h-6 w-6" />
                  <span>Đang xử lý ({state.progress}%)</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-6 w-6" />
                  <span>Tạo hình ảnh ngay</span>
                </>
              )}
            </button>

            {state.error && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start space-x-3">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-red-700">{state.error}</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 min-h-[600px] flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-2">
                  <LayoutGrid className="text-slate-400 h-5 w-5" />
                  <h2 className="font-semibold text-lg text-slate-700">Kết quả đầu ra</h2>
                </div>
                {state.generatedImages.length > 0 && (
                  <span className="text-sm text-slate-400">{state.generatedImages.length} ảnh đã tạo</span>
                )}
              </div>

              {!state.isGenerating && state.generatedImages.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 text-slate-400 py-20">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Sparkles size={40} className="text-slate-200" />
                  </div>
                  <h3 className="text-xl font-medium text-slate-600">Sẵn sàng tạo ra kiệt tác</h3>
                  <p className="max-w-md">
                    Tải lên hình ảnh sản phẩm. Chọn bối cảnh Xuân Tết rực rỡ hoặc người mẫu Châu Á trẻ đẹp để tăng tính hấp dẫn cho sản phẩm của bạn.
                  </p>
                </div>
              )}

              {state.isGenerating && (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-20">
                  <div className="relative">
                    <div className="w-24 h-24 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <Sparkles className="absolute inset-0 m-auto text-blue-600 animate-pulse" size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-slate-700">Đang tách nền & phối cảnh...</h3>
                    <p className="text-slate-500 max-w-sm">
                      AI đang xử lý ánh sáng và đổ bóng tự nhiên cho sản phẩm của bạn.
                    </p>
                  </div>
                  <div className="w-full max-w-xs bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full transition-all duration-500" 
                      style={{ width: `${state.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {state.generatedImages.length > 0 && (
                <div className={`grid gap-4 ${state.generatedImages.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                  {state.generatedImages.map((url, idx) => (
                    <div key={idx} className="group relative rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shadow-sm transition-all hover:shadow-md">
                      <img src={url} alt={`Result ${idx + 1}`} className="w-full aspect-square object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                        <button 
                          onClick={() => downloadImage(url, idx)}
                          className="bg-white p-3 rounded-full text-slate-900 hover:bg-blue-600 hover:text-white transition-all transform scale-90 group-hover:scale-100"
                          title="Tải về"
                        >
                          <Download size={20} />
                        </button>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <span className="bg-white/90 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded text-slate-700 uppercase tracking-widest shadow-sm">
                          AI Result #{idx + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 bg-blue-900 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Mẹo từ chuyên gia</h3>
                <ul className="text-blue-100 text-sm space-y-2 max-w-lg">
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                    <span>Sử dụng ảnh sản phẩm có độ nét cao để AI giữ nguyên chi tiết thương hiệu.</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                    <span>Bối cảnh Xuân Tết rất phù hợp cho chiến dịch khuyến mãi cuối năm.</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                    <span>Người mẫu trẻ đẹp giúp tăng tỷ lệ chuyển đổi đơn hàng trên các sàn TMĐT.</span>
                  </li>
                </ul>
              </div>
              <Sparkles className="absolute right-[-20px] bottom-[-20px] text-blue-800 h-48 w-48 opacity-50" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
