/**
 * Converts a date to a friendly UK format: "21st May 2026 06:22 PM BST"
 */
export function getFriendlyDate(date: Date): string {
  if (isNaN(date.getTime())) return 'UNKNOWN DATE';
  
  const day = date.getDate();
  const month = date.toLocaleString('en-GB', { month: 'long' });
  const year = date.getFullYear();
  
  let hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const strHours = hours.toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  const suffix = (d: number) => {
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
      case 1:  return "st";
      case 2:  return "nd";
      case 3:  return "rd";
      default: return "th";
    }
  };

  return `${day}${suffix(day)} ${month} ${year} ${strHours}:${minutes} ${ampm} BST`;
}
