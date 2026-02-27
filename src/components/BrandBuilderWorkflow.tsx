import React from 'react';

const Node = ({ title, icon, isPurple, col, row, img, arrowRight, arrowRightSpan = 1, arrowUp, arrowDown }: any) => {
  const arrowWidth = arrowRightSpan === 1 ? '2rem' : `calc(${arrowRightSpan * 2}rem + ${(arrowRightSpan - 1) * 10}rem)`;
  
  return (
    <div className="relative flex flex-col gap-1 w-40" style={{ gridColumn: col, gridRow: row }}>
      <div className={`flex items-center gap-1 text-[11px] font-bold h-4 ${isPurple ? 'text-indigo-400' : 'text-slate-500'}`}>
        {icon && <span className="material-symbols-outlined text-sm">{icon}</span>}
        <span className="truncate">{title}</span>
      </div>
      <div className="relative">
        <div className={`w-full ${title === 'Logo' ? 'aspect-square' : 'aspect-[4/5]'} bg-black rounded-sm overflow-hidden border ${isPurple ? 'border-indigo-300' : 'border-slate-200'}`}>
          {img ? <img src={img} alt={title} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <div className="w-full h-full bg-slate-100"></div>}
        </div>
        
        {arrowRight && (
          <div className="absolute top-1/2 left-full h-[1px] bg-indigo-300 z-10" style={{ width: arrowWidth }}>
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 border-t-[4px] border-b-[4px] border-l-[5px] border-t-transparent border-b-transparent border-l-indigo-300 w-0 h-0"></div>
          </div>
        )}
        {arrowUp && (
          <div className="absolute bottom-full left-1/2 w-[1px] bg-indigo-300 z-10" style={{ height: '3.25rem' }}>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-l-[4px] border-r-[4px] border-b-[5px] border-l-transparent border-r-transparent border-b-indigo-300 w-0 h-0"></div>
          </div>
        )}
        {arrowDown && (
          <div className="absolute top-full left-1/2 w-[1px] bg-indigo-300 z-10 h-8">
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent border-t-indigo-300 w-0 h-0"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export const BrandBuilderWorkflow = () => {
  return (
    <div className="p-8 bg-[#f4f4f5] min-h-[800px] overflow-auto rounded-[2rem] border border-slate-200 shadow-inner">
      <div className="flex items-center justify-between mb-8 sticky left-0">
        <div>
          <h2 className="text-2xl font-black tracking-tighter uppercase text-slate-900 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">account_tree</span>
            Brand Builder Workflow
          </h2>
          <p className="text-slate-500 font-medium text-sm">Escopo visual completo de ativos da marca.</p>
        </div>
        <button className="px-6 py-3 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
          <span className="material-symbols-outlined text-sm">add</span> Novo Fluxo
        </button>
      </div>

      <div className="grid grid-cols-6 gap-x-8 gap-y-8 w-max pb-20">
        {/* Row 1 */}
        <Node col={5} row={1} title="T-Shirt Mockup" icon="auto_awesome" isPurple img="https://picsum.photos/seed/tsmup/400/500" />

        {/* Row 2 */}
        <Node col={1} row={2} title="Thumbnail" icon="star" img="https://picsum.photos/seed/thumb/400/500" />
        <Node col={2} row={2} title="Logo" img="https://picsum.photos/seed/logo/400/400" />
        <Node col={3} row={2} title="T-shirt Design 1" img="https://picsum.photos/seed/tsd1/400/500" arrowRight />
        <Node col={4} row={2} title="T-shirt Mockup" icon="auto_awesome" isPurple img="https://picsum.photos/seed/tsm1/400/500" arrowRight />
        <Node col={5} row={2} title="T-Shirt Edit 1" icon="edit" isPurple img="https://picsum.photos/seed/tse1/400/500" arrowRight arrowUp />
        <Node col={6} row={2} title="T-Shirt Mockup" icon="auto_awesome" isPurple img="https://picsum.photos/seed/tsm2/400/500" />

        {/* Row 3 */}
        <Node col={3} row={3} title="T-shirt Design 2" img="https://picsum.photos/seed/tsd2/400/500" arrowRight arrowRightSpan={2} />
        <Node col={5} row={3} title="T-Shirt Mockup" icon="auto_awesome" isPurple img="https://picsum.photos/seed/tsm3/400/500" arrowRight />
        <Node col={6} row={3} title="T-Shirt Mockup" icon="auto_awesome" isPurple img="https://picsum.photos/seed/tsm4/400/500" />

        {/* Row 4 */}
        <Node col={3} row={4} title="Sweatpants Design" img="https://picsum.photos/seed/spd/400/500" arrowRight />
        <Node col={4} row={4} title="Sweatpants Mockup 1" icon="auto_awesome" isPurple img="https://picsum.photos/seed/spm1/400/500" arrowRight />
        <Node col={5} row={4} title="Sweatpants Mockup" icon="auto_awesome" isPurple img="https://picsum.photos/seed/spm2/400/500" arrowRight />
        <Node col={6} row={4} title="Sweatpants Mockup" icon="auto_awesome" isPurple img="https://picsum.photos/seed/spm3/400/500" />

        {/* Row 5 */}
        <Node col={3} row={5} title="Cap Design" img="https://picsum.photos/seed/capd/400/500" arrowRight />
        <Node col={4} row={5} title="Cap Mockup 1" icon="auto_awesome" isPurple img="https://picsum.photos/seed/capm1/400/500" arrowRight />
        <Node col={5} row={5} title="Cap Mockup" icon="auto_awesome" isPurple img="https://picsum.photos/seed/capm2/400/500" arrowRight />
        <Node col={6} row={5} title="Cap Edit 1" icon="edit" isPurple img="https://picsum.photos/seed/cape1/400/500" arrowDown />

        {/* Row 6 */}
        <Node col={6} row={6} title="Cap Edit 2" icon="edit" isPurple img="https://picsum.photos/seed/cape2/400/500" />
      </div>
    </div>
  );
};

