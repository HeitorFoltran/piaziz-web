import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface YesNoRadioProps {
  idPrefix: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function YesNoRadio({ idPrefix, value, onValueChange }: YesNoRadioProps) {
  return (
    <RadioGroup className="flex gap-4" value={value} onValueChange={onValueChange}>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="sim" id={`${idPrefix}-sim`} />
        <Label htmlFor={`${idPrefix}-sim`} className="font-normal">Sim</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="nao" id={`${idPrefix}-nao`} />
        <Label htmlFor={`${idPrefix}-nao`} className="font-normal">Não</Label>
      </div>
    </RadioGroup>
  );
}
