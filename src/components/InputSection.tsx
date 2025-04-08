import React, { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { HelpCircle } from "lucide-react";

interface InputSectionProps {
  onInputChange?: (values: InputValues) => void;
  currencySymbol?: string;
  formatCurrency?: (value: number) => string;
}

export interface InputValues {
  annualIncome: number;
  annualExpenses: number;
  investmentReturns: number;
  withdrawalRate: number;
  currentPortfolioValue: number;
  inflationRate: number;
}

const InputSection: React.FC<InputSectionProps> = ({
  onInputChange = () => {},
  currencySymbol = "$",
  formatCurrency: propFormatCurrency,
}) => {
  const [values, setValues] = useState<InputValues>({
    annualIncome: 100000,
    annualExpenses: 70000,
    investmentReturns: 7,
    withdrawalRate: 4,
    currentPortfolioValue: 50000,
    inflationRate: 2.5,
  });

  const handleInputChange = (field: keyof InputValues, value: number) => {
    const newValues = { ...values, [field]: value };
    setValues(newValues);
    onInputChange(newValues);
  };

  const formatCurrency = (value: number) => {
    if (propFormatCurrency) {
      return propFormatCurrency(value);
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value}%`;
  };

  return (
    <div className="w-full max-w-xs p-6 rounded-sm border border-border-dark dark:border-gray-500 bg-card text-card-foreground shadow-sm h-full">
      <h2 className="text-2xl font-bold mb-6">Your Financial Inputs</h2>

      <div className="space-y-6">
        {/* Current Portfolio Value Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Label htmlFor="current-portfolio">Current Portfolio Value</Label>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" aria-label="Help">
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={5}>
                    <p className="max-w-xs">
                      Your current investment portfolio value - determines your
                      starting point to FIRE. Include all investments intended
                      for retirement (stocks, bonds, ETFs, retirement accounts)
                      but not emergency funds or home equity.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-sm font-medium">
              {formatCurrency(values.currentPortfolioValue)}
            </span>
          </div>
          <Input
            id="current-portfolio"
            type="number"
            min="0"
            step="5000"
            value={values.currentPortfolioValue}
            onChange={(e) =>
              handleInputChange("currentPortfolioValue", Number(e.target.value))
            }
            className="w-full"
          />
        </div>

        {/* Annual Income Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Label htmlFor="annual-income">Annual Income</Label>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" aria-label="Help">
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={5}>
                    <p className="max-w-xs">
                      Your total yearly income before taxes. This is used to
                      calculate how much you can save each year.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-sm font-medium">
              {formatCurrency(values.annualIncome)}
            </span>
          </div>
          <Input
            id="annual-income"
            type="number"
            min="0"
            step="1000"
            value={values.annualIncome}
            onChange={(e) =>
              handleInputChange("annualIncome", Number(e.target.value))
            }
            className="w-full"
          />
        </div>

        {/* Annual Expenses Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Label htmlFor="annual-expenses">Annual Expenses</Label>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" aria-label="Help">
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={5}>
                    <p className="max-w-xs">
                      Your total yearly spending - this directly determines your
                      FIRE number. Lower expenses mean you need less saved to
                      retire early.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-sm font-medium">
              {formatCurrency(values.annualExpenses)}
            </span>
          </div>
          <Input
            id="annual-expenses"
            type="number"
            min="0"
            step="1000"
            value={values.annualExpenses}
            onChange={(e) =>
              handleInputChange("annualExpenses", Number(e.target.value))
            }
            className="w-full"
          />
        </div>

        {/* Calculated Savings Rate Display */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Label>Calculated Savings Rate</Label>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" aria-label="Help">
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={5}>
                    <p className="max-w-xs">
                      Automatically calculated as (Income - Expenses) / Income.
                      Higher rates dramatically reduce time to FIRE. For
                      example, saving 50% instead of 25% can cut your time to
                      retirement nearly in half.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-sm font-medium">
              {formatPercentage(
                Math.max(
                  0,
                  Math.min(
                    100,
                    Math.round(
                      ((values.annualIncome - values.annualExpenses) /
                        values.annualIncome) *
                        100,
                    ),
                  ),
                ),
              )}
            </span>
          </div>
        </div>

        {/* Investment Returns Slider */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Label htmlFor="investment-returns">Investment Returns</Label>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" aria-label="Help">
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={5}>
                    <p className="max-w-xs">
                      Expected annual return on investments after inflation. 7%
                      is a common historical average for stock market returns.
                      More conservative estimates (4-5%) may be safer for
                      planning.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-sm font-medium">
              {formatPercentage(values.investmentReturns)}
            </span>
          </div>
          <Slider
            id="investment-returns"
            min={1}
            max={12}
            step={0.5}
            value={[values.investmentReturns]}
            onValueChange={(value) =>
              handleInputChange("investmentReturns", value[0])
            }
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1%</span>
            <span>6.5%</span>
            <span>12%</span>
          </div>
        </div>

        {/* Withdrawal Rate Slider */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Label htmlFor="withdrawal-rate">
                Withdrawal Rate{" "}
                <span className="text-xs font-normal">(After Retirement)</span>
              </Label>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" aria-label="Help">
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={5}>
                    <p className="max-w-xs">
                      Percentage of portfolio you'll withdraw annually in
                      retirement. The 4% rule is based on the Trinity Study,
                      suggesting a 4% initial withdrawal rate has a high
                      probability of lasting 30+ years. Lower rates (3-3.5%) are
                      more conservative.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-sm font-medium">
              {formatPercentage(values.withdrawalRate)}
            </span>
          </div>
          <Slider
            id="withdrawal-rate"
            min={2}
            max={8}
            step={0.1}
            value={[values.withdrawalRate]}
            onValueChange={(value) =>
              handleInputChange("withdrawalRate", value[0])
            }
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>2%</span>
            <span>4%</span>
            <span>8%</span>
          </div>
        </div>

        {/* Inflation Rate Slider */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Label htmlFor="inflation-rate">Inflation Rate</Label>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" aria-label="Help">
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={5}>
                    <p className="max-w-xs">
                      Expected annual inflation rate. Inflation erodes
                      purchasing power over time, increasing your expenses and
                      affecting real investment returns. Historically, inflation
                      has averaged 2-3% in developed economies.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-sm font-medium">
              {formatPercentage(values.inflationRate)}
            </span>
          </div>
          <Slider
            id="inflation-rate"
            min={0}
            max={10}
            step={0.1}
            value={[values.inflationRate]}
            onValueChange={(value) =>
              handleInputChange("inflationRate", value[0])
            }
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>5%</span>
            <span>10%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputSection;
