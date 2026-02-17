import React from "react";
import { createButton } from "@gluestack-ui/button";
import { Pressable, Text, View, ActivityIndicator } from "react-native";
import { tva } from "@gluestack-ui/nativewind-utils/tva";
import {
  withStyleContext,
  useStyleContext,
} from "@gluestack-ui/nativewind-utils/withStyleContext";
import type { VariantProps } from "@gluestack-ui/nativewind-utils";

const SCOPE = "BUTTON";

const buttonStyle = tva({
  base: "flex-row items-center justify-center rounded-xl",
  variants: {
    action: {
      primary: "bg-eid-gold active:opacity-80",
      secondary: "bg-eid-green active:opacity-80",
      negative: "bg-red-500 active:opacity-80",
    },
    variant: {
      solid: "",
      outline: "bg-transparent border-2 border-eid-gold",
      link: "bg-transparent",
    },
    size: {
      sm: "px-4 py-2",
      md: "px-6 py-3",
      lg: "px-8 py-4",
    },
    isDisabled: {
      true: "opacity-50",
    },
  },
  defaultVariants: {
    action: "primary",
    variant: "solid",
    size: "md",
  },
});

const buttonTextStyle = tva({
  base: "font-bold",
  parentVariants: {
    action: {
      primary: "text-eid-dark",
      secondary: "text-white",
      negative: "text-white",
    },
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    },
  },
});

const UIButton = createButton({
  Root: withStyleContext(Pressable, SCOPE),
  Text,
  Group: View,
  Spinner: ActivityIndicator,
  Icon: View,
});

type ButtonProps = React.ComponentProps<typeof UIButton> &
  VariantProps<typeof buttonStyle>;

const Button = React.forwardRef<
  React.ComponentRef<typeof UIButton>,
  ButtonProps
>(
  (
    {
      className,
      action = "primary",
      variant = "solid",
      size = "md",
      ...props
    },
    ref,
  ) => {
    return (
      <UIButton
        ref={ref}
        {...props}
        className={buttonStyle({
          action,
          variant,
          size,
          isDisabled: props.isDisabled,
          class: className,
        })}
        context={{ action, variant, size }}
      />
    );
  },
);
Button.displayName = "Button";

type ButtonTextProps = React.ComponentProps<typeof UIButton.Text> &
  VariantProps<typeof buttonTextStyle>;

const ButtonText = React.forwardRef<
  React.ComponentRef<typeof UIButton.Text>,
  ButtonTextProps
>(({ className, ...props }, ref) => {
  const { action, size } = useStyleContext(SCOPE);
  return (
    <UIButton.Text
      ref={ref}
      {...props}
      className={buttonTextStyle({
        parentVariants: { action, size },
        class: className,
      })}
    />
  );
});
ButtonText.displayName = "ButtonText";

const ButtonSpinner = UIButton.Spinner;
const ButtonIcon = UIButton.Icon;
const ButtonGroup = UIButton.Group;

export { Button, ButtonText, ButtonSpinner, ButtonIcon, ButtonGroup };
export type { ButtonProps };
