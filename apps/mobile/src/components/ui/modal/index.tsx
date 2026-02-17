import React from "react";
import { createModal } from "@gluestack-ui/modal";
import { View, ScrollView, Pressable } from "react-native";
import { tva } from "@gluestack-ui/nativewind-utils/tva";
import type { VariantProps } from "@gluestack-ui/nativewind-utils";

const modalContentStyle = tva({
  base: "bg-eid-dark rounded-2xl p-6 m-4 w-full border border-gray-700",
  variants: {
    size: {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      full: "max-w-full m-0 rounded-none",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const modalBackdropStyle = tva({
  base: "absolute top-0 left-0 right-0 bottom-0 bg-black/60",
});

const UIModal = createModal({
  Root: View,
  Content: View,
  CloseButton: Pressable,
  Header: View,
  Footer: View,
  Body: ScrollView,
  Backdrop: Pressable,
});

const Modal = UIModal;

type ModalContentProps = React.ComponentProps<typeof UIModal.Content> &
  VariantProps<typeof modalContentStyle>;

const ModalContent = React.forwardRef<
  React.ComponentRef<typeof UIModal.Content>,
  ModalContentProps
>(({ className, size = "md", ...props }, ref) => {
  return (
    <UIModal.Content
      ref={ref}
      {...props}
      className={modalContentStyle({ size, class: className })}
    />
  );
});
ModalContent.displayName = "ModalContent";

type ModalBackdropProps = React.ComponentProps<typeof UIModal.Backdrop>;

const ModalBackdrop = React.forwardRef<
  React.ComponentRef<typeof UIModal.Backdrop>,
  ModalBackdropProps
>(({ className, ...props }, ref) => {
  return (
    <UIModal.Backdrop
      ref={ref}
      {...props}
      className={modalBackdropStyle({ class: className as string })}
    />
  );
});
ModalBackdrop.displayName = "ModalBackdrop";

const ModalHeader = UIModal.Header;
const ModalBody = UIModal.Body;
const ModalFooter = UIModal.Footer;
const ModalCloseButton = UIModal.CloseButton;

export {
  Modal,
  ModalContent,
  ModalBackdrop,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
};
