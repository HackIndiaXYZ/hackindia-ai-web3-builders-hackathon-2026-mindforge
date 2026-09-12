"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface ActionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionTitle?: string;
  amount?: string;
  description?: string;
  onConfirm?: () => void;
}

export function ActionConfirmModal({
  isOpen,
  onClose,
  actionTitle = "Refund customer",
  amount = "₹1,299",
  description = "This action will issue a refund to the customer's original payment method.",
  onConfirm,
}: ActionConfirmModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onClose();
      toast(`Action executed: ${actionTitle} ${amount}`, "success");
      if (onConfirm) onConfirm();
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm action"
      description="Sensitive actions require explicit authorization."
      maxWidth="sm"
    >
      <div className="space-y-4 py-2">
        <div className="p-4 rounded border border-border bg-secondary-surface flex items-start gap-3">
          <div className="p-1 rounded bg-surface border border-border mt-0.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <span className="text-xs font-medium text-secondary-text block">{actionTitle}</span>
            <span className="text-xl font-semibold text-primary-text">{amount}</span>
            <p className="text-xs text-secondary-text mt-1.5 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-muted-text">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Requires Human-in-the-Loop policy check</span>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="secondary" size="md" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={handleConfirm} isLoading={isProcessing}>
            Confirm
          </Button>
        </div>
      </div>
    </Modal>
  );
}
