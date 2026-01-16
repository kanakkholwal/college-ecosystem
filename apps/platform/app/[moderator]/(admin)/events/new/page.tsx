"use client";
import { DateTimePicker } from "@/components/extended/date-n-time";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarCheck, CalendarDays, FileText, Loader2, RefreshCw, Save, UploadCloud } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { createNewEvent, saveNewEvents } from "~/actions/common.events";
import { generateEventsByDoc } from "~/ai/actions";
import {
  eventTypes,
  rawEventsSchema,
  rawEventsSchemaType,
} from "~/constants/common.events";

export default function CreateNewEvent() {
  const searchParams = useSearchParams();
  const [fileReference, setFileReference] = useState<string | ArrayBuffer | null>(null);
  const [generatedEvents, setGeneratedEvents] = useState<rawEventsSchemaType[] | null>(null);
  const [acceptedIndices, setAcceptedIndices] = useState<number[]>([]);
  const [generatingEvents, setGeneratingEvents] = useState<boolean>(false);
  const [savingEvents, setSavingEvents] = useState<boolean>(false);

  // --- Form Initialization ---
  const form = useForm<rawEventsSchemaType>({
    resolver: zodResolver(rawEventsSchema),
    defaultValues: {
      title: "",
      description: "",
      links: [],
      time: searchParams.get("time") ? new Date(searchParams.get("time") || "") : new Date(),
      endDate: searchParams.get("endDate") ? new Date(searchParams.get("endDate") || "") : undefined,
      eventType: eventTypes[0],
      location: "",
    },
  });

  // --- Handlers ---
  const handleManualSubmit = async (data: rawEventsSchemaType) => {
    toast.promise(createNewEvent(data), {
      loading: "Creating new event",
      success: "New Event created successfully",
      error: "Failed to create new event",
    });
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => setFileReference(reader.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleGenerateEvents = async () => {
    if (!fileReference) return;
    
    try {
      setGeneratingEvents(true);
      const response = await generateEventsByDoc([fileReference as string]);
      
      if (response.error) throw new Error(response.error.message || "Error generating events");

      setGeneratedEvents(
        response.events.map((event) => ({
          ...event,
          time: new Date(event.time),
          endDate: event.endDate ? new Date(event.endDate) : undefined,
          description: event.description ?? "",
          links: [],
        }))
      );
      setAcceptedIndices([]);
      toast.success(response.message);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setGeneratingEvents(false);
    }
  };

  const handleSaveAcceptedEvents = async () => {
    if (acceptedIndices.length === 0) return toast.error("No events accepted to save");

    const acceptedEvents = generatedEvents?.filter((_, i) => acceptedIndices.includes(i));
    if (!acceptedEvents || acceptedEvents.length === 0) return toast.error("No events to save");

    try {
      setSavingEvents(true);
      await saveNewEvents(acceptedEvents);
      toast.success("Accepted events added to calendar successfully");
      setGeneratedEvents(null); // Clear review list
    } catch (error) {
      toast.error("Error occurred while adding events to calendar");
    } finally {
      setSavingEvents(false);
    }
  };

  const handleToggleAccept = (index: number) => {
      setAcceptedIndices(prev => 
          prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
      );
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Schedule New Event</h1>
      
      <Tabs className="w-full" defaultValue="create-event">
        <TabsList className="bg-transparent h-auto p-0 gap-8 border-b w-full justify-start rounded-none">
            <TabsTrigger value="create-event" className="rounded-none border-b-2 border-transparent px-0 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                Manual Entry
            </TabsTrigger>
            <TabsTrigger value="import-events" className="rounded-none border-b-2 border-transparent px-0 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                AI Import (Beta)
            </TabsTrigger>
        </TabsList>
        
        {/* --- TAB 1: MANUAL FORM --- */}
        <TabsContent value="create-event" className="mt-8 max-w-4xl">
          <Card>
            <CardHeader>
                <CardTitle>Event Details</CardTitle>
                <CardDescription>Define the schedule and scope of the academic calendar entry.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleManualSubmit)} className="space-y-6">
                  
                  {/* Row 1: Title & Description */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g. Mid-Semester Exam Week" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Details about the event" className="resize-y" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Row 2: Type & Location */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="eventType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a event Type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {eventTypes.map(event => (
                                <SelectItem key={event} value={event} className="capitalize">
                                  {event}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Room A-101 / Online" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Row 3: Schedule */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date / Time</FormLabel>
                          <FormControl>
                            <DateTimePicker value={field.value.toISOString()} onChange={(date) => field.onChange(new Date(date))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date / Time (Optional)</FormLabel>
                          <FormControl>
                            <DateTimePicker 
                                value={field.value ? field.value?.toISOString() : new Date().toISOString()} 
                                onChange={(date) => field.onChange(new Date(date))} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="submit" className="gap-2 min-w-[150px]">
                      <Save className="h-4 w-4" /> Publish Event
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* --- TAB 2: AI IMPORT MANAGER --- */}
        <TabsContent value="import-events" className="mt-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UploadCloud className="h-5 w-5 text-primary" /> Import from Document
                    </CardTitle>
                    <CardDescription>Upload a calendar screenshot or official document to automatically extract events.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    
                    {/* Phase 1: Upload and Generate */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border p-4 rounded-xl bg-muted/20">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="file-upload" className="font-semibold">Upload Source Document (Image/PDF)</Label>
                            <Input
                                type="file"
                                accept="image/*, application/pdf"
                                name="file-upload"
                                id="file-upload"
                                onChange={handleFileUpload}
                            />
                            {fileReference && (
                                <p className="text-xs text-muted-foreground pt-1 flex items-center gap-1.5">
                                    <FileText className="h-3 w-3" /> File ready for processing.
                                </p>
                            )}
                        </div>
                        <Button
                            size="sm"
                            onClick={handleGenerateEvents}
                            disabled={!fileReference || generatingEvents}
                            className="shrink-0 h-10 w-full sm:w-auto mt-6 sm:mt-0"
                        >
                            {generatingEvents ? <Loader2 className="animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                            {generatingEvents ? " Analyzing..." : "Generate Events"}
                        </Button>
                    </div>

                    {/* Phase 2: Review and Acceptance */}
                    {generatedEvents && (
                        <div className="space-y-4 pt-4 border-t">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold">
                                    Review Generated Events 
                                    <Badge variant="secondary" className="ml-2">
                                        {acceptedIndices.length} / {generatedEvents.length} Accepted
                                    </Badge>
                                </h3>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setAcceptedIndices(Array.from({ length: generatedEvents.length }, (_, i) => i))}
                                    disabled={acceptedIndices.length === generatedEvents.length || generatingEvents}
                                >
                                    Accept All
                                </Button>
                            </div>

                            {/* Review Grid */}
                            <div className="grid grid-cols-1 gap-4">
                                {generatedEvents.map((event, index) => {
                                    const accepted = acceptedIndices.includes(index);
                                    return (
                                        <div key={index} className={cn(
                                            "flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-xl transition-all",
                                            accepted ? "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-md" : "border-border/60 bg-card"
                                        )}>
                                            <div className="flex-1 min-w-0 pr-4">
                                                {/* Visual Indication */}
                                                <div className="flex items-center gap-2 mb-1">
                                                    {accepted ? (
                                                        <CalendarCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                                                    ) : (
                                                        <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                                                    )}
                                                    <span className="font-medium truncate">{event.title}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground ml-6">
                                                    {event.time.toDateString()} at {event.time.toLocaleTimeString()}
                                                </p>
                                            </div>
                                            
                                            {/* Action Buttons */}
                                            <div className="flex gap-2 pt-2 sm:pt-0 shrink-0">
                                                <Button
                                                    variant={accepted ? "destructive" : "default"}
                                                    size="sm"
                                                    onClick={() => handleToggleAccept(index)}
                                                    className={accepted ? "order-2" : "order-1"}
                                                    disabled={savingEvents}
                                                >
                                                    {accepted ? "Remove" : "Accept"}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={accepted ? "order-1" : "order-2"}
                                                    disabled={savingEvents}
                                                >
                                                    View Card
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Final Save Button */}
                            <div className="flex justify-end pt-6">
                                <Button
                                    onClick={handleSaveAcceptedEvents}
                                    disabled={acceptedIndices.length === 0 || savingEvents}
                                    className="gap-2 min-w-[150px]"
                                >
                                    {savingEvents ? <Loader2 className="animate-spin" /> : <Save className="h-4 w-4" />}
                                    {savingEvents ? " Saving..." : `Save ${acceptedIndices.length} Events`}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}