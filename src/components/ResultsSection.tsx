import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import {
  DollarSign,
  Calendar,
  PiggyBank,
  TrendingUp,
  HelpCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface ResultsSectionProps {
  fireNumber?: number;
  yearsToRetirement?: number;
  monthlySavingsNeeded?: number;
  currentProgress?: number;
  currencySymbol?: string;
  formatCurrency?: (value: number) => string;
}

const ResultsSection = ({
  fireNumber = 1250000,
  yearsToRetirement = 15,
  monthlySavingsNeeded = 2500,
  currentProgress = 35,
  currencySymbol = "$",
  formatCurrency,
}: ResultsSectionProps) => {
  // Format currency with the provided function or default
  const formatCurrencyValue = (value: number) => {
    if (formatCurrency) {
      return formatCurrency(value);
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };
  return (
    <div className="w-full bg-background dark:bg-card p-3 rounded-sm h-full flex flex-col border border-border-dark dark:border-gray-500">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold text-center">
          Your FIRE Results
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-3 flex-1 flex flex-col justify-between">
          <Card className="border border-border-dark dark:border-gray-500 rounded-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-primary" />
                FIRE Number
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" aria-label="Help">
                        <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground cursor-help" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={5}>
                      <p className="max-w-xs">
                        The amount you need to save to live off investment
                        returns indefinitely. Calculated as Annual Expenses ÷
                        Withdrawal Rate. For example, with $40,000 annual
                        expenses and a 4% withdrawal rate, your FIRE number is
                        $1,000,000.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {formatCurrencyValue(fireNumber)}
              </p>
              <p className="text-sm text-muted-foreground">
                Total savings needed for financial independence
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border-dark dark:border-gray-500 rounded-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                <span className="whitespace-nowrap">Years to Retirement</span>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" aria-label="Help">
                        <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground cursor-help" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={5}>
                      <p className="max-w-xs">
                        Estimated time until you reach your FIRE number based on
                        your savings rate and investment returns. This
                        calculation uses compound interest and assumes
                        consistent contributions over time. Market volatility
                        may affect actual results.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {yearsToRetirement === Infinity ? "∞" : yearsToRetirement}
              </p>
              <p className="text-sm text-muted-foreground">
                Estimated time until you reach your FIRE goal
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border-dark dark:border-gray-500 rounded-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <PiggyBank className="h-5 w-5 mr-2 text-primary" />
                <span className="whitespace-nowrap">Monthly Savings</span>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" aria-label="Help">
                        <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground cursor-help" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={5}>
                      <p className="max-w-xs">
                        The amount you need to save each month to reach your
                        FIRE number in the estimated timeframe. This is
                        calculated using the time value of money formula and
                        accounts for your current portfolio value, target
                        amount, and expected returns.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {formatCurrencyValue(monthlySavingsNeeded)}
              </p>
              <p className="text-sm text-muted-foreground">
                Required monthly contribution to reach your goal
              </p>
            </CardContent>
          </Card>

          <div className="mt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium flex items-center">
                Progress to FIRE
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" aria-label="Help">
                        <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground cursor-help" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={5}>
                      <p className="max-w-xs">
                        Your current progress toward your FIRE number,
                        calculated as (Current Portfolio Value ÷ FIRE Number) ×
                        100%. This shows what percentage of your retirement goal
                        you've already achieved. The progress bar fills up as
                        you get closer to financial independence.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
              <span className="text-sm font-medium">{currentProgress}%</span>
            </div>
            <Progress value={currentProgress} max={100} className="h-3" />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-muted-foreground">Current</span>
              <span className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" /> FIRE Goal
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </div>
  );
};

export default ResultsSection;
