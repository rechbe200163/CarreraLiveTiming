"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, connectToSocket } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";

// Überarbeitetes Schema
const formSchema = z.object({
  race: z.object({
    type: z.enum(["laps", "time"]),
    laps: z
      .number({
        message: "Laps must be a number between 1 and 250",
      })
      .min(1, { message: "Laps must be a number between 1 and 250" })
      .max(250, { message: "Laps must be a number between 1 and 250" })
      .optional(),
    time: z
      .number({
        message: "Time must be a number between 1 and 30",
      })
      .min(1, { message: "Time must be a number between 1 and 30" })
      .max(30, { message: "Time must be a number between 1 and 30" })
      .optional(),
  }),
});

export default function FormComponent() {
  const socketRef = useRef<Socket | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      race: {
        type: "laps",
        laps: 1,
        time: 1,
      },
    },
  });

  useEffect(() => {
    // Connect to socket when component mounts
    const socket = connectToSocket("http://localhost:8765");
    socketRef.current = socket;

    // Event listeners for socket events
    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    socket.on("start_success", (message) => {
      toast({
        title: "Race Started",
        description: "The race has started successfully",
        variant: "success",
      });
    });

    socket.on("start_error", (message) => {
      toast({
        title: "Race Not Started",
        description: message,
        variant: "destructive",
      });
    });

    socket.on("stop_success", (message) => {
      toast({
        title: "Race Stopped",
        description: "The race has been stopped successfully",
        variant: "success",
      });
    });

    socket.on("stop_error", (message) => {
      toast({
        title: "Race Not Stopped",
        description: "No race is currently running",
        variant: "warning",
      });
    });

    return () => {
      // Clean up socket connection when component unmounts
      socket.disconnect();
    };
  }, [toast]);

  const raceType = form.watch("race.type");
  const raceLaps = form.watch("race.laps");
  const raceTime = form.watch("race.time");

  function onSubmit(values: z.infer<typeof formSchema>) {
    const raceData = {
      race_type: values.race.type,
      max_laps: values.race.type === "laps" ? values.race.laps : null,
      max_time: values.race.type === "time" ? values.race.time : null,
    };
    console.log("Starting race with data:", raceData);
    if (socketRef.current) {
      (socketRef.current as any).emit("start", raceData);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <div className="flex flex-row-reverse gap-8 items-start">
          <div className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="race.type"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full md:w-60">
                      <SelectValue placeholder="Select a race type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Race Type</SelectLabel>
                        <SelectItem value="time">Time</SelectItem>
                        <SelectItem value="laps">Laps</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {raceType === "laps" ? (
              <div className="">
                <FormField
                  control={form.control}
                  name="race.laps"
                  render={({ field }) => (
                    <FormItem>
                      <Slider
                        defaultValue={[3]}
                        max={250}
                        min={3}
                        step={1}
                        className="w-2/3"
                        onValueChange={(value) => field.onChange(value[0])}
                        value={[field.value || 1]}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <span className="text-center">{raceLaps ?? 1} Laps</span>
              </div>
            ) : (
              <div className="">
                <FormField
                  control={form.control}
                  name="race.time"
                  render={({ field }) => (
                    <FormItem>
                      <Slider
                        defaultValue={[15]}
                        max={30}
                        min={1}
                        step={1}
                        className="w-2/3"
                        onValueChange={(value) => field.onChange(value[0])}
                        value={[field.value || 1]}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <span className="text-center">{raceTime ?? 1} Min</span>
              </div>
            )}
          </div>
          <Button type="submit">Start</Button>
        </div>
      </form>
    </Form>
  );
}
