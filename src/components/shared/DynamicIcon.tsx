import React from 'react';
import {
  Award,
  Building2,
  Calculator,
  CalendarCheck,
  ClipboardCheck,
  Clock,
  Compass,
  Factory,
  FileSpreadsheet,
  Hammer,
  Handshake,
  HardHat,
  Home,
  KeyRound,
  Landmark,
  Layers,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Sofa,
  Users,
  Wrench,
  type LucideProps,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  Award,
  Building2,
  Calculator,
  CalendarCheck,
  ClipboardCheck,
  Clock,
  Compass,
  Factory,
  FileSpreadsheet,
  Hammer,
  Handshake,
  HardHat,
  Home,
  KeyRound,
  Landmark,
  Layers,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Sofa,
  Users,
  Wrench,
};

export function DynamicIcon({
  name,
  className = 'w-5 h-5',
}: {
  name?: string | null;
  className?: string;
}) {
  const Icon = (name && ICON_MAP[name]) || Building2;
  return <Icon className={className} aria-hidden="true" />;
}
