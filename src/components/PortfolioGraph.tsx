import React, { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { ZoomIn, ZoomOut, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

interface DataPoint {
  year: number;
  portfolioValue: number;
  expenses: number;
  fireNumber: number;
}

interface PortfolioGraphProps {
  data?: DataPoint[];
  fireYear?: number;
  fireNumber?: number;
}

const PortfolioGraph = React.forwardRef(
  (
    {
      data = generateMockData(),
      fireYear = 15,
      fireNumber = 1250000,
    }: PortfolioGraphProps,
    ref,
  ) => {
    const [zoomLevel, setZoomLevel] = useState(1);
    const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);

    // Format currency values
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(value);
    };

    // Custom tooltip component for the chart
    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-background border border-border p-4 rounded-md shadow-md dark:bg-card dark:border-border-dark dark:text-foreground">
            <p className="font-semibold">Year {label}</p>
            <p className="text-primary">
              Portfolio: {formatCurrency(payload[0].value)}
            </p>
            <p className="text-destructive">
              Annual Expenses (Inflation Adjusted):{" "}
              {formatCurrency(payload[1].value)}
            </p>
            {payload[2] && (
              <p className="text-amber-500">
                FIRE Number: {formatCurrency(payload[2].value)}
              </p>
            )}
          </div>
        );
      }
      return null;
    };

    // Handle zoom functionality
    const handleZoomIn = () => {
      if (zoomLevel < 2) setZoomLevel(zoomLevel + 0.25);
    };

    const handleZoomOut = () => {
      if (zoomLevel > 0.5) setZoomLevel(zoomLevel - 0.25);
    };

    const handleReset = () => {
      setZoomLevel(1);
    };

    return (
      <Card
        className="w-full h-full bg-card dark:bg-card border dark:border-gray-500"
        ref={ref}
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardContent className="p-6 flex-1 flex flex-col bg-card dark:bg-card">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-foreground dark:text-foreground">
              Portfolio Growth Projection
            </h3>
          </div>

          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey="year"
                  label={{
                    value: "Years",
                    position: "insideBottomRight",
                    offset: -10,
                  }}
                  domain={[0, data.length > 0 ? data.length - 1 : 30]}
                  tickCount={Math.floor(10 / zoomLevel)}
                />
                <YAxis
                  tickFormatter={(value) => {
                    if (value >= 1000000000) {
                      return `${(value / 1000000000).toFixed(1)}b`;
                    } else if (value >= 1000000) {
                      return `${(value / 1000000).toFixed(1)}m`;
                    } else if (value >= 1000) {
                      return `${(value / 1000).toFixed(1)}k`;
                    }
                    return value;
                  }}
                  label={{
                    value: "Amount ($)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                  domain={[0, "dataMax * 1.1"]}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="portfolioValue"
                  name="Portfolio Value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false} // Disable animation for better performance
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  name="Annual Expenses (Inflation Adjusted)"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="fireNumber"
                  name="FIRE Number (Inflation Adjusted)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                  strokeDasharray="5 5"
                  isAnimationActive={false}
                />

                {/* Reference line for FIRE year */}
                <ReferenceLine
                  x={fireYear}
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  label={{
                    value: "FIRE Achieved",
                    position: "top",
                    fill: "#10b981",
                    fontSize: 12,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 text-sm text-muted-foreground dark:text-muted-foreground">
            <p>
              Based on your inputs, you'll need {formatCurrency(fireNumber)} to
              reach FIRE. With your current portfolio and savings rate, you'll
              reach your FIRE goal in{" "}
              {fireYear === Infinity ? "an infinite amount of" : fireYear}{" "}
              years. The green vertical line indicates when you reach your FIRE
              goal.
            </p>
            <p className="mt-2">
              Hover over the graph to see detailed values for each year.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  },
);

// Generate mock data for default display
function generateMockData(): DataPoint[] {
  const data: DataPoint[] = [];
  const initialPortfolio = 50000;
  const annualContribution = 25000;
  const growthRate = 0.07;
  const annualExpenses = 40000;
  const fireNumber = annualExpenses * 25; // 4% withdrawal rate

  let portfolioValue = initialPortfolio;

  for (let year = 0; year <= 30; year++) {
    // Add some randomness to make the graph look more realistic
    const randomFactor = 1 + (Math.random() * 0.04 - 0.02);

    if (year > 0) {
      portfolioValue =
        portfolioValue * (1 + growthRate * randomFactor) + annualContribution;
    }

    data.push({
      year,
      portfolioValue: Math.round(portfolioValue),
      expenses: annualExpenses,
      fireNumber: fireNumber,
    });
  }

  return data;
}

export default PortfolioGraph;
