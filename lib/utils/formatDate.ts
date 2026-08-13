import { format } from 'date-fns';

export const formatDate = (date: string | Date) => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm');
};

export const formatDateShort = (date: string | Date) => {
  return format(new Date(date), 'dd/MM/yyyy');
};
