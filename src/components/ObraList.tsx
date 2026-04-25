import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Edit2, Trash2, Search, Filter, Download, Upload, Plus, ChevronDown, Clock, X, Eye, Calendar, User, MapPin, CreditCard, MessageSquare, Briefcase } from 'lucide-react';
import { Obra } from '../types';
import { format, parseISO, isAfter, isBefore, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { calculateDiasCorrido, cn, parseFlexibleDate } from '../lib/utils';

interface ObraListProps {
  obras: Obra[];
  onEdit: (obra: Obra) => void;
  onDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onImport: () => void;
  onExport: () => void;
  onAdd: () => void;
}

export function ObraList({ obras, onEdit, onDelete, onBulkDelete, onImport, onExport, onAdd }: ObraListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEquipe, setFilterEquipe] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterPagamento, setFilterPagamento] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewingObra, setViewingObra] = useState<Obra | null>(null);

  const filteredObras = obras.filter((obra) => {
    const matchesSearch = 
      obra.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obra.funcionario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obra.local.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEquipe = filterEquipe ? (obra.equipe === filterEquipe) : true;
    const matchesPagamento = filterPagamento ? (obra.pagamento === filterPagamento) : true;

    let matchesDate = true;
    if (startDate || endDate) {
      const contractDate = parseFlexibleDate(obra.dataContrato);
      if (contractDate) {
        if (startDate) {
          const s = parseFlexibleDate(startDate);
          if (s) matchesDate = matchesDate && (isAfter(contractDate, s) || isSameDay(contractDate, s));
        }
        if (endDate) {
          const e = parseFlexibleDate(endDate);
          if (e) matchesDate = matchesDate && (isBefore(contractDate, e) || isSameDay(contractDate, e));
        }
      }
    }
    
    return matchesSearch && matchesEquipe && matchesPagamento && matchesDate;
  });

  const uniqueEquipes = Array.from(new Set(obras.map(o => o.equipe).filter(Boolean)));
  const uniquePagamentos = Array.from(new Set(obras.map(o => o.pagamento).filter(Boolean)));

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredObras.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredObras.map(o => o.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = parseFlexibleDate(dateStr);
    if (!date) return dateStr || '-';
    return format(date, 'dd/MM/yyyy');
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions Header */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-blue-600 text-white rounded-lg p-3 flex justify-between items-center shadow-lg"
          >
            <span className="text-xs font-bold uppercase tracking-wider">{selectedIds.length} Registros Selecionados</span>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  onBulkDelete(selectedIds);
                  setSelectedIds([]);
                }}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-[10px] uppercase font-bold tracking-widest transition-colors"
              >
                Excluir Selecionados
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Filters */}
      <div className="h-14 bg-white border border-slate-200 rounded-lg flex items-center px-4 gap-4 shrink-0 shadow-sm">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Pesquisar cliente, equipe ou local..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-100 border-none rounded-md text-sm focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 italic pointer-events-none">
            <Search size={14} />
          </div>
        </div>
        <div className="flex gap-2">
            <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={cn(
                    "px-3 py-1.5 rounded border border-slate-200 text-[10px] font-bold uppercase tracking-wider transition-all",
                    isFilterOpen ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 hover:bg-slate-50"
                )}
            >
                Filtros
            </button>
            <select 
                value={filterEquipe}
                onChange={(e) => setFilterEquipe(e.target.value)}
                className="text-xs border border-slate-200 rounded px-3 py-1.5 bg-white text-slate-600 focus:ring-blue-500 outline-none"
            >
                <option value="">Filtrar por Equipe</option>
                {uniqueEquipes.map(eq => <option key={eq} value={eq}>{eq}</option>)}
            </select>
            <div className="flex items-center gap-2">
                <button
                    onClick={onAdd}
                    className="btn-primary"
                >
                    + Nova Obra
                </button>
                <button
                    onClick={onImport}
                    className="btn-secondary"
                >
                    Importar
                </button>
                <button
                    onClick={onExport}
                    className="btn-secondary"
                >
                    Exportar XLS
                </button>
            </div>
        </div>
      </div>

      {/* Expanded Filters Panel */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white border border-slate-200 rounded-lg p-4 grid grid-cols-1 md:grid-cols-4 gap-4 shadow-sm">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Status Pagamento</label>
                <select
                  value={filterPagamento}
                  onChange={(e) => setFilterPagamento(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="">Todos os Status</option>
                  {uniquePagamentos.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Data Inicial (Contrato)</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Data Final (Contrato)</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div className="flex items-end">
                <button
                    onClick={() => {
                        setFilterEquipe('');
                        setFilterPagamento('');
                        setStartDate('');
                        setEndDate('');
                    }}
                    className="w-full py-1.5 text-[10px] font-bold uppercase bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors"
                >
                    Limpar Filtros
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data Grid Area */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse table-auto">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <th className="p-3 border-r border-slate-200 w-10 text-center">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === filteredObras.length && filteredObras.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="xls-th min-w-[150px]">Cliente</th>
                <th className="xls-th min-w-[120px]">Funcionário</th>
                <th className="xls-th min-w-[100px]">Pagamento</th>
                <th className="xls-th min-w-[100px] text-center">Chegada Placas</th>
                <th className="xls-th min-w-[100px] text-center">Data Contrato</th>
                <th className="xls-th min-w-[50px] text-center">Dias</th>
                <th className="xls-th min-w-[70px] text-center">Qt Placa</th>
                <th className="xls-th min-w-[100px] text-center">Data Obra</th>
                <th className="xls-th min-w-[100px] text-center">Conclusão</th>
                <th className="xls-th min-w-[120px]">Equipe</th>
                <th className="xls-th min-w-[150px]">Local</th>
                <th className="xls-th min-w-[200px]">Observações</th>
                <th className="xls-th w-20 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredObras.length > 0 ? (
                filteredObras.map((obra) => {
                  const dias = calculateDiasCorrido(obra.dataContrato, obra.dataConclusao);
                  return (
                    <motion.tr
                      layout
                      key={obra.id}
                      className={cn(
                        "hover:bg-blue-50/50 group transition-colors",
                        selectedIds.includes(obra.id) && "bg-blue-50"
                      )}
                    >
                      <td className="p-3 border-r border-slate-100 text-center">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(obra.id)}
                          onChange={() => toggleSelect(obra.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="xls-td font-medium min-w-[150px]">
                        <button 
                          onClick={() => setViewingObra(obra)}
                          className="text-blue-600 hover:underline text-left w-full truncate font-bold"
                          title={obra.cliente}
                        >
                          {obra.cliente}
                        </button>
                      </td>
                      <td className="xls-td truncate min-w-[120px]" title={obra.funcionario}>{obra.funcionario}</td>
                      <td className="xls-td min-w-[100px]">{obra.pagamento || '-'}</td>
                      <td className="xls-td text-center min-w-[100px]">{formatDate(obra.dataChegadaPlacas)}</td>
                      <td className="xls-td text-center min-w-[100px]">{formatDate(obra.dataContrato)}</td>
                      <td className="xls-td text-center text-blue-600 font-bold min-w-[50px]">
                        {dias}
                      </td>
                      <td className="xls-td text-center font-bold min-w-[70px]">{obra.qtPlaca}</td>
                      <td className="xls-td text-center min-w-[100px]">{formatDate(obra.dataObra)}</td>
                      <td className="xls-td text-center min-w-[100px]">{obra.dataConclusao ? formatDate(obra.dataConclusao) : <span className="text-slate-300 italic">Pendente</span>}</td>
                      <td className="xls-td truncate min-w-[120px]">{obra.equipe || '-'}</td>
                      <td className="xls-td truncate min-w-[150px]" title={obra.local}>{obra.local}</td>
                      <td className="xls-td truncate text-[10px] italic border-r border-slate-100 min-w-[200px]" title={obra.obs}>{obra.obs || '-'}</td>
                      <td className="xls-td text-center">
                        <button
                          onClick={() => onEdit(obra)}
                          className="text-blue-600 hover:underline font-semibold"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => onDelete(obra.id)}
                          className="ml-2 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400 uppercase text-[10px] tracking-widest bg-slate-50/30">
                    Nenhum registro encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer Controls */}
        <div className="border-t border-slate-200 bg-slate-50 p-3 flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-wider">
          <div className="flex items-center gap-6">
            <span>Total: <strong className="text-slate-900 font-mono">{filteredObras.length}</strong></span>
            <span>Placas: <strong className="text-slate-900 font-mono">{filteredObras.reduce((acc, curr) => acc + (curr.qtPlaca || 0), 0)}</strong></span>
          </div>
          <div className="text-slate-300 italic">
            CBC SOLAR - SISTEMA DE GESTÃO GEOMÉTRICA
          </div>
        </div>
      </div>

      {/* Detalhes da Obra Modal */}
      <AnimatePresence>
        {viewingObra && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[400]"
              onClick={() => setViewingObra(null)}
            />
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white shadow-2xl z-[401] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h2 className="text-2xl font-black italic text-slate-900 uppercase tracking-tighter mb-1">
                      Detalhes da Obra
                    </h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                      ID: {viewingObra.id}
                    </p>
                  </div>
                  <button 
                    onClick={() => setViewingObra(null)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Header Info */}
                  <div className="col-span-full bg-slate-50 rounded-xl p-6 border border-slate-100 flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-black italic">
                      {viewingObra.cliente.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Cliente / Titular</div>
                      <div className="text-xl font-bold text-slate-900">{viewingObra.cliente}</div>
                    </div>
                  </div>

                  {/* General Details */}
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 mb-3 tracking-widest">
                        <User size={12} className="text-blue-500" />
                        Equipe e Responsável
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Equipe</label>
                          <div className="text-sm font-medium">{viewingObra.equipe || 'Não atribuída'}</div>
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Responsável / Funcionário</label>
                          <div className="text-sm font-medium">{viewingObra.funcionario || '-'}</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 mb-3 tracking-widest">
                        <MapPin size={12} className="text-blue-500" />
                        Localização
                      </div>
                      <div className="bg-slate-50 p-3 rounded border border-slate-100 text-sm italic">
                        {viewingObra.local || '-'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 mb-3 tracking-widest">
                        <Calendar size={12} className="text-blue-500" />
                        Cronograma
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Contrato</label>
                          <div className="text-xs font-mono font-bold">{formatDate(viewingObra.dataContrato)}</div>
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Data Obra</label>
                          <div className="text-xs font-mono font-bold">{formatDate(viewingObra.dataObra)}</div>
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Chegada Placas</label>
                          <div className="text-xs font-mono font-bold">{formatDate(viewingObra.dataChegadaPlacas)}</div>
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Conclusão</label>
                          <div className="text-xs font-mono font-bold text-blue-600">
                            {viewingObra.dataConclusao ? formatDate(viewingObra.dataConclusao) : 'Pendente'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                          <label className="text-[9px] uppercase font-bold text-blue-400 block mb-1">Dias Corridos</label>
                          <div className="text-2xl font-black italic text-blue-600">
                            {calculateDiasCorrido(viewingObra.dataContrato, viewingObra.dataConclusao)}
                          </div>
                       </div>
                       <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Qt de Placas</label>
                          <div className="text-2xl font-black italic text-slate-700">
                            {viewingObra.qtPlaca}
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Payment & Obs */}
                  <div className="col-span-full border-t border-dashed border-slate-200 mt-4 pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 mb-3 tracking-widest">
                        <CreditCard size={12} className="text-blue-500" />
                        Financeiro
                      </div>
                      <div className="inline-block px-4 py-2 bg-slate-800 text-white rounded font-bold uppercase text-[10px] tracking-widest italic">
                        {viewingObra.pagamento || 'NÃO DEFINIDO'}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 mb-3 tracking-widest">
                        <MessageSquare size={12} className="text-blue-500" />
                        Observações
                      </div>
                      <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-sm italic text-slate-700 leading-relaxed min-h-[100px]">
                        {viewingObra.obs || 'Nenhuma observação registrada.'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-100 flex gap-4">
                  <button
                    onClick={() => {
                        onEdit(viewingObra);
                        setViewingObra(null);
                    }}
                    className="flex-1 bg-slate-900 text-white py-3 rounded-lg font-bold uppercase text-[11px] tracking-widest hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit2 size={14} />
                    Editar Dados
                  </button>
                  <button
                    onClick={() => {
                        onDelete(viewingObra.id);
                        setViewingObra(null);
                    }}
                    className="flex-1 bg-white border border-red-200 text-red-600 py-3 rounded-lg font-bold uppercase text-[11px] tracking-widest hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={14} />
                    Excluir Registro
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
