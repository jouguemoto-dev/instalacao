import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, db, setDoc, doc, updateDoc, deleteDoc, serverTimestamp, handleFirestoreError, OperationType } from './lib/firebase';
import { Obra, ObraFormData } from './types';
import { Layout } from './components/Layout';
import { ObraList } from './components/ObraList';
import { ObraForm } from './components/ObraForm';
import { ImportModal } from './components/ImportModal';
import { useAuth } from './hooks/useAuth';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingObra, setEditingObra] = useState<Obra | null>(null);
  const [obrasToDelete, setObrasToDelete] = useState<string[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setObras([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'obras'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Obra[];
      setObras(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'obras');
    });

    return unsubscribe;
  }, [user, authLoading]);

  const handleSave = async (formData: ObraFormData) => {
    if (!user) return;

    try {
      if (editingObra) {
        await updateDoc(doc(db, 'obras', editingObra.id), {
          ...formData,
          updatedAt: serverTimestamp(),
        });
      } else {
        const newDocRef = doc(collection(db, 'obras'));
        await setDoc(newDocRef, {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: user.uid,
        });
      }
      setIsFormOpen(false);
      setEditingObra(null);
    } catch (error) {
      handleFirestoreError(error, editingObra ? OperationType.UPDATE : OperationType.CREATE, 'obras');
    }
  };

  const handleDelete = async () => {
    if (obrasToDelete.length === 0) return;

    try {
      for (const id of obrasToDelete) {
        await deleteDoc(doc(db, 'obras', id));
      }
      setObrasToDelete([]);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `obras/${obrasToDelete.join(',')}`);
    }
  };

  const handleImport = async (dataList: ObraFormData[]) => {
    if (!user) return;

    for (const item of dataList) {
      try {
        const newDocRef = doc(collection(db, 'obras'));
        await setDoc(newDocRef, {
          ...item,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: user.uid,
        });
      } catch (error) {
        console.error('Erro ao importar item:', item.cliente, error);
      }
    }
  };

  const handleExport = () => {
    const exportData = obras.map(o => ({
      Cliente: o.cliente,
      Funcionário: o.funcionario,
      Pagamento: o.pagamento,
      'Chegada Placas': o.dataChegadaPlacas,
      'Data Contrato': o.dataContrato,
      'Quantidade Placas': o.qtPlaca,
      'Data Início Obra': o.dataObra,
      'Data Conclusão': o.dataConclusao,
      Equipe: o.equipe,
      Local: o.local,
      Observações: o.obs
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Obras');
    XLSX.writeFile(wb, `CBC_Solar_Obras_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <div className="text-center">
            <Loader2 className="animate-spin text-[#FF6321] mx-auto mb-4" size={40} />
            <p className="text-sm font-bold uppercase tracking-widest text-[#9E9E9E]">Carregando Sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Painel de Obras</h2>
        <p className="text-[#9E9E9E]">Gerencie todas as obras e projetos da CBC Solar em um só lugar.</p>
      </div>

      <ObraList
        obras={obras}
        onAdd={() => {
          setEditingObra(null);
          setIsFormOpen(true);
        }}
        onEdit={(obra) => {
          setEditingObra(obra);
          setIsFormOpen(true);
        }}
        onDelete={(id) => setObrasToDelete([id])}
        onBulkDelete={(ids) => setObrasToDelete(ids)}
        onImport={() => setIsImportOpen(true)}
        onExport={handleExport}
      />

      <ObraForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        initialData={editingObra}
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImport}
      />

      {/* Modal de Confirmação de Exclusão */}
      <AnimatePresence>
        {obrasToDelete.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300]"
              onClick={() => setObrasToDelete([])}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 m-auto w-full max-w-sm h-fit bg-white rounded-lg shadow-2xl z-[301] p-8"
            >
              <div className="flex items-center gap-2 text-red-600 mb-4 uppercase font-bold italic tracking-tight">
                <AlertTriangle size={20} />
                <span>Excluir {obrasToDelete.length > 1 ? 'Registros' : 'Registro'}?</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-8 leading-relaxed">
                Deseja realmente remover {obrasToDelete.length > 1 ? 'os dados destas obras' : 'os dados desta obra'}? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setObrasToDelete([])}
                  className="flex-1 py-2 text-[10px] font-bold uppercase tracking-wider border border-slate-200 rounded hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2 text-[10px] font-bold uppercase tracking-wider bg-red-500 text-white rounded hover:bg-red-600 shadow-sm"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Layout>
  );
}
