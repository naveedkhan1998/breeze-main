import React, { memo } from 'react';
import { ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const SUBSCRIPTION_DURATIONS = [4, 5, 6, 7, 8, 52, 104] as const;
const DurationSelector: React.FC<{
  duration: number;
  onDurationChange: (duration: number) => void;
}> = memo(({ duration, onDurationChange }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="outline"
        className="w-40 border-border bg-background hover:bg-muted"
      >
        {duration} weeks
        <ChevronDown className="w-4 h-4 ml-2" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="bg-background border-border">
      {SUBSCRIPTION_DURATIONS.map(weeks => (
        <DropdownMenuItem key={weeks} onClick={() => onDurationChange(weeks)}>
          {weeks} weeks
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
));

DurationSelector.displayName = 'DurationSelector';

export default DurationSelector;
