import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Calendar, User, CreditCard, Package, Hammer, MapPin, FileText } from 'lucide-react';
import { Obra, ObraFormData } from '../types';
import { calculateDiasCorrido } from '../lib/utils';

interface ObraFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ObraFormData) => void;
  initialData?: Obra | null;
}

export function ObraForm({ isOpen, onClose, onSave, initialData }: ObraFormProps) {
  const [formData, setFormData] = useState<ObraFormData>({
    cliente: '',
    funcionario: '',
    pagamento: '',
    dataChegadaPlacas: '',
    dataContrato: '',
    qtPlaca: 0,
    dataObra: '',
    dataConclusao: '',
    equipe: '',
    local: '',
    obs: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        cliente: initialData.cliente || '',
        funcionario: initialData.funcionario || '',
        pagamento: initialData.pagamento || '',
        dataChegadaPlacas: initialData.dataChegadaPlacas || '',
        dataContrato: initialData.dataContrato || '',
        qtPlaca: initialData.qtPlaca || 0,
        dataObra: initialData.dataObra || '',
        dataConclusao: initialData.dataConclusao || '',
        equipe: initialData.equipe || '',
        local: initialData.local || '',
        obs: initialData.obs || '',
      });
    } else {
      setFormData({
        cliente: '',
        funcionario: '',
        pagamento: '',
        dataChegadaPlacas: '',
        dataContrato: '',
        qtPlaca: 0,
        dataObra: '',
        dataConclusao: '',
        equipe: '',
        local: '',
        obs: '',
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const diasCorrido = calculateDiasCorrido(formData.dataContrato, formData.dataConclusao);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto w-full max-w-2xl h-fit max-h-[90vh] bg-white rounded-3xl shadow-2xl z-[101] overflow-hidden flex flex-col"
          >
            <div className="px-8 py-6 border-b border-[#E5E5E5] flex items-center justify-between bg-white sticky top-0">
              <div>
                <h2 className="text-xl font-bold">{initialData ? 'Editar Obra' : 'Nova Obra'}</h2>
                <p className="text-sm text-[#9E9E9E]">{initialData ? 'Altere os dados da obra selecionada' : 'Preencha os dados da nova obra'}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#F5F5F5] rounded-full transition-colors text-[#9E9E9E]"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar space-y-8">
              {/* Seção 1: Cliente e Responsável */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E] flex items-center gap-2">
                    <User size={12} className="text-[#FF6321]" /> Cliente
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.cliente}
                    onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                    className="w-full bg-[#F9F9F9] border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#FF6321] transition-all outline-none"
                    placeholder="Nome do Cliente"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E] flex items-center gap-2">
                    <User size={12} className="text-[#FF6321]" /> Funcionário
                  </label>
                  <input
                    type="text"
                    value={formData.funcionario}
                    onChange={(e) => setFormData({ ...formData, funcionario: e.target.value })}
                    className="w-full bg-[#F9F9F9] border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#FF6321] transition-all outline-none"
                    placeholder="Nome do Funcionário"
                  />
                </div>
              </div>

              {/* Seção 2: Pagamento e Placas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E] flex items-center gap-2">
                    <CreditCard size={12} className="text-[#FF6321]" /> Pagamento
                  </label>
                  <input
                    type="text"
                    value={formData.pagamento}
                    onChange={(e) => setFormData({ ...formData, pagamento: e.target.value })}
                    className="w-full bg-[#F9F9F9] border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#FF6321] transition-all outline-none"
                    placeholder="Status/Forma"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E] flex items-center gap-2">
                    <Package size={12} className="text-[#FF6321]" /> QT Placa
                  </label>
                  <input
                    type="number"
                    value={formData.qtPlaca}
                    onChange={(e) => setFormData({ ...formData, qtPlaca: Number(e.target.value) })}
                    className="w-full bg-[#F9F9F9] border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#FF6321] transition-all outline-none"
                    placeholder="Ex: 10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E] flex items-center gap-2">
                    <Calendar size={12} className="text-[#FF6321]" /> Chegada Placas
                  </label>
                  <input
                    type="date"
                    value={formData.dataChegadaPlacas}
                    onChange={(e) => setFormData({ ...formData, dataChegadaPlacas: e.target.value })}
                    className="w-full bg-[#F9F9F9] border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#FF6321] transition-all outline-none"
                  />
                </div>
              </div>

              {/* Seção 3: Datas e Prazos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 rounded-2xl bg-[#F9F9F9]">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E] flex items-center gap-2">
                    <Calendar size={12} className="text-[#FF6321]" /> Data Contrato
                  </label>
                  <input
                    required
                    type="date"
                    value={formData.dataContrato}
                    onChange={(e) => setFormData({ ...formData, dataContrato: e.target.value })}
                    className="w-full bg-white border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#FF6321] transition-all outline-none shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E] flex items-center gap-2">
                    <Calendar size={12} className="text-[#FF6321]" /> Início Obra
                  </label>
                  <input
                    type="date"
                    value={formData.dataObra}
                    onChange={(e) => setFormData({ ...formData, dataObra: e.target.value })}
                    className="w-full bg-white border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#FF6321] transition-all outline-none shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E] flex items-center gap-2">
                    <Calendar size={12} className="text-[#FF6321]" /> Conclusão
                  </label>
                  <input
                    type="date"
                    value={formData.dataConclusao}
                    onChange={(e) => setFormData({ ...formData, dataConclusao: e.target.value })}
                    className="w-full bg-white border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#FF6321] transition-all outline-none shadow-sm"
                  />
                </div>
                <div className="md:col-span-3 pt-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-[#9E9E9E]">Dias Corridos:</span>
                        <span className="font-bold text-[#FF6321] text-lg">{diasCorrido} dias</span>
                    </div>
                </div>
              </div>

              {/* Seção 4: Operacional */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E] flex items-center gap-2">
                    <Hammer size={12} className="text-[#FF6321]" /> Equipe
                  </label>
                  <input
                    type="text"
                    value={formData.equipe}
                    onChange={(e) => setFormData({ ...formData, equipe: e.target.value })}
                    className="w-full bg-[#F9F9F9] border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#FF6321] transition-all outline-none"
                    placeholder="Nome da Equipe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E] flex items-center gap-2">
                    <MapPin size={12} className="text-[#FF6321]" /> Local
                  </label>
                  <input
                    type="text"
                    value={formData.local}
                    onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                    className="w-full bg-[#F9F9F9] border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#FF6321] transition-all outline-none"
                    placeholder="Cidade / Endereço"
                  />
                </div>
              </div>

              {/* Seção 5: Observações */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E] flex items-center gap-2">
                  <FileText size={12} className="text-[#FF6321]" /> Observações
                </label>
                <textarea
                  value={formData.obs}
                  onChange={(e) => setFormData({ ...formData, obs: e.target.value })}
                  className="w-full bg-[#F9F9F9] border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#FF6321] transition-all outline-none min-h-[100px] resize-none"
                  placeholder="Informações adicionais..."
                />
              </div>

              <div className="pt-4 sticky bottom-0 bg-white">
                <button
                  type="submit"
                  className="w-full btn-primary py-4 text-sm"
                >
                  {initialData ? 'SALVAR ALTERAÇÕES' : 'CONFIRMAR CADASTRO'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
