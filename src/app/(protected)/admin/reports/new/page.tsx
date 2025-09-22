"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/stores/admin";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft } from "lucide-react";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const reportModules = [
  { id: "revenue", label: "Revenue & Sales Trends" },
  { id: "plans", label: "Plan Performance Breakdown" },
];

export default function GenerateReportPage() {
    const router = useRouter();
    const { generateReport, loading } = useAdminStore();
    
    const [name, setName] = React.useState("");
    const [date, setDate] = React.useState<DateRange | undefined>();
    const [selectedModules, setSelectedModules] = React.useState<string[]>([]);
    const [popoverOpen, setPopoverOpen] = React.useState(false);

    const handleGenerate = async () => {
        if (!name || !date?.from || !date?.to || selectedModules.length === 0) {
            toast.error("Please fill all fields to generate a report.");
            return;
        }
        
        const newReport = await generateReport(name, {
            startDate: date.from.toISOString(),
            endDate: date.to.toISOString(),
            modules: selectedModules,
        });
        
        // On success, redirect to the new report's detail page
        if (newReport) {
            router.push(`/admin/reports/${newReport.id}`);
        }
    };
    
    return (
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/admin/reports"><ChevronLeft className="h-4 w-4" /></Link>
                </Button>
                <h2 className="text-3xl font-bold tracking-tight">Generate New Report</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Report Details</CardTitle>
                            <CardDescription>Give your report a name and a date range.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Report Name</Label>
                                <Input id="name" placeholder="e.g., Q3 Financial Summary 2025" value={name} onChange={e => setName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Date Range</Label>
                                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date?.from ? (date.to ? `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}` : format(date.from, "LLL dd, y")) : <span>Pick a date range</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 z-[60]" align="start">
                                        <Calendar
                                            initialFocus
                                            mode="range"
                                            defaultMonth={date?.from}
                                            selected={date}
                                            onSelect={(range) => {
                                                setDate(range);
                                                if (range?.from && range?.to) { setPopoverOpen(false); }
                                            }}
                                            numberOfMonths={2}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </CardContent>
                    </Card>
                    <Button onClick={handleGenerate} disabled={loading.reports}>
                        {loading.reports ? "Generating..." : "Generate Report"}
                    </Button>
                </div>

                <div className="md:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Report Modules</CardTitle>
                            <CardDescription>Select the data to include.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {reportModules.map(module => (
                                <div key={module.id} className="flex items-center space-x-3 rounded-md border p-4">
                                    <Checkbox 
                                        id={module.id} 
                                        onCheckedChange={(checked) => {
                                            setSelectedModules(prev => checked ? [...prev, module.id] : prev.filter(m => m !== module.id))
                                        }}
                                    />
                                    <label htmlFor={module.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        {module.label}
                                    </label>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}