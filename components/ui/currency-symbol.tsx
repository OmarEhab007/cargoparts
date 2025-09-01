import Image from 'next/image';

interface CurrencySymbolProps {
  className?: string;
}

export function SARSymbol({ className = "h-4 w-4 inline-block" }: CurrencySymbolProps) {
  return (
    <Image 
      src="/Saudi_Riyal_Symbol-2.svg" 
      alt="SAR" 
      width={16} 
      height={16}
      className={className}
    />
  );
}