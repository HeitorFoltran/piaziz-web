import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type Option = string | { v: string; l: string };

interface RadioOptionListProps {
  idPrefix: string;
  options: Option[];
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export function RadioOptionList({ idPrefix, options, value, onValueChange, className = "space-y-2" }: RadioOptionListProps) {
  const normalized = options.map((o) => (typeof o === "string" ? { v: o, l: o } : o));

  return (
    <RadioGroup className={className} value={value} onValueChange={onValueChange}>
      {normalized.map((o) => (
        <div key={o.v} className="flex items-center gap-3">
          <RadioGroupItem value={o.v} id={`${idPrefix}-${o.v}`} />
          <Label htmlFor={`${idPrefix}-${o.v}`} className="font-normal text-sm">{o.l}</Label>
        </div>
      ))}
    </RadioGroup>
  );
}
