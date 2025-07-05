import { format, parseISO } from 'date-fns';

export const formatDate = (date: Date | string | undefined | null): string => {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'dd MMM yyyy');
  } catch (error) {
    return '-';
  }
};

export const formatDateTime = (date: Date | string | undefined | null): string => {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'dd MMM yyyy HH:mm');
  } catch (error) {
    return '-';
  }
};

export const getExpiryStatus = (expiryDate: Date | string | undefined | null): 'expired' | 'expiring' | 'valid' => {
  if (!expiryDate) return 'valid';
  
  try {
    const dateObj = typeof expiryDate === 'string' ? parseISO(expiryDate) : expiryDate;
    const now = new Date();
    const monthFromNow = new Date();
    monthFromNow.setMonth(monthFromNow.getMonth() + 1);
    
    if (dateObj < now) return 'expired';
    if (dateObj < monthFromNow) return 'expiring';
    return 'valid';
  } catch (error) {
    return 'valid';
  }
};

export const getConfidenceColor = (confidence: number | undefined): string => {
  if (!confidence) return 'grey';
  if (confidence >= 90) return 'green';
  if (confidence >= 70) return 'orange';
  return 'red';
};