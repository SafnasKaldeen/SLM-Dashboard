"use client";

import type React from "react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  Loader2,
  User,
  Mail,
  FileText,
  MessageCircle,
  Tag,
  AlertCircle,
  Zap,
  MapPin,
} from "lucide-react";

interface ComplaintFormProps {
  onSubmit: (data: {
    customerId: string;
    customerEmail: string;
    title: string;
    description: string;
    type: string;
    priority: string;
    scooterId?: string;
    stationId?: string;
  }) => void;
  isProcessing: boolean;
}

export default function ComplaintForm({
  onSubmit,
  isProcessing,
}: ComplaintFormProps) {
  const [customerId, setCustomerId] = useState("CU001");
  const [customerEmail, setCustomerEmail] = useState("alice.smith@example.com");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("general");
  const [priority, setPriority] = useState("medium");
  const [scooterId, setScooterId] = useState("");
  const [stationId, setStationId] = useState("");

  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId || !customerEmail || !title || !description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    onSubmit({
      customerId,
      customerEmail,
      title,
      description,
      type,
      priority,
      scooterId: scooterId || undefined,
      stationId: stationId || undefined,
    });

    setTitle("");
    setDescription("");
    setScooterId("");
    setStationId("");
    setType("general");
    setPriority("medium");
  };

  const priorityColors = {
    low: "text-green-400 bg-green-400/10",
    medium: "text-yellow-400 bg-yellow-400/10",
    high: "text-orange-400 bg-orange-400/10",
    critical: "text-red-400 bg-red-400/10",
  };

  return (
    // Removed the outer div with background styles
    <div className="relative z-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4 shadow-lg shadow-purple-500/25">
          <MessageCircle className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Submit Your Complaint
        </h1>
        <p className="text-slate-400 text-lg">
          We're here to help resolve your concerns quickly and efficiently
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="bg-slate-800/50 border-slate-700/50 shadow-2xl shadow-purple-500/10 backdrop-blur-xl relative">
          {isProcessing && (
            <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center rounded-xl">
              <Loader2 className="animate-spin h-8 w-8 text-white" />
            </div>
          )}

          <CardContent className="p-8 space-y-6 relative z-20">
            {/* Customer Information */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
                Customer Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-300 flex items-center gap-2">
                    <User className="h-4 w-4" /> Customer ID
                  </Label>
                  <Input
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    placeholder="e.g., CU001"
                    className="bg-slate-900/50 border-slate-600/50 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300 flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Customer Email
                  </Label>
                  <Input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g., user@example.com"
                    className="bg-slate-900/50 border-slate-600/50 text-white"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Complaint Details */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
                Complaint Details
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Complaint Title
                  </Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief summary of the issue"
                    className="bg-slate-900/50 border-slate-600/50 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300 flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" /> Description
                  </Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed description of the complaint..."
                    className="bg-slate-900/50 border-slate-600/50 text-white min-h-[120px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-300 flex items-center gap-2">
                      <Tag className="h-4 w-4" /> Complaint Type
                    </Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger className="bg-slate-900/50 border-slate-600/50 text-white">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 text-white">
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" /> Priority
                    </Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger className="bg-slate-900/50 border-slate-600/50 text-white">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 text-white">
                        {["low", "medium", "high", "critical"].map((level) => (
                          <SelectItem key={level} value={level}>
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  priorityColors[
                                    level as keyof typeof priorityColors
                                  ].split(" ")[1]
                                }`}
                              />
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
                Additional Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-300 flex items-center gap-2">
                    <Zap className="h-4 w-4" /> Scooter ID (Optional)
                  </Label>
                  <Input
                    value={scooterId}
                    onChange={(e) => setScooterId(e.target.value)}
                    placeholder="e.g., SC001"
                    className="bg-slate-900/50 border-slate-600/50 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300 flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Station ID (Optional)
                  </Label>
                  <Input
                    value={stationId}
                    onChange={(e) => setStationId(e.target.value)}
                    placeholder="e.g., ST001"
                    className="bg-slate-900/50 border-slate-600/50 text-white"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg shadow-purple-500/25 transition-all duration-200 transform hover:scale-[1.02]"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Submit Complaint
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
