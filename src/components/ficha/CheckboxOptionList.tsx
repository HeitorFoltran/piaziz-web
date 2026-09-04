import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type Option = string | { v: string; l: string };

interface CheckboxOptionListProps {
  idPrefix: string;
  options: Option[];
  value?: string[];
  onValueChange?: (value: string[]) => void;
  className?: string;
}

export function CheckboxOptionList({ idPrefix, options, value, onValueChange, className = "space-y-2" }: CheckboxOptionListProps) {
  const normalized = options.map((o) => (typeof o === "string" ? { v: o, l: o } : o));

  const toggle = (v: string, checked: boolean) => {
    if (!onValueChange) return;
    const current = value ?? [];
    onValueChange(checked ? [...current, v] : current.filter((x) => x !== v));
  };

  return (
    <div className={className}>
      {normalized.map((o) => (
        <div key={o.v} className="flex items-center gap-3">
          <Checkbox
            id={`${idPrefix}-${o.v}`}
            checked={value ? value.includes(o.v) : undefined}
            onCheckedChange={(checked) => toggle(o.v, checked === true)}
          />
          <Label htmlFor={`${idPrefix}-${o.v}`} className="font-normal text-sm">{o.l}</Label>
        </div>
      ))}
    </div>
  );
}
