"use client";

import { CHECKOUT_STEPS } from "../steps";

type CheckoutStepperProps = {
  currentStep: number;
};

export default function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  return (
    <div className="relative flex items-center justify-between w-full px-2 sm:px-6 lg:px-8 py-8">
      {/* Background Line */}
      <div className="absolute left-0 top-12 right-0 h-1 bg-gray-200 z-0 rounded-full" />

      {/* Progress Line */}
      <div
        className="absolute left-0 top-12 h-1 bg-pink-600 z-10 rounded-full transition-all duration-300 ease-in-out"
        style={{
          width: `${(currentStep / (CHECKOUT_STEPS.length - 1)) * 100}%`,
        }}
      />

      {/* Step Points */}
      {CHECKOUT_STEPS.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        return (
          <div
            key={step.key}
            className="relative z-20 flex flex-col items-center w-1/4"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition
                ${
                  isCompleted
                    ? "bg-pink-600 text-white shadow"
                    : isActive
                    ? "bg-white border-2 border-pink-600 text-pink-600 shadow"
                    : "bg-white border-2 border-gray-300 text-gray-400"
                }`}
            >
              {index + 1}
            </div>
            <span
              className={`mt-2 text-xs sm:text-sm text-center font-medium ${
                isCompleted || isActive ? "text-pink-700" : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
