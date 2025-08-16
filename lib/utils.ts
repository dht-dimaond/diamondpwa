export function validateTelegramId(id: string): boolean {
    return /^\d+$/.test(id) && parseInt(id) > 0 && parseInt(id) <= 10000000000;
  }
  
  export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }