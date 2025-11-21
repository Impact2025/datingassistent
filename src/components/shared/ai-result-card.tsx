"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, Copy, Save, Trash2, ExternalLink } from "lucide-react";
import { useState } from "react";

interface AIResultCardProps {
  content: string;
  tip?: string;
  link?: string;
  linkText?: string;
  onSave?: () => void;
  onDelete?: () => void;
}

export function AIResultCard({ content, tip, link, linkText = "Bezoek site", onSave, onDelete }: AIResultCardProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // Regex to remove HTML tags for plain text copy
    const plainText = content.replace(/<[^>]*>/g, '\n').replace(/\n\n/g, '\n').trim();
    navigator.clipboard.writeText(plainText);
    setCopied(true);
    toast({
      description: "Tekst gekopieerd naar klembord.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = (text: string) => {
    const boldedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return <div className="whitespace-pre-wrap text-foreground" dangerouslySetInnerHTML={{ __html: boldedText }} />;
  };


  return (
    <div className="rounded-lg bg-secondary/50 p-4">
      {renderContent(content)}
      {tip && (
        <p className="border-l-2 border-primary/50 pl-2 text-xs italic text-primary/80">
          <strong>Coach tip:</strong> {tip}
        </p>
      )}
      <div className="mt-2 flex items-center justify-end gap-2">
        {link && (
            <a href={link} target="_blank" rel="noopener noreferrer" className="mr-auto inline-flex items-center gap-2 text-sm font-semibold text-green-400 hover:text-green-300">
                <ExternalLink /> {linkText}
            </a>
        )}
        {onSave && (
            <Button variant="ghost" size="sm" onClick={onSave} className="gap-2 text-primary hover:text-primary">
                <Save /> Opslaan
            </Button>
        )}
         <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-2 text-primary hover:text-primary">
          {copied ? <Check /> : <Copy />}
          {copied ? "Gekopieerd!" : "Kopiëren"}
        </Button>
        {onDelete && (
            <Button variant="ghost" size="sm" onClick={onDelete} className="gap-2 text-destructive hover:text-destructive">
                <Trash2 /> Verwijderen
            </Button>
        )}
      </div>
    </div>
  );
}
