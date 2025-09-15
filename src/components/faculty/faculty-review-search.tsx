import { IconSearch } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";

type FacultyReviewSearchProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
};

export function FacultyReviewSearch({ searchQuery, onSearchChange }: FacultyReviewSearchProps) {
  return (
    <div className="relative max-w-md">
      <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search by student name or subject..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}
