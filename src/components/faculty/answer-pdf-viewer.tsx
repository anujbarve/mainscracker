"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { IconDownload, IconExternalLink } from "@tabler/icons-react";
import { toast } from "sonner";

type AnswerPDFViewerProps = {
  pdfUrl: string;
  answerId: string;
};

export function AnswerPDFViewer({ pdfUrl, answerId }: AnswerPDFViewerProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  const handleDownload = async () => {
    try {
      if (pdfUrl.includes('supabase')) {
        window.open(pdfUrl, '_blank');
        toast.success("PDF opened in new tab - you can download it from there");
      } else {
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `answer_sheet_${answerId}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("PDF download started");
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      window.open(pdfUrl, '_blank');
      toast.info("PDF opened in new tab - you can download it from there");
    }
  };

  const handleOpenInNewTab = () => {
    window.open(pdfUrl, '_blank');
    toast.info("PDF opened in new tab");
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Answer Sheet</CardTitle>
        <CardDescription>
          Student's submitted answer document
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* PDF Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenInNewTab}
                    disabled={!pdfUrl}
                  >
                    <IconExternalLink className="size-4 mr-2" />
                    Open in New Tab
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Open PDF in a new browser tab</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    disabled={!pdfUrl}
                  >
                    <IconDownload className="size-4 mr-2" />
                    Download
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download answer sheet PDF</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* PDF Viewer using Browser's Built-in Viewer */}
        <div className="border rounded-lg overflow-hidden bg-muted/20 min-h-[600px]">
          {!pdfUrl && (
            <div className="flex items-center justify-center h-96 text-center p-6">
              <p className="text-muted-foreground">No PDF URL provided</p>
            </div>
          )}

          {pdfUrl && hasError && (
            <div className="flex flex-col items-center justify-center h-96 text-center p-6">
              <p className="text-destructive mb-2">Error loading PDF</p>
              <p className="text-sm text-muted-foreground mb-4">
                The PDF could not be displayed in the embedded viewer
              </p>
              <Button onClick={handleOpenInNewTab} variant="outline" size="sm">
                <IconExternalLink className="size-4 mr-2" />
                Open in New Tab
              </Button>
            </div>
          )}

          {pdfUrl && !hasError && (
            <>
              {isLoading && (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Loading PDF...</p>
                  </div>
                </div>
              )}
              
              <iframe
                src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                className="w-full h-[600px] border-0"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                title={`Answer Sheet - ${answerId}`}
                style={{ display: isLoading ? 'none' : 'block' }}
              />
            </>
          )}
        </div>

        {/* PDF Info */}
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>Answer ID: {answerId}</p>
          {pdfUrl && (
            <p className="truncate max-w-full">
              Source: {pdfUrl.split('/').pop()}
            </p>
          )}
          <p>Status: {!pdfUrl ? 'No URL' : hasError ? 'Error' : isLoading ? 'Loading' : 'Ready'}</p>
        </div>
      </CardContent>
    </Card>
  );
}