import { SlidingToggle } from "@/components/ui/SlidingToggle";
import { RANGE_OPTIONS, type ChainRange } from "@/lib/streaks";

type RangeSelectorProps = {
  value: ChainRange;
  onChange: (range: ChainRange) => void;
};

const OPTIONS = RANGE_OPTIONS.map((o) => ({ value: o.key, label: o.label }));

export function RangeSelector({ value, onChange }: RangeSelectorProps) {
  return <SlidingToggle options={OPTIONS} value={value} onChange={onChange} />;
}
