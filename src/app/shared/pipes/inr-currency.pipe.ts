import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'inrCurrency',
  standalone: true,
})
export class InrCurrencyPipe implements PipeTransform {
  transform(value: number | string | null | undefined, showSymbol: boolean = true): string {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return showSymbol ? '₹0.00' : '0.00';
    }
    const num = Number(value);
    const isNegative = num < 0;
    const absVal = Math.abs(num).toFixed(2);
    const [intPart, decPart] = absVal.split('.');

    let lastThree = intPart.substring(intPart.length - 3);
    const otherNumbers = intPart.substring(0, intPart.length - 3);
    if (otherNumbers !== '') {
      lastThree = ',' + lastThree;
    }
    const formattedInt = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
    const result = `${formattedInt}.${decPart}`;
    const sign = isNegative ? '-' : '';

    return showSymbol ? `${sign}₹${result}` : `${sign}${result}`;
  }
}
