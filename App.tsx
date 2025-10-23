import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { AgentControlPanel } from './components/AgentControlPanel';
import { EmailList } from './components/EmailList';
import { CustomRules } from './components/CustomRules';
import { analyzeEmailsForDeletion } from './services/geminiService';
import { MOCK_EMAILS } from './constants';
import type { Email, DeletionAnalysis, CustomRules as CustomRulesType } from './types';

const App: React.FC = () => {
  const [emails, setEmails] = useState<Email[]>(MOCK_EMAILS);
  const [analysis, setAnalysis] = useState<DeletionAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [customRules, setCustomRules] = useState<CustomRulesType>({ alwaysDelete: '', neverDelete: '' });

  const handleRulesChange = useCallback((type: keyof CustomRulesType, value: string) => {
    setCustomRules(prev => ({ ...prev, [type]: value }));
  }, []);

  const handleAnalyze = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSummary(null);
    setAnalysis([]);
    try {
      const result = await analyzeEmailsForDeletion(emails, customRules);
      setAnalysis(result);
      if (result.length === 0) {
        setSummary("AI analysis complete. No unwanted emails found!");
      }
    } catch (e) {
      console.error(e);
      setError('Failed to analyze emails. Please check the API key and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [emails, customRules]);

  const handleConfirmDeletion = useCallback(() => {
    const idsToDelete = new Set(analysis.map(a => a.id));
    const newEmails = emails.filter(email => !idsToDelete.has(email.id));
    setEmails(newEmails);
    setSummary(`Successfully deleted ${idsToDelete.size} unwanted email(s).`);
    setAnalysis([]);
  }, [analysis, emails]);

  const handleCancel = useCallback(() => {
    setAnalysis([]);
  }, []);

  const handleReset = useCallback(() => {
    setEmails(MOCK_EMAILS);
    setAnalysis([]);
    setSummary(null);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <AgentControlPanel
            onAnalyze={handleAnalyze}
            onConfirm={handleConfirmDeletion}
            onCancel={handleCancel}
            onReset={handleReset}
            isLoading={isLoading}
            analysisReady={analysis.length > 0}
            summary={summary}
            error={error}
            totalEmails={emails.length}
            initialEmailCount={MOCK_EMAILS.length}
          />
          <CustomRules rules={customRules} onRulesChange={handleRulesChange} />
          <EmailList emails={emails} analysis={analysis} />
        </div>
      </main>
    </div>
  );
};

export default App;