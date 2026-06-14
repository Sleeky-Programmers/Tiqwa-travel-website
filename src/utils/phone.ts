export function formatPhoneNumber(value: string): string {
    let cleaned = value.replace(/\D/g, '');
    
    if (cleaned.startsWith('234') && cleaned.length === 13) {
      return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9, 13)}`;
    }
    
    if (cleaned.startsWith('0') && cleaned.length === 11) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 11)}`;
    }
    
    // Partial formatting
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    if (cleaned.length <= 10) return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    
    return cleaned;
  }