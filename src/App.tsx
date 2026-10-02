/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  FinancialAnalysisResult,
  FinancialAssumptions,
  GovScheme,
  Language,
  MarketAnalysisResult,
  RiskAnalysisResult,
  SavedAnalysisRecord,
  UserInputState,
} from './types';
import { BUSINESS_TEMPLATES, DEMO_LOCATIONS } from './data/demoData';
import { calculateMarketAnalysis } from './services/marketEngine';
import { calculateFinancialAnalysis } from './services/financeEngine';
import { evaluateBusinessRisks } from './services/riskEngine';
import { matchGovernmentSchemes } from './services/schemeEngine';
import { T } from './services/translations';

// Components
import { Header } from './components/Header';
import { TrustBanner } from './components/TrustBanner';
import { StepNavigation } from './components/StepNavigation';
import { HomeHero } from './components/HomeHero';
import { MarketSection } from './components/MarketSection';
import { FinanceSection } from './components/FinanceSection';
import { SchemesSection } from './components/SchemesSection';
import { RiskSection } from './components/RiskSection';
import { NextStepsSection } from './components/NextStepsSection';
import { ReportSection } from './components/ReportSection';
import { AiAdvisorDrawer } from './components/AiAdvisorDrawer';
import { SavedBusinessesModal } from './components/SavedBusinessesModal';
import { AdminModal } from './components/AdminModal';

export default function App() {
  const [language, setLanguage] = useState<Language>('kn'); // Default Kannada for rural Karnataka focus, switchable to English
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);

  // Analysis State
  const [inputs, setInputs] = useState<UserInputState | null>(null);
  const [marketResult, setMarketResult] = useState<MarketAnalysisResult | null>(null);
  const [assumptions, setAssumptions] = useState<FinancialAssumptions | null>(null);
  const [financeResult, setFinanceResult] = useState<FinancialAnalysisResult | null>(null);
  const [risksResult, setRisksResult] = useState<RiskAnalysisResult | null>(null);
  const [matchedSchemes, setMatchedSchemes] = useState<GovScheme[]>([]);
  const [aiExplanation, setAiExplanation] = useState<string>('');

  // Modals & Storage
  const [savedBusinesses, setSavedBusinesses] = useState<SavedAnalysisRecord[]>([]);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Load saved businesses from localStorage & server on mount
  useEffect(() => {
    try {
      const local = localStorage.getItem('gramrozgar_saved');
      if (local) {
        setSavedBusinesses(JSON.parse(local));
      }
    } catch (err) {
      console.warn(err);
    }

    fetch('/api/analyses')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSavedBusinesses((prev) => {
            const ids = new Set(prev.map((p) => p.id));
            const newOnes = data.filter((d: any) => !ids.has(d.id));
            return [...prev, ...newOnes];
          });
        }
      })
      .catch((err) => console.warn('Could not fetch server analyses', err));
  }, []);

  // Primary Analyzer Workflow
  const handleAnalyze = async (userInputs: UserInputState) => {
    setIsAnalyzing(true);
    setInputs(userInputs);

    // 1. Classification & Intent Extraction
    let finalCategoryId = userInputs.categoryId;
    try {
      const classRes = await fetch('/api/advisor/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: userInputs.businessIdea,
          language,
        }),
      });
      if (classRes.ok) {
        const classData = await classRes.json();
        if (classData.categoryId) {
          finalCategoryId = classData.categoryId;
        }
      }
    } catch (err) {
      console.warn('Classify fallback:', err);
    }

    const template =
      BUSINESS_TEMPLATES.find((t) => t.id === finalCategoryId) || BUSINESS_TEMPLATES[0];

    // 2. Deterministic Local Market Analysis
    const market = calculateMarketAnalysis(finalCategoryId, {
      isDemo: userInputs.location.isDemo,
      demoLocationId: userInputs.location.demoLocationId,
      panchayat: userInputs.location.panchayat,
      taluk: userInputs.location.taluk,
      district: userInputs.location.district,
    });
    setMarketResult(market);

    // 3. Deterministic Financial Assumptions
    const initialAssumptions: FinancialAssumptions = {
      projectCost: template.defaultProjectCost,
      userCapital: userInputs.capital,
      monthlyRevenue: template.defaultMonthlyRevenue,
      monthlyExpenses: template.defaultMonthlyExpenses,
      interestRate: 9.5,
      loanTenureMonths: 36,
    };
    setAssumptions(initialAssumptions);

    // 4. Deterministic Financial Calculations
    const finance = calculateFinancialAnalysis(initialAssumptions);
    setFinanceResult(finance);

    // 5. Deterministic Risk Calculations
    const risks = evaluateBusinessRisks(market, finance);
    setRisksResult(risks);

    // 6. Matched Curated Government Schemes
    const schemes = matchGovernmentSchemes(finalCategoryId, finance.fundingGap);
    setMatchedSchemes(schemes);

    setIsAnalyzing(false);
    setCurrentStep(2); // Move to Local Market view

    // 7. Conversational AI Explanation
    setIsLoadingAi(true);
    try {
      const expRes = await fetch('/api/advisor/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          businessCategory: language === 'kn' ? template.titleKn : template.titleEn,
          locationName: market.locationName,
          market,
          finance,
          risks,
          userCapital: userInputs.capital,
        }),
      });
      if (expRes.ok) {
        const expData = await expRes.json();
        setAiExplanation(expData.explanation || '');
      }
    } catch (err) {
      console.warn('AI explain fallback:', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Instant Financial Assumption Recalculation
  const handleUpdateAssumptions = (newAssumptions: FinancialAssumptions) => {
    setAssumptions(newAssumptions);
    const newFinance = calculateFinancialAnalysis(newAssumptions);
    setFinanceResult(newFinance);

    if (marketResult) {
      const newRisks = evaluateBusinessRisks(marketResult, newFinance);
      setRisksResult(newRisks);
    }
  };

  // Save Analysis to Database & LocalStorage
  const handleSaveAnalysis = async (userName: string): Promise<boolean> => {
    if (!inputs || !marketResult || !financeResult || !risksResult || !assumptions) {
      return false;
    }

    const record: SavedAnalysisRecord = {
      id: `an_${Date.now()}`,
      createdAt: new Date().toISOString(),
      businessTitle: inputs.businessIdea,
      locationName: marketResult.locationName,
      capital: inputs.capital,
      inputs,
      market: marketResult,
      finance: financeResult,
      assumptions,
      risks: risksResult,
      feasibilityScore: marketResult.marketPotential,
    };

    const updated = [record, ...savedBusinesses];
    setSavedBusinesses(updated);
    try {
      localStorage.setItem('gramrozgar_saved', JSON.stringify(updated));
      await fetch('/api/analyses/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis: record, userName }),
      });
    } catch (err) {
      console.warn(err);
    }
    return true;
  };

  // Load Saved Business Record
  const handleSelectSavedBusiness = (record: SavedAnalysisRecord) => {
    setInputs(record.inputs);
    setMarketResult(record.market);
    setAssumptions(record.assumptions);
    setFinanceResult(record.finance);
    setRisksResult(record.risks);
    setMatchedSchemes(
      matchGovernmentSchemes(record.inputs.categoryId, record.finance.fundingGap)
    );
    setCurrentStep(7); // Jump straight to report
  };

  // Reset Demo to Initial State
  const handleResetDemo = () => {
    setInputs(null);
    setMarketResult(null);
    setAssumptions(null);
    setFinanceResult(null);
    setRisksResult(null);
    setMatchedSchemes([]);
    setAiExplanation('');
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
      <div>
        {/* Top Bar Contract Compliant Header */}
        <Header
          language={language}
          onLanguageChange={setLanguage}
          savedCount={savedBusinesses.length}
          onOpenSaved={() => setIsSavedModalOpen(true)}
          onOpenAdmin={() => setIsAdminModalOpen(true)}
          onResetDemo={handleResetDemo}
          currentStep={currentStep}
          onNavigateStep={setCurrentStep}
          hasAnalysis={Boolean(marketResult)}
        />

        {/* Core Trust Principle Banner */}
        <TrustBanner language={language} />

        {/* Guided Step Navigation */}
        <StepNavigation
          currentStep={currentStep}
          onStepClick={setCurrentStep}
          language={language}
          hasAnalysis={Boolean(marketResult)}
        />

        {/* Main Step Views */}
        <main>
          {currentStep === 1 && (
            <HomeHero
              language={language}
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
              initialInputs={inputs || undefined}
            />
          )}

          {currentStep === 2 && marketResult && (
            <MarketSection
              market={marketResult}
              language={language}
              onNext={() => setCurrentStep(3)}
              aiExplanation={aiExplanation}
              isLoadingAi={isLoadingAi}
            />
          )}

          {currentStep === 3 && financeResult && assumptions && (
            <FinanceSection
              finance={financeResult}
              assumptions={assumptions}
              onUpdateAssumptions={handleUpdateAssumptions}
              language={language}
              onNext={() => setCurrentStep(4)}
            />
          )}

          {currentStep === 4 && (
            <SchemesSection
              schemes={matchedSchemes}
              language={language}
              onNext={() => setCurrentStep(5)}
            />
          )}

          {currentStep === 5 && risksResult && (
            <RiskSection
              risks={risksResult}
              language={language}
              onNext={() => setCurrentStep(6)}
            />
          )}

          {currentStep === 6 && (
            <NextStepsSection
              language={language}
              onNext={() => setCurrentStep(7)}
              categoryTitle={marketResult?.categoryName || 'Rural Business'}
            />
          )}

          {currentStep === 7 &&
            inputs &&
            marketResult &&
            financeResult &&
            risksResult && (
              <ReportSection
                inputs={inputs}
                market={marketResult}
                finance={financeResult}
                risks={risksResult}
                schemes={matchedSchemes}
                language={language}
                onRestart={handleResetDemo}
                onSave={handleSaveAnalysis}
                aiExplanation={aiExplanation}
              />
            )}
        </main>
      </div>

      {/* Floating AI Business Advisor Drawer */}
      <AiAdvisorDrawer
        language={language}
        businessContext={
          inputs && marketResult
            ? {
                businessTitle: inputs.businessIdea,
                locationName: marketResult.locationName,
                capital: inputs.capital,
              }
            : undefined
        }
      />

      {/* Saved Businesses Modal */}
      <SavedBusinessesModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedList={savedBusinesses}
        onSelectBusiness={handleSelectSavedBusiness}
        language={language}
      />

      {/* Admin Portal Modal */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        language={language}
      />

      {/* Clean Minimal Footer */}
      <footer className="no-print border-t border-stone-200 bg-white py-6 px-4 sm:px-6 text-xs text-stone-500 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-stone-900 font-serif">
              {T[language].brandName}
            </span>
            <span>·</span>
            <span>{T[language].tagline}</span>
          </div>

          <div className="text-stone-400 text-center sm:text-right">
            <span>Prototype Dataset for SIH Evaluation</span>
            <span className="mx-2">·</span>
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="text-stone-600 hover:text-stone-900 underline cursor-pointer"
            >
              Admin Portal
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
