import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Clipboard, CheckCircle2, AlertCircle } from 'lucide-react';
import { ObraFormData } from '../types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: ObraFormData[]) => void;
}

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [pasteData, setPasteData] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleProcess = () => {
    try {
      const rows = pasteData.trim().split('\n');
      if (rows.length === 0 || !pasteData.trim()) {
        setError('Por favor, cole os dados da planilha.');
        return;
      }

      const parsedData: ObraFormData[] = rows.map((row) => {
        // Excel paste uses tabs
        const cols = row.split('\t');
        
        // Se tiver 12 colunas ou mais, assume que tem a coluna "DIAS" (que ignoramos)
        // Se tiver entre 10 e 11 colunas, assume que NÃO tem a coluna "DIAS" (formato do export ou manual reduzido)
        const hasDiasColumn = cols.length >= 12;
        
        if (hasDiasColumn) {
          return {
            cliente: cols[0]?.trim() || '',
            funcionario: cols[1]?.trim() || '',
            pagamento: cols[2]?.trim() || '',
            dataChegadaPlacas: cols[3]?.trim() || '',
            dataContrato: cols[4]?.trim() || '',
            // cols[5] is dias corrido - skipped
            qtPlaca: Number(cols[6]) || 0,
            dataObra: cols[7]?.trim() || '',
            dataConclusao: cols[8]?.trim() || '',
            equipe: cols[9]?.trim() || '',
            local: cols[10]?.trim() || '',
            obs: cols[11]?.trim() || '',
          };
        } else {
          // Formato sem coluna DIAS
          return {
            cliente: cols[0]?.trim() || '',
            funcionario: cols[1]?.trim() || '',
            pagamento: cols[2]?.trim() || '',
            dataChegadaPlacas: cols[3]?.trim() || '',
            dataContrato: cols[4]?.trim() || '',
            qtPlaca: Number(cols[5]) || 0,
            dataObra: cols[6]?.trim() || '',
            dataConclusao: cols[7]?.trim() || '',
            equipe: cols[8]?.trim() || '',
            local: cols[9]?.trim() || '',
            obs: cols[10]?.trim() || '',
          };
        }
      }).filter(item => item.cliente !== '');

      if (parsedData.length === 0) {
        setError('Nenhum dado válido encontrado. Certifique-se de que a primeira coluna tenha o nome do cliente.');
        return;
      }

      onImport(parsedData);
      setPasteData('');
      setError(null);
      onClose();
    } catch (err) {
      setError('Erro ao processar dados. Verifique a formatação da sua planilha.');
      console.error(err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 m-auto w-full max-w-xl h-fit bg-white rounded-lg shadow-2xl z-[201] overflow-hidden"
          >
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase italic tracking-tight">Importar Planilha (XLS/CSV)</h2>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Cole os dados da sua planilha abaixo</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 flex items-start gap-3">
                <AlertCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <div className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-tight">
                  <p className="font-bold text-slate-800 mb-1">Dica de Formatação:</p>
                  Copie os dados na ordem: Cliente, Funcionário, Pagamento, Chegada Placas, Contrato, Dias (ignorado), Quantidade, Início Obra, Conclusão, Equipe, Local, Obs.
                </div>
              </div>

              <div className="space-y-2">
                <textarea
                  value={pasteData}
                  onChange={(e) => {
                    setPasteData(e.target.value);
                    setError(null);
                  }}
                  placeholder="Cole aqui..."
                  className="w-full h-48 bg-slate-50 border border-slate-200 rounded p-4 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 transition-all outline-none resize-none font-mono text-[10px]"
                />
              </div>

              {error && (
                <div className="text-red-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                  <AlertCircle size={12} /> {error}
                </div>
              )}

              <button
                onClick={handleProcess}
                className="w-full btn-primary py-3"
              >
                PROCESSAR DADOS
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
