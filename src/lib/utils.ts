import { differenceInCalendarDays, parseISO, isValid, parse } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseFlexibleDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === '') return null;
  
  // Se contiver '/', tenta o formato brasileiro primeiro
  if (dateStr.includes('/')) {
    const brDate = parse(dateStr, 'dd/MM/yyyy', new Date());
    if (isValid(brDate)) return brDate;
  }

  // Tenta parseISO (formato padrão do input date: YYYY-MM-DD)
  let isoDate = parseISO(dateStr);
  if (isValid(isoDate)) return isoDate;

  // Fallback para outros formatos se necessário
  const fallbackDate = parse(dateStr, 'dd/MM/yyyy', new Date());
  if (isValid(fallbackDate)) return fallbackDate;

  return null;
}

export function calculateDiasCorrido(dataContrato: string, dataConclusao?: string) {
  const start = parseFlexibleDate(dataContrato);
  if (!start) return 0;

  const end = (dataConclusao && dataConclusao.trim() !== '') 
    ? parseFlexibleDate(dataConclusao) 
    : new Date();
    
  if (!end) return 0;
  
  // Retorna o valor absoluto da diferença para garantir que mostre a duração mesmo que as datas estejam invertidas na entrada
  return Math.abs(differenceInCalendarDays(end, start));
}
