import { useState, useEffect } from "react";
import { useToast } from "@/shadcn/use-toast";

export default function useCopyText() {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const copyText = (code) => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  useEffect(() => {
    if (isCopied) {
      toast({
        title: "Success!",
        description: "Code has been copied",
      });
    }
  }, [isCopied]);
  return { copyText };
}
