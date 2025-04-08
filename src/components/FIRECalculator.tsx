import React, { useState, useEffect, useRef } from "react";
import InputSection from "./InputSection";
import ResultsSection from "./ResultsSection";
import PortfolioGraph from "./PortfolioGraph";
import ThemeToggle from "./ThemeToggle";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Download, FileType, DollarSign } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toPng, toJpeg } from "html-to-image";
import jsPDF from "jspdf";

// Define the InputValues interface here instead of importing it
interface InputValues {
  annualIncome: number;
  annualExpenses: number;
  investmentReturns: number;
  withdrawalRate: number;
  currentPortfolioValue: number;
  inflationRate: number;
}

interface DataPoint {
  year: number;
  portfolioValue: number;
  expenses: number;
  fireNumber: number;
}

const FIRECalculator: React.FC = () => {
  const graphRef = useRef<HTMLDivElement>(null);
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [currencySymbol, setCurrencySymbol] = useState<string>("$");
  const [currencyCode, setCurrencyCode] = useState<string>("USD");

  const [inputValues, setInputValues] = useState<InputValues>({
    annualIncome: 100000,
    annualExpenses: 70000,
    investmentReturns: 7,
    withdrawalRate: 4,
    currentPortfolioValue: 50000,
    inflationRate: 2.5,
  });

  const [calculatedResults, setCalculatedResults] = useState({
    fireNumber: 1750000,
    yearsToRetirement: 15,
    monthlySavingsNeeded: 2500,
    currentProgress: 35,
  });

  const [portfolioData, setPortfolioData] = useState<DataPoint[]>([]);

  // Format currency based on selected currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
      currencyDisplay: "symbol",
    })
      .format(value)
      .replace(/[A-Z]{3}\s?/, currencySymbol);
  };

  // Handle currency change
  const handleCurrencyChange = (value: string) => {
    switch (value) {
      case "USD":
        setCurrencySymbol("$");
        setCurrencyCode("USD");
        break;
      case "EUR":
        setCurrencySymbol("€");
        setCurrencyCode("EUR");
        break;
      case "GBP":
        setCurrencySymbol("£");
        setCurrencyCode("GBP");
        break;
      case "JPY":
        setCurrencySymbol("¥");
        setCurrencyCode("JPY");
        break;
      case "INR":
        setCurrencySymbol("₹");
        setCurrencyCode("INR");
        break;
      case "CAD":
        setCurrencySymbol("$");
        setCurrencyCode("CAD");
        break;
      default:
        setCurrencySymbol("$");
        setCurrencyCode("USD");
    }
  };

  // Calculate FIRE results whenever inputs change
  useEffect(() => {
    // Calculate FIRE number based on annual expenses and withdrawal rate
    const fireNumber = Math.round(
      inputValues.annualExpenses / (inputValues.withdrawalRate / 100),
    );

    // Calculate annual savings based on income minus expenses
    const annualSavings = Math.max(
      0,
      inputValues.annualIncome - inputValues.annualExpenses,
    );

    // Calculate savings rate for display purposes
    const savingsRate =
      inputValues.annualIncome > 0
        ? Math.max(
            0,
            Math.min(100, (annualSavings / inputValues.annualIncome) * 100),
          )
        : 0;

    // Calculate real rate of return (investment returns minus inflation)
    const realReturnRate =
      (inputValues.investmentReturns - inputValues.inflationRate) / 100;

    // Validate real return rate
    const validRealReturnRate = realReturnRate;
    const isNegativeRealReturn = realReturnRate < 0;

    // Calculate years to retirement using real returns
    const yearsToRetirement = calculateYearsToFIRE(
      inputValues.currentPortfolioValue, // Starting portfolio value
      fireNumber,
      annualSavings,
      validRealReturnRate,
    );

    // Calculate monthly savings needed to reach FIRE in calculated years
    // This is a more accurate calculation based on the target and timeframe
    const requiredAnnualSavings = calculateRequiredSavings(
      inputValues.currentPortfolioValue,
      fireNumber,
      yearsToRetirement,
      validRealReturnRate,
    );

    // Calculate monthly savings from annual savings (direct from inputs)
    const monthlySavingsFromInputs = Math.round(annualSavings / 12);

    // Use the required monthly savings if years to retirement is achievable,
    // otherwise use the direct calculation from inputs
    const monthlySavingsNeeded =
      yearsToRetirement < 100
        ? Math.round(requiredAnnualSavings / 12)
        : monthlySavingsFromInputs;

    // Calculate current progress based on current portfolio value
    const currentProgress = Math.min(
      Math.max(
        0,
        Math.round((inputValues.currentPortfolioValue / fireNumber) * 100),
      ),
      100,
    );

    setCalculatedResults({
      fireNumber,
      yearsToRetirement:
        isNegativeRealReturn && yearsToRetirement >= 100
          ? Infinity
          : yearsToRetirement,
      monthlySavingsNeeded,
      currentProgress,
    });

    // Generate portfolio growth data for the graph
    setPortfolioData(
      generatePortfolioData(
        inputValues.currentPortfolioValue, // Starting portfolio
        annualSavings,
        inputValues.investmentReturns / 100,
        inputValues.annualExpenses,
        fireNumber,
        Math.min(Math.ceil(yearsToRetirement) + 10, 100), // Show 10 years beyond FIRE date, max 100 years
        inputValues.inflationRate / 100, // Pass inflation rate
      ),
    );
  }, [inputValues]);

  // Calculate required annual savings to reach FIRE in given years
  const calculateRequiredSavings = (
    currentPortfolio: number,
    targetAmount: number,
    years: number,
    annualReturn: number,
  ): number => {
    // Handle edge cases
    if (years <= 0 || years >= 100) return 0;
    if (currentPortfolio >= targetAmount) return 0;

    // For zero return rate, simple division
    if (Math.abs(annualReturn) < 0.0001) {
      return (targetAmount - currentPortfolio) / years;
    }

    // Formula: PMT = (FV - PV(1+r)^n) / (((1+r)^n - 1) / r)
    // This is the compound growth formula solved for the periodic payment
    const futureValue = targetAmount;
    const presentValue = currentPortfolio;

    // Calculate required periodic payment
    const compoundFactor = Math.pow(1 + annualReturn, years);
    const numerator = futureValue - presentValue * compoundFactor;
    const denominator = (compoundFactor - 1) / annualReturn;

    // Handle negative returns carefully
    if (annualReturn < 0 && compoundFactor <= 0) {
      // In this case, the formula breaks down
      return (targetAmount - currentPortfolio) / years; // Fallback to linear calculation
    }

    return Math.max(numerator / denominator, 0); // Ensure non-negative
  };

  // Calculate years to FIRE using compound growth formula
  const calculateYearsToFIRE = (
    currentPortfolio: number,
    targetAmount: number,
    annualContribution: number,
    annualReturn: number,
  ): number => {
    // Handle edge cases
    if (currentPortfolio >= targetAmount) return 0;
    if (annualReturn === 0) {
      // Simple division if no growth
      const yearsWithNoGrowth =
        (targetAmount - currentPortfolio) / annualContribution;
      return Math.ceil(yearsWithNoGrowth);
    }

    // Handle negative real returns
    if (annualReturn < 0) {
      // With negative returns, we need to check if FIRE is even possible
      // If annual contribution can't overcome negative returns on existing portfolio
      if (Math.abs(currentPortfolio * annualReturn) >= annualContribution) {
        return 100; // FIRE not achievable, return max years
      }
    }

    let years = 0;
    let portfolio = currentPortfolio;

    // Use the compound growth formula to project portfolio growth
    while (portfolio < targetAmount && years < 100) {
      // Future Value = Present Value × (1 + real_return_rate) + Annual_Contribution
      portfolio = portfolio * (1 + annualReturn) + annualContribution;
      years++;
    }

    return years;
  };

  // Generate data for portfolio growth chart using compound growth formula
  const generatePortfolioData = (
    startingPortfolio: number,
    annualContribution: number,
    growthRate: number,
    annualExpenses: number,
    fireNumber: number,
    years: number,
    inflationRate: number,
  ): DataPoint[] => {
    const data: DataPoint[] = [];
    let portfolioValue = startingPortfolio;
    let inflatedExpenses = annualExpenses;
    let inflatedFireNumber = fireNumber;
    const realGrowthRate = growthRate - inflationRate; // Real return rate

    // Validate growth rate to prevent unrealistic scenarios
    const effectiveGrowthRate = realGrowthRate < -0.15 ? -0.15 : growthRate;

    for (let year = 0; year <= years; year++) {
      if (year === 0) {
        // Initial year
        data.push({
          year,
          portfolioValue: Math.round(portfolioValue),
          expenses: Math.round(inflatedExpenses),
          fireNumber: Math.round(inflatedFireNumber),
        });
      } else {
        // Apply compound growth formula for portfolio value
        // Future Value = Present Value × (1 + growth_rate) + Annual_Contribution
        portfolioValue =
          portfolioValue * (1 + effectiveGrowthRate) + annualContribution;

        // Increase expenses with inflation
        inflatedExpenses = inflatedExpenses * (1 + inflationRate);

        // Recalculate FIRE number based on inflated expenses
        inflatedFireNumber =
          inflatedExpenses / (inputValues.withdrawalRate / 100);

        data.push({
          year,
          portfolioValue: Math.round(Math.max(0, portfolioValue)), // Ensure non-negative
          expenses: Math.round(inflatedExpenses),
          fireNumber: Math.round(inflatedFireNumber),
        });
      }
    }

    return data;
  };

  const handleInputChange = (values: InputValues) => {
    setInputValues(values);
  };

  // Pass currency symbol to child components
  const childProps = {
    currencySymbol,
    formatCurrency,
  };

  // Download as PNG function
  const downloadAsPNG = async () => {
    if (!calculatorRef.current) return;

    try {
      // Create a canvas to add watermark
      const dataUrl = await toPng(calculatorRef.current, { quality: 0.95 });

      // Create an image from the data URL
      const img = new Image();
      img.src = dataUrl;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Create a canvas to add watermark
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      // Draw the original image
      ctx.drawImage(img, 0, 0);

      // Add watermark
      ctx.save();
      ctx.globalAlpha = 0.2; // Transparency
      ctx.font = "bold 40px Arial";
      ctx.fillStyle = "#888888";

      // Rotate and position watermark
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 4); // -45 degrees
      ctx.textAlign = "center";
      ctx.fillText("Built by EquityResearch.ai/FIRE", 0, 0);
      ctx.restore();

      // Convert to data URL and download
      const finalDataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "FIRE calculation.png";
      link.href = finalDataUrl;
      link.click();
    } catch (error) {
      console.error("Error generating PNG:", error);
    }
  };

  // Download as PDF function with watermark
  const downloadAsPDF = async () => {
    if (!calculatorRef.current) return;

    try {
      const dataUrl = await toJpeg(calculatorRef.current, { quality: 0.95 });

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Add the image to the PDF
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(dataUrl, "JPEG", 0, 0, pdfWidth, pdfHeight);

      // Add watermark
      pdf.setTextColor(180, 180, 180); // Light gray
      pdf.setFontSize(40);
      pdf.setFont("helvetica", "bold");

      // Rotate and position the watermark diagonally across the page
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Simple watermark approach without state management
      pdf.setGState(new pdf.GState({ opacity: 0.4 }));
      pdf.setTextColor(180, 180, 180);
      pdf.setFontSize(40);

      // Save current transformation matrix
      pdf.save();

      // Apply transformations for watermark
      pdf.translate(pageWidth / 2, pageHeight / 2);
      pdf.rotate((-45 * Math.PI) / 180);
      pdf.text("Built by EquityResearch.ai/FIRE", 0, 0, { align: "center" });

      // Restore transformation matrix
      pdf.restore();

      // Set explicit filename - using direct string instead of variable
      pdf.save("FIRE calculation.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <div
      ref={calculatorRef}
      className="min-h-screen bg-background dark:bg-card p-3 md:p-6 relative"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(200, 200, 200, 0.2) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(200, 200, 200, 0.2) 1px, transparent 1px)
        `,
        backgroundSize: "20px 20px",
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-foreground">
            FIRE Calculator by EquityResearch.ai
          </h1>
          <div className="flex items-center space-x-2 bg-background dark:bg-card z-10 relative">
            <Select defaultValue="USD" onValueChange={handleCurrencyChange}>
              <SelectTrigger className="w-[110px] h-9">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">$ (USD)</SelectItem>
                <SelectItem value="CAD">$ (CAD)</SelectItem>
                <SelectItem value="EUR">€ (EUR)</SelectItem>
                <SelectItem value="GBP">£ (GBP)</SelectItem>
                <SelectItem value="JPY">¥ (JPY)</SelectItem>
                <SelectItem value="INR">₹ (INR)</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadAsPNG}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              PNG
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadAsPDF}
              className="flex items-center gap-1"
            >
              <FileType className="h-4 w-4" />
              PDF
            </Button>
            <ThemeToggle />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
          {/* Left column - Inputs */}
          <div className="lg:col-span-3 h-full">
            <InputSection
              onInputChange={handleInputChange}
              currencySymbol={currencySymbol}
              formatCurrency={formatCurrency}
            />
          </div>

          {/* Right column - Results and Graph */}
          <div className="lg:col-span-9">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
              <div className="lg:col-span-8 lg:order-1 lg:row-span-1 h-full">
                <Card
                  className="bg-card dark:bg-card border border-border-dark dark:border-gray-500 rounded-sm h-full"
                  ref={graphRef}
                >
                  <CardContent className="p-4 h-full bg-card dark:bg-card">
                    <PortfolioGraph
                      data={portfolioData}
                      fireYear={calculatedResults.yearsToRetirement}
                      fireNumber={calculatedResults.fireNumber}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-4 lg:order-2 lg:row-span-1 h-full">
                <ResultsSection
                  fireNumber={calculatedResults.fireNumber}
                  yearsToRetirement={calculatedResults.yearsToRetirement}
                  monthlySavingsNeeded={calculatedResults.monthlySavingsNeeded}
                  currentProgress={calculatedResults.currentProgress}
                  currencySymbol={currencySymbol}
                  formatCurrency={formatCurrency}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4">
          <Card className="bg-card dark:bg-card border border-border-dark dark:border-gray-500 rounded-sm">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Quick Tips</h3>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>
                      • The 4% rule is a common withdrawal rate for early
                      retirees
                    </li>
                    <li>
                      • Higher savings rates dramatically reduce time to FIRE
                    </li>
                    <li>
                      • Conservative investment return estimates are recommended
                    </li>
                    <li>
                      • If inflation exceeds investment returns, FIRE may not be
                      achievable
                    </li>
                  </ul>
                </div>
                <div className="text-sm text-muted-foreground max-w-xl">
                  <p>
                    Adjust your inputs to see how different scenarios affect
                    your FIRE journey.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FIRECalculator;
