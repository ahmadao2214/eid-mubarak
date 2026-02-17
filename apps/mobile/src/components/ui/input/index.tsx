import React from "react";
import { createInput } from "@gluestack-ui/input";
import { View, TextInput, Pressable } from "react-native";
import { tva } from "@gluestack-ui/nativewind-utils/tva";
import {
  withStyleContext,
  useStyleContext,
} from "@gluestack-ui/nativewind-utils/withStyleContext";
import type { VariantProps } from "@gluestack-ui/nativewind-utils";

const SCOPE = "INPUT";

const inputStyle = tva({
  base: "flex-row items-center border rounded-xl bg-white/10",
  variants: {
    variant: {
      outline: "border-gray-600",
      rounded: "border-gray-600 rounded-full",
    },
    size: {
      sm: "h-9",
      md: "h-11",
      lg: "h-14",
    },
    isInvalid: {
      true: "border-red-500",
    },
    isDisabled: {
      true: "opacity-50",
    },
  },
  defaultVariants: {
    variant: "outline",
    size: "md",
  },
});

const inputFieldStyle = tva({
  base: "flex-1 px-3 text-white",
  parentVariants: {
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    },
  },
});

const UIInput = createInput({
  Root: withStyleContext(View, SCOPE),
  Input: TextInput,
  Icon: View,
  Slot: Pressable,
});

type InputProps = React.ComponentProps<typeof UIInput> &
  VariantProps<typeof inputStyle>;

const Input = React.forwardRef<
  React.ComponentRef<typeof UIInput>,
  InputProps
>(({ className, variant = "outline", size = "md", ...props }, ref) => {
  return (
    <UIInput
      ref={ref}
      {...props}
      className={inputStyle({
        variant,
        size,
        isInvalid: props.isInvalid,
        isDisabled: props.isDisabled,
        class: className,
      })}
      context={{ variant, size }}
    />
  );
});
Input.displayName = "Input";

type InputFieldProps = React.ComponentProps<typeof UIInput.Input> &
  VariantProps<typeof inputFieldStyle>;

const InputField = React.forwardRef<
  React.ComponentRef<typeof UIInput.Input>,
  InputFieldProps
>(({ className, ...props }, ref) => {
  const { size } = useStyleContext(SCOPE);
  return (
    <UIInput.Input
      ref={ref}
      placeholderTextColor="#9ca3af"
      {...props}
      className={inputFieldStyle({
        parentVariants: { size },
        class: className,
      })}
    />
  );
});
InputField.displayName = "InputField";

const InputSlot = UIInput.Slot;
const InputIcon = UIInput.Icon;

export { Input, InputField, InputSlot, InputIcon };
export type { InputProps };
