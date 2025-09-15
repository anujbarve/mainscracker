"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  IconCalendar, 
  IconCheck, 
  IconX, 
  IconClock, 
  IconUser, 
  IconPlayerPlay, 
  IconAlertCircle,
  IconEyeOff
} from "@tabler/icons-react";

type StatusFilter = 
  | "all" 
  | "requested" 
  | "assigned" 
  | "scheduled" 
  | "in_progress" 
  | "completed" 
  | "cancelled" 
  | "no_show";

type FacultyMentorshipFiltersProps = {
  selectedFilter: StatusFilter;
  onFilterChange: (filter: StatusFilter) => void;
  sessionCounts: Record<StatusFilter, number>;
};

export function FacultyMentorshipFilters({
  selectedFilter,
  onFilterChange,
  sessionCounts
}: FacultyMentorshipFiltersProps) {
  const statusFilters = [
    {
      key: "all" as const,
      label: "All Sessions",
      icon: IconCalendar,
      description: "View all mentorship sessions"
    },
    {
      key: "requested" as const,
      label: "Requested",
      icon: IconUser,
      description: "Sessions requested by students"
    },
    {
      key: "assigned" as const,
      label: "Assigned",
      icon: IconClock,
      description: "Sessions assigned to you"
    },
    {
      key: "scheduled" as const,
      label: "Scheduled",
      icon: IconCalendar,
      description: "Sessions with confirmed time"
    },
    {
      key: "in_progress" as const,
      label: "In Progress",
      icon: IconPlayerPlay,
      description: "Currently active sessions"
    },
    {
      key: "completed" as const,
      label: "Completed",
      icon: IconCheck,
      description: "Successfully finished sessions"
    },
    {
      key: "cancelled" as const,
      label: "Cancelled",
      icon: IconX,
      description: "Cancelled sessions"
    },
    {
      key: "no_show" as const,
      label: "No Show",
      icon: IconEyeOff,
      description: "Sessions where student didn't attend"
    }
  ];

  const getFilterDescription = (filter: StatusFilter) => {
    return statusFilters.find(f => f.key === filter)?.description || "";
  };

  return (
    <Card>
      <CardContent className="p-4">
        <Tabs value={selectedFilter} onValueChange={(value) => onFilterChange(value as StatusFilter)} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 h-auto p-1">
            {statusFilters.map((filter) => {
              const Icon = filter.icon;
              const count = sessionCounts[filter.key];
              
              return (
                <TabsTrigger 
                  key={filter.key} 
                  value={filter.key}
                  className="flex flex-col items-center gap-1 p-2 h-auto data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <div className="flex items-center gap-1">
                    <Icon className="size-3" />
                    <span className="text-xs font-medium">{filter.label}</span>
                  </div>
                  <Badge 
                    variant="secondary"
                    className="text-xs h-5 px-1"
                  >
                    {count}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
        
        <div className="mt-3 p-3 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            {getFilterDescription(selectedFilter)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
