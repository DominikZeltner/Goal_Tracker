import { format, parse, isValid } from 'date-fns';
import { de } from 'date-fns/locale';

/**
 * Schweizer Datumsformat: DD.MM.YYYY
 */
export const SWISS_DATE_FORMAT = 'dd.MM.yyyy';

/**
 * ISO-Format für API: YYYY-MM-DD
 */
export const ISO_DATE_FORMAT = 'yyyy-MM-dd';

/**
 * Konvertiert ISO-Datum (YYYY-MM-DD) zu Schweizer Format (DD.MM.YYYY)
 * @param isoDate - Datum im ISO-Format (z.B. "2026-01-30")
 * @returns Datum im Schweizer Format (z.B. "30.01.2026")
 */
export function formatToSwiss(isoDate: string | null | undefined): string {
  if (!isoDate) return '';
  
  try {
    const date = parse(isoDate, ISO_DATE_FORMAT, new Date());
    if (!isValid(date)) return isoDate; // Fallback
    return format(date, SWISS_DATE_FORMAT, { locale: de });
  } catch {
    return isoDate;
  }
}

/**
 * Konvertiert Schweizer Datum (DD.MM.YYYY) zu ISO-Format (YYYY-MM-DD)
 * @param swissDate - Datum im Schweizer Format (z.B. "30.01.2026")
 * @returns Datum im ISO-Format (z.B. "2026-01-30")
 */
export function formatToISO(swissDate: string | null | undefined): string {
  if (!swissDate) return '';
  
  try {
    const date = parse(swissDate, SWISS_DATE_FORMAT, new Date());
    if (!isValid(date)) return swissDate; // Fallback
    return format(date, ISO_DATE_FORMAT);
  } catch {
    return swissDate;
  }
}

/**
 * Konvertiert ISO-Datum zu einem Format für HTML input[type="date"]
 * HTML date input erwartet: YYYY-MM-DD
 * @param isoDate - Datum im ISO-Format
 * @returns Datum im YYYY-MM-DD Format
 */
export function formatForInput(isoDate: string | null | undefined): string {
  if (!isoDate) return '';
  return isoDate; // ISO-Format ist bereits kompatibel mit HTML input
}

/**
 * Konvertiert HTML input-Wert (YYYY-MM-DD) zu ISO-Format
 * @param inputValue - Wert aus HTML input[type="date"]
 * @returns ISO-Format Datum
 */
export function formatFromInput(inputValue: string | null | undefined): string {
  return inputValue || '';
}

/**
 * Formatiert Datum für Anzeige mit Wochentag (z.B. "Donnerstag, 30.01.2026")
 * @param isoDate - Datum im ISO-Format
 * @returns Formatiertes Datum mit Wochentag
 */
export function formatWithWeekday(isoDate: string | null | undefined): string {
  if (!isoDate) return '';
  
  try {
    const date = parse(isoDate, ISO_DATE_FORMAT, new Date());
    if (!isValid(date)) return isoDate;
    return format(date, 'EEEE, dd.MM.yyyy', { locale: de });
  } catch {
    return isoDate;
  }
}

/**
 * Berechnet die Anzahl Tage bis zum Zieldatum
 * @param isoDate - Zieldatum im ISO-Format
 * @returns Anzahl Tage (negativ wenn überfällig)
 */
export function daysUntil(isoDate: string | null | undefined): number | null {
  if (!isoDate) return null;
  
  try {
    const targetDate = parse(isoDate, ISO_DATE_FORMAT, new Date());
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!isValid(targetDate)) return null;
    
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch {
    return null;
  }
}

/**
 * Gibt einen menschenlesbaren Text für die verbleibende Zeit zurück
 * @param isoDate - Zieldatum im ISO-Format
 * @returns Text wie "Noch 5 Tage", "Heute fällig", "3 Tage überfällig"
 */
export function daysUntilText(isoDate: string | null | undefined): string {
  const days = daysUntil(isoDate);
  
  if (days === null) return '';
  
  if (days === 0) return 'Heute fällig';
  if (days === 1) return 'Morgen fällig';
  if (days > 1) return `Noch ${days} Tage`;
  if (days === -1) return '1 Tag überfällig';
  return `${Math.abs(days)} Tage überfällig`;
}
