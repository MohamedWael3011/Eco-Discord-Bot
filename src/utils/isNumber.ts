export function isNumber(value: any): boolean {
    // Check if the value is of type 'number'
    if (typeof value === 'number') {
      return !isNaN(value);
    }
    
    // Check if the value is of type 'string' and can be converted to a number
    if (typeof value === 'string') {
      return !isNaN(parseFloat(value)) && isFinite(parseFloat(value));
    }
  
    // If the value is neither a number nor a string, return false
    return false;
  }