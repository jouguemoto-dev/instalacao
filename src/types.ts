export interface Obra {
  id: string;
  cliente: string;
  funcionario: string;
  pagamento: string;
  dataChegadaPlacas: string;
  dataContrato: string;
  qtPlaca: number;
  dataObra: string;
  dataConclusao: string;
  equipe: string;
  local: string;
  obs: string;
  createdAt: any;
  updatedAt: any;
  createdBy: string;
  // Computed fields
  diasCorrido?: number;
}

export type ObraFormData = Omit<Obra, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'diasCorrido'>;
